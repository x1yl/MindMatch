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

  await updateUI();
};

const updateUI = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();
  const loginBtn = document.getElementById("loginBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");
  const loginLink = document.getElementById("loginLink");
  const userInfo = document.getElementById("userInfo");
  const userName = document.getElementById("userName");

  if (isAuthenticated) {
    const user = await auth0Client.getUser();

    loginBtn.classList.add("hidden");
    loginLink.classList.add("hidden");
    dashboardBtn.classList.remove("hidden");
    userInfo.classList.remove("hidden");
    userName.textContent = user.name || user.email;
  } else {
    loginBtn.classList.remove("hidden");
    loginLink.classList.remove("hidden");
    dashboardBtn.classList.add("hidden");
    userInfo.classList.add("hidden");
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

document.addEventListener("DOMContentLoaded", initAuth0);
