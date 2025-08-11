const updateUI = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();
  const loginBtn = document.getElementById("loginBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");
  const loginLink = document.getElementById("loginLink");
  const userInfo = document.getElementById("userInfo");

  if (isAuthenticated) {
    const user = await auth0Client.getUser();

    loginBtn?.classList.add("hidden");
    loginLink?.classList.add("hidden");
    dashboardBtn?.classList.remove("hidden");
    userInfo?.classList.remove("hidden");

    if (typeof updateAllProfileElements === "function") {
      await updateAllProfileElements();
    }
  } else {
    loginBtn?.classList.remove("hidden");
    loginLink?.classList.remove("hidden");
    dashboardBtn?.classList.add("hidden");
    userInfo?.classList.add("hidden");
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("loginBtn");
  // const logoutBtn = document.getElementById('logoutBtn');
  const loginLink = document.getElementById("loginLink");
  const dashboardBtn = document.getElementById("dashboardBtn");

  loginBtn?.addEventListener("click", async function () {
    const isAuthenticated =
      auth0Client && (await auth0Client.isAuthenticated());
    if (!isAuthenticated) {
      await signUp();
    }
  });

  dashboardBtn?.addEventListener("click", () => {
    window.location.href = "./dashboard.html";
  });

  loginLink?.addEventListener("click", function (e) {
    signIn();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
});
