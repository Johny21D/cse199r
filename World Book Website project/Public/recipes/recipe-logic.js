// ── FAVORITES HELPERS ──────────────────────────────────────────────
const STORAGE_KEY = 'worldbook_favorites';

const recipeRegistry = {};

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function isFavorite(id) {
  return getFavorites().some(f => f.id === id);
}

function toggleFavorite(id) {
  const favs = getFavorites();
  const recipe = recipeRegistry[id];
  if (!recipe) return false;

  const exists = favs.find(f => f.id === id);
  if (exists) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs.filter(f => f.id !== id)));
    return false;
  } else {
    favs.unshift(recipe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    return true;
  }
}

function makeRecipeId(country, name) {
  return (country + '-' + name).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── HEART CLICK HANDLER ────────────────────────────────────────────
function handleHeartClick(btn) {
  const id = btn.getAttribute('data-id');
  const isNowFaved = toggleFavorite(id);
  btn.textContent = isNowFaved ? '❤️' : '🤍';
  btn.title = isNowFaved ? 'Remove from favorites' : 'Add to favorites';
  btn.classList.toggle('faved', isNowFaved);

  const recipe = recipeRegistry[id];
  showFavToast(isNowFaved
    ? `❤️ "${recipe ? recipe.title : 'Recipe'}" saved to favorites!`
    : `💔 Removed from favorites`
  );
}

// ── TOAST ──────────────────────────────────────────────────────────
function showFavToast(msg) {
  let toast = document.getElementById('fav-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fav-toast';
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%;
      transform:translateX(-50%) translateY(80px);
      background:#1a1208; color:#fff; padding:10px 22px; border-radius:10px;
      font-size:0.9rem; font-weight:500; z-index:99999;
      transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
      pointer-events:none; white-space:nowrap;
      box-shadow:0 4px 16px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
  }, 2500);
}

// ── HEART BUTTON HTML ──────────────────────────────────────────────
function heartBtn(id) {
  const faved = isFavorite(id);
  return `<button
    class="heart-btn ${faved ? 'faved' : ''}"
    data-id="${id}"
    title="${faved ? 'Remove from favorites' : 'Add to favorites'}"
    onclick="handleHeartClick(this)">
    ${faved ? '❤️' : '🤍'}
  </button>`;
}

// ── REGISTER RECIPE IN MEMORY ──────────────────────────────────────
function registerRecipe(country, recipe) {
  const id = makeRecipeId(country, recipe.name);
  recipeRegistry[id] = {
    id,
    title:        recipe.name,
    region:       recipe.region,
    image:        recipe.img,
    emoji:        '🍽️',
    time:         recipe.time || '',
    difficulty:   '',
    servings:     '',
    url:          `recipes.html?country=${encodeURIComponent(country)}`,
    instructions: recipe.instructions || [],
    ingredients:  recipe.ingredients  || []
  };
  return id;
}

// ── SHARED CARD BUILDER ────────────────────────────────────────────
// Builds the full HTML string for one recipe card including
// collapsible Ingredients AND Instructions sections.
function buildCardHTML(recipe, countryKey, showCountryLabel) {
  const id = registerRecipe(countryKey, recipe);

  const ingredientsHTML = (recipe.ingredients || [])
    .map(ing => `<li>${ing}</li>`)
    .join('');

  const instructionsHTML = (recipe.instructions || [])
    .map((step, i) => `
      <li class="instruction-step">
        <span class="step-num">${i + 1}</span>
        <span class="step-text">${step}</span>
      </li>`)
    .join('');

  const countryBadge = showCountryLabel
    ? `<span class="country-badge">📍 ${countryKey}</span>`
    : '';

  return `
    <section class="region-section">
      <div class="card-image-wrap">
        <img src="${recipe.img}" class="recipe-img" alt="${recipe.name}"
             onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect width=%22400%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23aaa%22 font-size=%2216%22%3ENo Image%3C/text%3E%3C/svg%3E'"
        ${heartBtn(id)}
      </div>

      <div class="card-body">
        <h2 class="card-title">${recipe.name}</h2>
        ${countryBadge}
        <div class="card-meta">
          <span class="tag">${recipe.region || ''}</span>
          <span class="time-label">⏱ ${recipe.time || '—'}</span>
        </div>

        <!-- Ingredients (open by default) -->
        <details class="card-section" open>
          <summary class="card-section-toggle">🧂 Ingredients</summary>
          <ul class="ingredients-list">${ingredientsHTML}</ul>
        </details>

        <!-- Instructions (collapsed by default) -->
        <details class="card-section">
          <summary class="card-section-toggle">👨‍🍳 Instructions</summary>
          <ol class="instructions-list">${instructionsHTML}</ol>
        </details>
      </div>
    </section>`;
}

