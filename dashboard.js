document.addEventListener("DOMContentLoaded", async function () {
  const onAuthenticated = async () => {
    const user = await auth0Client.getUser();
    const welcomeText = document.getElementById("welcomeText");
    
    if (welcomeText) {
      welcomeText.textContent = `Welcome, ${
        user.name || user.email || "User"
      }, how are you feeling today?`;
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
