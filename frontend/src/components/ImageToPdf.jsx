import { useState, useRef } from 'react'

// SVG Icons
const Icons = {
    image: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
        </svg>
    ),
    upload: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
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
    close: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    file: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13,2 13,9 20,9" />
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
 * ImageToPdf - Component to convert image to PDF
 * 
 * @param {string} apiUrl - Backend API URL
 */
function ImageToPdf({ apiUrl }) {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [message, setMessage] = useState(null)
    const [pdfReady, setPdfReady] = useState(false)
    const [pdfBlob, setPdfBlob] = useState(null)
    const [dragover, setDragover] = useState(false)
    const fileInputRef = useRef(null)

    // Accepted file types
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png']

    // Function to validate and set file
    const handleFile = (selectedFile) => {
        if (!acceptedTypes.includes(selectedFile.type)) {
            setMessage({ type: 'error', text: 'Format not supported. Use JPG or PNG.' })
            return
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File too large. Maximum: 10MB.' })
            return
        }

        setFile(selectedFile)
        setMessage(null)
        setPdfReady(false)
        setPdfBlob(null)
    }

    // Handler for file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            handleFile(selectedFile)
        }
    }

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault()
        setDragover(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setDragover(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragover(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            handleFile(droppedFile)
        }
    }

    // Remove selected file
    const handleRemoveFile = () => {
        setFile(null)
        setMessage(null)
        setPdfReady(false)
        setPdfBlob(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Function to convert image to PDF
    const handleConvert = async () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Please select an image.' })
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
            const formData = new FormData()
            formData.append('image', file)

            const response = await fetch(`${apiUrl}/image-to-pdf`, {
                method: 'POST',
                body: formData,
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
            a.download = 'image.pdf'
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
                <div className="card-icon">{Icons.image}</div>
                <div>
                    <h2>Image to PDF</h2>
                    <p>Upload a JPG or PNG image</p>
                </div>
            </div>

            {/* Upload area */}
            <div className="form-group">
                <label className="form-label">Your image:</label>
                <div
                    className={`file-upload ${dragover ? 'dragover' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="file-upload-icon">{Icons.upload}</div>
                    <p>Drag an image here or <span>click to select</span></p>
                    <p style={{ fontSize: '0.85rem' }}>JPG, PNG up to 10MB</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="file-input"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                </div>

                {/* Selected file */}
                {file && (
                    <div className="file-selected">
                        {Icons.file}
                        <span>{file.name}</span>
                        <button className="file-remove" onClick={handleRemoveFile} title="Remove">
                            {Icons.close}
                        </button>
                    </div>
                )}
            </div>

            {/* Convert button */}
            {!pdfReady && (
                <button
                    className="btn btn-primary"
                    onClick={handleConvert}
                    disabled={loading || !file}
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

export default ImageToPdf
