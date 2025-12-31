# 🔄 FlipDoc - Conversor de PDF

Sistema completo para conversão de documentos para PDF, com React no frontend e Node.js/Express no backend.

## 📋 Funcionalidades

- **Texto → PDF**: Digite ou cole texto para converter em PDF
- **Imagem → PDF**: Upload de imagens JPG/PNG para PDF
- **Word → PDF**: Upload de arquivos .doc/.docx para PDF

## 🏗️ Estrutura do Projeto (Monorepo)

```
FlipDoc/
├── package.json              # Scripts para rodar tudo junto
├── backend/                  # Servidor Node.js + Express
│   ├── index.js
│   └── package.json
└── frontend/                 # Aplicação React + Vite
    ├── src/
    └── package.json
```

## 🚀 Rodar Localmente

```bash
# Na pasta raiz FlipDoc/
npm install           # Instala concurrently
npm run install:all   # Instala dependências do backend e frontend
npm run dev           # Inicia backend E frontend juntos
```

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

## 🌐 Deploy (Monorepo)

### 1. Subir para o GitHub

```bash
git init
git add .
git commit -m "Initial commit - FlipDoc"
git remote add origin https://github.com/SEU_USUARIO/flipdoc.git
git branch -M main
git push -u origin main
```

### 2. Backend → Render.com

1. Acesse [render.com](https://render.com)
2. **New +** → **Web Service** → Conecte o repositório `flipdoc`
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Copie a URL (ex: `https://flipdoc-backend.onrender.com`)

### 3. Frontend → Vercel

1. Acesse [vercel.com](https://vercel.com)
2. **Add New** → **Project** → Importe `flipdoc`
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: `Vite`
   - **Environment Variables**:
     - `VITE_API_URL` = `https://flipdoc-backend.onrender.com`
4. Clique **Deploy**

## 🔧 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Status do servidor |
| POST | `/text-to-pdf` | Texto → PDF |
| POST | `/image-to-pdf` | Imagem → PDF |
| POST | `/word-to-pdf` | Word → PDF |

## 📦 Tecnologias

**Backend**: Express, pdf-lib, multer, mammoth, cors  
**Frontend**: React 18, Vite, CSS3

## 📝 Licença

MIT License
