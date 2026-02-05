const container = document.getElementById('flag-container');

// Only run this if we are on the library page (where the container exists)
if (container) {
    countries.forEach(country => {
        const card = document.createElement('a');
        card.className = 'country-card';
        card.href = `recipe-detail.html?country=${country.name.toLowerCase()}`;
        card.innerHTML = `
            <img src="https://flagcdn.com/w320/${country.code}.png" alt="${country.name}">
            <h3>${country.name}</h3>
        `;
        container.appendChild(card);
    });
}