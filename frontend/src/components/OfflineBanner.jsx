import { WifiOff } from 'lucide-react'
import { useOffline } from '../context/OfflineContext'

export default function OfflineBanner() {
  const { isOnline } = useOffline()
  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      Offline Mode — Showing saved information. Changes will sync when connected.
    </div>
  )
}
