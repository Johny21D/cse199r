// Eye toggle
document.querySelector('.eye-icon').addEventListener('click', function() {
    const input = document.getElementById('new-password');
    const icon = this.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// Get token and email from URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const email = params.get('email');

if (!token || !email) {
    alert('Invalid reset link!');
    window.location.href = 'login.html';
}

// Reset form
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;

    try {
        const response = await fetch('http://localhost:3000/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, token, newPassword })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            window.location.href = 'login.html';
        }
    } catch (err) {
        alert('Could not connect to server!');
        console.error(err);
    }
});