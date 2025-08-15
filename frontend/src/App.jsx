import React, { useMemo, useState } from "react";
import axios from "axios";
const API_BASE = (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) ||
  (import.meta.env.PROD ? "https://legal-buddy-vuhp.onrender.com" : "");
const api = axios.create({ baseURL: API_BASE });

function App() {
  const [file, setFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [aiAdvice, setAiAdvice] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a file first");
      return;
    }
    setLoading(true);
    setOcrText("");
    setAiAdvice("");
  setChatMessages([]);
  setWarning("");

  const formData = new FormData();
  formData.append("file", file);

    try {
  // Use Vite dev proxy: '/api' -> http://localhost:3000
  const res = await api.post("/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

  setOcrText(res.data.ocrText);
  setAiAdvice(res.data.aiAdvice);
  setWarning(res.data.warning || "");

      // Add to chat history display
      setChatMessages([
        { sender: "AI", text: res.data.aiAdvice }
      ]);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.details || err?.message || "Error processing file";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    if (!userMessage.trim()) return;

    // Add user message to chat display
    setChatMessages((prev) => [...prev, { sender: "You", text: userMessage }]);
    setChatLoading(true);

    try {
      // Backend expects { userMessage, ocrText } at /api/analyze/chat
  const res = await api.post("/api/analyze/chat", { userMessage, ocrText });
      setChatMessages((prev) => [...prev, { sender: "AI", text: res.data.aiReply }]);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.details || err?.message || "Error in chat";
      alert(msg);
    } finally {
      setUserMessage("");
      setChatLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="brand">
        <div className="gavel">⚖️</div>
        <h1>LegalBuddy — Notice Analyzer</h1>
      </div>
      <div className="sub">Upload an image or PDF. We’ll extract text and give court-ready guidance: Do / Don’t / Next Steps.</div>

      <div className="grid">
        <div className="panel">
          <div className="panel-header">Document preview</div>
          <div className="panel-body">
            <div className="uploader">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*,application/pdf" />
              <button onClick={handleUpload} disabled={loading}>{loading ? "Processing…" : "Upload & Analyze"}</button>
            </div>
            <div className="preview-holder">
              {file ? (
                file.type === "application/pdf" ? (
                  <iframe title="pdf-preview" src={URL.createObjectURL(file)} />
                ) : (
                  <img alt="preview" src={URL.createObjectURL(file)} />
                )
              ) : (
                <div className="preview-caption">First page preview will appear here</div>
              )}
            </div>
            {warning && <div className="warning">{warning}</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">Extracted text</div>
          <div className="panel-body">
            <div className="ocr-text">{ocrText || "No text yet. Upload to analyze."}</div>
          </div>
        </div>
      </div>

      {aiAdvice && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-header">AI guidance — Do / Don’t / Next Steps</div>
          <div className="panel-body">
            <div className="ocr-text" style={{ maxHeight: 220 }}>{aiAdvice}</div>
          </div>
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header">Chat</div>
        <div className="panel-body">
          <div className="chat-box">
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="preview-caption">Ask follow-up questions here…</div>
              ) : (
                chatMessages.map((msg, i) => (
                  <p className="chat-row" key={i}><b>{msg.sender}:</b> {msg.text}</p>
                ))
              )}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Ask a follow-up question…"
              />
              <button onClick={sendChat} disabled={chatLoading}>{chatLoading ? "…" : "Send"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
