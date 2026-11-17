'use client'

import { useEffect } from 'react'

/**
 * ScrollReveal
 * ------------
 * Adds professional scroll-triggered entrance animations to every
 * <section> and any element carrying a data-reveal attribute.
 *
 *   data-reveal="left"   → slide in from left
 *   data-reveal="right"  → slide in from right
 *   data-reveal="up"     → slide up (default for sections)
 *   data-reveal="fade"   → fade only
 *
 * Children of a [data-reveal-stagger] container animate one after another.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    // Auto-apply a reveal direction to every <section> that does not
    // already carry an explicit data-reveal attribute.
    // First section (usually hero) slides up; subsequent sections
    // alternate left → right → left for a professional, dynamic feel.
    const sections = document.querySelectorAll('section:not([data-reveal])')
    const directions = ['up', 'left', 'right', 'left', 'right', 'up', 'left', 'right']
    sections.forEach((el, i) => {
      el.setAttribute('data-reveal', directions[i % directions.length])
    })

    const targets = document.querySelectorAll<HTMLElement>(
      '[data-reveal], [data-reveal-stagger]'
    )

    if (!('IntersectionObserver' in window) || targets.length === 0) {
      // Fallback: just show everything
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
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
