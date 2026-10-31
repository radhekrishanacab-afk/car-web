'use client'

import { MessageCircle } from 'lucide-react'

interface Props {
  whatsappNumber?: string
  message?: string
  label?: string
  className?: string
  variant?: 'floating' | 'inline' | 'primary'
}

export default function WhatsAppButton({
  whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832',
  message = 'Hello! I would like to enquire about taxi services from Radhe Krishna Cabs.',
  label = 'WhatsApp Enquiry',
  className = '',
  variant = 'inline',
}: Props) {
  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) {
      alert('Could not open WhatsApp automatically. Please contact us at +91 97230 97832.')
    }
  }

  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-2xl transition-all hover:scale-105 ${className}`}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Chat with Us</span>
      </button>
    )
  }

  if (variant === 'primary') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md ${className}`}
      >
        <MessageCircle className="w-5 h-5" />
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </button>
  )
}
