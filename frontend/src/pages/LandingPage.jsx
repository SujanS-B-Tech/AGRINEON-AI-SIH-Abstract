import { Link } from 'react-router-dom'
import { Leaf, Brain, FlaskConical, Stethoscope, TrendingUp, Wifi, Globe, ArrowRight } from 'lucide-react'

const CAPABILITIES = [
  { icon: Leaf, title: 'Smart Crop Recommendation', desc: 'ML-powered top-3 crop suggestions based on your soil and climate' },
  { icon: Brain, title: 'Explainable AI', desc: 'Understand exactly why each crop was recommended with SHAP analysis' },
  { icon: FlaskConical, title: 'Soil Intelligence', desc: 'Upload soil reports and get actionable agricultural insights' },
  { icon: Stethoscope, title: 'Crop Disease Detection', desc: 'AI-powered disease identification from leaf and crop images' },
  { icon: TrendingUp, title: 'Profit & Risk Analysis', desc: 'Estimated costs, revenue, profit and risk assessment' },
  { icon: TrendingUp, title: 'Market Intelligence', desc: 'Compare market prices and find the best selling option' },
  { icon: Wifi, title: 'Offline-First Support', desc: 'Access saved farm data even without internet connectivity' },
  { icon: Globe, title: 'Multilingual Assistance', desc: 'Voice and chat support in English and Tamil' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8" />
            <span className="text-2xl font-bold">AGRONEON</span>
          </div>
          <Link to="/login" className="text-white/90 hover:text-white font-medium">Login</Link>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 text-center">
          <p className="text-primary-200 text-sm font-medium tracking-wider uppercase mb-4">Smart India Hackathon · SIHI018</p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">AGRONEON</h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-2">Explainable AI-Powered Smart Farming Ecosystem</p>
          <p className="text-lg text-primary-200 mb-10 max-w-2xl mx-auto">
            Empowering Every Farmer with Explainable AI – From Soil to Sale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 text-lg px-8">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition-colors text-lg min-h-[48px]">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Capabilities */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Complete Farming Lifecycle Support</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          From soil analysis to market sale — AGRONEON guides you through every step with explainable AI.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lifecycle Flow */}
      <section className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Soil → Crop → Cultivation → Health → Profit → Market → Sale</h2>
          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium">
            {['Soil', 'Crop', 'Cultivation', 'Crop Health', 'Profit', 'Market', 'Sale'].map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="px-4 py-2 bg-white rounded-full shadow-sm text-primary-700">{step}</span>
                {i < 6 && <ArrowRight className="w-4 h-4 text-primary-400 hidden sm:block" />}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>AGRONEON · Team TECH NEON · Smart India Hackathon 2025</p>
        <p className="mt-1">Problem Statement: Smart Crop Advisory System for Small and Marginal Farmers</p>
      </footer>
    </div>
  )
}
