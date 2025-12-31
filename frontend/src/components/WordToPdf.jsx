import { useState, useRef } from 'react'

/**
 * WordToPdf - Componente para converter Word em PDF
 * 
 * @param {string} apiUrl - URL da API do backend
 */
function WordToPdf({ apiUrl }) {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [dragover, setDragover] = useState(false)
    const fileInputRef = useRef(null)

    // Tipos de arquivo aceitos
    const acceptedExtensions = ['.doc', '.docx']

    // Função para validar e definir arquivo
    const handleFile = (selectedFile) => {
        const fileName = selectedFile.name.toLowerCase()
        const isValid = acceptedExtensions.some(ext => fileName.endsWith(ext))

        if (!isValid) {
            setMessage({ type: 'error', text: 'Formato não suportado. Use arquivos .doc ou .docx' })
            return
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Arquivo muito grande. Máximo: 10MB.' })
            return
        }

        setFile(selectedFile)
        setMessage(null)
    }

    // Handler para seleção de arquivo
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            handleFile(selectedFile)
        }
    }

    // Handlers para drag and drop
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

    // Remover arquivo selecionado
    const handleRemoveFile = () => {
        setFile(null)
        setMessage(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Função para converter Word em PDF
    const handleConvert = async () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Por favor, selecione um documento Word.' })
            return
        }

        setLoading(true)
        setMessage(null)

        try {
            const formData = new FormData()
            formData.append('document', file)

            const response = await fetch(`${apiUrl}/word-to-pdf`, {
                method: 'POST',
                body: formData,
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
                <div className="card-icon">📄</div>
                <div>
                    <h2>Word para PDF</h2>
                    <p>Faça upload de um documento Word (.doc, .docx)</p>
                </div>
            </div>

            {/* Área de upload */}
            <div className="form-group">
                <label className="form-label">Seu documento:</label>
                <div
                    className={`file-upload ${dragover ? 'dragover' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="file-upload-icon">📁</div>
                    <p>Arraste um documento aqui ou <span>clique para selecionar</span></p>
                    <p style={{ fontSize: '0.85rem' }}>.doc, .docx até 10MB</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="file-input"
                        accept=".doc,.docx"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                </div>

                {/* Arquivo selecionado */}
                {file && (
                    <div className="file-selected">
                        <span>📎 {file.name}</span>
                        <button className="file-remove" onClick={handleRemoveFile} title="Remover">
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Botão de conversão */}
            <button
                className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                onClick={handleConvert}
                disabled={loading || !file}
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

export default WordToPdf
