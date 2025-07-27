let auth0Client = null;

const configureAuth0 = async () => {
  auth0Client = await auth0.createAuth0Client({
    domain: 'dev-2tt6eod8bvyz70gx.us.auth0.com',
    clientId: 'xJBxZ5BQNfB0j6FrNY8KrQm3z72aSDvh',
  });
};

const initAuth0 = async () => {
  await configureAuth0();
  
  // Check if user is returning from Auth0
  const query = window.location.search;
  if (query.includes('code=') && query.includes('state=')) {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, '/');
  }
  
  await updateUI();
};

const updateUI = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginLink = document.getElementById('loginLink');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');

  if (isAuthenticated) {
    const user = await auth0Client.getUser();
    
    loginBtn.classList.add('hidden');
    loginLink.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    userName.textContent = user.name || user.email;
    
  } else {
    loginBtn.classList.remove('hidden');
    loginLink.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    userInfo.classList.add('hidden');
    
  }
};

const login = async () => {
  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.origin + "/MindMatch"
    }
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
    return await auth0Client.getTokenSilently();
  }
  return null;
};

document.addEventListener('DOMContentLoaded', initAuth0);
