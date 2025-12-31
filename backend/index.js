/**
 * FlipDoc Backend - Servidor Express para conversão de documentos para PDF
 * 
 * Rotas:
 * - GET / → Status do servidor
 * - POST /text-to-pdf → Converte texto para PDF
 * - POST /image-to-pdf → Converte imagem para PDF
 * - POST /word-to-pdf → Converte Word para PDF
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const mammoth = require('mammoth');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Criar diretórios necessários
const uploadsDir = path.join(__dirname, 'uploads');
const outputsDir = path.join(__dirname, 'outputs');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
}

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limite
    }
});

// Middlewares
app.use(cors({
    origin: '*', // Em produção, especifique o domínio do Vercel
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ============================================
// ROTA: GET / - Status do servidor
// ============================================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Servidor online no Render',
        routes: {
            'POST /text-to-pdf': 'Converte texto para PDF',
            'POST /image-to-pdf': 'Converte imagem (JPG/PNG) para PDF',
            'POST /word-to-pdf': 'Converte Word (.doc, .docx) para PDF'
        }
    });
});

// ============================================
// ROTA: POST /text-to-pdf - Texto para PDF
// ============================================
app.post('/text-to-pdf', async (req, res) => {
    try {
        const { text } = req.body;

        // Validar entrada
        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                error: 'Campo "text" é obrigatório e deve ser uma string'
            });
        }

        // Criar documento PDF
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Configurações da página
        const pageWidth = 595.28; // A4 width in points
        const pageHeight = 841.89; // A4 height in points
        const margin = 50;
        const fontSize = 12;
        const lineHeight = fontSize * 1.5;
        const maxWidth = pageWidth - (margin * 2);

        // Função para quebrar texto em linhas
        const wrapText = (text, maxWidth, font, fontSize) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
        };

        // Processar texto (dividir por quebras de linha e depois por largura)
        const paragraphs = text.split('\n');
        let allLines = [];

        for (const paragraph of paragraphs) {
            if (paragraph.trim() === '') {
                allLines.push('');
            } else {
                const wrappedLines = wrapText(paragraph, maxWidth, font, fontSize);
                allLines = allLines.concat(wrappedLines);
            }
        }

        // Adicionar páginas conforme necessário
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;
        const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

        for (let i = 0; i < allLines.length; i++) {
            if (yPosition < margin + lineHeight) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
            }

            page.drawText(allLines[i], {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0)
            });

            yPosition -= lineHeight;
        }

        // Gerar bytes do PDF
        const pdfBytes = await pdfDoc.save();

        // Enviar resposta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Erro ao converter texto para PDF:', error);
        res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
});

// ============================================
// ROTA: POST /image-to-pdf - Imagem para PDF
// ============================================
app.post('/image-to-pdf', upload.single('image'), async (req, res) => {
    try {
        // Validar arquivo
        if (!req.file) {
            return res.status(400).json({
                error: 'Arquivo de imagem é obrigatório'
            });
        }

        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const mimeType = req.file.mimetype;

        // Criar documento PDF
        const pdfDoc = await PDFDocument.create();

        // Embedar imagem baseado no tipo
        let image;
        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBuffer);
        } else if (mimeType === 'image/png') {
            image = await pdfDoc.embedPng(imageBuffer);
        } else {
            // Limpar arquivo temporário
            fs.unlinkSync(imagePath);
            return res.status(400).json({
                error: 'Formato de imagem não suportado. Use JPG ou PNG.'
            });
        }

        // Calcular dimensões da página baseado na imagem
        const imgWidth = image.width;
        const imgHeight = image.height;

        // Definir tamanho máximo da página (A4)
        const maxWidth = 595.28;
        const maxHeight = 841.89;

        // Calcular escala para caber na página
        const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        // Criar página com tamanho da imagem escalada
        const page = pdfDoc.addPage([scaledWidth, scaledHeight]);

        // Desenhar imagem
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: scaledWidth,
            height: scaledHeight
        });

        // Gerar bytes do PDF
        const pdfBytes = await pdfDoc.save();

        // Limpar arquivo temporário
        fs.unlinkSync(imagePath);

        // Enviar resposta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="imagem.pdf"');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Erro ao converter imagem para PDF:', error);

        // Limpar arquivo temporário em caso de erro
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
});

// ============================================
// ROTA: POST /word-to-pdf - Word para PDF
// ============================================
app.post('/word-to-pdf', upload.single('document'), async (req, res) => {
    try {
        // Validar arquivo
        if (!req.file) {
            return res.status(400).json({
                error: 'Arquivo Word é obrigatório'
            });
        }

        const docPath = req.file.path;
        const fileName = req.file.originalname.toLowerCase();

        // Verificar extensão
        if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
            fs.unlinkSync(docPath);
            return res.status(400).json({
                error: 'Formato não suportado. Use arquivos .doc ou .docx'
            });
        }

        // Extrair texto do documento Word usando mammoth
        const result = await mammoth.extractRawText({ path: docPath });
        const text = result.value;

        // Limpar arquivo temporário
        fs.unlinkSync(docPath);

        if (!text || text.trim() === '') {
            return res.status(400).json({
                error: 'O documento está vazio ou não foi possível extrair o texto'
            });
        }

        // Criar documento PDF
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Configurações da página
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 50;
        const fontSize = 12;
        const lineHeight = fontSize * 1.5;
        const maxWidth = pageWidth - (margin * 2);

        // Função para quebrar texto em linhas
        const wrapText = (text, maxWidth, font, fontSize) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
        };

        // Processar texto
        const paragraphs = text.split('\n');
        let allLines = [];

        for (const paragraph of paragraphs) {
            if (paragraph.trim() === '') {
                allLines.push('');
            } else {
                const wrappedLines = wrapText(paragraph, maxWidth, font, fontSize);
                allLines = allLines.concat(wrappedLines);
            }
        }

        // Adicionar páginas conforme necessário
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let yPosition = pageHeight - margin;

        for (let i = 0; i < allLines.length; i++) {
            if (yPosition < margin + lineHeight) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                yPosition = pageHeight - margin;
            }

            page.drawText(allLines[i], {
                x: margin,
                y: yPosition,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0)
            });

            yPosition -= lineHeight;
        }

        // Gerar bytes do PDF
        const pdfBytes = await pdfDoc.save();

        // Enviar resposta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Erro ao converter Word para PDF:', error);

        // Limpar arquivo temporário em caso de erro
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
});

// ============================================
// Iniciar servidor
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor FlipDoc rodando na porta ${PORT}`);
    console.log(`📄 Acesse: http://localhost:${PORT}`);
});
