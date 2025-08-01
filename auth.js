let auth0Client = null;

const configureAuth0 = async () => {
  auth0Client = await auth0.createAuth0Client({
    domain: "dev-2tt6eod8bvyz70gx.us.auth0.com",
    clientId: "xJBxZ5BQNfB0j6FrNY8KrQm3z72aSDvh",
    authorizationParams: {
      audience: "https://ericafk0001.github.io/MindMatch/",
      scope: "openid profile email read:moods create:moods delete:moods",
    },
  });
};

const initAuth0 = async () => {
  await configureAuth0();

  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
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
  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.href,
      screen_hint: "signup",
    },
  });
};

const signIn = async () => {
  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.href,
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
        authorizationParams: {
          audience: "https://ericafk0001.github.io/MindMatch/",
          scope: "openid profile email read:moods create:moods delete:moods",
        },
      });
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      if (
        error.error === "consent_required" ||
        error.error === "login_required"
      ) {
        await auth0Client.loginWithRedirect({
          authorizationParams: {
            audience: "https://ericafk0001.github.io/MindMatch/",
            scope: "openid profile email read:moods create:moods delete:moods",
          },
        });
      }
      throw error;
    }
  }
  return null;
};

document.addEventListener("DOMContentLoaded", initAuth0);
