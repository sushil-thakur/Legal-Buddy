export const sendToOCR = async ({ buffer, mimetype = "application/octet-stream", filename = "file" }) => {
  const formData = new FormData();
  formData.append("apikey", process.env.OCR_API_KEY);
  // OCR.space expects a file upload; use Blob with provided mimetype
  const blob = new Blob([buffer], { type: mimetype });
  formData.append("file", blob, filename);
  // Helpful options: set language to English (adjust if needed), scale PDF, and auto-detect
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("isCreateSearchablePdf", mimetype === "application/pdf" ? "true" : "false");
  formData.append("scale", "true");
  formData.append("OCREngine", "2");

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  const extractText = () => {
    const results = Array.isArray(data?.ParsedResults) ? data.ParsedResults : [];
    return results.map(r => r?.ParsedText || "").join("\n\n").trim();
  };

  const text = extractText();
  if (data.IsErroredOnProcessing) {
    const rawMsg = data.ErrorMessage || data.ErrorDetails || "OCR provider error";
    const msg = Array.isArray(rawMsg) ? rawMsg.join("; ") : String(rawMsg);
    const isPageLimit = /page limit|maximum page limit/i.test(msg);
    if (isPageLimit && text) {
      // Partial success: return text with a warning so caller can proceed
      return { text, warning: msg };
    }
    throw new Error(msg);
  }

  if (!text) throw new Error("No text extracted from OCR response");
  return { text };
};
