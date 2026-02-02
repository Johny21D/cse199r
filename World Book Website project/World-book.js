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

    // --- EFFECT 2: CLICK (Navigate OR Modal) ---
    area.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const targetUrl = area.getAttribute('data-url');

        if (targetUrl) {
            // If the area has a URL (The Burger), go to that page
            window.location.href = targetUrl; 
        } else {
            // Otherwise, show the big pop-out modal
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