// ── MAIN LOGIC ─────────────────────────────────────────────────────
const displayArea  = document.getElementById('recipe-display-area');
const pageTitle    = document.querySelector('.page-title');
const urlParams    = new URLSearchParams(window.location.search);

const selectedCountry = urlParams.get('country');
const searchQuery     = urlParams.get('search')?.toLowerCase();

if (displayArea) {
  displayArea.innerHTML = '';

  // ── VIEW 1: SEARCH MODE ────────────────────────────────────────
  if (searchQuery) {
    pageTitle.innerText = `Search Results for: "${searchQuery}"`;
    displayArea.classList.add('recipe-view');

    let searchResults = [];
    Object.keys(allRecipes).forEach(countryKey => {
      allRecipes[countryKey].forEach(recipe => {
        const matchesName       = recipe.name.toLowerCase().includes(searchQuery);
        const matchesCountry    = countryKey.toLowerCase().includes(searchQuery);
        const matchesIngredient = recipe.ingredients.some(
          ing => ing.toLowerCase().includes(searchQuery)
        );
        if (matchesName || matchesCountry || matchesIngredient) {
          searchResults.push({ ...recipe, country: countryKey });
        }
      });
    });

    if (searchResults.length > 0) {
      displayArea.innerHTML = searchResults
        .map(recipe => buildCardHTML(recipe, recipe.country, true))
        .join('');
    } else {
      displayArea.innerHTML = `
        <p style="text-align:center; padding:50px; grid-column:1/-1;">
          No recipes found for "<strong>${searchQuery}</strong>".
        </p>`;
    }

    const backBtn = document.createElement('a');
    backBtn.href      = 'recipes.html';
    backBtn.className = 'back-link';
    backBtn.innerText = '← Back to Library';
    displayArea.appendChild(backBtn);

  // ── VIEW 2: SPECIFIC COUNTRY MODE ─────────────────────────────
  } else if (selectedCountry) {
    document.body.classList.add('recipe-active');
    displayArea.classList.add('recipe-view');

    const recipes = allRecipes[selectedCountry];

    if (recipes) {
      pageTitle.innerText = selectedCountry.toUpperCase();
      displayArea.innerHTML = recipes
        .map(recipe => buildCardHTML(recipe, selectedCountry, false))
        .join('');

      const backBtn = document.createElement('a');
      backBtn.href      = '?';
      backBtn.className = 'back-link';
      backBtn.innerText = '← Back to Library';
      displayArea.appendChild(backBtn);
    } else {
      displayArea.innerHTML = `
        <p style="text-align:center; padding:50px;">
          Recipes for <strong>${selectedCountry}</strong> coming soon!
        </p>`;
    }

  // ── VIEW 3: LIBRARY MODE (Default) ────────────────────────────
  } else {
    document.body.classList.remove('recipe-active');
    displayArea.classList.remove('recipe-view');
    pageTitle.innerText = 'World Recipe Library';

    const continents = {};
    countries.forEach(country => {
      if (!continents[country.continent]) continents[country.continent] = [];
      continents[country.continent].push(country);
    });

    Object.keys(continents).forEach(continentName => {
      const section = document.createElement('div');
      section.className = 'continent-section';
      section.innerHTML = `<h3>${continentName}</h3>`;

      const grid = document.createElement('div');
      grid.className = 'country-grid';

      continents[continentName].forEach(country => {
        const card = document.createElement('div');
        card.className = 'country-card';
        card.innerHTML = `
          <a href="?country=${encodeURIComponent(country.name.toLowerCase())}">
            <img src="https://flagcdn.com/w320/${country.code.toLowerCase()}.png"
                 alt="${country.name}">
            <p class="country-label">${country.name}</p>
          </a>`;
        grid.appendChild(card);
      });

      section.appendChild(grid);
      displayArea.appendChild(section);
    });
  }
}

