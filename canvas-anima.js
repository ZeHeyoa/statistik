// ===== PARTIE 3: ANIMATION ET ÉVÉNEMENTS (VERSION CANVAS) =====

let animationFrame = null;
let animationStartTime = 0;
let currentTimelineTime = 0;
let frameCounter = 0;
let canvasRenderer = null;
let previewCanvas = null;

// FONCTION REFACTORISÉE POUR CALCULER UNE TRANSFORMATION
const computeTransformation = (p, timeMs, currentOrientation) => {
    const startMs = parseInt(p.dataset.startTimeMs);
    const endMs = parseInt(p.dataset.endTimeMs);
    const durationMs = endMs - startMs;

    if (durationMs <= 0 || timeMs < startMs || timeMs > endMs) {
        return null;
    }

    const t_progression = (timeMs - startMs) / durationMs;
    const curve_value = getBezierValue(
        t_progression,
        1 - (parseFloat(p.dataset.curveP0Top) / 100),
        1 - (parseFloat(p.dataset.curveP1Top) / 100),
        1 - (parseFloat(p.dataset.curveP2Top) / 100),
        1 - (parseFloat(p.dataset.curveP3Top) / 100)
    );

    const startVal = parseFloat(p.dataset.startValue || 0);
    const endVal = parseFloat(p.dataset.endValue || 0);
    const final_value = startVal + (endVal - startVal) * curve_value;
    const axis = p.dataset.axis;

    let rotQuat = null;
    let transVec = { x: 0, y: 0, z: 0 };

    // Dimensions du cube (fixe pour le rendu canvas)
    const CUBE_SIZE = 150;

    if (axis === 'Axe X') transVec.x = final_value;
    if (axis === 'Axe Y') transVec.y = final_value;
    if (axis === 'Axe Z') transVec.z = final_value;

    if (axis.startsWith('rotation')) {
        const angleRad = final_value * Math.PI / 180;

        if (axis === 'rotation X') {
            rotQuat = Quaternion.fromAxisAngle({ x: 1, y: 0, z: 0 }, angleRad);
        } else if (axis === 'rotation Y') {
            rotQuat = Quaternion.fromAxisAngle({ x: 0, y: 1, z: 0 }, angleRad);
        } else if (axis === 'rotation Z') {
            rotQuat = Quaternion.fromAxisAngle({ x: 0, y: 0, z: 1 }, angleRad);
        } else if (axis === 'rotation Pivot') {
            const pAx_pct = parseFloat(p.dataset.pivotAx || 0);
            const pAy_pct = parseFloat(p.dataset.pivotAy || 0);
            const pAz_px = parseFloat(p.dataset.pivotAz || 0);
            const pBx = parseFloat(p.dataset.pivotBx || 0);
            const pBy = parseFloat(p.dataset.pivotBy || 0);
            const pBz = parseFloat(p.dataset.pivotBz || 0);

            const pivotPoint = {
                x: (CUBE_SIZE / 100) * pAx_pct,
                y: (CUBE_SIZE / 100) * pAy_pct,
                z: pAz_px
            };

            let vx = (CUBE_SIZE / 100) * (pBx - pAx_pct);
            let vy = (CUBE_SIZE / 100) * (pBy - pAy_pct);
            let vz = pBz - pAz_px;

            const mag = Math.sqrt(vx * vx + vy * vy + vz * vz);
            let rotationAxis = { x: 0, y: 1, z: 0 };
            if (mag > 1e-6) {
                rotationAxis = { x: vx / mag, y: vy / mag, z: vz / mag };
            }

            rotQuat = Quaternion.fromAxisAngle(rotationAxis, angleRad);

            const referential = p.dataset.referential || 'local';
            
            if (referential === 'world') {
                const worldPivot = currentOrientation.rotatePoint(pivotPoint);
                const rotatedWorldPivot = rotQuat.rotatePoint(worldPivot);
                
                const compensation = {
                    x: worldPivot.x - rotatedWorldPivot.x,
                    y: worldPivot.y - rotatedWorldPivot.y,
                    z: worldPivot.z - rotatedWorldPivot.z
                };
                
                transVec.x += compensation.x;
                transVec.y += compensation.y;
                transVec.z += compensation.z;
            } else {
                const rotatedPivot = rotQuat.rotatePoint(pivotPoint);
                
                const compensation = {
                    x: pivotPoint.x - rotatedPivot.x,
                    y: pivotPoint.y - rotatedPivot.y,
                    z: pivotPoint.z - rotatedPivot.z
                };
                
                transVec.x += compensation.x;
                transVec.y += compensation.y;
                transVec.z += compensation.z;
            }
        }
    }

    return { rotQuat, transVec };
};

