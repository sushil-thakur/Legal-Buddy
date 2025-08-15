import express from "express";
import multer from "multer";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { sendToOCR } from "./utils/ocr.js";
import { sendToChatAI } from "./utils/chatAI.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Simple request logger to help track 404s and routing
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const isImage = /^(image\/(jpeg|png|webp|bmp|tiff|gif))$/i.test(file.mimetype);
    const isPdf = file.mimetype === "application/pdf";
    if (!isImage && !isPdf) return cb(new Error("Only image or PDF files are allowed"));
    cb(null, true);
  }
});

// Temporary storage for conversation (reset every new upload)
let conversationHistory = [];

// OCR + AI initial analysis
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File required" });
    // 1. OCR API call
  const ocrResult = await sendToOCR({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      filename: req.file.originalname || "upload"
    });
  const ocrText = ocrResult.text;

    // 2. AI API call
    const aiResponse = await sendToChatAI(
      `You are a concise legal assistant. Use ONLY the notice text below. If unsure, say so.\n\n`+
      `NOTICE TEXT:\n${ocrText}\n\n`+
      `Return your answer in three clear sections with brief bullet points:`+
      `\n\nDo:\n- ...`+
      `\n\nDon't:\n- ...`+
      `\n\nNext Steps:\n- ...`
    );

    // Save context for chat
    conversationHistory = [
      { role: "system", content: "You are a legal assistant AI." },
      { role: "user", content: `Legal notice text: ${ocrText}` },
      { role: "assistant", content: aiResponse }
    ];

  res.json({ ocrText, aiAdvice: aiResponse, warning: ocrResult.warning });
  } catch (err) {
  console.error(err);
  res.status(500).json({ error: "Processing failed", details: err?.message || String(err) });
  }
});

// Chat with AI
const chatHandler = async (req, res) => {
  const { message, userMessage, ocrText } = req.body;
  try {
    const userText = userMessage ?? message;
    if (!userText) return res.status(400).json({ error: "userMessage required" });

    // If OCR text is provided with the chat call, include it; otherwise rely on prior context
    if (ocrText) {
      conversationHistory = [
        { role: "system", content: "You are a legal assistant AI." },
        { role: "user", content: `Legal notice text: ${ocrText}` },
      ];
    }
    conversationHistory.push({ role: "user", content: userText });

    // Call AI API with prioritized Do/Don't/Next Steps
    const aiReply = await sendToChatAI(
      `You are a concise legal assistant. Use ONLY the notice text (if provided) as context. If unsure, say so.\n\n`+
      (ocrText ? `NOTICE TEXT:\n${ocrText}\n\n` : "")+
      `User asks: ${userText}\n`+
      `Answer with short bullet points prioritizing Do / Don't / Next Steps.`
    );

    conversationHistory.push({ role: "assistant", content: aiReply });
    res.json({ aiReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed", details: err?.message || String(err) });
  }
};

app.post("/api/chat", chatHandler);
// Alias to support frontend calling /api/analyze/chat
app.post("/api/analyze/chat", chatHandler);

// Health endpoint for quick connectivity checks
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log("Server running on port 3000"));
