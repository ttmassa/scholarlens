import { ExternalLink, Settings } from 'lucide-react'
import './App.css'

export default function App() {
  const url = window.location.href

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
    </div>
  )
}