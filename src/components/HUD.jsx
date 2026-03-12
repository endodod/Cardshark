'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function AnimatedBalance({ value }) {
  const motionVal = useMotionValue(value)
  const spring = useSpring(motionVal, { duration: 600 })
  const display = useTransform(spring, v => Math.round(v).toLocaleString())
  const [color, setColor] = useState('#f0c040')
  const prevRef = useRef(value)

  useEffect(() => {
    const delta = value - prevRef.current
    if (delta !== 0) {
      setColor(delta > 0 ? '#80c080' : '#c03030')
      const timeout = setTimeout(() => setColor('#f0c040'), 700)
      prevRef.current = value
      motionVal.set(value)
      return () => clearTimeout(timeout)
    }
  }, [value])

  return (
    <motion.span style={{ color }}>{display}</motion.span>
  )
}

export default function HUD({ balance, activeModifier }) {
  const borderColor = activeModifier?.type === 'curse' ? '#c03030' : '#80c080'

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #666666',
      paddingBottom: '6px',
      marginBottom: '10px',
    }}>
      <div style={{ color: '#f0c040', fontSize: '1.2em' }}>
        BALANCE: <AnimatedBalance value={balance} /> CHIPS
      </div>

      {activeModifier && (
        <div style={{
          border: `1px solid ${borderColor}`,
          padding: '4px 10px',
          textAlign: 'right',
        }}>
          <div style={{ color: borderColor, fontSize: '0.9em' }}>
            [{activeModifier.label}]
          </div>
          <div style={{ color: '#c8c8a0', fontSize: '0.75em' }}>
            {activeModifier.description}
          </div>
        </div>
      )}
    </div>
  )
}