// ── DYNAMIC STYLES ─────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  /* ── Heart button ── */
  .card-image-wrap { position: relative; }
  .heart-btn {
    position: absolute; top: 8px; right: 8px;
    background: white; border: none; border-radius: 50%;
    width: 36px; height: 36px; font-size: 1.1rem;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: transform 0.15s; z-index: 10;
  }
  .heart-btn:hover { transform: scale(1.2); }
  .heart-btn.faved { background: #fff0ed; }

  /* ── Card body ── */
  .card-body { padding: 14px 16px 16px; }
  .card-title {
    font-size: 1.05rem; font-weight: 700;
    margin: 0 0 6px; color: #2c3e50;
  }
  .country-badge {
    display: inline-block; font-size: 0.78rem;
    color: #666; margin-bottom: 6px;
  }
  .card-meta {
    display: flex; align-items: center;
    gap: 10px; margin-bottom: 12px;
  }
  .time-label { font-size: 0.82rem; color: #888; }

  /* ── Collapsible sections ── */
  .card-section {
    border: 1px solid #f0f0f0; border-radius: 8px;
    overflow: hidden; margin-top: 8px;
  }
  .card-section-toggle {
    cursor: pointer; list-style: none;
    padding: 9px 14px; font-size: 0.87rem; font-weight: 600;
    color: #444; background: #fafafa;
    display: flex; align-items: center; gap: 6px;
    user-select: none; transition: background 0.15s;
  }
  .card-section-toggle::-webkit-details-marker { display: none; }
  .card-section-toggle::after {
    content: "▾"; margin-left: auto; font-size: 0.8rem;
    color: #aaa; transition: transform 0.2s;
  }
  details[open] .card-section-toggle::after { transform: rotate(-180deg); }
  .card-section-toggle:hover { background: #f0f0f0; }

  /* ── Ingredients ── */
  .ingredients-list {
    list-style: none; margin: 0; padding: 10px 14px 12px;
    display: flex; flex-direction: column; gap: 5px;
  }
  .ingredients-list li {
    font-size: 0.85rem; color: #555;
    padding-left: 16px; position: relative;
  }
  .ingredients-list li::before {
    content: "•"; position: absolute; left: 0;
    color: #e67e22; font-weight: 700;
  }

  /* ── Instructions ── */
  .instructions-list {
    list-style: none; margin: 0; padding: 10px 14px 14px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .instruction-step {
    display: flex; gap: 10px;
    font-size: 0.85rem; color: #444; line-height: 1.55;
  }
  .step-num {
    min-width: 24px; height: 24px;
    background: #e67e22; color: #fff;
    font-size: 0.75rem; font-weight: 700;
    border-radius: 50%; display: flex;
    align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
  }
  .step-text { flex: 1; }
`;
document.head.appendChild(style);

// ── BURGER MENU ────────────────────────────────────────────────────
const burgerBtn = document.getElementById('burgerBtn');
const navMenu   = document.getElementById('navMenu');

if (burgerBtn) {
  burgerBtn.addEventListener('click', () => {
    burgerBtn.classList.toggle('open');
    navMenu.classList.toggle('open');
  });
  navMenu.querySelectorAll('a, button').forEach(item => {
    item.addEventListener('click', () => {
      burgerBtn.classList.remove('open');
      navMenu.classList.remove('open');
    });
  });
}

// ── LOGOUT ─────────────────────────────────────────────────────────
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login-page/login.html';
  });
}