// ── FAVORITES MANAGER ──────────────────────────────────────────────
const STORAGE_KEY = 'worldbook_favorites';

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveFavorites(favs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

function removeFavorite(id) {
  const favs = getFavorites().filter(f => f.id !== id);
  saveFavorites(favs);
}

function isFavorite(id) {
  return getFavorites().some(f => f.id === id);
}

// ── TOAST ──────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── MODAL ──────────────────────────────────────────────────────────
function openRecipeModal(r) {
  // Remove existing modal if any
  const existing = document.getElementById('recipe-modal');
  if (existing) existing.remove();

  const ingredientsList = Array.isArray(r.ingredients) && r.ingredients.length
    ? r.ingredients.map(i => `<li>${i}</li>`).join('')
    : '<li>No ingredients listed</li>';

  const instructionsList = Array.isArray(r.instructions) && r.instructions.length
    ? r.instructions.map((step, i) => `<li><strong>Step ${i + 1}:</strong> ${step}</li>`).join('')
    : '<li>No instructions listed</li>';

  const modal = document.createElement('div');
  modal.id = 'recipe-modal';
  modal.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.75);
    z-index:99999; display:flex; align-items:center; justify-content:center;
    padding:20px; backdrop-filter:blur(4px);
  `;

  modal.innerHTML = `
    <div style="
      background:#fff; border-radius:20px; max-width:580px; width:100%;
      max-height:85vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.3);
      animation: fadeUp 0.3s ease;
    ">
      ${r.image ? `<img src="${r.image}" alt="${r.title}" style="width:100%;height:220px;object-fit:cover;border-radius:20px 20px 0 0;">` : ''}
      <div style="padding:24px;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
          <div>
            <p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#f5a623;margin:0 0 4px;">${r.region || 'World Recipe'}</p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;margin:0;color:#1a1208;">${r.title}</h2>
          </div>
          <button onclick="closeRecipeModal()" style="
            background:#f5f5f5;border:none;border-radius:50%;width:36px;height:36px;
            font-size:1.2rem;cursor:pointer;flex-shrink:0;margin-left:12px;
          ">✕</button>
        </div>

        ${r.time ? `<p style="font-size:0.85rem;color:#8a7f72;margin:0 0 16px;">⏱ ${r.time}</p>` : ''}

        <h3 style="font-size:1rem;font-weight:700;color:#1a1208;margin:0 0 8px;">🛒 Ingredients</h3>
        <ul style="font-size:0.9rem;color:#444;padding-left:20px;margin:0 0 20px;line-height:1.8;">
          ${ingredientsList}
        </ul>

        <h3 style="font-size:1rem;font-weight:700;color:#1a1208;margin:0 0 8px;">👨‍🍳 Instructions</h3>
        <ol style="font-size:0.9rem;color:#444;padding-left:20px;margin:0 0 20px;line-height:1.8;">
          ${instructionsList}
        </ol>

        <div style="display:flex;gap:10px;margin-top:8px;">
          <button onclick="closeRecipeModal()" style="
            flex:1;background:#1a1208;color:white;border:none;border-radius:10px;
            padding:12px;font-size:0.9rem;font-weight:600;cursor:pointer;
          ">Close</button>
          <button onclick="handleRemove('${r.id}'); closeRecipeModal();" style="
            background:#fff0ed;color:#e8470a;border:none;border-radius:10px;
            padding:12px 16px;font-size:0.9rem;cursor:pointer;font-weight:600;
          ">🗑 Remove</button>
        </div>
      </div>
    </div>
  `;

  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeRecipeModal();
  });

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
  const modal = document.getElementById('recipe-modal');
  if (modal) modal.remove();
  document.body.style.overflow = '';
}

// Safe modal opener using data-id instead of inline JSON
const modalDataStore = {};

function openRecipeModalById(btn) {
  const id = btn.getAttribute('data-id');
  const r = modalDataStore[id];
  if (r) openRecipeModal(r);
}

// ── RENDER ─────────────────────────────────────────────────────────
function renderFavorites(filter = '') {
  const grid = document.getElementById('favGrid');
  const empty = document.getElementById('favEmpty');
  const countEl = document.getElementById('favCount');
  let favs = getFavorites();

  if (filter) {
    favs = favs.filter(f =>
      f.title.toLowerCase().includes(filter.toLowerCase()) ||
      (f.region || '').toLowerCase().includes(filter.toLowerCase())
    );
  }

  countEl.textContent = `${getFavorites().length} recipe${getFavorites().length !== 1 ? 's' : ''} saved`;

  if (favs.length === 0) {
    grid.innerHTML = '';
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

      // Store each recipe safely by id
    favs.forEach(r => { modalDataStore[r.id] = r; });

  grid.style.display = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = favs.map((r, i) => `
    <div class="fav-card" style="animation-delay:${i * 0.07}s" data-id="${r.id}">
      <div class="heart-badge">❤️</div>
      ${r.image
        ? `<img class="fav-card-img" src="${r.image}" alt="${r.title}" onerror="this.style.display='none'">`
        : `<div class="fav-card-img-placeholder">${r.emoji || '🍽️'}</div>`
      }
      <div class="fav-card-body">
        <div class="fav-card-region">${r.region || 'World Recipe'}</div>
        <h3 class="fav-card-title">${r.title}</h3>
        <div class="fav-card-meta">
          ${r.time ? `<span>⏱ ${r.time}</span>` : ''}
          ${r.difficulty ? `<span>👨‍🍳 ${r.difficulty}</span>` : ''}
          ${r.servings ? `<span>🍽 ${r.servings}</span>` : ''}
        </div>
        <div class="fav-card-actions">
          <button class="btn-view" data-id="${r.id}" onclick="openRecipeModalById(this)">View Recipe</button>
          <button class="btn-remove" onclick="handleRemove('${r.id}')" title="Remove from favorites">🗑</button>
        </div>
      </div>
    </div>
  `).join('');
}

function handleRemove(id) {
  const favs = getFavorites();
  const recipe = favs.find(f => f.id === id);
  removeFavorite(id);
  if (recipe) showToast(`💔 "${recipe.title}" removed`);
  renderFavorites(document.getElementById('favSearch').value);
}

// ── SEARCH ─────────────────────────────────────────────────────────
document.getElementById('favSearch').addEventListener('input', (e) => {
  renderFavorites(e.target.value);
});

// ── CLEAR ALL ──────────────────────────────────────────────────────
document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (getFavorites().length === 0) return showToast('Nothing to clear!');
  if (confirm('Remove all favorites?')) {
    saveFavorites([]);
    showToast('🗑 All favorites cleared');
    renderFavorites();
  }
});

// ── BURGER MENU ────────────────────────────────────────────────────
const burgerBtn = document.getElementById('burgerBtn');
const navMenu = document.getElementById('navMenu');
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

// ── PROTECT PAGE ───────────────────────────────────────────────────
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login-page/login.html';
}

// ── INIT ───────────────────────────────────────────────────────────
renderFavorites();