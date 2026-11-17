'use client'

import { useEffect, useRef } from 'react'

/**
 * CustomCursor
 * ------------
 * A professional custom mouse cursor with two layers:
 *   • a small dot  that follows the pointer instantly
 *   • a larger ring that trails smoothly behind (lerp)
 *
 * On hover over interactive elements (links, buttons, inputs) the ring
 * grows and the dot fades — giving a polished, premium feel.
 *
 * Colours use the site brand palette: cyan #08A9EE with a navy glow.
 *
 * Automatically disabled on touch / coarse-pointer devices.
 */
export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Disable on touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Hide the native cursor across the whole page
    document.documentElement.style.cursor = 'none'
    document.body.style.cursor = 'none'

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX  = mouseX
    let ringY  = mouseY
    let rafId  = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      // Dot snaps instantly to the pointer
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
    }

    const animate = () => {
      // Smooth trailing for the ring (lerp factor 0.18)
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    // Hover state over interactive elements
    const interactive = 'a, button, input, select, textarea, [role="button"], label, [data-cursor="hover"]'
    const onOver = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest(interactive)) {
        ring.classList.add('cursor-ring--hover')
        dot.classList.add('cursor-dot--hover')
      }
    }
    const onOut = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest(interactive)) {
        ring.classList.remove('cursor-ring--hover')
        dot.classList.remove('cursor-dot--hover')
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.documentElement.style.cursor = ''
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
    </>
  )
}
