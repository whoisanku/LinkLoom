
import { useState, useEffect } from 'react'
import Heading from '@ui/Typography'

export default function Timer({
  targetDate, // e.g. new Date("2025-10-30T13:30:00")
}: {
  targetDate: Date
}) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate))

  // helper function
  function calcTimeLeft(target: Date) {
    const diff = Math.max(target.getTime() - new Date().getTime(), 0)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)
    return { diff, days, hours, minutes, seconds }
  }

  useEffect(() => {
    if (timeLeft.diff <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, timeLeft.diff])

  const segments = [
    { label: 'days', value: timeLeft.days },
    { label: 'hrs', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'mins', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'secs', value: String(timeLeft.seconds).padStart(2, '0') },
  ]

  return (
    <div className="flex rounded-md">
      <div className="flex flex-wrap justify-center items-center gap-2 text-center">
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-2">
            <Heading variant="body-s" title={seg.value} color="white" fontWeight={700} />
            <Heading variant="body-xs" title={seg.label} color="white" fontWeight={700} />
            {i < segments.length - 1 && <Heading variant="body-xs" title=":" color="white" fontWeight={700} />}
          </div>
        ))}
      </div>
    </div>
  )
}
