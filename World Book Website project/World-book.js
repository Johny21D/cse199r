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
    // --- EFFECT 1: HOVER (Small Preview) ---
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

    // --- EFFECT 2: CLICK (Big Pop Out) ---
    area.addEventListener('click', (e) => {
        e.preventDefault(); // Prevents the page from jumping up
        modal.style.display = "block";
        modalImg.src = area.getAttribute('data-img');
        modalCaption.innerText = area.getAttribute('data-info');
    });
});

// --- CLOSE MODAL LOGIC ---
// Close when clicking the (X)
if(closeBtn) {
    closeBtn.onclick = () => {
        modal.style.display = "none";
    };
}

// Close when clicking anywhere on the dark background
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// --- EFFECT 2: CLICK (Big Pop Out) ---
    area.addEventListener('click', (e) => {
        e.preventDefault(); 
        popup.style.display = 'none'; // ADD THIS: Hides the small preview immediately
        modal.style.display = "block";
        modalImg.src = area.getAttribute('data-img');
        modalCaption.innerText = area.getAttribute('data-info');
    });
