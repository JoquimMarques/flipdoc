import { useState } from 'react'
import TextToPdf from './components/TextToPdf'
import ImageToPdf from './components/ImageToPdf'
import WordToPdf from './components/WordToPdf'

/**
 * FlipDoc - Main Application
 * 
 * Document to PDF conversion system
 * - Text → PDF
 * - Image → PDF
 * - Word → PDF
 */

// Backend API URL
// Development: http://localhost:3000
// Production: Render URL (ex: https://flipdoc-backend.onrender.com)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// SVG Icons
const Icons = {
    document: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
        </svg>
    ),
    text: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,7 4,4 20,4 20,7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
    ),
    image: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
        </svg>
    ),
    word: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <path d="M9 15l2 2 4-4" />
        </svg>
    )
}

function App() {
    // Active tab (text, image, word)
    const [activeTab, setActiveTab] = useState('text')

    // Render component based on active tab
    const renderConverter = () => {
        switch (activeTab) {
            case 'text':
                return <TextToPdf apiUrl={API_URL} />
            case 'image':
                return <ImageToPdf apiUrl={API_URL} />
            case 'word':
                return <WordToPdf apiUrl={API_URL} />
            default:
                return <TextToPdf apiUrl={API_URL} />
        }
    }

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="logo">
                    <img src="/assets/logoflip.png" alt="FlipDoc Logo" className="logo-image" />
                    <h1>FlipDoc</h1>
                </div>
                <p>Convert your documents to PDF quickly and for free</p>
            </header>

            {/* Tab navigation */}
            <nav className="tabs">
                <button
                    className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveTab('text')}
                >
                    <span className="tab-icon">{Icons.text}</span>
                    <span>Text to PDF</span>
                </button>
                <button
                    className={`tab ${activeTab === 'image' ? 'active' : ''}`}
                    onClick={() => setActiveTab('image')}
                >
                    <span className="tab-icon">{Icons.image}</span>
                    <span>Image to PDF</span>
                </button>
                <button
                    className={`tab ${activeTab === 'word' ? 'active' : ''}`}
                    onClick={() => setActiveTab('word')}
                >
                    <span className="tab-icon">{Icons.word}</span>
                    <span>Word to PDF</span>
                </button>
            </nav>

            {/* Converter card */}
            {renderConverter()}

            {/* Footer */}
            <footer className="footer">
                <p>
                    &copy; {new Date().getFullYear()} FlipDoc. All rights reserved. 
                    
                </p>
            </footer>
        </div>
    )
}

export default App
