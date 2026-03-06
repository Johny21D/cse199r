const foodAreas = document.querySelectorAll('area');

// Small Hover Popup Elements
const popup = document.getElementById('food-popup');
const popupImg = document.getElementById('popup-img');
const popupText = document.getElementById('popup-text');

// Big Click Modal Elements
const modal = document.getElementById('food-modal');
const modalImg = document.getElementById('modal-img');
const modalCaption = document.getElementById('modal-caption');
const closeBtn = document.querySelector('.close-btn');

foodAreas.forEach(area => {
    area.addEventListener('mouseover', () => {
        popupImg.src = area.getAttribute('data-img');
        popupText.innerText = area.getAttribute('data-info');
        popup.style.display = 'block';
    });

    area.addEventListener('mousemove', (e) => {
        popup.style.left = (e.clientX + 20) + 'px';
        popup.style.top = (e.clientY + 20) + 'px';
    });

    area.addEventListener('mouseout', () => {
        popup.style.display = 'none';
    });

    area.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        let targetUrl = area.getAttribute('data-url');

        if (targetUrl) {
            if (!targetUrl.startsWith('continents/')) {
                targetUrl = `continents/${targetUrl}`;
            }
            window.location.href = targetUrl; 
        } else {
            popup.style.display = 'none'; 
            modal.style.display = "block";
            modalImg.src = area.getAttribute('data-img');
            modalCaption.innerText = area.getAttribute('data-info');
        }
    });
});

// --- CLOSE MODAL LOGIC ---
if(closeBtn) {
    closeBtn.onclick = () => {
        modal.style.display = "none";
    };
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// 🔒 Protect this page
const token = localStorage.getItem("token");
if (!token) {
    // Ensuring the path matches your folder structure: "login page/login.html"
    window.location.href = "/login-page/login.html"; 
}

// 🚪 Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/login-page/login.html"; 
    });
}

// 🔍 Search Bar Logic
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('recipeSearch');
    const searchBtn = document.getElementById('searchBtn');

    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === "") {
            alert("Please enter a food name!");
            return;
        }

        // Redirects to recipes.html with the search query in the URL
        window.location.href = `recipes/recipes.html?search=${encodeURIComponent(query)}`;
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
});

// 🍔 Burger Menu
const burgerBtn = document.getElementById('burgerBtn');
const navMenu = document.getElementById('navMenu');

if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', () => {
            burgerBtn.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });
}