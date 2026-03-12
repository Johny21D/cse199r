// Eye toggle
document.querySelector('.eye-icon').addEventListener('click', function() {
    const input = document.getElementById('signup-password');
    const icon = this.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// Signup form
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("signup-email").value;
    const phone = document.getElementById("signup-phone").value;
    const password = document.getElementById("signup-password").value;

    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Account created successfully!");
            window.location.href = "/login-page/login.html";
        } else {
            alert(data.message || "Signup failed!");
        }
    } catch (err) {
        alert("Could not connect to server!");
        console.error(err);
    }
});