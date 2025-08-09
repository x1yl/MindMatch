document.addEventListener("DOMContentLoaded", async function () {
  const onAuthenticated = async () => {
    const welcomeText = document.getElementById("welcomeText");

    if (welcomeText) {
      welcomeText.innerHTML = `Hey, <span id="UserName">[Name]</span>, how are you feeling today?`;
    }
  };

  await checkAuthAndRedirect(onAuthenticated);
});
