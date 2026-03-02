// 👁️ Eye toggle
document.querySelector('.eye-icon').addEventListener('click', function() {
    const input = document.getElementById('login-password');
    const icon = this.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// 🔐 Login form
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
      window.location.href = "/"; // ✅ FIXED
    } else {
      alert(data.message || "Login failed!");
    }

  } catch (err) {
    alert("Could not connect to server. Make sure it is running!");
    console.error(err);
  }
});