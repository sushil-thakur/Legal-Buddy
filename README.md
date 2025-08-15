# 🏛 Legal Notice Assistant (MVP)

**Legal Notice Assistant** is a privacy-first tool that helps users understand court or legal notices.  
Users can upload an **image** or **PDF** of their notice, get it **automatically read** by AI, and chat to ask follow-up questions — all without storing personal data.

---

## 🚀 Features
- 📄 **File Upload** – Upload legal notice images or PDFs.
- 🔍 **OCR Processing** – Extract text using [OCR.space API](https://ocr.space/ocrapi).
- 🤖 **AI Explanation** – Get plain-language advice on:
  - What the notice means.
  - What to do next.
  - What NOT to do.
- 💬 **Follow-up Chat** – Ask the AI additional questions.
- 🔐 **Privacy-first** – No storage of user files or chat history.

---

## 🛠 Tech Stack
| Feature              | Technology / API |
|----------------------|-------------------|
| **Frontend**         | React.js          |
| **Backend**          | Node.js + Express |
| **OCR**              | OCR.space API     |
| **AI Chat**          | Grok API / OpenAI API |
| **File Upload**      | Multer (Node.js)  |
| **HTTP Requests**    | Axios             |

---

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repo
```bash
git clone https://github.com/your-username/legal-notice-assistant.git
cd legal-notice-assistant
Backend Setup
cd backend
npm install


Create .env file in backend/:

OCR_API_KEY=your_ocrspace_api_key
AI_API_KEY=your_ai_api_key
PORT=8000


Run backend:

npm start

3️⃣ Frontend Setup
cd ../frontend
npm install
npm start

▶️ Usage

Open http://localhost:3000 in your browser.

Upload a legal notice (image or PDF).

Wait for AI-generated explanation.

Ask follow-up questions in the chat box.

U CAN TEST THE WEBSITE HERE
[https://legal-buddy-x00v.onrender.com](url)

📌 API References

OCR: OCR.space API

AI: Grok API or OpenAI API

🔒 Privacy Note

This MVP does not store uploaded files or chat data.
Everything is processed in-memory and discarded after the session ends.
