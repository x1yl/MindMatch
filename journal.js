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

    this.initializeEventListeners();
    this.loadCurrentEntry();
    this.updateDate();
    this.updateWordCount();
    this.setupBeforeUnload();
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

  saveEntry(showIndicator = false) {
    const content = this.textarea.value.trim();
    if (!content) return;

    const entry = {
      id: this.currentEntryId || this.generateEntryId(),
      content: content,
      lastModified: new Date().toISOString(),
      wordCount: content === "" ? 0 : content.split(/\s+/).length,
    };

    this.currentEntryId = entry.id;

    const entries = this.getEntries();
    const existingIndex = entries.findIndex((e) => e.id === entry.id);

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.unshift(entry);
    }

    localStorage.setItem("journal_entries", JSON.stringify(entries));
    localStorage.setItem("journal_current", entry.id);

    this.hasUnsavedChanges = false;
    this.initialContent = content;

    if (showIndicator) {
      this.showSaveIndicator();
    }
  }

  markAsChanged() {
    const currentContent = this.textarea.value.trim();
    this.hasUnsavedChanges = currentContent !== this.initialContent;
  }

  setupBeforeUnload() {
    window.addEventListener("beforeunload", (e) => {
      if (this.hasUnsavedChanges && this.textarea.value.trim()) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    });
  }

  autoSave() {
    if (this.isNewUser && this.getEntries().length === 0) {
      return;
    }

    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveEntry(false);
    }, 2000);
  }

  newEntry() {
    if (this.hasUnsavedChanges && this.textarea.value.trim()) {
      if (
        confirm(
          "You have unsaved changes. Do you want to save them before creating a new entry?"
        )
      ) {
        this.saveEntry(false);
      }
    } else if (this.textarea.value.trim()) {
      this.saveEntry(false);
    }

    this.currentEntryId = this.generateEntryId();
    this.textarea.value = "";
    this.textarea.focus();
    this.updateWordCount();
    this.hasUnsavedChanges = false;
    this.initialContent = "";

    localStorage.setItem("journal_current", this.currentEntryId);
  }

  loadCurrentEntry() {
    const entries = this.getEntries();

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

  loadEntry(entryId) {
    const entries = this.getEntries();
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      if (this.hasUnsavedChanges && this.textarea.value.trim()) {
        if (
          confirm(
            "You have unsaved changes. Do you want to save them before loading this entry?"
          )
        ) {
          this.saveEntry(false);
        }
      } else if (this.textarea.value.trim()) {
        this.saveEntry(false);
      }

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

  deleteEntry(entryId) {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const entries = this.getEntries();
    const filteredEntries = entries.filter((e) => e.id !== entryId);
    localStorage.setItem("journal_entries", JSON.stringify(filteredEntries));

    if (this.currentEntryId === entryId) {
      this.textarea.value = "";
      this.currentEntryId = null;
      this.updateWordCount();
      this.hasUnsavedChanges = false;
      this.initialContent = "";

      this.currentEntryId = this.generateEntryId();
      localStorage.setItem("journal_current", this.currentEntryId);

      if (filteredEntries.length === 0) {
        this.isNewUser = true;
      }
    }

    this.renderEntriesList();
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

  renderEntriesList() {
    const entries = this.getEntries();

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
