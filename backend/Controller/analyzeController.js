import { sendToOCR } from "../utils/ocr.js";
import { sendToChatAI } from "../utils/chatAI.js";

export const analyzeFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File required" });

    // OCR (pass buffer + metadata)
    const ocrText = await sendToOCR({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      filename: req.file.originalname || "upload"
    });

    // AI advice
    const aiAdvice = await sendToChatAI(
      `You are a concise legal assistant. Use ONLY the notice text below. If unsure, say so.\n\n`+
      `NOTICE TEXT:\n${ocrText}\n\n`+
      `Return your answer in three clear sections with brief bullet points:`+
      `\n\nDo:\n- ...`+
      `\n\nDon't:\n- ...`+
      `\n\nNext Steps:\n- ...`
    );

    res.json({ ocrText, aiAdvice });
  } catch (err) {
  console.error(err);
  res.status(500).json({ error: "Processing failed", details: err?.message || String(err) });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { userMessage, ocrText } = req.body;
    if (!userMessage || !ocrText)
      return res.status(400).json({ error: "userMessage and ocrText required" });

    const aiReply = await sendToChatAI(
      `You are a concise legal assistant. Use ONLY the notice text below as context. If unsure, say so.\n\n`+
      `NOTICE TEXT:\n${ocrText}\n\n`+
      `User asks: ${userMessage}\n`+
      `Answer with short bullet points prioritizing Do / Don't / Next Steps.`
    );

    res.json({ aiReply });
  } catch (err) {
  console.error(err);
  res.status(500).json({ error: "Chat failed", details: err?.message || String(err) });
  }
};
