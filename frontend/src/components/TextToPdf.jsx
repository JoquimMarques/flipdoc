import { useState } from 'react'

/**
 * TextToPdf - Componente para converter texto em PDF
 * 
 * @param {string} apiUrl - URL da API do backend
 */
function TextToPdf({ apiUrl }) {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    // Função para converter texto em PDF
    const handleConvert = async () => {
        // Validar texto
        if (!text.trim()) {
            setMessage({ type: 'error', text: 'Por favor, digite algum texto para converter.' })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const response = await fetch(`${apiUrl}/text-to-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro ao gerar PDF')
            }

            // Baixar o PDF
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'documento.pdf'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setMessage({ type: 'success', text: 'PDF gerado com sucesso! Download iniciado.' })
        } catch (error) {
            console.error('Erro:', error)
            setMessage({ type: 'error', text: error.message || 'Erro ao conectar com o servidor.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="converter-card">
            {/* Header do card */}
            <div className="card-header">
                <div className="card-icon">📝</div>
                <div>
                    <h2>Texto para PDF</h2>
                    <p>Digite ou cole seu texto para converter em PDF</p>
                </div>
            </div>

            {/* Formulário */}
            <div className="form-group">
                <label className="form-label" htmlFor="text-input">
                    Seu texto:
                </label>
                <textarea
                    id="text-input"
                    className="textarea"
                    placeholder="Digite ou cole seu texto aqui..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                />
            </div>

            {/* Botão de conversão */}
            <button
                className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                onClick={handleConvert}
                disabled={loading || !text.trim()}
            >
                {loading ? (
                    <>Gerando PDF...</>
                ) : (
                    <>
                        <span>📄</span>
                        Gerar PDF
                    </>
                )}
            </button>

            {/* Mensagem de status */}
            {message && (
                <div className={`message message-${message.type}`}>
                    <span className="message-icon">
                        {message.type === 'success' ? '✅' : '❌'}
                    </span>
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    )
}

export default TextToPdf
