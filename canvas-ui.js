// ===== PARTIE 2: GESTION UI ET PASTILLES =====

// Variables globales (à initialiser dans le DOMContentLoaded)
let timeline, timelineContainer, previewObject, previewInner;
let activePastille = null;
let totalTimelineDuration = 0;
let allGroups = [];
let nextGroupNumber = 1;
let curveArea, canvas, ctx, curvePoints;

// GESTION DES COURBES DE BÉZIER
const updateCanvasSize = () => {
    if (!canvas || !curveArea) return;
    canvas.width = curveArea.clientWidth;
    canvas.height = curveArea.clientHeight;
    drawBezierCurve();
};

const drawBezierCurve = () => {
    if (!ctx || !canvas || !curvePoints) return;
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;

    ctx.clearRect(0, 0, w, h);

    const getPointCoords = (index) => {
        const style = curvePoints[index].style;
        const x = parseFloat(style.left) * w / 100;
        const y = h - (parseFloat(style.top) * h / 100);
        return { x, y };
    };

    const p0 = getPointCoords(0);
    const p1 = getPointCoords(1);
    const p2 = getPointCoords(2);
    const p3 = getPointCoords(3);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = 'var(--secondary-glow)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.stroke();
};

const setupCurvePointDrag = () => {
    let draggingCurvePoint = null;

    const startDragCurve = (e) => {
        e.preventDefault();
        draggingCurvePoint = e.target;
        const rect = curveArea.getBoundingClientRect();

        const moveHandler = (moveEvent) => {
            if (!draggingCurvePoint) return;
            const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

            let x = clientX - rect.left;
            let y = clientY - rect.top;
            let newLeft = (x / rect.width) * 100;
            let newTop = (y / rect.height) * 100;

            const index = parseInt(draggingCurvePoint.dataset.index);
            newLeft = Math.max(0, Math.min(100, newLeft));
            newTop = Math.max(0, Math.min(100, newTop));

            if (index === 1 || index === 2) {
                draggingCurvePoint.style.left = `${newLeft}%`;
                draggingCurvePoint.style.top = `${newTop}%`;
            } else if (index === 0) {
                draggingCurvePoint.style.left = `0%`;
                draggingCurvePoint.style.top = `${newTop}%`;
            } else if (index === 3) {
                draggingCurvePoint.style.left = `100%`;
                draggingCurvePoint.style.top = `${newTop}%`;
            }
            drawBezierCurve();
        };

        const stopHandler = () => {
            if (activePastille && draggingCurvePoint) {
                const pointIndex = draggingCurvePoint.dataset.index;
                activePastille.dataset[`curveP${pointIndex}Left`] = draggingCurvePoint.style.left;
                activePastille.dataset[`curveP${pointIndex}Top`] = draggingCurvePoint.style.top;
            }
            draggingCurvePoint = null;
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', stopHandler);
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', stopHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', stopHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('touchend', stopHandler);
    };

    curvePoints.forEach(p => {
        p.addEventListener('mousedown', startDragCurve);
        p.addEventListener('touchstart', startDragCurve);
    });
};

// GESTION DES GROUPES
const updateGroupList = () => {
    const groupListContainer = document.getElementById('group-list-container');
    if (!groupListContainer) return;

    groupListContainer.innerHTML = '<span style="opacity: 0.6; margin-right: 10px;">Groupes:</span>';
    allGroups.forEach(group => {
        const item = document.createElement('div');
        item.className = 'group-item';
        item.innerHTML = `
            <span class="group-color-dot" style="background-color: ${group.color};"></span>
            <span>Groupe ${group.number}</span>
            <button class="delete-group-btn" data-group-id="${group.id}">X</button>
        `;
        groupListContainer.appendChild(item);
    });

    document.querySelectorAll('.delete-group-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groupId = e.target.dataset.groupId;
            const group = allGroups.find(g => g.id === groupId);
            if (group && confirm(`Supprimer le Groupe ${group.number} et toutes ses pastilles ?`)) {
                deleteGroup(groupId);
            }
        });
    });
};

const deleteGroup = (groupId) => {
    document.querySelectorAll(`.pastille[data-group-id="${groupId}"]`).forEach(p => p.remove());
    allGroups = allGroups.filter(g => g.id !== groupId);
    updateGroupList();
    updateAndDrawMarkers();
};

// GESTION DES PASTILLES
const updatePastilleStyle = (pastille) => {
    const axis = pastille.dataset.axis || 'Axe X';
    const color = getAxisColor(axis);
    const barColor = getBarColor(axis);
    const durationBar = pastille.querySelector('.duration-bar');

    pastille.style.backgroundColor = color;
    pastille.style.boxShadow = `0 0 8px ${color}, 0 0 15px ${color}`;

    if (durationBar) {
        durationBar.style.backgroundColor = barColor;
        durationBar.style.boxShadow = `0 0 4px ${color}`;
    }

    let label = pastille.querySelector('.group-label');
    if (pastille.dataset.groupId) {
        const group = allGroups.find(g => g.id === pastille.dataset.groupId);
        pastille.classList.add('grouped');
        if (group) {
            pastille.style.border = `2px solid ${group.color}`;
        }
        if (!label) {
            label = document.createElement('span');
            label.className = 'group-label';
            pastille.appendChild(label);
        }
        label.textContent = `G${pastille.dataset.groupNumber}`;
    } else {
        pastille.classList.remove('grouped');
        pastille.style.border = '';
        if (label) label.remove();
    }
};

