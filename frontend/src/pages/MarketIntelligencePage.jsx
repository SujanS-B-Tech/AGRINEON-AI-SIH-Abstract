import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, MapPin, Store } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'

export default function MarketIntelligencePage() {
  const [quantity, setQuantity] = useState(250)
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [farmCrop, setFarmCrop] = useState("")

  useEffect(() => {
    fetchMarkets()
  }, [])

  const fetchMarkets = async () => {
    try {
      setLoading(true)
      const farmRes = await api.get('/farms/')
      const cropQuery = farmRes.data.length > 0 && farmRes.data[0].current_crop ? farmRes.data[0].current_crop : "Tomato"
      setFarmCrop(cropQuery)

      const mktRes = await api.get(`/markets/compare?crop_name=${cropQuery}`)
      
      const processed = mktRes.data.map(m => {
        const p = m.prices.length > 0 ? m.prices[0] : { price: 0, transport_cost: 0, grade: 'Standard', unit: '₹/quintal' }
        return {
          ...m,
          price: parseFloat(p.price),
          transportCost: parseFloat(p.transport_cost),
          grade: p.grade,
          unit: p.unit,
          grossRevenue: parseFloat(p.price) * quantity,
          netReturn: (parseFloat(p.price) * quantity) - parseFloat(p.transport_cost)
        }
      })
      
      setMarkets(processed.sort((a,b) => b.netReturn - a.netReturn))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Reload when quantity changes
  useEffect(() => {
    if(markets.length > 0) {
      const updated = markets.map(m => ({
        ...m,
        grossRevenue: m.price * quantity,
        netReturn: (m.price * quantity) - m.transportCost
      }))
      setMarkets(updated.sort((a,b) => b.netReturn - a.netReturn))
    }
  }, [quantity])

  if (loading) {
    return <DashboardLayout><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 m-8" /></DashboardLayout>
  }

  const best = markets.length > 0 ? markets[0] : null
  const chartData = markets.map(m => ({ name: m.name.split(' ')[0], netReturn: m.netReturn, price: m.price }))

  return (
    <DashboardLayout title="Market Intelligence" subtitle={`Compare APMC market prices for ${farmCrop || 'your crops'}`}>
      <div className="space-y-6">
        
        {markets.length === 0 ? (
           <div className="card text-center py-12 text-gray-500">No market data available for '{farmCrop}' right now.</div>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Analysis Quantity</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-24 px-3 py-2 border border-gray-300 rounded-lg" />
                  <span className="text-gray-600 font-medium text-sm">quintals</span>
                </div>
              </div>
            </div>

            {/* Best market recommendation */}
            {best && (
              <div className="card bg-green-50 border-green-200">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 flex items-center gap-2">Highest Net Return: {best.name}</h3>
                    <p className="text-lg text-green-700 font-medium">Estimated net return: ₹{best.netReturn.toLocaleString()} for {quantity} quintals</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Market comparison chart */}
              <div className="card lg:col-span-2">
                <h3 className="font-semibold mb-4 text-gray-800">Net Return Comparison (₹)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Net Return']} />
                    <Bar dataKey="netReturn" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={best && entry.name === best.name.split(' ')[0] ? '#16a34a' : '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Market cards */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {markets.map((m) => (
                  <div key={m.id} className={`p-4 rounded-xl border ${m.id === best?.id ? 'border-2 border-green-500 bg-white shadow-sm' : 'border-gray-200 bg-gray-50'}`}>
                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{m.name}</h4>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-3 bg-gray-200 w-fit px-2 py-0.5 rounded-full">
                      <MapPin className="w-3 h-3" /> {m.location}
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Price Rate</span><span className="font-medium">₹{m.price}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Quality Grade</span><span>{m.grade}</span></div>
                      <div className="flex justify-between text-red-600"><span className="">Transport Cost</span><span>- ₹{m.transportCost}</span></div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 mt-2"><span className="font-bold text-gray-800">Final Net Return</span><span className="font-bold text-green-700">₹{m.netReturn.toLocaleString()}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
