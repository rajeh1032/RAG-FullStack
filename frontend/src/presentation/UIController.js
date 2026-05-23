// Presentation Layer: DOM manipulation and UI logic
export class UIController {
    constructor(config) {
        this.chatContainer = document.getElementById(config.chatContainerId);
        this.messageInput = document.getElementById(config.inputId);
        this.sendButton = document.getElementById(config.sendBtnId);
        this.loadingIndicator = document.getElementById(config.loadingId);
        this.welcomeMessage = document.getElementById(config.welcomeId);

        this.fileUpload = document.getElementById(config.imageUploadId);
        this.attachBtn = document.getElementById(config.attachBtnId);
        this.filePreviewContainer = document.getElementById(config.imagePreviewContainerId);
        this.filePreviewName = document.getElementById(config.imagePreviewId);
        this.fileStatus = document.getElementById(config.fileStatusId);
        this.removeFileBtn = document.getElementById(config.removeImageBtnId);

        this.selectedFile = null;
        this.onSendCallback = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.messageInput.addEventListener("input", () => {
            this.updateSendButtonState();
            this.messageInput.style.height = "auto";
            this.messageInput.style.height = `${Math.min(this.messageInput.scrollHeight, 200)}px`;
        });

        this.messageInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                this.handleSend();
            }
        });

        this.sendButton.addEventListener("click", () => this.handleSend());

        if (this.attachBtn && this.fileUpload) {
            this.attachBtn.addEventListener("click", () => {
                this.fileUpload.click();
            });

            this.fileUpload.addEventListener("change", (event) => {
                const file = event.target.files?.[0] || null;

                if (file) {
                    this.selectedFile = file;
                    this.showSelectedFile(file);
                    this.updateSendButtonState();
                }

                this.fileUpload.value = "";
            });
        }

        if (this.removeFileBtn) {
            this.removeFileBtn.addEventListener("click", () => {
                this.clearFileSelection();
            });
        }
    }

    updateSendButtonState() {
        const hasText = this.messageInput.value.trim() !== "";
        const hasFile = this.selectedFile !== null;

        this.sendButton.disabled = !(hasText || hasFile);
    }

    showSelectedFile(file) {
        if (!this.filePreviewContainer || !this.filePreviewName || !this.fileStatus) {
            return;
        }

        this.filePreviewName.textContent = file.name;
        this.fileStatus.textContent = `${this.formatFileSize(file.size)} • Ready to upload`;
        this.filePreviewContainer.classList.remove("hidden");
        if (this.removeFileBtn) {
            this.removeFileBtn.classList.remove("hidden");
        }
    }

    setFileUploadedState(fileName, chunksCount) {
        if (!this.filePreviewContainer || !this.filePreviewName || !this.fileStatus) {
            return;
        }

        this.selectedFile = null;
        this.filePreviewName.textContent = fileName;
        this.fileStatus.textContent = `Uploaded successfully • ${chunksCount} chunks stored`;
        this.filePreviewContainer.classList.remove("hidden");
        if (this.removeFileBtn) {
            this.removeFileBtn.classList.add("hidden");
        }
        this.updateSendButtonState();
    }

    clearFileSelection() {
        this.selectedFile = null;

        if (this.filePreviewContainer && this.filePreviewName && this.fileStatus) {
            this.filePreviewName.textContent = "";
            this.fileStatus.textContent = "Ready to upload";
            this.filePreviewContainer.classList.add("hidden");
        }

        if (this.removeFileBtn) {
            this.removeFileBtn.classList.remove("hidden");
        }

        this.updateSendButtonState();
    }

    getSelectedFile() {
        return this.selectedFile;
    }

    setOnSend(callback) {
        this.onSendCallback = callback;
    }

    async handleSend() {
        const text = this.messageInput.value.trim();
        const file = this.selectedFile;

        if (!text && !file) {
            return;
        }

        this.clearInput();
        this.hideWelcome();

        if (this.onSendCallback) {
            await this.onSendCallback({ text, file });
        }
    }

    clearInput() {
        this.messageInput.value = "";
        this.messageInput.style.height = "auto";
        this.updateSendButtonState();
    }

    hideWelcome() {
        if (this.welcomeMessage) {
            this.welcomeMessage.style.display = "none";
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.remove("hidden");
            this.loadingIndicator.classList.add("flex");
        } else {
            this.loadingIndicator.classList.add("hidden");
            this.loadingIndicator.classList.remove("flex");
            this.messageInput.focus();
        }
    }

    appendMessage(role, content, metadata = {}) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `flex w-full mb-6 ${role === "user" ? "justify-end" : "justify-start"}`;

        const innerDiv = document.createElement("div");

        if (role === "user") {
            innerDiv.className = "bg-blue-500 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] md:max-w-[70%] shadow-sm flex flex-col gap-2";

            if (metadata.fileName) {
                const fileBadge = document.createElement("div");
                fileBadge.className = "rounded-xl bg-blue-400/30 px-3 py-2 text-sm";
                fileBadge.textContent = `PDF: ${metadata.fileName}`;
                innerDiv.appendChild(fileBadge);
            }

            if (content) {
                const textSpan = document.createElement("span");
                textSpan.className = "whitespace-pre-wrap";
                textSpan.textContent = content;
                innerDiv.appendChild(textSpan);
            }
        } else {
            innerDiv.className = "bg-white border border-gray-200 text-gray-800 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[80%] md:max-w-[70%] shadow-sm flex gap-3";

            const iconDiv = document.createElement("div");
            iconDiv.className = "flex-shrink-0 mt-1";
            iconDiv.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
            `;

            const textDiv = document.createElement("div");
            textDiv.className = "mt-1 whitespace-pre-wrap flex-1";
            textDiv.textContent = content;

            innerDiv.appendChild(iconDiv);
            innerDiv.appendChild(textDiv);
        }

        messageDiv.appendChild(innerDiv);
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    formatFileSize(size) {
        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
}
