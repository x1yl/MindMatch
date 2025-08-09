const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8081"
    : location.origin;

document.addEventListener("DOMContentLoaded", async function () {
  const onAuthenticated = async () => {
    await initializeSettings();
    initializeAvatarSelection();
    initializeUsernameChange();
    initializeDeleteAccount();
  };

  await checkAuthAndRedirect(onAuthenticated);
});

let currentUser = null;

async function initializeSettings() {
  try {
    const user = await getUser();
    const freshUserData = await fetchFreshUserData();
    currentUser = freshUserData || user;

    document.getElementById("usernameInput").value = currentUser.name || "";
    document.getElementById("emailDisplay").value = currentUser.email || "";
    document.getElementById("settingsUserName").textContent =
      currentUser.name || "User";
    document.getElementById("settingsUserEmail").textContent =
      currentUser.email || "";
    document.getElementById("settingsPanelUserName").textContent =
      currentUser.name || "User";

    if (
      currentUser.picture &&
      currentUser.picture.includes("mindmatch.app/avatars/")
    ) {
      const avatarType = currentUser.picture.match(/avatars\/(.+)\.png$/)?.[1];
      if (avatarType) {
        setCurrentAvatar(null, avatarType);
      } else {
        setCurrentAvatar(currentUser.picture);
      }
    } else {
      setCurrentAvatar(currentUser.picture);
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
    showMessage("Failed to load user settings", "error");
  }
}

function initializeAvatarSelection() {
  const avatarOptions = document.querySelectorAll(".avatar-option");
  const uploadBtn = document.getElementById("uploadAvatarBtn");
  const uploadInput = document.getElementById("avatarUpload");

  avatarOptions.forEach((option) => {
    option.style.display = "";

    option.addEventListener("click", function () {
      const avatarType = this.dataset.avatar;

      avatarOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");

      setCurrentAvatar(null, avatarType);

      updateUserAvatar(avatarType);

      showMessage("Avatar updated successfully!", "success");
    });
  });

  uploadBtn.addEventListener("click", function () {
    uploadInput.click();
  });

  uploadInput.addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          showMessage("Image file must be smaller than 10MB.", "error");
          return;
        }

        try {
          uploadBtn.classList.add("loading");
          uploadBtn.disabled = true;

          const reader = new FileReader();
          reader.onload = async function (e) {
            try {
              await updateUserPicture(e.target.result, file.name);

              const freshUserData = await fetchFreshUserData();
              if (freshUserData) {
                currentUser = freshUserData;
                setCurrentAvatar(freshUserData.picture);
              }

              avatarOptions.forEach((opt) => opt.classList.remove("active"));

              showMessage("Profile picture updated successfully!", "success");
            } catch (error) {
              console.error("Upload failed:", error);
              showMessage("Failed to update profile picture.", "error");
            } finally {
              uploadBtn.classList.remove("loading");
              uploadBtn.disabled = false;
            }
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Error reading file:", error);
          showMessage("Failed to read image file.", "error");
          uploadBtn.classList.remove("loading");
          uploadBtn.disabled = false;
        }
      } else {
        showMessage("Please select a valid image file.", "error");
      }
    }
  });
}

function setCurrentAvatar(pictureUrl, avatarType = null) {
  const currentAvatar = document.getElementById("currentAvatar");
  const navbarAvatar = document.getElementById("settingsProfilePicture");

  if (pictureUrl && pictureUrl !== "" && !avatarType) {
    currentAvatar.className =
      "w-24 h-24 rounded-full overflow-hidden shadow-lg bg-gray-200";
    currentAvatar.innerHTML = `<img src="${pictureUrl}" alt="Profile Picture" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-user text-gray-500 text-2xl\\"></i>'; this.parentElement.classList.add('flex', 'items-center', 'justify-center');">`;

    if (navbarAvatar) {
      navbarAvatar.src = pictureUrl;
      navbarAvatar.style.display = 'block';
      const fallbackIcon = navbarAvatar.nextElementSibling;
      if (fallbackIcon && fallbackIcon.classList.contains('fa-user')) {
        fallbackIcon.style.display = 'none';
      }
    }

    document
      .querySelectorAll(".avatar-option")
      .forEach((opt) => opt.classList.remove("active"));
  } else if (avatarType) {
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

    if (navbarAvatar) {
      navbarAvatar.style.display = 'none';
      const fallbackIcon = navbarAvatar.nextElementSibling;
      if (fallbackIcon && fallbackIcon.classList.contains('fa-user')) {
        fallbackIcon.style.display = 'block';
      }
    }

    document.querySelectorAll(".avatar-option").forEach((opt) => {
      opt.classList.remove("active");
      if (opt.dataset.avatar === avatarType) {
        opt.classList.add("active");
      }
    });
  } else {
    currentAvatar.className =
      "w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg";
    currentAvatar.innerHTML = '<i class="fas fa-user text-white text-2xl"></i>';

    if (navbarAvatar) {
      navbarAvatar.style.display = 'none';
      const fallbackIcon = navbarAvatar.nextElementSibling;
      if (fallbackIcon && fallbackIcon.classList.contains('fa-user')) {
        fallbackIcon.style.display = 'block';
      }
    }
  }
  
  if (typeof updateAllProfileElements === 'function') {
    updateAllProfileElements();
  }
}

