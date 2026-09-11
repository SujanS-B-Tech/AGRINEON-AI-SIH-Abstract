import { Link } from 'react-router-dom'
import {
  Leaf, Brain, FlaskConical, Stethoscope, TrendingUp, Wifi, Globe,
  ArrowRight, Check, ChevronRight,
} from 'lucide-react'

const FEATURES = [
  { icon: Leaf,        title: 'Smart Crop Recommendation',   desc: 'ML-powered recommendations based on your soil, climate, and market conditions' },
  { icon: Brain,       title: 'Explainable AI',              desc: 'Understand exactly why each recommendation was made — no black boxes' },
  { icon: FlaskConical,title: 'Soil Intelligence',            desc: 'Upload soil reports and get actionable, farmer-friendly insights' },
  { icon: Stethoscope, title: 'Crop Disease Detection',      desc: 'AI-powered disease identification from leaf and crop images' },
  { icon: TrendingUp,  title: 'Market Intelligence',         desc: 'Compare APMC market prices and find the best selling option' },
  { icon: Globe,       title: 'Multilingual Voice Assistant', desc: 'Voice and chat support in English and Tamil for every farmer' },
]

const LIFECYCLE = ['Soil', 'Crop', 'Disease', 'Plan', 'Market', 'Profit']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-soil-50 font-sans">
      {/* ── Topbar ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-700 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-primary-900 tracking-wide">AGRONEON</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2 min-h-0">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Brand + CTA */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary-300 uppercase mb-4">
                Smart India Hackathon · SIHI018
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Farm Smarter.<br />
                <span className="text-crop-400">Grow Confident.</span>
              </h1>
              <p className="text-primary-200 text-base md:text-lg leading-relaxed mb-8 max-w-md">
                AGRONEON gives small and marginal farmers practical, explainable AI — from soil analysis to market selection.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-800 font-semibold rounded-lg hover:bg-primary-50 transition-colors text-sm">
                  Start for Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 border border-primary-600 text-primary-100 font-semibold rounded-lg hover:border-primary-400 hover:text-white transition-colors text-sm">
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right: Feature quick-view */}
            <div className="space-y-2">
              {[
                'AI-powered crop recommendations with explainable reasoning',
                'Disease detection from crop images',
                'Market price comparison across APMC markets',
                'Daily farming plans from verified crop calendars',
                'Voice assistant in English and Tamil',
                'Offline-capable with local data caching',
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-primary-800/50 last:border-b-0">
                  <span className="w-5 h-5 rounded-full bg-primary-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary-200" />
                  </span>
                  <p className="text-sm text-primary-200">{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Lifecycle Flow ── */}
      <section className="bg-white border-y border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-6">Full farming lifecycle support</p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {LIFECYCLE.map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <span className="px-3 py-1.5 bg-primary-50 text-primary-800 text-xs font-semibold rounded-full border border-primary-100">
                  {step}
                </span>
                {i < LIFECYCLE.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Everything a farmer needs</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            From soil to sale — AGRONEON guides you through every step with practical, explainable AI.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-150">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-primary-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to grow smarter?</h2>
          <p className="text-primary-200 text-sm mb-6">Join AGRONEON and get AI-powered farming guidance from soil to sale.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-800 font-semibold rounded-lg hover:bg-primary-50 transition-colors">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-500 py-6 text-center text-xs">
        <p className="font-semibold text-gray-400">AGRONEON · Team TECH NEON</p>
        <p className="mt-1">Smart India Hackathon 2026 · Problem Statement: Smart Crop Advisory for Small & Marginal Farmers</p>
      </footer>
    </div>
  )
}
