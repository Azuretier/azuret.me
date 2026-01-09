'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [followerPosition, setFollowerPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - 10, y: e.clientY - 10 })
      
      setTimeout(() => {
        setFollowerPosition({ x: e.clientX - 20, y: e.clientY - 20 })
      }, 100)
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    document.addEventListener('mousemove', handleMouseMove)
    
    const hoverElements = document.querySelectorAll('a, button, .interactive-element, .work-card')
    hoverElements.forEach(elem => {
      elem.addEventListener('mouseenter', handleMouseEnter)
      elem.addEventListener('mouseleave', handleMouseLeave)
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      hoverElements.forEach(elem => {
        elem.removeEventListener('mouseenter', handleMouseEnter)
        elem.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])

  return (
    <>
      <div 
        className={`cursor ${isHovering ? 'hover' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      <div 
        className="cursor-follower"
        style={{ left: `${followerPosition.x}px`, top: `${followerPosition.y}px` }}
      />
    </>
  )
}
