import { useState, useEffect } from 'react'
import { ExternalLink, Search, Settings } from 'lucide-react'
import type { FactCheckResult } from '@/components/ResultsPanel/ResultsPanel'
import { storage } from 'wxt/utils/storage'
import './App.css'

interface LastFactCheck {
  claim: string
  result: FactCheckResult
  language: string
  pageUrl: string
  checkedAt: string
}

export default function App() {
  const [lastCheck, setLastCheck] = useState<LastFactCheck | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)
  const url = window.location.href

  useEffect(() => {
    let isMounted = true

    storage.getItem<LastFactCheck>('local:lastFactCheck').then((value) => {
      if (isMounted) {
        setLastCheck(value)
      }
    }).catch((error) => {
      console.warn('[ScholarLens] Failed to read the last fact-check:', error)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const openLastAnalysis = async () => {
    if (!lastCheck) {
      return
    }

    setOpenError(null)

    try {
      const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (!activeTab.id) {
        throw new Error('No active tab is available.')
      }

      const response = await browser.tabs.sendMessage(activeTab.id, {
        type: 'OPEN_CACHED_FACT_CHECK',
        payload: lastCheck,
      })

      if (!response?.success) {
        throw new Error(response?.error || 'The result panel could not be opened.')
      }

      window.close()
    } catch (error) {
      console.warn('[ScholarLens] Failed to open the last fact-check:', error)
      setOpenError('Open the result panel from a regular webpage.')
    }
  }

  return (
    <div className='popup'>
      <header className='popup-header'>
        <div className='brand'>
          <div className='logo-wrap'>
            <img src='/icon/32.png' className='logo' alt='ScholarLens logo' />
          </div>

          <div className='header-copy'>
            <h2 className='header-title'>ScholarLens</h2>
            <p className='header-url'>{url}</p>
          </div>
        </div>

        <div className='header-btns'>
          <button className='icon-btn' aria-label='Settings'>
            <Settings size={15} />
          </button>
          <button className='icon-btn' aria-label='Open source'>
            <ExternalLink size={15} />
          </button>
        </div>
      </header>
      
      <main className="popup-main">
        <section className="search-container" aria-labelledby="search-title">
          <h3 id="search-title" className='search-title'>Fact-check claim</h3>
          <div className="search-bar">
            <input className='search-input' type="text" placeholder='Paste sentence, statement, or claim...'/>
            <button className="icon-btn search-button" aria-label="Check claim">
              <Search size={15} />
            </button>
          </div>
        </section>

        <section className="history-container" aria-labelledby="history-title">
          <h3 id="history-title" className='history-title'>Last claim checked</h3>
          {lastCheck ? (
            <>
              <div className="claim-card">
                <p className="claim-text">“{lastCheck.claim}”</p>
                <div className="claim-meta">
                  <span className={`verdict verdict-${lastCheck.result.verdict?.toLowerCase() || 'unknown'}`}>
                    {lastCheck.result.verdict || 'UNVERIFIED'}
                  </span>
                  <span className="score">
                    Score <strong>{lastCheck.result.score !== undefined ? `${lastCheck.result.score}%` : 'N/A'}</strong>
                  </span>
                </div>
              </div>
              <button
                className="analysis-button"
                type="button"
                onClick={openLastAnalysis}
              >
                <span>View full analysis</span>
                <ExternalLink size={16} />
              </button>
              {openError && <p className="open-error" role="alert">{openError}</p>}
            </>
          ) : (
            <p className="empty-state">Your most recent fact-check will appear here.</p>
          )}
        </section>
      </main>
    </div>
  )
}