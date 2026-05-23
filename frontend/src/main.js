import { ChatSession } from "./domain/ChatSession.js";
import { ChatApiService } from "./infrastructure/ChatApiService.js";
import { UIController } from "./presentation/UIController.js";

document.addEventListener("DOMContentLoaded", () => {
    const chatSession = new ChatSession();
    const chatApiService = new ChatApiService();
    const uiController = new UIController({
        chatContainerId: "chat-container",
        inputId: "message-input",
        sendBtnId: "send-button",
        loadingId: "loading-indicator",
        welcomeId: "welcome-message",
        imageUploadId: "image-upload",
        attachBtnId: "attach-btn",
        imagePreviewContainerId: "image-preview-container",
        imagePreviewId: "image-preview",
        fileStatusId: "file-status",
        removeImageBtnId: "remove-image-btn"
    });

    let ragEnabled = false;

    uiController.setOnSend(async ({ text, file }) => {
        let uploadSucceeded = false;

        uiController.hideWelcome();
        uiController.showLoading(true);

        try {
            if (file) {
                uiController.appendMessage("user", text, { fileName: file.name });

                const uploadResult = await chatApiService.uploadFile(file);
                ragEnabled = true;
                uploadSucceeded = true;

                uiController.setFileUploadedState(file.name, uploadResult.chunksCount ?? 0);
                uiController.appendMessage(
                    "assistant",
                    `${file.name} uploaded successfully. ${uploadResult.chunksCount ?? 0} chunks stored.`
                );
            } else if (text) {
                uiController.appendMessage("user", text);
            }

            if (!text) {
                uiController.clearFileSelection();
                return;
            }

            if (ragEnabled) {
                const answer = await chatApiService.askQuestion(text);
                uiController.appendMessage("assistant", answer);
                return;
            }

            chatSession.addMessage("user", text);
            const aiResponse = await chatApiService.getChatCompletion(chatSession.getHistory());
            chatSession.addMessage("assistant", aiResponse);
            uiController.appendMessage("assistant", aiResponse);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            uiController.appendMessage("assistant", `Error: ${error.message}`);
        } finally {
            if (file && !uploadSucceeded) {
                uiController.clearFileSelection();
            }

            uiController.showLoading(false);
        }
    });
});
