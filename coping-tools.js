document.addEventListener("DOMContentLoaded", async function () {
  const checkAuthAndLoad = async () => {
    try {
      if (typeof auth0Client !== "undefined" && auth0Client) {
        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated) {
          initializeCopingTools();
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

function initializeCopingTools() {
  setupExpandableSections();
  setupQuickActions();
  setupResourceTracking();
}

function setupExpandableSections() {
  const expandableSections = document.querySelectorAll(".expandable-section");

  expandableSections.forEach((section) => {
    const header = section.querySelector(".expandable-header");
    const content = section.querySelector(".expandable-content");
    const chevron = header.querySelector(".fa-chevron-down");

    header.addEventListener("click", () => {
      const isExpanded = !content.classList.contains("hidden");

      if (isExpanded) {
        content.classList.add("hidden");
        chevron.style.transform = "rotate(0deg)";
        section.classList.remove("expanded");
      } else {
        content.classList.remove("hidden");
        chevron.style.transform = "rotate(180deg)";
        section.classList.add("expanded");

        setTimeout(() => {
          const rect = section.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            section.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }, 100);
      }
    });
  });
}

function setupQuickActions() {
  const quickActionCards = document.querySelectorAll(".quick-action-card");

  quickActionCards.forEach((card) => {
    card.addEventListener("click", () => {
      card.style.transform = "scale(0.98)";
      setTimeout(() => {
        card.style.transform = "scale(1)";
      }, 150);
    });
  });
}

function setupResourceTracking() {
  const resourceLinks = document.querySelectorAll('a[target="_blank"]');

  resourceLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const resourceName = link.textContent.trim();
      const resourceUrl = link.href;

      link.style.opacity = "0.7";
      setTimeout(() => {
        link.style.opacity = "1";
      }, 200);

      console.log(`Resource accessed: ${resourceName} - ${resourceUrl}`);
    });
  });
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const navHeight = 80;
    const targetPosition =
      section.getBoundingClientRect().top + window.pageYOffset - navHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
}

function startBreathingExercise(type) {
  console.log(`Starting ${type} breathing exercise`);

  showNotification(
    `Starting ${type} breathing exercise. Follow the instructions!`
  );
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className =
    "fixed top-20 right-4 bg-primary text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translate(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translate(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function callEmergencyNumber(number) {
  if (confirm(`This will attempt to call ${number}. Continue?`)) {
    window.location.href = `tel:${number}`;
  }
}

window.copingTools = {
  scrollToSection,
  startBreathingExercise,
  callEmergencyNumber,
  showNotification,
};

window.copingTools = {
  scrollToSection,
  startBreathingExercise,
  callEmergencyNumber,
  showNotification,
};
