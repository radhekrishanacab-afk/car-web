'use client'

import { useEffect } from 'react'

/**
 * ScrollReveal
 * ------------
 * Professional scroll-triggered entrance animations.
 *
 * Supported directions via data-reveal attribute:
 *   data-reveal="left"   → slide in from the left
 *   data-reveal="right"  → slide in from the right
 *   data-reveal="up"     → slide up from below
 *   data-reveal="down"   → slide down from above
 *   data-reveal="zoom"   → zoom + fade in (0.92 → 1)
 *   data-reveal="fade"   → fade only
 *
 * Every <section> without an explicit data-reveal automatically gets an
 * alternating direction (up → left → right → zoom …) for a dynamic flow.
 *
 * Children of a [data-reveal-stagger] container animate one after another.
 *
 * Uses IntersectionObserver for performant, on-demand triggering.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    // Auto-assign an alternating reveal direction to every <section> that
    // does not already declare one. Mix of slide + zoom keeps it lively.
    const sections = document.querySelectorAll('section:not([data-reveal])')
    const directions = ['up', 'left', 'right', 'zoom', 'up', 'left', 'right', 'zoom']
    sections.forEach((el, i) => {
      el.setAttribute('data-reveal', directions[i % directions.length])
    })

    const targets = document.querySelectorAll<HTMLElement>(
      '[data-reveal], [data-reveal-stagger]'
    )

    if (!('IntersectionObserver' in window) || targets.length === 0) {
      targets.forEach((el) => el.classList.add('reveal-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
