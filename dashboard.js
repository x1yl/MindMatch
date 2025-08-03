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
      window.location.href = "/";
    }
  } else if (isDevelopment) {
    const dashboardUserName = document.getElementById("dashboardUserName");
    if (dashboardUserName) {
      dashboardUserName.textContent = "ADMIN";
    }
  }

  initializeSidebar();

  setActiveNavigation();
});

function initializeSidebar() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const closeSidebar = document.getElementById("closeSidebar");

  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeSidebarMenu() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  hamburgerBtn.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) {
      closeSidebarMenu();
    } else {
      openSidebar();
    }
  });

  closeSidebar.addEventListener("click", closeSidebarMenu);
  sidebarOverlay.addEventListener("click", closeSidebarMenu);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeSidebarMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024 && sidebar.classList.contains("open")) {
      closeSidebarMenu();
    }
  });
}

function setActiveNavigation() {
  const currentPage =
    window.location.pathname.split("/").pop() || "dashboard.html";
  const navItems = document.querySelectorAll(".sidebar-nav-item");

  navItems.forEach((item) => {
    const href = item.getAttribute("href");
    if (href) {
      const linkPage = href.split("/").pop();
      if (
        linkPage === currentPage ||
        (currentPage === "dashboard.html" && linkPage === "./dashboard.html") ||
        (currentPage === "" && linkPage === "./dashboard.html")
      ) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    }
  });
}
