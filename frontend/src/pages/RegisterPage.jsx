import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, User, Mail, Lock, MapPin, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/LoadingState'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    land_area: 1,
    preferred_language: 'English',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = { ...formData, land_area: parseFloat(formData.land_area) || 1.0 }
    if (!payload.email) delete payload.email

    const result = await register(payload)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex w-2/5 bg-primary-900 flex-col justify-between p-10 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-700 rounded-xl flex items-center justify-center border border-primary-600">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold tracking-wide">AGRONEON</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Start your<br />
            <span className="text-crop-400">smart farming</span><br />
            journey today.
          </h2>
          <p className="text-primary-300 text-sm leading-relaxed mb-6">
            Register to access crop recommendations, disease detection, market intelligence, and farming plans — all with explainable AI.
          </p>
          <div className="bg-primary-800 rounded-xl p-4 border border-primary-700">
            <p className="text-xs text-primary-400 font-semibold uppercase tracking-wide mb-2">What you get</p>
            <ul className="space-y-1.5 text-sm text-primary-200">
              <li className="flex items-center gap-2"><span className="text-crop-400">✓</span> Personalized crop advisory</li>
              <li className="flex items-center gap-2"><span className="text-crop-400">✓</span> Disease diagnostics from images</li>
              <li className="flex items-center gap-2"><span className="text-crop-400">✓</span> Market price comparison</li>
              <li className="flex items-center gap-2"><span className="text-crop-400">✓</span> Daily farming plan & schedule</li>
              <li className="flex items-center gap-2"><span className="text-crop-400">✓</span> Voice assistant in Tamil & English</li>
            </ul>
          </div>
        </div>

        <p className="text-primary-500 text-xs">
          Smart India Hackathon 2026 · Team TECH NEON
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 bg-soil-50 overflow-y-auto">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 lg:hidden mb-6">
          <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-primary-900">AGRONEON</span>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500">Join AGRONEON and start farming smarter</p>
          </div>

          {error && (
            <div className="inline-alert-error mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account details */}
            <div>
              <p className="label-sm text-gray-400 mb-3">Account Details</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label" htmlFor="name">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input id="name" name="name" type="text" required className="input-field pl-9" placeholder="Ramesh Kumar" value={formData.name} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="phone">Phone Number</label>
                  <input id="phone" name="phone" type="tel" required className="input-field" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="reg-email">Email <span className="text-gray-400">(optional)</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input id="reg-email" name="email" type="email" className="input-field pl-9" placeholder="farmer@example.com" value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="reg-password">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <input id="reg-password" name="password" type={showPwd ? 'text' : 'password'} required className="input-field pl-9 pr-9" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                    <button type="button" className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm details */}
            <div>
              <p className="label-sm text-gray-400 mb-3">Farm Details</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group sm:col-span-2">
                  <label className="label" htmlFor="location">Village / Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <input id="location" name="location" type="text" required className="input-field pl-9" placeholder="Block, District, State" value={formData.location} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="land_area">Land Area (Acres)</label>
                  <input id="land_area" name="land_area" type="number" step="0.1" required min="0.1" className="input-field" placeholder="2.5" value={formData.land_area} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="preferred_language">Preferred Language</label>
                  <select id="preferred_language" name="preferred_language" className="select-field" value={formData.preferred_language} onChange={handleChange}>
                    <option value="English">English</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <><Spinner className="text-white" /> Creating Account...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