function initializeUsernameChange() {
  const usernameInput = document.getElementById("usernameInput");
  const saveBtn = document.getElementById("saveUsernameBtn");

  saveBtn.addEventListener("click", async function () {
    const newUsername = usernameInput.value.trim();

    if (newUsername === "") {
      showMessage("Name cannot be empty.", "error");
      return;
    }

    if (newUsername.length < 1) {
      showMessage("Name must be at least 1 character long.", "error");
      return;
    }

    if (newUsername.length > 50) {
      showMessage("Name must be 50 characters or less.", "error");
      return;
    }

    if (newUsername === currentUser.name) {
      showMessage("No changes to save.", "info");
      return;
    }

    saveBtn.classList.add("loading");
    saveBtn.disabled = true;

    try {
      await updateUserName(newUsername);

      const freshUserData = await fetchFreshUserData();
      if (freshUserData) {
        currentUser = freshUserData;
      }

      const updatedName = freshUserData ? freshUserData.name : newUsername;

      document.getElementById("usernameInput").value = updatedName;
      document.getElementById("settingsUserName").textContent = updatedName;
      document.getElementById("settingsPanelUserName").textContent = updatedName;
      
      if (typeof updateAllProfileElements === 'function') {
        updateAllProfileElements();
      }
    } catch (error) {
      console.error("Error updating name:", error);
      showMessage("Failed to update name. Please try again.", "error");
      usernameInput.value = currentUser.name || "";
    } finally {
      saveBtn.classList.remove("loading");
      saveBtn.disabled = false;
      showMessage("Username updated successfully!", "success");
    }
  });

  usernameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      saveBtn.click();
    }
  });
}

async function updateUserName(name) {
  try {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}/api/user-profile/name`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server error response:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error;
  }
}

async function updateUserPicture(imageData, fileName) {
  try {
    const token = await getToken();

    const payload = JSON.stringify({ imageData, fileName });

    const response = await fetch(`${API_BASE_URL}/api/user-profile/picture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server error response:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error updating user picture:", error);
    throw error;
  }
}

async function updateUserAvatar(avatarType) {
  try {
    const avatarUrl = `https://mindmatch.app/avatars/${avatarType}.png`;

    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}/api/user-profile/picture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageData: null,
        fileName: null,
        avatarType: avatarType,
        avatarUrl: avatarUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server error response:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    currentUser.picture = avatarUrl;
    currentUser.avatarType = avatarType;

    return data;
  } catch (error) {
    console.error("Error updating user avatar:", error);
    throw error;
  }
}

async function deleteUserAccount() {
  try {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}/api/user-profile`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Server error response:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
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

  confirmBtn.addEventListener("click", async function () {
    if (confirmInput.value === "DELETE") {
      confirmBtn.classList.add("loading");
      confirmBtn.disabled = true;

      try {
        await deleteUserAccount();
        
        showMessage(
          "Account deleted successfully. You will be redirected to the login page.",
          "success"
        );

        // Wait 2 seconds then redirect to logout/login
        setTimeout(() => {
          // Clear any local storage or cached data
          localStorage.clear();
          sessionStorage.clear();
          
          // Redirect to home page (user will no longer be authenticated)
          window.location.href = '/';
        }, 2000);
        
      } catch (error) {
        console.error('Error deleting account:', error);
        showMessage(
          "Failed to delete account. Please try again or contact support.",
          "error"
        );
        
        confirmBtn.classList.remove("loading");
        confirmBtn.disabled = false;
      }
    }
  });

  function closeDeleteModal() {
    modal.classList.add("hidden");
    modal.classList.remove("modal-visible");
    confirmInput.value = "";
    confirmBtn.disabled = true;
    confirmBtn.classList.remove("loading");
  }
}

function showMessage(message, type = "success") {
  const existingMessages = document.querySelectorAll(".toast-notification");
  let topOffset = 16;

  existingMessages.forEach((msg) => {
    topOffset += msg.offsetHeight + 8;
  });

  const messageEl = document.createElement("div");
  let bgClass, borderClass, textClass, iconClass;

  switch (type) {
    case "success":
      bgClass = "bg-green-100 dark:bg-green-900/20";
      borderClass = "border-green-300 dark:border-green-700";
      textClass = "text-green-700 dark:text-green-400";
      iconClass = "fa-check-circle";
      break;
    case "error":
      bgClass = "bg-red-100 dark:bg-red-900/20";
      borderClass = "border-red-300 dark:border-red-700";
      textClass = "text-red-700 dark:text-red-400";
      iconClass = "fa-exclamation-circle";
      break;
    case "info":
      bgClass = "bg-blue-100 dark:bg-blue-900/20";
      borderClass = "border-blue-300 dark:border-blue-700";
      textClass = "text-blue-700 dark:text-blue-400";
      iconClass = "fa-info-circle";
      break;
    default:
      bgClass = "bg-green-100 dark:bg-green-900/20";
      borderClass = "border-green-300 dark:border-green-700";
      textClass = "text-green-700 dark:text-green-400";
      iconClass = "fa-check-circle";
  }

  messageEl.className = `toast-notification fixed right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${bgClass} border ${borderClass} ${textClass}`;

  messageEl.style.top = `${topOffset}px`;

  messageEl.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${iconClass}"></i>
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
