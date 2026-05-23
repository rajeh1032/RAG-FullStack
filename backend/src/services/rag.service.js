import similarity from "compute-cosine-similarity";
import { embeddingsCollection } from "./mongo.service.js";
export class RagService {
    constructor({ pdfService, openAIService } = {}) {
        this.pdfService = pdfService;
        this.openAIService = openAIService;
    }

    chunkText(text, chunkSize = 500) {
        const chunks = [];

        for (let i = 0; i < text.length; i += chunkSize) {
            const chunk = text.slice(i, i + chunkSize).trim();

            if (chunk.length > 0) {
                chunks.push(chunk);
            }
        }

        return chunks;
    }
    async storeFile(file) {
        const text = await this.pdfService.extractText(file.path);
        const chunks = this.chunkText(text);
        const uploadedAt = new Date();
        const fileMetadata = {
            originalName: file.originalname,
            storedName: file.filename,
            path: file.path,
            destination: file.destination,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt,
        };

        await embeddingsCollection.deleteMany({});

        for (let index = 0; index < chunks.length; index += 1) {
            const chunk = chunks[index];
            const embedding = await this.openAIService.createEmbedding(chunk);

            await embeddingsCollection.insertOne({
                text: chunk,
                embedding,
                fileName: file.originalname,
                filePath: file.path,
                metadata: {
                    ...fileMetadata,
                    chunkIndex: index,
                    chunksCount: chunks.length,
                },
                createdAt: uploadedAt,
            });
        }

        return chunks.length;
    }
    async answerQuestion(question) {
        const questionEmbedding = await this.openAIService.createEmbedding(question);

        const docs = await embeddingsCollection.find({}).toArray();

        if (docs.length === 0) {
            throw new Error("No uploaded file data found. Please upload a PDF first.");
        }

        const scoredDocs = docs.map((doc) => ({
            text: doc.text,
            score: similarity(questionEmbedding, doc.embedding),
        }));

        scoredDocs.sort((a, b) => b.score - a.score);

        const context = scoredDocs
            .slice(0, 3)
            .map((doc) => doc.text)
            .join("\n\n");

        const answer = await this.openAIService.getChatCompletion([
            {
                role: "system",
                content:
                    "Answer only using the provided context. If the answer is not in the context, say: I don't know from the uploaded file.",
            },
            {
                role: "user",
                content: `Context:\n${context}\n\nQuestion:\n${question}`,
            },
        ]);

        return answer;
    }
}
