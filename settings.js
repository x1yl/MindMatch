document.addEventListener("DOMContentLoaded", function () {
  initializeSettings();
  initializeAvatarSelection();
  initializeUsernameChange();
  initializeDeleteAccount();
  initializeSidebar();
  initializeThemeToggle();
});

function initializeSettings() {
  const currentUser = {
    username: "ADMIN",
    email: "admin@mindmatch.xyz",
    avatar: "user",
  };

  document.getElementById("usernameInput").value = currentUser.username;
  document.getElementById("emailDisplay").value = currentUser.email;
  document.getElementById("settingsUserName").textContent =
    currentUser.username;
  document.getElementById("settingsUserEmail").textContent = currentUser.email;
  document.getElementById("panelUserName").textContent = currentUser.username;

  setCurrentAvatar(currentUser.avatar);
}

function initializeAvatarSelection() {
  const avatarOptions = document.querySelectorAll(".avatar-option");
  const currentAvatar = document.getElementById("currentAvatar");
  const navbarAvatar = document.getElementById("navbarAvatar");
  const uploadBtn = document.getElementById("uploadAvatarBtn");
  const uploadInput = document.getElementById("avatarUpload");

  avatarOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const avatarType = this.dataset.avatar;

      avatarOptions.forEach((opt) => opt.classList.remove("active"));

      this.classList.add("active");

      setCurrentAvatar(avatarType);

      showMessage("Avatar updated successfully!", "success");
    });
  });

  uploadBtn.addEventListener("click", function () {
    uploadInput.click();
  });

  uploadInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          showMessage(
            "Custom avatar upload would be implemented here!",
            "success"
          );
        };
        reader.readAsDataURL(file);
      } else {
        showMessage("Please select a valid image file.", "error");
      }
    }
  });
}

function setCurrentAvatar(avatarType) {
  const currentAvatar = document.getElementById("currentAvatar");
  const navbarAvatar = document.getElementById("navbarAvatar");

  const avatarIcons = {
    user: "fas fa-user",
    smile: "fas fa-smile",
    leaf: "fas fa-leaf",
    heart: "fas fa-heart",
    star: "fas fa-star",
    sun: "fas fa-sun",
  };

  const avatarColors = {
    user: "bg-primary",
    smile: "bg-purple-500",
    leaf: "bg-green-500",
    heart: "bg-orange-500",
    star: "bg-teal-500",
    sun: "bg-indigo-500",
  };

  const iconClass = avatarIcons[avatarType] || "fas fa-user";
  const colorClass = avatarColors[avatarType] || "bg-primary";

  currentAvatar.className = `w-24 h-24 ${colorClass} rounded-full flex items-center justify-center shadow-lg`;
  currentAvatar.innerHTML = `<i class="${iconClass} text-white text-2xl"></i>`;

  navbarAvatar.className = `w-8 h-8 ${colorClass} rounded-full flex items-center justify-center`;
  navbarAvatar.innerHTML = `<i class="${iconClass} text-light-1 text-sm"></i>`;

  document.querySelectorAll(".avatar-option").forEach((opt) => {
    opt.classList.remove("active");
    if (opt.dataset.avatar === avatarType) {
      opt.classList.add("active");
    }
  });
}

function initializeUsernameChange() {
  const usernameInput = document.getElementById("usernameInput");
  const saveBtn = document.getElementById("saveUsernameBtn");

  saveBtn.addEventListener("click", function () {
    const newUsername = usernameInput.value.trim();

    if (newUsername === "") {
      showMessage("Username cannot be empty.", "error");
      return;
    }

    if (newUsername.length < 2) {
      showMessage("Username must be at least 2 characters long.", "error");
      return;
    }

    if (newUsername.length > 20) {
      showMessage("Username must be 20 characters or less.", "error");
      return;
    }

    saveBtn.classList.add("loading");
    saveBtn.disabled = true;

    setTimeout(() => {
      document.getElementById("settingsUserName").textContent = newUsername;
      document.getElementById("panelUserName").textContent = newUsername;

      saveBtn.classList.remove("loading");
      saveBtn.disabled = false;

      showMessage("Username updated successfully!", "success");
    }, 1000);
  });

  usernameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      saveBtn.click();
    }
  });
}

function initializeDeleteAccount() {
  const deleteBtn = document.getElementById("deleteAccountBtn");
  const modal = document.getElementById("deleteModal");
  const cancelBtn = document.getElementById("cancelDeleteBtn");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const confirmInput = document.getElementById("deleteConfirmInput");

  deleteBtn.addEventListener("click", function () {
    modal.classList.remove("hidden");
    modal.classList.add("modal-visible");
    confirmInput.value = "";
    confirmBtn.disabled = true;
    confirmInput.focus();
  });

  cancelBtn.addEventListener("click", closeDeleteModal);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeDeleteModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("modal-visible")) {
      closeDeleteModal();
    }
  });

  confirmInput.addEventListener("input", function () {
    confirmBtn.disabled = this.value !== "DELETE";
  });

  confirmBtn.addEventListener("click", function () {
    if (confirmInput.value === "DELETE") {
      confirmBtn.classList.add("loading");
      confirmBtn.disabled = true;

      setTimeout(() => {
        showMessage(
          "Account deletion would be processed here. Redirecting to homepage...",
          "success"
        );

        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      }, 2000);
    }
  });

  function closeDeleteModal() {
    modal.classList.add("hidden");
    modal.classList.remove("modal-visible");
    confirmInput.value = "";
    confirmBtn.disabled = true;
  }
}

function initializeSidebar() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const closeSidebarBtn = document.getElementById("closeSidebar");

  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  hamburgerBtn.addEventListener("click", openSidebar);
  closeSidebarBtn.addEventListener("click", closeSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeSidebar();
    }
  });
}

function initializeThemeToggle() {
  const themeButtons = document.querySelectorAll(".theme-dropdown button");

  themeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const theme = this.textContent.trim().toLowerCase();

      document.documentElement.classList.remove("dark", "light");

      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else if (theme === "light") {
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      } else {
        localStorage.removeItem("theme");
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        }
      }

      showMessage(`Theme changed to ${theme}`, "success");
    });
  });

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.classList.add(savedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }
}

function showMessage(message, type = "success") {
  const existingMessages = document.querySelectorAll(".toast-notification");
  let topOffset = 16;

  existingMessages.forEach((msg) => {
    topOffset += msg.offsetHeight + 8;
  });

  const messageEl = document.createElement("div");
  messageEl.className = `toast-notification fixed right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
    type === "success"
      ? "bg-green-100 border border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400"
      : "bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400"
  }`;

  messageEl.style.top = `${topOffset}px`;

  messageEl.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${
              type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
            }"></i>
            <span>${message}</span>
            <button class="ml-3 opacity-50 hover:opacity-100 transition-opacity">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  document.body.appendChild(messageEl);

  setTimeout(() => {
    messageEl.classList.remove("translate-x-full");
  }, 100);

  const removeMessage = () => {
    messageEl.classList.add("translate-x-full");
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);

        repositionMessages();
      }
    }, 300);
  };

  messageEl.querySelector("button").addEventListener("click", removeMessage);

  setTimeout(removeMessage, 5000);
}

function repositionMessages() {
  const messages = document.querySelectorAll(".toast-notification");
  let topOffset = 16;

  messages.forEach((msg) => {
    msg.style.top = `${topOffset}px`;
    topOffset += msg.offsetHeight + 8;
  });
}