// SYSTÈME À DEUX PASSES - VERSION CANVAS
const renderTransform = (timeMs) => {
    
    if (!canvasRenderer) return;

    const pastilles = Array.from(timeline.querySelectorAll('.pastille'));
    pastilles.sort((a, b) => parseInt(a.dataset.startTimeMs) - parseInt(b.dataset.startTimeMs));

    const worldPastilles = pastilles.filter(p => (p.dataset.referential || 'local') === 'world');
    const localPastilles = pastilles.filter(p => (p.dataset.referential || 'local') === 'local');

    let orientation = new Quaternion(1, 0, 0, 0);
    let position = { x: 0, y: 0, z: 0 };
 
    // === PASSE 1: TRANSFORMATIONS MONDE ===
    worldPastilles.forEach(p => {
        const transformation = computeTransformation(p, timeMs, orientation);
        if (!transformation) return;

        const { rotQuat, transVec } = transformation;

        if (rotQuat) {
            orientation = orientation.multiply(rotQuat);
        }
        if (transVec.x !== 0 || transVec.y !== 0 || transVec.z !== 0) {
            position.x += transVec.x;
            position.y += transVec.y;
            position.z += transVec.z;
        }
    });
 
    // === PASSE 2: TRANSFORMATIONS LOCALES ===
    localPastilles.forEach(p => {
        const transformation = computeTransformation(p, timeMs, orientation);
        if (!transformation) return;

        const { rotQuat, transVec } = transformation;

        if (transVec.x !== 0 || transVec.y !== 0 || transVec.z !== 0) {
            const rotatedTranslation = orientation.rotatePoint(transVec);
            position.x += rotatedTranslation.x;
            position.y += rotatedTranslation.y;
            position.z += rotatedTranslation.z;
        }
        if (rotQuat) {
            orientation = rotQuat.multiply(orientation);
        }
    });

    // Normalisation périodique
    frameCounter++;
    if (frameCounter % 10 === 0) {
        orientation.normalize();
    }

    // RENDU CANVAS
    const rotationMatrix = orientation.toRotationMatrix();
    
    canvasRenderer.clear();
    canvasRenderer.drawCube(150, rotationMatrix, position, '#00ffaa');
    canvasRenderer.drawAxes(rotationMatrix, position, 80);
   
};

// ANIMATION
const animateTimeline = (timestamp) => {
    if (!animationStartTime) animationStartTime = timestamp;
    const elapsed = timestamp - animationStartTime;
    currentTimelineTime = elapsed;

    if (currentTimelineTime > totalTimelineDuration) {
        animationStartTime = timestamp;
        currentTimelineTime = 0;
    }

    const display = document.getElementById('current-time-display');
    if (display) display.textContent = formatTimeDisplay(currentTimelineTime);

    renderTransform(currentTimelineTime);
    animationFrame = requestAnimationFrame(animateTimeline);
};

const stopAnimation = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    animationStartTime = 0;
    currentTimelineTime = 0;
    frameCounter = 0;

    const previewCard = document.getElementById('preview-card');
    if (previewCard) previewCard.style.display = 'none';

    if (canvasRenderer) {
        canvasRenderer.clear();
        // Dessiner l'état initial
        const identityMatrix = [[1,0,0],[0,1,0],[0,0,1]];
        canvasRenderer.drawCube(150, identityMatrix, {x:0, y:0, z:0}, '#00ffaa');
        canvasRenderer.drawAxes(identityMatrix, {x:0, y:0, z:0}, 80);
    }

    const display = document.getElementById('current-time-display');
    if (display) display.textContent = formatTimeDisplay(0);
};

