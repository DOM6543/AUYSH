/**
 * Real Client-Side Medical Document OCR Engine
 * 
 * Powered by Tesseract.js / WASM.
 * Performs true optical character recognition on uploaded image/scan pixels.
 * No filename-based templates or simulated presets.
 */

import { createWorker } from "tesseract.js";

class OcrService {
  /**
   * Process an image or document and perform genuine optical character recognition
   * @param {File|Blob|string} fileInput - Image file, blob, or base64 data URL
   * @param {Object} options - { onProgress: (progressObj) => void, language: 'eng' }
   */
  async extractTextFromDocument(fileInput, options = {}) {
    if (!fileInput) {
      throw new Error("No document input provided for OCR extraction.");
    }

    const fileName = typeof fileInput === "string" ? "scanned_document.jpg" : (fileInput.name || "uploaded_document.jpg");
    const fileType = typeof fileInput === "string" ? "image" : (fileInput.type?.includes("pdf") ? "pdf" : "image");
    const onProgress = options.onProgress || (() => {});

    try {
      onProgress({ status: "loading_image", progress: 0.1, message: "Preparing image for optical character recognition..." });

      // Read image input
      let imageSource = fileInput;
      if (fileInput instanceof File || fileInput instanceof Blob) {
        imageSource = await this.readFileAsDataUrl(fileInput);
      }

      onProgress({ status: "initializing_wasm", progress: 0.25, message: "Initializing Tesseract WASM OCR Engine..." });

      // Create Tesseract Worker
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const prog = 0.3 + (m.progress || 0) * 0.65;
            onProgress({
              status: "recognizing_text",
              progress: Math.min(prog, 0.95),
              message: `Reading document pixels (${Math.round((m.progress || 0) * 100)}%)...`
            });
          }
        }
      });

      onProgress({ status: "extracting_characters", progress: 0.7, message: "Extracting clinical characters and lines..." });

      const result = await worker.recognize(imageSource);
      await worker.terminate();

      const extractedText = (result.data?.text || "").trim();
      const confidence = (result.data?.confidence || 0) / 100;

      onProgress({ status: "completed", progress: 1.0, message: "Optical character recognition complete." });

      if (!extractedText || extractedText.length < 5) {
        return {
          success: false,
          documentName: fileName,
          documentType: fileType,
          rawText: "",
          confidence: 0,
          engine: "Tesseract.js WASM",
          error: "Unable to reliably extract text. Please review the original document.",
          processedAt: new Date().toISOString()
        };
      }

      return {
        success: true,
        documentName: fileName,
        documentType: fileType,
        rawText: extractedText,
        confidence: Math.round(confidence * 100) / 100,
        engine: "Tesseract.js WASM",
        lineCount: result.data?.lines?.length || 1,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Real Tesseract OCR execution failed:", error);
      return {
        success: false,
        documentName: fileName,
        documentType: fileType,
        rawText: "",
        confidence: 0,
        engine: "Tesseract.js WASM",
        error: error.message || "Unable to reliably extract text. Please review the original document.",
        processedAt: new Date().toISOString()
      };
    }
  }

  readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const ocrService = new OcrService();
