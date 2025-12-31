import { useState } from 'react'

// SVG Icons
const Icons = {
    text: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,7 4,4 20,4 20,7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
    ),
    download: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    check: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    pdf: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    )
}

/**
 * TextToPdf - Component to convert text to PDF
 * 
 * @param {string} apiUrl - Backend API URL
 */
function TextToPdf({ apiUrl }) {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState(null)
    const [pdfReady, setPdfReady] = useState(false)
    const [pdfBlob, setPdfBlob] = useState(null)

    // Function to convert text to PDF
    const handleConvert = async () => {
        // Validate text
        if (!text.trim()) {
            setMessage({ type: 'error', text: 'Please enter some text to convert.' })
            return
        }

        setLoading(true)
        setMessage(null)
        setPdfReady(false)
        setProgress(0)

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return 90
                }
                return prev + 10
            })
        }, 200)

        try {
            const response = await fetch(`${apiUrl}/text-to-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            })

            clearInterval(progressInterval)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Error generating PDF')
            }

            // Get PDF blob
            const blob = await response.blob()
            setPdfBlob(blob)
            setProgress(100)

            // Show download button after short delay
            setTimeout(() => {
                setPdfReady(true)
                setMessage({ type: 'success', text: 'PDF generated successfully!' })
            }, 500)

        } catch (error) {
            console.error('Error:', error)
            clearInterval(progressInterval)
            setProgress(0)
            setMessage({ type: 'error', text: error.message || 'Error connecting to server.' })
        } finally {
            setLoading(false)
        }
    }

    // Download PDF
    const handleDownload = () => {
        if (pdfBlob) {
            const url = window.URL.createObjectURL(pdfBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'document.pdf'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        }
    }

    return (
        <div className="converter-card">
            {/* Card header */}
            <div className="card-header">
                <div className="card-icon">{Icons.text}</div>
                <div>
                    <h2>Text to PDF</h2>
                    <p>Type or paste your text to convert to PDF</p>
                </div>
            </div>

            {/* Form */}
            <div className="form-group">
                <label className="form-label" htmlFor="text-input">
                    Your text:
                </label>
                <textarea
                    id="text-input"
                    className="textarea"
                    placeholder="Type or paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                />
            </div>

            {/* Convert button */}
            {!pdfReady && (
                <button
                    className="btn btn-primary"
                    onClick={handleConvert}
                    disabled={loading || !text.trim()}
                >
                    {loading ? (
                        <>Processing...</>
                    ) : (
                        <>
                            {Icons.pdf}
                            Generate PDF
                        </>
                    )}
                </button>
            )}

            {/* Progress bar */}
            {loading && (
                <div className="progress-container">
                    <div className="progress-label">
                        <span>Generating PDF...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Download button */}
            {pdfReady && (
                <button className="btn btn-download" onClick={handleDownload}>
                    {Icons.download}
                    Download PDF
                </button>
            )}

            {/* Status message */}
            {message && (
                <div className={`message message-${message.type}`}>
                    {message.type === 'success' ? Icons.check : Icons.error}
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    )
}

export default TextToPdf
