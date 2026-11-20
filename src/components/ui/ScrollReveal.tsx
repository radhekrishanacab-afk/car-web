'use client'

import { useEffect } from 'react'

/**
 * ScrollReveal
 * ------------
 * Scroll-triggered entrance animations for elements that explicitly declare
 * a data-reveal attribute. Sections are NOT auto-animated — this keeps
 * images and links visible immediately and prevents any load-time flicker.
 *
 * Supported directions via data-reveal attribute:
 *   data-reveal="left"   → slide in from the left
 *   data-reveal="right"  → slide in from the right
 *   data-reveal="up"     → slide up from below
 *   data-reveal="down"   → slide down from above
 *   data-reveal="zoom"   → zoom + fade in
 *   data-reveal="fade"   → fade only
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

    // Only animate elements that explicitly opt-in via data-reveal or
    // data-reveal-stagger. We do NOT auto-annotate <section> elements —
    // that caused entire sections (and their images) to be hidden until
    // scrolled into view, making the page feel slow.
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
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
