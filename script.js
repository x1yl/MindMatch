// Theme management
function updateTheme() {
  const isDark =
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", isDark);

  if (isDark) {
    document.documentElement.style.setProperty("--color-light-1", "#1a1a1a");
    document.documentElement.style.setProperty("--color-light-2", "#2d2d2d");
    document.documentElement.style.setProperty("--color-light-3", "#404040");
    document.documentElement.style.setProperty("--color-dark-1", "#e0e0e0");
    document.documentElement.style.setProperty("--color-dark-2", "#b0b0b0");
    document.documentElement.style.setProperty("--color-dark-3", "#808080");
  } else {
    document.documentElement.style.setProperty("--color-light-1", "#ffffff");
    document.documentElement.style.setProperty("--color-light-2", "#f4faf7");
    document.documentElement.style.setProperty("--color-light-3", "#deede6");
    document.documentElement.style.setProperty("--color-dark-1", "#173626");
    document.documentElement.style.setProperty("--color-dark-2", "#2d5340");
    document.documentElement.style.setProperty("--color-dark-3", "#476b59");
  }

  const themeIcon = document.querySelector(".theme-button i");
  if (themeIcon) {
    themeIcon.className = isDark
      ? "fas fa-moon text-dark-1"
      : "fas fa-sun text-dark-1";
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
