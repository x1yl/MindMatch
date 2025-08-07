document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
);

document.addEventListener("DOMContentLoaded", async function () {

  if (auth0Client) {
    const isAuthenticated = await auth0Client.isAuthenticated();
    if (isAuthenticated) {
      const user = await auth0Client.getUser();
      const dashboardUserName = document.getElementById("dashboardUserName");
      const welcomeText = document.getElementById("welcomeText");
      const panelUserName = document.getElementById("panelUserName");
      const dashboardUserEmail = document.getElementById("dashboardUserEmail");
      if (dashboardUserName) {
        dashboardUserName.textContent = user.name || user.email || "User";
      }
      if (welcomeText) {
        welcomeText.textContent = `Welcome, ${user.name || user.email || "User"}, how are you feeling today?`;
      }
      if (panelUserName) {
        panelUserName.textContent = user.name || user.email || "User";
      }
      if (dashboardUserEmail) {
        dashboardUserEmail.textContent = user.email || "";
      }
    } else {
      window.location.href = "/";
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