// ÉDITEUR
let currentSlide = 1;

const showSlide = (slideNumber) => {
    const slide1 = document.getElementById('editor-slide-1');
    const slide2 = document.getElementById('editor-slide-2');
    const timeEditor = document.getElementById('time-editor');

    if (slide1) slide1.style.display = (slideNumber === 1) ? 'block' : 'none';
    if (slide2) slide2.style.display = (slideNumber === 2) ? 'block' : 'none';
    currentSlide = slideNumber;

    if (timeEditor) {
        if (slideNumber === 2) {
            timeEditor.style.width = 'min(330px, 95vw)';
            updateCanvasSize();
        } else {
            timeEditor.style.width = 'min(450px, 95vw)';
        }
    }
};

const showTimeEditor = (p) => {
    activePastille = p;

    const startTime = millisecondsToTime(parseInt(p.dataset.startTimeMs));
    const endTime = millisecondsToTime(parseInt(p.dataset.endTimeMs));

    ['start', 'end'].forEach(type => {
        const t = type === 'start' ? startTime : endTime;
        Object.keys(t).forEach(unit => {
            const el = document.getElementById(`${type}-${unit}`);
            if (el) el.value = t[unit];
        });
    });

    const startValueInput = document.getElementById('start-value');
    const endValueInput = document.getElementById('end-value');
    const editorAxisSelector = document.getElementById('editor-axis-selector');
    const editorReferentialSelector = document.getElementById('editor-referential-selector');
    const pivotFieldset = document.getElementById('pivot-fieldset');

    if (startValueInput) startValueInput.value = p.dataset.startValue;
    if (endValueInput) endValueInput.value = p.dataset.endValue;
    if (editorAxisSelector) editorAxisSelector.value = p.dataset.axis;
    if (editorReferentialSelector) editorReferentialSelector.value = p.dataset.referential || 'local';

    if (pivotFieldset) {
        pivotFieldset.style.display = (p.dataset.axis === 'rotation Pivot') ? 'flex' : 'none';
    }

    ['ax', 'ay', 'az', 'bx', 'by', 'bz'].forEach(coord => {
        const el = document.getElementById(`pivot-${coord}`);
        if (el) el.value = p.dataset[`pivot${coord.charAt(0).toUpperCase() + coord.slice(1)}`];
    });

    curvePoints.forEach((cp, index) => {
        cp.style.left = p.dataset[`curveP${index}Left`] || cp.style.left;
        cp.style.top = p.dataset[`curveP${index}Top`] || cp.style.top;
    });

    const timeEditor = document.getElementById('time-editor');
    if (timeEditor) timeEditor.style.display = 'block';
    showSlide(1);
};

// IMPORT/EXPORT JSON
const importTimelineFromJson = (importData) => {
    if (!importData || !Array.isArray(importData.pastilles)) {
        alert("Erreur: Le fichier JSON ne contient pas de tableau 'pastilles' valide.");
        return;
    }

    const newGroupId = `group-${Date.now()}`;
    const newGroupColor = getRandomPaleColor();
    const newGroupNumber = nextGroupNumber++;

    const newGroup = {
        id: newGroupId,
        number: newGroupNumber,
        color: newGroupColor
    };
    allGroups.push(newGroup);

    importData.pastilles.forEach(pData => {
        const x = parseFloat(pData.left?.replace('px', '')) || 30;
        const y = parseFloat(pData.top?.replace('px', '')) || 50;
        createPastille(x, y, pData, newGroupId, newGroupNumber);
    });

    updateGroupList();
    updateAndDrawMarkers();
    alert(`Séquence importée avec succès! Pastilles ajoutées au Groupe ${newGroupNumber}.`);
};

