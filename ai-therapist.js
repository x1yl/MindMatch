class AITherapist {
  constructor() {
    this.chatMessages = document.getElementById("chatMessages");
    this.messageInput = document.getElementById("messageInput");
    this.sendButton = document.getElementById("sendMessage");
    this.loadingIndicator = document.getElementById("loadingIndicator");
    this.typingIndicator = document.getElementById("typingIndicator");
    this.quickActionButtons = document.querySelectorAll(".quick-action-btn");
    this.quickActionsContainer = document.getElementById(
      "quickActionsContainer"
    );

    this.apiUrl = "https://ai.hackclub.com/chat/completions";
    this.conversationHistory = [
      {
        role: "system",
        content: `You are a compassionate, professional AI therapist. Your role is to:

      1. Provide emotional support and active listening
      2. Use evidence-based therapeutic techniques (CBT, mindfulness, etc.)
      3. Help users process their emotions and thoughts
      4. Suggest healthy coping strategies
      5. Be empathetic and non-judgmental
      6. Maintain appropriate boundaries

      Scope Restriction:
      - Only respond to requests directly related to improving mental health, emotional well-being, or coping with psychological challenges.
      - Politely decline requests unrelated to mental health, such as academic tasks, math equations, or other non-therapeutic queries. For example, respond with: "I'm here to support your mental health and emotional well-being. For topics like math or other non-mental health questions, I recommend exploring other resources. How can I assist you with your feelings or challenges today?"

      Guidelines:
      - Always prioritize user safety and well-being
      - If someone mentions self-harm or crisis, encourage them to seek immediate professional help (e.g., contact a hotline or therapist)
      - Keep responses conversational but professional
      - Ask thoughtful follow-up questions
      - Validate emotions while gently challenging negative thought patterns
      - Suggest practical exercises or techniques when appropriate
      - Remember this is a supportive conversation, not a diagnosis

      Be warm, understanding, and genuinely helpful. Respond in a natural, conversational way while maintaining your therapeutic approach.`,
      },
    ];

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.sendButton.addEventListener("click", () => this.handleSendMessage());

    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    this.messageInput.addEventListener("input", () => {
      const hasText = this.messageInput.value.trim().length > 0;
      this.sendButton.disabled = !hasText;

      if (hasText && !this.quickActionsContainer.style.opacity) {
        this.hideQuickActions();
      }
    });

    this.quickActionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const message = button.dataset.message;
        this.messageInput.value = message;
        this.sendButton.disabled = false;
        this.hideQuickActions();
        this.handleSendMessage();
      });
    });
  }

  async handleSendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    this.addMessageToChat("user", message);

    this.messageInput.value = "";
    this.sendButton.disabled = true;

    this.showTyping(true);

    try {
      this.conversationHistory.push({
        role: "user",
        content: message,
      });

      const response = await this.getAIResponse();

      this.showTyping(false);

      this.addMessageToChat("assistant", response);
      this.conversationHistory.push({
        role: "assistant",
        content: response,
      });
    } catch (error) {
      console.error("Error getting AI response:", error);
      this.showTyping(false);
      this.addMessageToChat(
        "assistant",
        "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please reach out to emergency services or a crisis hotline."
      );
    }
  }

  async getAIResponse() {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: this.conversationHistory,
        temperature: 0.7,
        max_completion_tokens: 500,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    return content;
  }

  addMessageToChat(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "flex items-start gap-3";

    if (sender === "user") {
      messageDiv.classList.add("flex-row-reverse");
      messageDiv.innerHTML = `
        <div class="w-8 h-8 bg-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fas fa-user text-white text-sm"></i>
        </div>
        <div class="bg-primary text-white rounded-lg p-4 max-w-xs">
          <p>${this.escapeHtml(message)}</p>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fas fa-robot text-white text-sm"></i>
        </div>
        <div class="bg-light-2 dark:bg-light-2-dark rounded-lg p-4 max-w-2xl">
          <p class="text-dark-1 dark:text-dark-1-dark">${this.formatAIMessage(
            message
          )}</p>
        </div>
      `;
    }

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  formatAIMessage(message) {
    return this.escapeHtml(message)
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto"><code>$1</code></pre>'
      )
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm">$1</code>'
      )
      .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(
        /^> (.*$)/gm,
        '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>'
      )
      .replace(/\n/g, "<br>");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  showLoading(show) {
    if (show) {
      this.loadingIndicator.classList.remove("hidden");
    } else {
      this.loadingIndicator.classList.add("hidden");
    }
  }

  showTyping(show) {
    if (show) {
      this.typingIndicator.classList.remove("hidden");
      this.scrollToBottom();
    } else {
      this.typingIndicator.classList.add("hidden");
    }
  }

  hideQuickActions() {
    this.quickActionsContainer.style.transition =
      "opacity 0.3s ease-out, height 0.3s ease-out";
    this.quickActionsContainer.style.opacity = "0";
    this.quickActionsContainer.style.height = "0";
    this.quickActionsContainer.style.overflow = "hidden";
    this.quickActionsContainer.style.marginTop = "0";
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  clearConversation() {
    this.conversationHistory = this.conversationHistory.slice(0, 1);
    this.chatMessages.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fas fa-robot text-white text-sm"></i>
        </div>
        <div class="bg-light-2 dark:bg-light-2-dark rounded-lg p-4 max-w-2xl">
          <p class="text-dark-1 dark:text-dark-1-dark">
            Hello! I'm your AI therapist.<br>
            I'm here to offer a safe, judgment-free space where you can share your thoughts and feelings. Whether you're going through a tough time or just need someone to talk to, I'm here to listen.<br><br>
            ⚠️ If you're in a crisis or need immediate help, please reach out to a professional or emergency service.<br>
            In the U.S., you can call or text 988 for the Suicide & Crisis Lifeline (available 24/7).<br><br>
            So, what's on your mind today?
          </p>
        </div>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const checkAuthAndLoad = async () => {
    try {
      if (typeof auth0Client !== "undefined" && auth0Client) {
        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated) {
          window.aiTherapist = new AITherapist();
        } else {
          window.location.href = "./index.html";
        }
      } else {
        setTimeout(checkAuthAndLoad, 500);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  checkAuthAndLoad();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (typeof logout === "function") {
        logout();
      }
    });
  }

  const themeButton = document.querySelector(".theme-button > button");
  const themeDropdown = document.querySelector(".theme-dropdown");
  const themeOptions = themeDropdown.querySelectorAll("button");

  themeButton.addEventListener("click", function () {
    themeDropdown.classList.toggle("open");
  });

  themeOptions.forEach((btn) => {
    btn.addEventListener("click", function () {
      const theme = btn.textContent.trim().toLowerCase();
      if (theme === "light") {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      } else if (theme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.removeItem("theme");
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      themeDropdown.classList.remove("open");
    });
  });

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }
});
