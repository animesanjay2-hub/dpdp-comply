'use client'
import { useEffect, useState } from 'react'
import { differenceInDays } from 'date-fns'

interface CountdownTimerProps {
  targetDate: Date
  label: string
  urgencyDays?: number
}

export function CountdownTimer({ 
  targetDate, 
  label,
  urgencyDays = 90 
}: CountdownTimerProps) {
  const [days, setDays] = useState(0)

  useEffect(() => {
    const calc = () => {
      setDays(Math.max(0, differenceInDays(targetDate, new Date())))
    }
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [targetDate])

  const color = days < urgencyDays * 0.33 ? '#c62828' :
                days < urgencyDays ? '#f57c00' : '#1a237e'

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <p className="text-gray-500 text-sm mb-2">{label}</p>
      <p style={{ 
        fontSize: '4rem', 
        fontWeight: '800', 
        color, 
        lineHeight: 1 
      }}>
        {days}
      </p>
      <p className="text-gray-400 text-sm mt-1">days remaining</p>
    </div>
  )
}
