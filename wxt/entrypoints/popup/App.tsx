import { useState, useEffect } from 'react'
import { ExternalLink, Search, Settings } from 'lucide-react'
import './App.css'

export default function App() {
  const [lastClaim, setLastClaim] = useState<string | null>(null)
  const url = window.location.href

  useEffect(() => {
    // Fetch the last claim checked from storage
  }, [])

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
        <div className="search-container">
          <h3 className='search-title'>Fact-check claim</h3>
          <div className="search-bar">
            <input className='search-input' type="text" placeholder='Paste sentence, statement, or claim...'/>
            <button className="icon-btn">
              <Search size={15} />
            </button>
          </div>
        </div>

        <div className="history-container">
          <h3 className='history-title'>Last claim checked</h3>
          <p>{lastClaim}</p>
        </div>
      </main>
    </div>
  )
}