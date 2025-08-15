import express from "express";
import multer from "multer";
import { analyzeFile, chatWithAI } from "../Controller/analyzeController.js";

const router = express.Router();
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

// Upload file & get AI advice
router.post("/", (req, res, next) => {
	upload.single("file")(req, res, (err) => {
		if (err) return res.status(400).json({ error: "Upload failed", details: err.message });
		next();
	});
}, analyzeFile);

// Chat with AI using OCR text from session (stateless, send extracted text each time)
router.post("/chat", chatWithAI);

export default router;
