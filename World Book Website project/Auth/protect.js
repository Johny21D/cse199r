const authBtn = document.getElementById("authBtn");

const token = localStorage.getItem("token");

if (token) {
  // USER IS LOGGED IN
  try {
    const response = await fetch("http://localhost:3000/profile", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
      authBtn.textContent = `Logout (${data.user.name})`;
    } else {
      authBtn.textContent = "Logout";
    }

    authBtn.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.reload();
    };

  } catch (err) {
    console.error("Error fetching profile:", err);
    authBtn.textContent = "Logout";
  }

} else {
  // USER IS LOGGED OUT
  authBtn.textContent = "Login";
  authBtn.href = "./login page/login.html";
}