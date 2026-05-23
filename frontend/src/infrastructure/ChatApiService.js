// Infrastructure Layer: Backend API Communication
export class ChatApiService {
    constructor(baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001") {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.chatUrl = `${this.baseUrl}/api/chat`;
        this.uploadUrl = `${this.baseUrl}/api/upload`;
        this.askUrl = `${this.baseUrl}/api/ask`;
    }

    async getChatCompletion(messages) {
        const response = await fetch(this.chatUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ messages })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch response from backend");
        }

        return data.reply;
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(this.uploadUrl, {
            method: "POST",
            body: formData
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "Failed to upload file");
        }

        return data;
    }

    async askQuestion(question) {
        const response = await fetch(this.askUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "Failed to ask question");
        }

        return data.answer;
    }
}
