// Theme management
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

updateTheme();

document.addEventListener("DOMContentLoaded", function () {
  const lightBtn = document.querySelector(
    ".theme-dropdown button:nth-child(1)"
  );
  const darkBtn = document.querySelector(".theme-dropdown button:nth-child(2)");
  const systemBtn = document.querySelector(
    ".theme-dropdown button:nth-child(3)"
  );

  lightBtn?.addEventListener("click", function () {
    localStorage.theme = "light";
    updateTheme();
  });

  darkBtn?.addEventListener("click", function () {
    localStorage.theme = "dark";
    updateTheme();
  });

  systemBtn?.addEventListener("click", function () {
    localStorage.removeItem("theme");
    updateTheme();
  });
});

// Listen for system theme changes
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", function () {
    if (!("theme" in localStorage)) {
      updateTheme();
    }
  });
