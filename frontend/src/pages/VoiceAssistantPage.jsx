import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, Volume2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import api from '../utils/api'

export default function VoiceAssistantPage() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm AGRI-VOICE, your farming assistant. Ask me about your crop, today's tasks, market prices, or weather — in English या Tamil.",
      isUser: false,
    },
  ])
  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText]     = useState('')
  const [language, setLanguage]       = useState('English')
  const [loading, setLoading]         = useState(false)
  const [farmCtx, setFarmCtx]         = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    api.get('/farms/').then(r => {
      if (r.data.length > 0) setFarmCtx(r.data[0])
    }).catch(() => {})
  }, [])

  const handleSend = async (textOverride = '') => {
    const text = textOverride || inputText
    if (!text.trim()) return

    setMessages(prev => [...prev, { text, isUser: true }])
    setInputText('')
    setLoading(true)

    try {
      const res = await api.post('/chat/', { message: text, language })
      const reply = res.data.reply
      setMessages(prev => [...prev, { text: reply, isUser: false }])
      speakResponse(reply, language)
    } catch {
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't connect right now. Please check your connection and try again.",
        isUser: false,
        isError: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = language === 'Tamil' ? 'ta-IN' : 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart  = () => setIsListening(true)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInputText(transcript)
      handleSend(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend   = () => setIsListening(false)
    recognition.start()
  }

  const speakResponse = (text, lang) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'Tamil' ? 'ta-IN' : 'en-US'
    const voices = window.speechSynthesis.getVoices()
    if (lang === 'Tamil') {
      const gVoice = voices.find(v => v.lang.includes('ta') && v.name.includes('Google'))
      if (gVoice) utterance.voice = gVoice
    }
    window.speechSynthesis.speak(utterance)
  }

  const SUGGESTIONS = [
    "What should I do today on my farm?",
    "What is the current market price?",
    language === 'Tamil' ? "நான் எந்த பயிர் வளர்க்கலாம்?" : "What crops suit my soil?",
  ]

  return (
    <DashboardLayout>
      <PageHeader
        title="AGRI-VOICE"
        subtitle="Context-aware agricultural assistant"
        icon={Mic}
      />

      <div className="max-w-3xl flex flex-col h-[calc(100vh-200px)] min-h-[480px]">
        {/* Header bar */}
        <div className="bg-white border border-gray-200 rounded-t-xl px-4 py-3 flex items-center justify-between">
          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {['English', 'Tamil'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  language === lang
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang === 'Tamil' ? 'தமிழ்' : 'EN'}
              </button>
            ))}
          </div>

          {/* Farm context */}
          {farmCtx && (
            <p className="text-xs text-gray-400 hidden sm:block">
              <Volume2 className="w-3 h-3 inline mr-1 text-gray-300" />
              Your farm: <span className="font-medium text-gray-600">{farmCtx.current_crop || 'No crop'}</span>
              {farmCtx.location && <> · {farmCtx.location}</>}
            </p>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-white border-x border-gray-200 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {!msg.isUser && (
                <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Mic className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.isUser
                  ? 'bg-primary-700 text-white rounded-tr-sm'
                  : msg.isError
                  ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-sm'
                  : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-tl-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {!msg.isUser && !msg.isError && (
                  <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <Volume2 className="w-2.5 h-2.5" /> Based on your farm context
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start gap-2 animate-fade-in">
              <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center shrink-0">
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border border-gray-200 rounded-b-xl px-4 py-3">
          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-700 rounded-full transition-colors border border-gray-200 hover:border-primary-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Mic button */}
            <button
              onClick={startListening}
              disabled={loading}
              className={`relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              }`}
              title={isListening ? 'Listening...' : 'Start speaking'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening && (
                <span className="absolute -inset-1 rounded-full border-2 border-red-400 animate-pulse-ring" />
              )}
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
              placeholder={isListening ? 'Listening...' : language === 'Tamil' ? 'இங்கே தட்டச்சு செய்யுங்கள்...' : 'Ask about your farm...'}
              className="flex-1 input-field"
              disabled={isListening || loading}
            />

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || loading}
              className="shrink-0 w-10 h-10 rounded-full bg-primary-700 text-white flex items-center justify-center hover:bg-primary-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
