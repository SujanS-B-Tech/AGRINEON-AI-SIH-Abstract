import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, MapPin, Info } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { PageLoadingState } from '../components/LoadingState'
import api from '../utils/api'

export default function MarketIntelligencePage() {
  const [quantity, setQuantity] = useState(250)
  const [markets,  setMarkets]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [farmCrop, setFarmCrop] = useState('')

  useEffect(() => { fetchMarkets() }, [])

  const fetchMarkets = async () => {
    try {
      setLoading(true)
      const farmRes  = await api.get('/farms/')
      const cropQuery = (farmRes.data.length > 0 && farmRes.data[0].current_crop)
        ? farmRes.data[0].current_crop
        : 'Tomato'
      setFarmCrop(cropQuery)

      const mktRes = await api.get(`/markets/compare?crop_name=${cropQuery}`)
      const processed = mktRes.data.map(m => {
        const p = m.prices.length > 0 ? m.prices[0] : { price: 0, transport_cost: 0, grade: 'Standard', unit: '₹/quintal' }
        return {
          ...m,
          price:        parseFloat(p.price),
          transportCost:parseFloat(p.transport_cost),
          grade:        p.grade,
          unit:         p.unit,
          grossRevenue: parseFloat(p.price) * quantity,
          netReturn:   (parseFloat(p.price) * quantity) - parseFloat(p.transport_cost),
        }
      })
      setMarkets(processed.sort((a, b) => b.netReturn - a.netReturn))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Recalculate on quantity change
  useEffect(() => {
    if (markets.length === 0) return
    const updated = markets.map(m => ({
      ...m,
      grossRevenue: m.price * quantity,
      netReturn:   (m.price * quantity) - m.transportCost,
    }))
    setMarkets(updated.sort((a, b) => b.netReturn - a.netReturn))
  }, [quantity])

  if (loading) return <DashboardLayout><PageLoadingState /></DashboardLayout>

  const best      = markets[0] || null
  const chartData = markets.map(m => ({ name: m.name.split(' ')[0], netReturn: m.netReturn }))

  return (
    <DashboardLayout>
      <PageHeader
        title="Market Intelligence"
        subtitle={`APMC market comparison for ${farmCrop || 'your crop'}`}
        icon={TrendingUp}
        badge={<span>Verified Market Prices</span>}
      />

      {markets.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No market data available"
          description={`Market information for '${farmCrop}' is not currently available.`}
        />
      ) : (
        <div className="space-y-5 max-w-5xl">

          {/* Controls row */}
          <div className="flex flex-wrap items-end gap-5 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-card">
            <div>
              <p className="label-sm mb-1">Crop</p>
              <p className="font-semibold text-gray-900 text-sm">{farmCrop}</p>
            </div>
            <div>
              <label className="label-sm mb-1 block" htmlFor="qty-input">Analysis Quantity</label>
              <div className="flex items-center gap-2">
                <input
                  id="qty-input"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="input-field w-24"
                />
                <span className="text-sm text-gray-500">quintals</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
              <Info className="w-3.5 h-3.5" />
              Net return = (price × quantity) − transport cost
            </div>
          </div>

          {/* Best market highlight */}
          {best && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-0.5">Best Net Return</p>
                <p className="font-bold text-emerald-900">{best.name}</p>
                <p className="text-sm text-emerald-700 mt-0.5">
                  ₹{best.netReturn.toLocaleString()} estimated for {quantity} quintals
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500">Price Rate</p>
                <p className="font-bold text-gray-900">₹{best.price}/quintal</p>
              </div>
            </div>
          )}

          {/* Main content: table + chart */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Market comparison table */}
            <div className="lg:col-span-2 card">
              <p className="section-title mb-3">Market Comparison</p>
              <div className="overflow-x-auto">
                <table className="table-base w-full">
                  <thead>
                    <tr>
                      <th>Market</th>
                      <th>Location</th>
                      <th className="text-right">Price/quintal</th>
                      <th className="text-right hidden sm:table-cell">Transport</th>
                      <th className="text-right">Net Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markets.map((m) => (
                      <tr key={m.id} className={best && m.id === best.id ? 'bg-emerald-50/60' : ''}>
                        <td>
                          <div className="flex items-center gap-2">
                            {best && m.id === best.id && (
                              <span className="badge-success text-[10px]">Best</span>
                            )}
                            <span className="font-medium text-gray-900 truncate max-w-[120px]" title={m.name}>
                              {m.name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[80px]" title={m.location}>{m.location}</span>
                          </div>
                        </td>
                        <td className="text-right font-semibold text-gray-900">₹{m.price}</td>
                        <td className="text-right text-red-500 hidden sm:table-cell">- ₹{m.transportCost}</td>
                        <td className="text-right">
                          <span className={`font-bold ${best && m.id === best.id ? 'text-emerald-700' : 'text-gray-700'}`}>
                            ₹{m.netReturn.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="card">
              <p className="section-title mb-3">Net Return ₹</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} width={60} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                    formatter={v => [`₹${v.toLocaleString()}`, 'Net Return']}
                  />
                  <Bar dataKey="netReturn" radius={[0, 4, 4, 0]}>
                    {chartData.map((item, i) => (
                      <Cell key={i} fill={i === 0 ? '#15803d' : '#d1fae5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center text-xs text-amber-800">
            Market prices fluctuate rapidly. Always verify with actual APMC price boards before making selling decisions.
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
