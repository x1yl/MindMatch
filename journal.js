class Journal {
  constructor() {
    this.textarea = document.getElementById("journalTextarea");
    this.dock = document.getElementById("journalDock");
    this.dockHoverArea = document.getElementById("dockHoverArea");
    this.wordCountEl = document.getElementById("wordCount");
    this.currentDateEl = document.getElementById("currentDate");
    this.saveIndicator = document.getElementById("saveIndicator");
    this.entriesModal = document.getElementById("entriesModal");
    this.entriesList = document.getElementById("entriesList");

    this.currentEntryId = null;
    this.autoSaveTimeout = null;
    this.isDockMinimized = false;
    this.hasUnsavedChanges = false;
    this.initialContent = "";
    this.isNewUser = false;
    this.isOnline = navigator.onLine;
    this.apiBaseUrl =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? "http://localhost:8081"
        : "https://mind-match-chi.vercel.app";

    this.initializeEventListeners();
    this.loadCurrentEntry();
    this.updateDate();
    this.updateWordCount();
    this.setupBeforeUnload();
    this.setupOnlineOfflineHandlers();
  }

  initializeEventListeners() {
    this.textarea.addEventListener("focus", () => this.minimizeDock());
    this.textarea.addEventListener("blur", (e) => {
      if (!this.dock.contains(e.relatedTarget)) {
        setTimeout(() => this.restoreDock(), 100);
      }
    });

    this.dockHoverArea.addEventListener("mouseenter", () => {
      if (this.isDockMinimized) {
        this.dock.classList.remove("minimized");
      }
    });

    this.dockHoverArea.addEventListener("mouseleave", (e) => {
      if (this.isDockMinimized && !this.dock.contains(e.relatedTarget)) {
        setTimeout(() => {
          if (
            this.isDockMinimized &&
            !this.dock.matches(":hover") &&
            !this.dockHoverArea.matches(":hover")
          ) {
            this.dock.classList.add("minimized");
          }
        }, 100);
      }
    });

    this.dock.addEventListener("mouseenter", () => {
      if (this.isDockMinimized) {
        this.dock.classList.remove("minimized");
      }
    });

    this.dock.addEventListener("mouseleave", (e) => {
      if (
        this.isDockMinimized &&
        !this.dockHoverArea.contains(e.relatedTarget)
      ) {
        setTimeout(() => {
          if (
            this.isDockMinimized &&
            !this.dock.matches(":hover") &&
            !this.dockHoverArea.matches(":hover")
          ) {
            this.dock.classList.add("minimized");
          }
        }, 100);
      }
    });

    document.querySelector("nav").addEventListener("click", () => {
      this.restoreDock();
    });

    this.textarea.addEventListener("input", () => {
      this.updateWordCount();
      this.markAsChanged();
      this.autoSave();
    });

    document
      .getElementById("newEntryBtn")
      .addEventListener("click", () => this.newEntry());
    document
      .getElementById("saveBtn")
      .addEventListener("click", () => this.saveEntry(true));
    document
      .getElementById("entriesBtn")
      .addEventListener("click", () => this.showEntriesModal());

    const closeModalBtn = document.getElementById("closeModal");
    const modalOverlay = this.entriesModal.querySelector(".modal-overlay");

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideEntriesModal();
      });
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideEntriesModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!this.entriesModal.classList.contains("hidden")) {
          this.hideEntriesModal();
        }
        this.restoreDock();
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            this.saveEntry(true);
            break;
          case "n":
            e.preventDefault();
            this.newEntry();
            break;
          case "e":
            e.preventDefault();
            this.showEntriesModal();
            break;
        }
      }
    });
  }

  minimizeDock() {
    this.isDockMinimized = true;
    this.dock.classList.add("minimized");

    this.dockHoverArea.classList.add("active");
  }

  restoreDock() {
    this.isDockMinimized = false;
    this.dock.classList.remove("minimized");

    this.dockHoverArea.classList.remove("active");
  }

  updateWordCount() {
    const text = this.textarea.value.trim();
    const words = text === "" ? 0 : text.split(/\s+/).length;
    this.wordCountEl.textContent = `${words} word${words !== 1 ? "s" : ""}`;
  }

  updateDate() {
    const now = new Date();
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    this.currentDateEl.textContent = now.toLocaleDateString("en-US", options);
  }

  generateEntryId() {
    return Date.now().toString();
  }

  async getAuthToken() {
    try {
      if (auth0Client) {
        return await auth0Client.getTokenSilently();
      }
      return null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async apiRequest(endpoint, options = {}) {
    const token = await this.getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const url = `${this.apiBaseUrl}/api${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.warn("Could not parse error response as JSON");
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return { success: true };
      }
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }

  setupOnlineOfflineHandlers() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  async syncPendingChanges() {
    try {
      const pendingChanges = JSON.parse(
        localStorage.getItem("pendingJournalChanges") || "[]"
      );

      for (const change of pendingChanges) {
        if (change.type === "save") {
          await this.saveToDatabase(change.entry);
        } else if (change.type === "delete") {
          await this.deleteFromDatabase(change.entryId);
        }
      }

      localStorage.removeItem("pendingJournalChanges");

      this.loadCurrentEntry();
    } catch (error) {
      console.error("Error syncing pending changes:", error);
    }
  }

  async saveToDatabase(entry) {
    try {
      const entryExists = await this.checkEntryExists(entry.id);

      if (entryExists) {
        await this.apiRequest(`/journal/${entry.id}`, {
          method: "PUT",
          body: JSON.stringify({
            content: entry.content,
            wordCount: entry.wordCount,
          }),
        });
      } else {
        await this.apiRequest("/journal", {
          method: "POST",
          body: JSON.stringify(entry),
        });
      }

      return true;
    } catch (error) {
      console.error("Error saving to database:", error);
      throw error;
    }
  }

  async checkEntryExists(entryId) {
    try {
      await this.apiRequest(`/journal/${entryId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteFromDatabase(entryId) {
    try {
      const response = await this.apiRequest(`/journal/${entryId}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Error deleting from database:", error.message);
      throw new Error(`Failed to delete entry from database: ${error.message}`);
    }
  }

  addToPendingChanges(change) {
    const pending = JSON.parse(
      localStorage.getItem("pendingJournalChanges") || "[]"
    );
    pending.push({
      ...change,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("pendingJournalChanges", JSON.stringify(pending));
  }

  async saveEntry(showIndicator = false) {
    const content = this.textarea.value.trim();
    if (!content) return;

    const entry = {
      id: this.currentEntryId || this.generateEntryId(),
      content: content,
      wordCount: content === "" ? 0 : content.split(/\s+/).length,
    };

    this.currentEntryId = entry.id;

    try {
      if (this.isOnline) {
        await this.saveToDatabase(entry);

        this.saveToLocalStorage(entry);
      } else {
        this.saveToLocalStorage(entry);
        this.addToPendingChanges({ type: "save", entry });
      }

      this.hasUnsavedChanges = false;
      this.initialContent = content;

      if (showIndicator) {
        this.showSaveIndicator();
      }
    } catch (error) {
      console.error("Error saving entry:", error);

      this.saveToLocalStorage(entry);
      this.addToPendingChanges({ type: "save", entry });

      this.hasUnsavedChanges = false;
      this.initialContent = content;

      if (showIndicator) {
        this.showSaveIndicator("Saved locally (will sync when online)");
      }
    }
  }

  saveToLocalStorage(entry) {
    const entries = this.getLocalEntries();
    const existingIndex = entries.findIndex((e) => e.id === entry.id);

    const entryWithTimestamp = {
      ...entry,
      lastModified: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = entryWithTimestamp;
    } else {
      entries.unshift(entryWithTimestamp);
    }

    localStorage.setItem("journal_entries", JSON.stringify(entries));
    localStorage.setItem("journal_current", entry.id);
  }

  getLocalEntries() {
    try {
      return JSON.parse(localStorage.getItem("journal_entries") || "[]");
    } catch {
      return [];
    }
  }

  markAsChanged() {
    const currentContent = this.textarea.value.trim();
    this.hasUnsavedChanges = currentContent !== this.initialContent;
  }

  setupBeforeUnload() {
    window.addEventListener("beforeunload", (e) => {
      const currentContent = this.textarea.value.trim();
      const hasRealChanges =
        this.hasUnsavedChanges &&
        currentContent &&
        currentContent !== this.initialContent;

      if (hasRealChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    });
  }

  autoSave() {
    if (this.isNewUser && this.getLocalEntries().length === 0) {
      return;
    }

    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(async () => {
      if (this.hasUnsavedChanges && this.textarea.value.trim()) {
        await this.saveEntry(false);
      }
    }, 2000);
  }

  async newEntry() {
    if (this.hasUnsavedChanges && this.textarea.value.trim()) {
      if (
        confirm(
          "You have unsaved changes. Do you want to save them before creating a new entry?"
        )
      ) {
        await this.saveEntry(false);
      }
    } else if (this.textarea.value.trim()) {
      await this.saveEntry(false);
    }

    this.currentEntryId = this.generateEntryId();
    this.textarea.value = "";
    this.textarea.focus();
    this.updateWordCount();
    this.hasUnsavedChanges = false;
    this.initialContent = "";

    localStorage.setItem("journal_current", this.currentEntryId);
  }

  async loadCurrentEntry() {
    try {
      if (this.isOnline) {
        const result = await this.apiRequest("/journal?limit=1");
        if (result.data && result.data.length > 0) {
          const entry = result.data[0];
          this.currentEntryId = entry.id;
          this.textarea.value = entry.content;
          this.initialContent = entry.content;
          this.hasUnsavedChanges = false;
          this.updateWordCount();
          localStorage.setItem("journal_current", entry.id);
          return;
        } else {
          await this.migrateFromLocalStorage();
          return;
        }
      }
    } catch (error) {
      console.error("Error loading from database:", error);
    }

    this.loadFromLocalStorage();
  }

  async migrateFromLocalStorage() {
    const localEntries = this.getLocalEntries();
    if (localEntries.length > 0) {
      try {
        for (const localEntry of localEntries) {
          await this.saveToDatabase({
            id: localEntry.id,
            content: localEntry.content,
            wordCount: localEntry.wordCount,
          });
        }

        const mostRecent = localEntries[0];
        this.currentEntryId = mostRecent.id;
        this.textarea.value = mostRecent.content;
        this.initialContent = mostRecent.content;
        this.hasUnsavedChanges = false;
        this.updateWordCount();
        localStorage.setItem("journal_current", mostRecent.id);

      } catch (error) {
        console.error("Error migrating entries:", error);
        this.loadFromLocalStorage();
      }
    } else {
      this.isNewUser = true;
      this.currentEntryId = this.generateEntryId();
      this.textarea.value = "";
      this.initialContent = "";
      this.hasUnsavedChanges = false;
      localStorage.setItem("journal_current", this.currentEntryId);
    }
  }

  loadFromLocalStorage() {
    const entries = this.getLocalEntries();

    if (entries.length === 0) {
      this.isNewUser = true;
      this.currentEntryId = this.generateEntryId();
      this.textarea.value = "";
      this.initialContent = "";
      this.hasUnsavedChanges = false;
      localStorage.setItem("journal_current", this.currentEntryId);
      return;
    }

    const currentId = localStorage.getItem("journal_current");
    if (currentId) {
      const entry = entries.find((e) => e.id === currentId);
      if (entry) {
        this.currentEntryId = entry.id;
        this.textarea.value = entry.content;
        this.initialContent = entry.content;
        this.hasUnsavedChanges = false;
        this.updateWordCount();
        return;
      }
    }

    if (entries.length > 0) {
      const mostRecent = entries[0];
      this.currentEntryId = mostRecent.id;
      this.textarea.value = mostRecent.content;
      this.initialContent = mostRecent.content;
      this.hasUnsavedChanges = false;
      localStorage.setItem("journal_current", mostRecent.id);
      this.updateWordCount();
    }
  }

  async loadEntry(entryId) {
    if (this.hasUnsavedChanges && this.textarea.value.trim()) {
      if (
        confirm(
          "You have unsaved changes. Do you want to save them before loading this entry?"
        )
      ) {
        await this.saveEntry(false);
      }
    } else if (this.textarea.value.trim()) {
      await this.saveEntry(false);
    }

    try {
      if (this.isOnline) {
        const entry = await this.apiRequest(`/journal/${entryId}`);
        this.currentEntryId = entry.id;
        this.textarea.value = entry.content;
        this.initialContent = entry.content;
        this.hasUnsavedChanges = false;
        this.updateWordCount();
        localStorage.setItem("journal_current", entry.id);
        this.hideEntriesModal();
        this.textarea.focus();
        return;
      }
    } catch (error) {
      console.error("Error loading entry from database:", error);
    }

    const entries = this.getLocalEntries();
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      this.currentEntryId = entry.id;
      this.textarea.value = entry.content;
      this.initialContent = entry.content;
      this.hasUnsavedChanges = false;
      this.updateWordCount();
      localStorage.setItem("journal_current", entry.id);
      this.hideEntriesModal();
      this.textarea.focus();
    }
  }

  async deleteEntry(entryId) {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      if (this.isOnline) {
        try {
          await this.deleteFromDatabase(entryId);
        } catch (dbError) {
          console.error("Error deleting from database:", dbError);
          this.addToPendingChanges({ type: "delete", entryId });
        }
      } else {
        this.addToPendingChanges({ type: "delete", entryId });
      }

      const entries = this.getLocalEntries();
      const filteredEntries = entries.filter((e) => e.id !== entryId);
      localStorage.setItem("journal_entries", JSON.stringify(filteredEntries));

      if (this.currentEntryId === entryId) {
        this.textarea.value = "";
        this.currentEntryId = this.generateEntryId();
        this.updateWordCount();
        this.hasUnsavedChanges = false;
        this.initialContent = "";
        localStorage.setItem("journal_current", this.currentEntryId);

        if (filteredEntries.length === 0) {
          this.isNewUser = true;
        }
      }

      await this.renderEntriesList();

      this.showSaveIndicator("Entry deleted successfully");
    } catch (error) {
      console.error("Error in deleteEntry:", error);
      alert("Error deleting entry. Please try again.");
    }
  }

  showEntriesModal() {
    this.entriesModal.classList.remove("hidden");
    this.renderEntriesList();
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      const closeBtn = document.getElementById("closeModal");
      if (closeBtn) closeBtn.focus();
    }, 100);
  }

  hideEntriesModal() {
    this.entriesModal.classList.add("hidden");
    document.body.style.overflow = "";

    setTimeout(() => {
      this.textarea.focus();
    }, 100);
  }

  async renderEntriesList() {
    let entries = [];

    try {
      if (this.isOnline) {
        const result = await this.apiRequest("/journal?limit=50");
        entries = result.data.map((entry) => ({
          id: entry.id,
          content: entry.content,
          wordCount: entry.word_count,
          lastModified: entry.updated_at,
        }));
      }
    } catch (error) {
      console.error("Error loading entries from database:", error);
    }

    if (entries.length === 0) {
      entries = this.getLocalEntries();
    }

    if (entries.length === 0) {
      this.entriesList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book-open text-4xl mb-4 opacity-50"></i>
          <p>No journal entries yet.</p>
          <p class="text-sm mt-2">Start writing to create your first entry!</p>
        </div>
      `;
      return;
    }

    this.entriesList.innerHTML = entries
      .map((entry) => {
        const date = new Date(entry.lastModified);
        const preview =
          entry.content.length > 150
            ? entry.content.substring(0, 150) + "..."
            : entry.content;

        const isCurrentEntry = entry.id === this.currentEntryId;

        return `
        <div class="entry-item ${
          isCurrentEntry ? "border-primary" : ""
        }" data-id="${entry.id}">
          <div class="entry-date">
            ${date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })} ${isCurrentEntry ? "(Current)" : ""}
          </div>
          <div class="entry-preview">${this.escapeHtml(preview)}</div>
          <div class="entry-actions">
            <button class="entry-action-btn load" onclick="journal.loadEntry('${
              entry.id
            }')">
              Load
            </button>
            <button class="entry-action-btn delete" onclick="journal.deleteEntry('${
              entry.id
            }')">
              Delete
            </button>
          </div>
          <div class="text-xs text-dark-2 dark:text-dark-2-dark mt-2">
            ${entry.wordCount} words
          </div>
        </div>
      `;
      })
      .join("");
  }

  showSaveIndicator(message = "Saved!") {
    const textSpan = this.saveIndicator.querySelector("span");
    if (textSpan) {
      textSpan.textContent = message;
    } else {
      this.saveIndicator.textContent = message;
    }

    this.saveIndicator.classList.remove("hidden");
    this.saveIndicator.classList.add("show");

    setTimeout(() => {
      this.saveIndicator.classList.remove("show");

      setTimeout(() => {
        this.saveIndicator.classList.add("hidden");
      }, 300);
    }, 2000);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

let journal;

document.addEventListener("DOMContentLoaded", async function () {
  const checkAuthAndLoad = async () => {
    try {
      if (typeof auth0Client !== "undefined" && auth0Client) {
        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated) {
          journal = new Journal();
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
