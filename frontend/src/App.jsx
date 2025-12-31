import { useState } from 'react'
import TextToPdf from './components/TextToPdf'
import ImageToPdf from './components/ImageToPdf'
import WordToPdf from './components/WordToPdf'

/**
 * FlipDoc - Aplicação principal
 * 
 * Sistema de conversão de documentos para PDF
 * - Texto → PDF
 * - Imagem → PDF
 * - Word → PDF
 */

// URL da API do backend
// Em desenvolvimento: http://localhost:3000
// Em produção: URL do Render (ex: https://flipdoc-backend.onrender.com)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function App() {
    // Tab ativa (text, image, word)
    const [activeTab, setActiveTab] = useState('text')

    // Renderizar componente baseado na tab ativa
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
                    <div className="logo-icon">📄</div>
                    <h1>FlipDoc</h1>
                </div>
                <p>Converta seus documentos para PDF de forma rápida e gratuita</p>
            </header>

            {/* Tabs de navegação */}
            <nav className="tabs">
                <button
                    className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveTab('text')}
                >
                    <span className="tab-icon">📝</span>
                    <span>Texto para PDF</span>
                </button>
                <button
                    className={`tab ${activeTab === 'image' ? 'active' : ''}`}
                    onClick={() => setActiveTab('image')}
                >
                    <span className="tab-icon">🖼️</span>
                    <span>Imagem para PDF</span>
                </button>
                <button
                    className={`tab ${activeTab === 'word' ? 'active' : ''}`}
                    onClick={() => setActiveTab('word')}
                >
                    <span className="tab-icon">📄</span>
                    <span>Word para PDF</span>
                </button>
            </nav>

            {/* Card de conversão */}
            {renderConverter()}

            {/* Footer */}
            <footer className="footer">
                <p>
                    Feito com ❤️ usando React + Node.js |
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer"> GitHub</a>
                </p>
            </footer>
        </div>
    )
}

export default App
