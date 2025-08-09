document.addEventListener("DOMContentLoaded", async function () {
  const onAuthenticated = async () => {
    const user = await auth0Client.getUser();
    const welcomeText = document.getElementById("welcomeText");

    if (welcomeText) {
      welcomeText.textContent = `Welcome, ${
        user.name || user.email || "User"
      }, how are you feeling today?`;
    }
  };

  await checkAuthAndRedirect(onAuthenticated);
});
