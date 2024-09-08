const divMovable = document.getElementById('movable');
let isDragging = false;
let offsetX = 0;
let offsetY = 0;
let lastX = 0;
let lastY = 0;
let scriptDisabled = false;

divMovable.addEventListener('mousedown', (event) => {
    if (!scriptDisabled) {
        isDragging = true;
        offsetX = event.clientX - divMovable.offsetLeft;
        offsetY = event.clientY - divMovable.offsetTop;
        lastX = event.clientX;
        lastY = event.clientY;
    }
});

document.addEventListener('mousemove', (event) => {
    if (isDragging && !scriptDisabled) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let newLeft = event.clientX - offsetX;
        let newTop = event.clientY - offsetY;

        newLeft = Math.max(0, Math.min(windowWidth - divMovable.offsetWidth, newLeft));
        newTop = Math.max(0, Math.min(windowHeight - divMovable.offsetHeight, newTop));

        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const maxStretch = 12800;
        const stretchFactor = Math.min(maxStretch, speed);
        divMovable.style.transform = `scaleX(${1 + stretchFactor / 100})`;

        divMovable.style.left = `${newLeft}px`;
        divMovable.style.top = `${newTop}px`;

        lastX = event.clientX;
        lastY = event.clientY;

        checkCollision(true);
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging && !scriptDisabled) {
        isDragging = false;
        divMovable.style.transform = 'scaleX(1)';
        checkCollision(false);
    }
});

function checkCollision(isDragging) {
    if (scriptDisabled) return;

    const divMovableRect = divMovable.getBoundingClientRect();
    const divStationaryRect = divStationary.getBoundingClientRect();

    const isOverlapping = !(divMovableRect.right < divStationaryRect.left ||
                            divMovableRect.left > divStationaryRect.right ||
                            divMovableRect.bottom < divStationaryRect.top ||
                            divMovableRect.top > divStationaryRect.bottom);

    }
