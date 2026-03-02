const forgotForm = document.getElementById('forgotForm');

forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;

    try {
        const response = await fetch('http://localhost:3000/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
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