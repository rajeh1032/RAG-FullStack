import cors from "cors";
import express from "express";
import multer from "multer";
import { OpenAIService } from "./services/openai.service.js";
import { PdfService } from "./services/pdf.service.js";
import { RagService } from "./services/rag.service.js";

const app = express();
const openAIService = new OpenAIService();
const pdfService = new PdfService();
const ragService = new RagService({ pdfService, openAIService });

const upload = multer({
    dest: "src/uploads/",
});


app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
    const { messages } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "messages array is required" });
    }

    try {
        const reply = await openAIService.getChatCompletion(messages);
        return res.json({ reply });
    } catch (error) {
        return res.status(500).json({ error: error.message });


    }
});
app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "file is required" });
        }

        const chunksCount = await ragService.storeFile(req.file);

        return res.json({
            message: "File uploaded and embeddings stored successfully",
            chunksCount,
            file: {
                originalName: req.file.originalname,
                storedName: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
app.post("/api/ask", async (req, res) => {
    try {
        const { question } = req.body ?? {};

        if (!question) {
            return res.status(400).json({ error: "question is required" });
        }

        const answer = await ragService.answerQuestion(question);

        return res.json({ answer });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
export default app;