// INITIALISATION PRINCIPALE
document.addEventListener('DOMContentLoaded', () => {
    // Récupération des éléments DOM
    timeline = document.getElementById('timeline');
    timelineContainer = document.getElementById('timeline-container');
    previewObject = document.getElementById('preview-object');
    previewInner = document.getElementById('preview-inner');
    
    // NOUVEAU: Initialisation du canvas 3D
    previewCanvas = document.getElementById('preview-canvas');
    if (previewCanvas) {
        canvasRenderer = new Canvas3DRenderer(previewCanvas);
        
        // Redimensionner le canvas
        const resizeCanvas = () => {
            const container = previewCanvas.parentElement;
            previewCanvas.width = container.clientWidth;
            previewCanvas.height = container.clientHeight;
            canvasRenderer.resize();
            
            // Redessiner l'état initial
            if (!animationFrame) {
                const identityMatrix = [[1,0,0],[0,1,0],[0,0,1]];
                canvasRenderer.clear();
                canvasRenderer.drawCube(150, identityMatrix, {x:0, y:0, z:0}, '#00ffaa');
                canvasRenderer.drawAxes(identityMatrix, {x:0, y:0, z:0}, 80);
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Dessiner l'état initial
        const identityMatrix = [[1,0,0],[0,1,0],[0,0,1]];
        canvasRenderer.drawCube(150, identityMatrix, {x:0, y:0, z:0}, '#00ffaa');
        canvasRenderer.drawAxes(identityMatrix, {x:0, y:0, z:0}, 80);
    }
    
    curveArea = document.getElementById('curve-area');
    canvas = document.getElementById('curve-canvas');
    if (canvas) ctx = canvas.getContext('2d');
    curvePoints = Array.from(document.querySelectorAll('.curve-control-point'));

    const referencePastille = document.getElementById('reference-pastille');
    const playBtn = document.getElementById('play-btn');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const saveJsonBtn = document.getElementById('save-json-btn');
    const loadJsonBtn = document.getElementById('load-json-btn');
    const loadJsonFile = document.getElementById('load-json-file');
    const closeEditorBtn = document.getElementById('close-editor-btn');
    const nextSlideBtn = document.getElementById('next-slide-btn');
    const prevSlideBtn = document.getElementById('prev-slide-btn');
    const editorAxisSelector = document.getElementById('editor-axis-selector');
    const okBtns = document.querySelectorAll('#time-editor .ok-btn');

    // Configuration des courbes
    setupCurvePointDrag();
    window.addEventListener('resize', updateCanvasSize);

    // Drag & Drop de la pastille de référence
    if (referencePastille) {
        referencePastille.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'reference-pastille');
            e.target.classList.add('dragging');
        });
        referencePastille.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    }

    // Drop sur timeline
    if (timeline) {
        timeline.addEventListener('dragover', (e) => e.preventDefault());
        timeline.addEventListener('drop', (e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(id);
            const rect = timeline.getBoundingClientRect();
            const x = e.clientX - rect.left + timelineContainer.scrollLeft;
            const y = e.clientY - rect.top + timelineContainer.scrollTop;

            if (id === 'reference-pastille') {
                const newPastille = createPastille(x, y);
                showTimeEditor(newPastille);
            } else if (draggedElement && draggedElement.classList.contains('pastille')) {
                draggedElement.style.left = `${x}px`;
                draggedElement.style.top = `${y}px`;
                const startMs = (x - 30) * (totalTimelineDuration / timeline.scrollWidth);
                const duration = parseInt(draggedElement.dataset.endTimeMs) - parseInt(draggedElement.dataset.startTimeMs);
                draggedElement.dataset.startTimeMs = Math.max(0, startMs);
                draggedElement.dataset.endTimeMs = Math.max(0, startMs + duration);
                updateAndDrawMarkers();
            }
        });
    }

    // Boutons
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (totalTimelineDuration <= 1) {
                alert("Veuillez créer et configurer au moins une animation avec une durée !");
                return;
            }
            const previewCard = document.getElementById('preview-card');
            if (previewCard) previewCard.style.display = 'flex';
            
            // Réinitialiser le canvas
            if (canvasRenderer) {
                canvasRenderer.clear();
            }
            
            animationFrame = requestAnimationFrame(animateTimeline);
        });
    }

    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', stopAnimation);
    }

    if (saveJsonBtn) {
        saveJsonBtn.addEventListener('click', () => {
            const pastillesData = Array.from(timeline.querySelectorAll('.pastille')).map(p => {
                const data = { left: p.style.left, top: p.style.top, id: p.id };
                for (const key in p.dataset) {
                    data[key] = p.dataset[key];
                }
                return data;
            });
            const exportData = {
                timestamp: new Date().toISOString(),
                pastilles: pastillesData
            };
            downloadJson(exportData, `timeline_export_${Date.now()}.json`);
        });
    }

    if (loadJsonBtn) {
        loadJsonBtn.addEventListener('click', () => {
            if (loadJsonFile) loadJsonFile.click();
        });
    }

    if (loadJsonFile) {
        loadJsonFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    importTimelineFromJson(jsonContent);
                } catch (error) {
                    alert("Erreur lors du chargement du fichier JSON. Format invalide.");
                    console.error("Erreur de chargement JSON:", error);
                }
            };
            reader.readAsText(file);
            e.target.value = null;
        });
    }

    if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => showSlide(2));
    if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => showSlide(1));

    if (editorAxisSelector) {
        editorAxisSelector.addEventListener('change', () => {
            const pivotFieldset = document.getElementById('pivot-fieldset');
            if (pivotFieldset) {
                pivotFieldset.style.display = (editorAxisSelector.value === 'rotation Pivot') ? 'flex' : 'none';
            }
        });
    }

    okBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!activePastille) return;

            const getMs = (type) => timeToMilliseconds(
                document.getElementById(`${type}-h`)?.value,
                document.getElementById(`${type}-m`)?.value,
                document.getElementById(`${type}-s`)?.value,
                document.getElementById(`${type}-ms`)?.value
            );

            const editorAxisSelector = document.getElementById('editor-axis-selector');
            const editorReferentialSelector = document.getElementById('editor-referential-selector');
            const startValueInput = document.getElementById('start-value');
            const endValueInput = document.getElementById('end-value');

            const newAxis = editorAxisSelector?.value || 'Axe X';
            activePastille.dataset.startTimeMs = getMs('start');
            activePastille.dataset.endTimeMs = getMs('end');
            activePastille.dataset.axis = newAxis;
            activePastille.dataset.referential = editorReferentialSelector?.value || 'local';
            activePastille.dataset.startValue = startValueInput?.value || '0';
            activePastille.dataset.endValue = endValueInput?.value || '100';

            if (newAxis === 'rotation Pivot') {
                ['ax', 'ay', 'az', 'bx', 'by', 'bz'].forEach(coord => {
                    const el = document.getElementById(`pivot-${coord}`);
                    if (el) {
                        const key = `pivot${coord.charAt(0).toUpperCase() + coord.slice(1)}`;
                        activePastille.dataset[key] = el.value;
                    }
                });
            }

            curvePoints.forEach((cp, index) => {
                activePastille.dataset[`curveP${index}Left`] = cp.style.left;
                activePastille.dataset[`curveP${index}Top`] = cp.style.top;
            });

            updatePastilleStyle(activePastille);
            const timeEditor = document.getElementById('time-editor');
            if (timeEditor) timeEditor.style.display = 'none';
            updateAndDrawMarkers();
            activePastille = null;
        });
    });

    if (closeEditorBtn) {
        closeEditorBtn.addEventListener('click', () => {
            if (activePastille && confirm("Supprimer cette animation ?")) {
                activePastille.remove();
                updateAndDrawMarkers();
            }
            const timeEditor = document.getElementById('time-editor');
            if (timeEditor) timeEditor.style.display = 'none';
            activePastille = null;
        });
    }

    // Initialisation
    const display = document.getElementById('current-time-display');
    if (display) display.textContent = formatTimeDisplay(0);
    updateCanvasSize();
    updateAndDrawMarkers();
    updateGroupList();
});