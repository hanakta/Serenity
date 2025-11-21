'use client'

import CookieConsent from './CookieConsent'

export default function CookieConsentWrapper() {
  const handleAccept = () => {
    console.log('Cookies приняты')
  }

  const handleDecline = () => {
    console.log('Cookies отклонены')
  }

  return (
    <CookieConsent 
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  )
}



