const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      alert("Login Successful!");
      window.location.href = "../World-Book.html";
    } else {
      alert(data.message || "Login failed!");
    }

  } catch (err) {
    alert("Could not connect to server. Make sure it is running!");
    console.error(err);
  }
});