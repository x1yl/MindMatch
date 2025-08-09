let auth0Client = null;

const configureAuth0 = async () => {
  const baseUrl =
    window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, "/");

  auth0Client = await auth0.createAuth0Client({
    domain: "dev-2tt6eod8bvyz70gx.us.auth0.com",
    clientId: "xJBxZ5BQNfB0j6FrNY8KrQm3z72aSDvh",
    authorizationParams: {
      audience: "https://ericafk0001.github.io/MindMatch/",
      scope: "openid profile email read:moods create:moods delete:moods",
      redirect_uri: baseUrl,
    },
    cacheLocation: "localstorage",
    useRefreshTokens: true,
  });
};

const initAuth0 = async () => {
  await configureAuth0();

  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    try {
      await auth0Client.handleRedirectCallback();
      const targetPage =
        localStorage.getItem("authTargetPage") || window.location.pathname;
      localStorage.removeItem("authTargetPage");
      window.history.replaceState({}, document.title, targetPage);
    } catch (error) {
      console.error("Auth callback error:", error);
      window.history.replaceState({}, document.title, "/");
    }
  }

  if (typeof updateUI === 'function') {
    await updateUI();
  }
};

const signUp = async () => {
  localStorage.setItem("authTargetPage", window.location.pathname);

  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri:
        window.location.origin +
        window.location.pathname.replace(/\/[^\/]*$/, "/"),
      screen_hint: "signup",
    },
  });
};

const signIn = async () => {
  localStorage.setItem("authTargetPage", window.location.pathname);

  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri:
        window.location.origin +
        window.location.pathname.replace(/\/[^\/]*$/, "/"),
      screen_hint: "signin",
    },
  });
};

const logout = async () => {
  await auth0Client.logout();
};

const getUser = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();
  if (isAuthenticated) {
    return await auth0Client.getUser();
  }
  return null;
};

const getFreshUser = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();
  if (isAuthenticated) {
    try {
      await auth0Client.getTokenSilently({
        ignoreCache: true,
        timeoutInSeconds: 30
      });
      return await auth0Client.getUser();
    } catch (error) {
      console.error("Error getting fresh user data:", error);
      return await auth0Client.getUser();
    }
  }
  return null;
};

const getToken = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();
  if (isAuthenticated) {
    try {
      const token = await auth0Client.getTokenSilently({
        timeoutInSeconds: 30,
        ignoreCache: false,
      });
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      if (
        error.error === "consent_required" ||
        error.error === "login_required" ||
        error.error === "interaction_required"
      ) {
        localStorage.setItem("authTargetPage", window.location.pathname);
        await auth0Client.loginWithRedirect();
      }
      throw error;
    }
  }
  return null;
};

const isUserAuthenticated = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const isAuthenticated = await auth0Client.isAuthenticated();
      if (isAuthenticated) {
        return true;
      }
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Auth check attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        return false;
      }
    }
  }
  return false;
};

const checkAuthAndRedirect = async (onAuthenticatedCallback, redirectPath = "/", maxRetries = 10) => {
  const attemptAuth = async (retryCount = 0) => {
    try {
      if (typeof auth0Client !== "undefined" && auth0Client) {
        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated) {
          if (typeof onAuthenticatedCallback === 'function') {
            await onAuthenticatedCallback();
          }
          initLogoutHandler();
          initSidebarHandler();
        } else {
          window.location.href = redirectPath;
        }
      } else {
        if (retryCount < maxRetries) {
          setTimeout(() => attemptAuth(retryCount + 1), 500);
        } else {
          console.error("Auth0 client failed to initialize after maximum retries");
          window.location.href = redirectPath;
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      if (retryCount < maxRetries) {
        setTimeout(() => attemptAuth(retryCount + 1), 1000);
      } else {
        window.location.href = redirectPath;
      }
    }
  };

  return attemptAuth();
};

const initLogoutHandler = () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (typeof logout === "function") {
        logout();
      }
    });
  }
};

const initSidebarHandler = () => {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const closeSidebar = document.getElementById("closeSidebar");

  if (!hamburgerBtn || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay?.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeSidebarMenu() {
    sidebar.classList.remove("open");
    sidebarOverlay?.classList.remove("open");
    document.body.style.overflow = "";
  }

  hamburgerBtn.addEventListener("click", function () {
    if (sidebar.classList.contains("open")) {
      closeSidebarMenu();
    } else {
      openSidebar();
    }
  });

  closeSidebar?.addEventListener("click", closeSidebarMenu);
  sidebarOverlay?.addEventListener("click", closeSidebarMenu);

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
};

document.addEventListener("DOMContentLoaded", initAuth0);