const createPastille = (x, y, data = {}, groupId = null, groupNumber = null) => {
    const pastille = document.createElement('div');
    pastille.className = 'pastille';
    pastille.id = data.id || `pastille-${Date.now()}-${Math.random()}`;
    pastille.draggable = true;

    const minX = 30;
    const finalX = Math.max(minX, x);

    pastille.style.left = data.left || `${finalX}px`;
    pastille.style.top = data.top || `${y}px`;

    pastille.dataset.startTimeMs = data.startTimeMs || '0';
    pastille.dataset.endTimeMs = data.endTimeMs || '0';
    pastille.dataset.startValue = data.startValue || '0';
    pastille.dataset.endValue = data.endValue || '100';
    pastille.dataset.axis = data.axis || 'rotation X';
    pastille.dataset.referential = data.referential || 'local';

    pastille.dataset.curveP0Left = data.curveP0Left || '0%';
    pastille.dataset.curveP0Top = data.curveP0Top || '100%';
    pastille.dataset.curveP1Left = data.curveP1Left || '33%';
    pastille.dataset.curveP1Top = data.curveP1Top || '50%';
    pastille.dataset.curveP2Left = data.curveP2Left || '66%';
    pastille.dataset.curveP2Top = data.curveP2Top || '50%';
    pastille.dataset.curveP3Left = data.curveP3Left || '100%';
    pastille.dataset.curveP3Top = data.curveP3Top || '0%';

    pastille.dataset.pivotAx = data.pivotAx || "-50";
    pastille.dataset.pivotAy = data.pivotAy || "-50";
    pastille.dataset.pivotAz = data.pivotAz || "0";
    pastille.dataset.pivotBx = data.pivotBx || "50";
    pastille.dataset.pivotBy = data.pivotBy || "50";
    pastille.dataset.pivotBz = data.pivotBz || "0";

    if (groupId !== null) {
        pastille.dataset.groupId = groupId;
        pastille.dataset.groupNumber = groupNumber;
    }

    const durationBar = document.createElement('div');
    durationBar.className = 'duration-bar';
    pastille.appendChild(durationBar);
    timeline.appendChild(pastille);

    updatePastilleStyle(pastille);

    pastille.addEventListener('click', () => showTimeEditor(pastille));

    pastille.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.dataTransfer.effectAllowed = 'move';
    });

    pastille.addEventListener('dragend', () => {
        updateAndDrawMarkers();
    });

    // Support tactile
    let touchStartX, touchStartY, pastilleStartLeft, pastilleStartTop;

    pastille.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            pastilleStartLeft = parseFloat(pastille.style.left);
            pastilleStartTop = parseFloat(pastille.style.top);
        }
    });

    pastille.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            pastille.style.left = `${pastilleStartLeft + deltaX}px`;
            pastille.style.top = `${pastilleStartTop + deltaY}px`;
        }
    }, { passive: false });

    pastille.addEventListener('touchend', () => {
        const x = parseFloat(pastille.style.left);
        const startMs = (x - 30) * (totalTimelineDuration / timeline.scrollWidth);
        const duration = parseInt(pastille.dataset.endTimeMs) - parseInt(pastille.dataset.startTimeMs);
        pastille.dataset.startTimeMs = Math.max(0, startMs);
        pastille.dataset.endTimeMs = Math.max(0, startMs + duration);
        updateAndDrawMarkers();
    });

    return pastille;
};

// MARQUEURS TEMPORELS
const createMarker = (x, htmlContent, type, y = null) => {
    const marker = document.createElement('div');
    marker.className = `time-marker marker-${type}`;
    marker.style.left = `${x}px`;
    if (y) {
        marker.style.top = y;
        marker.style.transform = `translate(-50%, -50%)`;
    } else {
        marker.style.transform = `translateX(-50%)`;
    }
    marker.innerHTML = htmlContent;
    timeline.appendChild(marker);
};

const updateAndDrawMarkers = () => {
    document.querySelectorAll('.time-marker').forEach(m => m.remove());

    let pastilles = Array.from(timeline.querySelectorAll('.pastille'));
    pastilles.sort((a, b) => parseInt(a.dataset.startTimeMs) - parseInt(b.dataset.startTimeMs));

    if (pastilles.length === 0) {
        totalTimelineDuration = 0;
        const display = document.getElementById('current-time-display');
        if (display) display.textContent = formatTimeDisplay(0);
        return;
    }

    let maxTime = 0;
    pastilles.forEach(p => maxTime = Math.max(maxTime, parseInt(p.dataset.endTimeMs)));
    if (maxTime <= 0) maxTime = 1000;
    totalTimelineDuration = maxTime;

    const timelineWidth = timeline.scrollWidth;
    const pixelsPerMs = timelineWidth / totalTimelineDuration;
    const minX = 30;

    pastilles.forEach(p => {
        const startMs = parseInt(p.dataset.startTimeMs);
        const endMs = parseInt(p.dataset.endTimeMs);
        const durationMs = Math.max(0, endMs - startMs);
        const posX = startMs * pixelsPerMs;

        p.style.left = `${posX + minX}px`;

        const bar = p.querySelector('.duration-bar');
        if (bar) bar.style.width = `${durationMs * pixelsPerMs}px`;

        createMarker(posX + minX, formatTimeVertical(startMs), 'top');
        createMarker(posX + minX, formatTimeVertical(startMs), 'bottom');

        if (durationMs > 0) {
            createMarker(posX + minX + (durationMs * pixelsPerMs), formatTimeVertical(endMs), 'end', p.style.top);
        }

        updatePastilleStyle(p);
    });
};