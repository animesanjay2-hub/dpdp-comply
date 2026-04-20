'use client'
import { useEffect, useState } from 'react'

export function BreachTimer({ detectedAt }: { detectedAt: Date }) {
  const [timeLeft, setTimeLeft] = useState({ 
    hours: 72, minutes: 0, seconds: 0 
  })
  const [isOverdue, setIsOverdue] = useState(false)

  useEffect(() => {
    const deadline = new Date(detectedAt.getTime() + 
                               72 * 60 * 60 * 1000)
    
    const interval = setInterval(() => {
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()
      
      if (diff <= 0) {
        setIsOverdue(true)
        clearInterval(interval)
        return
      }
      
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [detectedAt])

  const bgColor = isOverdue ? 'bg-red-900' : 
                  timeLeft.hours < 12 ? 'bg-red-700' : 'bg-red-600'

  return (
    <div className={`${bgColor} rounded-2xl p-8 text-center text-white`}>
      {isOverdue ? (
        <div>
          <p className="text-2xl font-bold mb-2">
            ⚠️ 72 HOURS EXCEEDED
          </p>
          <p className="text-red-200">
            Notify DPB IMMEDIATELY — you are in violation
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm uppercase tracking-wider mb-4 text-red-200">
            DPB Must Be Notified In
          </p>
          <div className="flex justify-center gap-4">
            <div>
              <p className="text-7xl font-mono font-bold">
                {String(timeLeft.hours).padStart(2, '0')}
              </p>
              <p className="text-xs text-red-300 mt-1">HOURS</p>
            </div>
            <p className="text-7xl font-mono font-bold">:</p>
            <div>
              <p className="text-7xl font-mono font-bold">
                {String(timeLeft.minutes).padStart(2, '0')}
              </p>
              <p className="text-xs text-red-300 mt-1">MINUTES</p>
            </div>
            <p className="text-7xl font-mono font-bold">:</p>
            <div>
              <p className="text-7xl font-mono font-bold">
                {String(timeLeft.seconds).padStart(2, '0')}
              </p>
              <p className="text-xs text-red-300 mt-1">SECONDS</p>
            </div>
          </div>
          <p className="text-red-300 text-sm mt-4">
            DPDP Act 2023 — 72-Hour Breach Notification Rule
          </p>
        </div>
      )}
    </div>
  )
}
