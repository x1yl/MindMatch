document.addEventListener("DOMContentLoaded", async function () {
  const onAuthenticated = async () => {
    const user = await auth0Client.getUser();
    const dashboardUserName = document.getElementById("dashboardUserName");
    const welcomeText = document.getElementById("welcomeText");
    const panelUserName = document.getElementById("panelUserName");
    const dashboardUserEmail = document.getElementById("dashboardUserEmail");
    
    if (dashboardUserName) {
      dashboardUserName.textContent = user.name || user.email || "User";
    }
    if (welcomeText) {
      welcomeText.textContent = `Welcome, ${
        user.name || user.email || "User"
      }, how are you feeling today?`;
    }
    if (panelUserName) {
      panelUserName.textContent = user.name || user.email || "User";
    }
    if (dashboardUserEmail) {
      dashboardUserEmail.textContent = user.email || "";
    }
    
    setActiveNavigation();
  };

  await checkAuthAndRedirect(onAuthenticated);
});

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
