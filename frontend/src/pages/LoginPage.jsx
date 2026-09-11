import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/LoadingState'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPwd, setShowPwd]   = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(formData)
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
            Empowering farmers<br />
            with <span className="text-crop-400">explainable AI</span>.
          </h2>
          <p className="text-primary-300 text-sm leading-relaxed mb-8">
            From soil analysis to market selection — AGRONEON helps small and marginal farmers make confident, data-driven decisions.
          </p>
          <div className="space-y-3">
            {[
              'AI crop recommendations with clear reasoning',
              'Disease detection from leaf images',
              'Market price comparison across APMCs',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-primary-200">
                <span className="w-4 h-4 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-primary-300">✓</span>
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-500 text-xs">
          Smart India Hackathon 2026 · Team TECH NEON
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-soil-50">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 lg:hidden mb-8">
          <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-primary-900">AGRONEON</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your farm account</p>
          </div>

          {error && (
            <div className="inline-alert-error mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-group">
              <label className="label" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  autoComplete="email"
                  className="input-field pl-9"
                  placeholder="farmer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="input-field pl-9 pr-9"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPwd(!showPwd)}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo credentials hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <span className="font-semibold">Demo account: </span>
              farmer@agroneon.com / password123
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <><Spinner className="text-white" /> Authenticating...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
