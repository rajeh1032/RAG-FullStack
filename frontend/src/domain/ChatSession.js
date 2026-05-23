// Core Domain Model: Chat Session State
export class ChatSession {
    constructor(systemPrompt = "You are a helpful assistant.") {
        this.history = [{ role: "system", content: systemPrompt }];
    }

    addMessage(role, content) {
        this.history.push({ role, content });
    }

    getHistory() {
        return this.history;
    }
}
