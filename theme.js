function updateTheme() {
  const isDark =
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", isDark);

  const themeIcon = document.querySelector(".theme-button i");
  if (themeIcon) {
    themeIcon.className = isDark
      ? "fas fa-moon text-dark-1 dark:text-dark-1-dark"
      : "fas fa-sun text-dark-1 dark:text-dark-1-dark";
  }
}

function setTheme(theme) {
  if (theme === "light") {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else if (theme === "dark") {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else if (theme === "system") {
    localStorage.removeItem("theme");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }

  const themeButton = document.querySelector(".theme-button > button");
  const themeDropdown = document.querySelector(".theme-dropdown");

  if (themeButton && themeDropdown) {
    const themeOptions = themeDropdown.querySelectorAll("button");

    themeButton.addEventListener("click", function () {
      themeDropdown.classList.toggle("open");
    });

    themeOptions.forEach((btn) => {
      btn.addEventListener("click", function () {
        const theme = btn.textContent.trim().toLowerCase();
        setTheme(theme);
        themeDropdown.classList.remove("open");
        
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
      });
    });

    document.addEventListener("click", function (event) {
      if (!themeButton.contains(event.target) && !themeDropdown.contains(event.target)) {
        themeDropdown.classList.remove("open");
      }
    });
  }

  updateTheme();
}

initializeTheme();

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function () {
    if (!("theme" in localStorage)) {
      updateTheme();
    }
  });
