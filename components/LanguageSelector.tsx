// components/LanguageSelector.tsx
'use client'
import { useState, useEffect } from 'react'
import { languages } from '../lib/translations'

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (language: string) => void
  className?: string
}

export default function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange, 
  className = '' 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.language-selector')) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])
  
  return (
    <div className={`relative language-selector ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors border border-white/20"
        title="Select Language"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-white text-sm font-medium hidden sm:block">
          {currentLang.name}
        </span>
        <svg 
          className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl z-50 overflow-hidden">
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageChange(language.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                  currentLanguage === language.code ? 'bg-white/10 text-purple-300' : 'text-gray-300'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {currentLanguage === language.code && (
                  <span className="ml-auto text-purple-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}