const container = document.getElementById('flag-container');

countries.forEach(country => {
    // 1. Create the link
    const link = document.createElement('a');
    link.className = 'country-card';
    
    // 2. THIS IS THE MAGIC: It creates the custom link for each flag
    link.href = `recipe-detail.html?country=${country.name.toLowerCase()}`;

    // 3. Add the flag image and the text
    link.innerHTML = `
        <img src="https://flagcdn.com/w320/${country.code}.png" alt="${country.name} Flag">
        <h3>${country.name}</h3>
    `;

    // 4. Put it on the screen
    container.appendChild(link);
});