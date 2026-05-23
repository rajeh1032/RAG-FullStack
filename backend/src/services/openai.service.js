export class OpenAIService {
    constructor({ apiKey = process.env.OPENAI_API_KEY, model = "gpt-4o-mini" } = {}) {
        this.apiKey = apiKey;
        this.chatUrl = "https://api.openai.com/v1/chat/completions";
        this.embeddingUrl = "https://api.openai.com/v1/embeddings";


        this.model = model;
    }
    checkApiKey() {
        if (!this.apiKey || this.apiKey === "your_actual_api_key_here") {
            throw new Error("OpenAI API key is missing. Please check backend/.env.");
        }
    }

    async getChatCompletion(messages) {
        this.checkApiKey();

        const response = await fetch(this.chatUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Failed to fetch response from OpenAI");
        }

        return data.choices?.[0]?.message?.content || "";
    }
// createEmbedding 
    async createEmbedding(text) {
        this.checkApiKey();

        const response = await fetch(this.embeddingUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: "text-embedding-3-small",
                input: text,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Failed to create embedding");
        }

        return data.data[0].embedding;
    }
}
