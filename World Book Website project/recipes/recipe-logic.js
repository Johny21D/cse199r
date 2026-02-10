const displayArea = document.getElementById('recipe-display-area');
const pageTitle = document.querySelector('.page-title');
const urlParams = new URLSearchParams(window.location.search);
const selectedCountry = urlParams.get('country');

if (displayArea) {
    displayArea.innerHTML = "";

    if (!selectedCountry) {
        // --- VIEW A: LIBRARY MODE (Grouped by Continent) ---
        document.body.classList.remove('recipe-active');
        displayArea.classList.remove('recipe-view');
        pageTitle.innerText = "World Recipe Library";

        // 1. Group countries by continent
        const continents = {};
        countries.forEach(country => {
            if (!continents[country.continent]) {
                continents[country.continent] = [];
            }
            continents[country.continent].push(country);
        });

        // 2. Loop through each continent and create a section
        Object.keys(continents).forEach(continentName => {
            const section = document.createElement('div');
            section.className = 'continent-section';
            section.innerHTML = `<h3>${continentName}</h3>`;
            
            const grid = document.createElement('div');
            grid.className = 'country-grid'; // Use a grid for the flags

            continents[continentName].forEach(country => {
                const card = document.createElement('div');
                card.className = 'country-card';
                card.innerHTML = `
                    <a href="?country=${encodeURIComponent(country.name.toLowerCase())}">
                        <img src="https://flagcdn.com/w320/${country.code.toLowerCase()}.png" alt="${country.name}">
                        <p class="country-label">${country.name}</p>
                    </a>
                `;
                grid.appendChild(card);
            });

            section.appendChild(grid);
            displayArea.appendChild(section);
        });

    } else {
        // --- VIEW B: RECIPE MODE ---
        document.body.classList.add('recipe-active');
        displayArea.classList.add('recipe-view');
        const recipes = allRecipes[selectedCountry];

        if (recipes) {
            pageTitle.innerText = selectedCountry.toUpperCase();
            displayArea.innerHTML = recipes.map(recipe => `
                <section class="region-section">
                    <img src="${recipe.img}" class="recipe-img" alt="${recipe.name}">
                    <h2 style="font-size: 1.1rem; margin: 10px 0;">${recipe.name}</h2>
                    <span class="tag">${recipe.region}</span>
                    <ul style="font-size: 0.85rem; padding-left: 20px;">
                        ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </section>
            `).join('');

            const backBtn = document.createElement('a');
            backBtn.href = "?";
            backBtn.className = "back-link";
            backBtn.innerText = "← Back to Library";
            displayArea.appendChild(backBtn);
        } else {
            // ... (Your existing "Coming Soon" logic)
        }
    }
}