document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
);

document.addEventListener("DOMContentLoaded", async function () {
  // Check if running in development environment
  const isDevelopment = window.location.href.startsWith(
    "http://127.0.0.1:5500/"
  );

  if (auth0Client && !isDevelopment) {
    const isAuthenticated = await auth0Client.isAuthenticated();
    if (isAuthenticated) {
      const user = await auth0Client.getUser();
      const dashboardUserName = document.getElementById("dashboardUserName");
      if (dashboardUserName) {
        dashboardUserName.textContent = user.name || user.email || "User";
      }
    } else {
      window.location.href = "index.html";
    }
  } else if (isDevelopment) {
    const dashboardUserName = document.getElementById("dashboardUserName");
    if (dashboardUserName) {
      dashboardUserName.textContent = "ADMIN";
    }
  }

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  hamburgerBtn.addEventListener("click", function () {
    console.log("Hamburger menu clicked - implement sidebar toggle here");
  });
});
