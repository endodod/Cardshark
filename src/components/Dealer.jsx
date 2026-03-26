'use client'

import { useEffect, useRef, useState } from 'react'
import { sounds } from '@/lib/soundEngine'

const CHAR_DELAY = 40
const MESSAGE_PAUSE = 600

export default function Dealer({ messages, onDone }) {
  const [completedMessages, setCompletedMessages] = useState([])
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cursor, setCursor] = useState(true)

  const doneFiredRef = useRef(false)

  // Reset when messages prop changes
  useEffect(() => {
    setCompletedMessages([])
    setCurrentText('')
    setCurrentIndex(0)
    doneFiredRef.current = false
  }, [messages])

  // Blink cursor
  useEffect(() => {
    const interval = setInterval(() => setCursor(c => !c), 500)
    return () => clearInterval(interval)
  }, [])

  // Fire onDone when all messages are typed
  useEffect(() => {
    if (!messages || messages.length === 0) return
    if (currentIndex >= messages.length && !doneFiredRef.current) {
      doneFiredRef.current = true
      onDone?.()
    }
  }, [currentIndex, messages, onDone])

  // Typewriter logic
  useEffect(() => {
    if (!messages || messages.length === 0) return
    if (currentIndex >= messages.length) return

    const message = messages[currentIndex]
    let charPos = 0
    let typed = ''

    const interval = setInterval(() => {
      if (charPos < message.length) {
        typed += message[charPos]
        charPos++
        sounds.typewriter_click()
        setCurrentText(typed)
      } else {
        clearInterval(interval)
        // Message complete — wait then advance
        setTimeout(() => {
          setCompletedMessages(prev => [...prev, message])
          setCurrentText('')
          setCurrentIndex(i => i + 1)
        }, MESSAGE_PAUSE)
      }
    }, CHAR_DELAY)

    return () => clearInterval(interval)
  }, [currentIndex, messages])

  if (!messages || messages.length === 0) return null

  return (
    <div style={{ color: '#80c080', lineHeight: '1.6' }}>
      {completedMessages.map((msg, i) => (
        <div key={i}>&gt; {msg}</div>
      ))}
      {currentIndex < messages.length && (
        <div>
          &gt; {currentText}{cursor ? '|' : '\u00a0'}
        </div>
      )}
    </div>
  )
}
