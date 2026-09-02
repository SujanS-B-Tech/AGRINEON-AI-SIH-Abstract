import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, MessageSquare, Volume2, Maximize2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'

export default function VoiceAssistantPage() {
  const [messages, setMessages] = useState([
    { text: "Hello! I am AGRI-VOICE, your intelligent farming assistant. Click the microphone to speak, or type your question below. I know your farm details, crops, and market prices.", isUser: false }
  ])
  const [isListening, setIsListening] = useState(false)
  const [inputText, setInputText] = useState('')
  const [language, setLanguage] = useState('English') // English or Tamil
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textOveride = '') => {
    const text = textOveride || inputText
    if (!text.trim()) return

    setMessages(prev => [...prev, { text, isUser: true }])
    setInputText('')
    setLoading(true)

    try {
      const res = await api.post('/chat/', {
        message: text,
        language: language
      })
      
      const reply = res.data.reply
      setMessages(prev => [...prev, { text: reply, isUser: false }])
      speakResponse(reply, language)
    } catch (e) {
      setMessages(prev => [...prev, { text: "Sorry, I couldn't process that right now.", isUser: false }])
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support speech recognition. Try Google Chrome.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = language === 'Tamil' ? 'ta-IN' : 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInputText(transcript)
      handleSend(transcript)
    }

    recognition.onerror = (event) => {
      console.error(event.error)
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)
    
    recognition.start()
  }

  const speakResponse = (text, lang) => {
    if (!('speechSynthesis' in window)) return
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'Tamil' ? 'ta-IN' : 'en-US'
    
    const voices = window.speechSynthesis.getVoices()
    
    // Attempt to set a native-sounding voice
    if (lang === 'Tamil') {
      const gVoice = voices.find(v => v.lang.includes('ta') && v.name.includes('Google'))
      if(gVoice) utterance.voice = gVoice
    }
    
    window.speechSynthesis.speak(utterance)
  }

  return (
    <DashboardLayout title="Voice Assistant" subtitle="Your context-aware AI farming companion">
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* Header Settings */}
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-gray-500" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
            </select>
          </div>
          <button className="text-gray-400 hover:text-gray-600"><Maximize2 className="w-5 h-5" /></button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.isUser ? 'bg-gray-200 text-gray-600' : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'}`}>
                  {msg.isUser ? <span className="font-bold text-sm">Me</span> : <MessageSquare className="w-5 h-5" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 shadow-sm ${msg.isUser ? 'bg-white border border-gray-100 rounded-2xl rounded-tr-sm' : 'bg-primary-900 border border-primary-800 text-white rounded-2xl rounded-tl-sm'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex w-full justify-start">
               <div className="flex gap-3 max-w-[80%]">
                 <div className="w-10 h-10 shrink-0 rounded-full bg-primary-600 text-white flex items-center justify-center">
                   <div className="animate-pulse w-3 h-3 bg-white rounded-full" />
                 </div>
                 <div className="p-4 bg-primary-900 border border-primary-800 text-white text-sm rounded-2xl rounded-tl-sm opacity-70">
                   Thinking based on your farm context...
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button 
              onClick={startListening}
              className={`p-4 rounded-full shrink-0 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <div className="flex-1 relative">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type your question here..."}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-4 pr-12 py-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                disabled={isListening}
              />
              <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">Try asking: "What tasks should I do today?" or "What is the tomato price in Thanjavur?"</p>
        </div>

      </div>
    </DashboardLayout>
  )
}
