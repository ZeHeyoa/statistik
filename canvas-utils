// ===== PARTIE 1: CLASSES ET UTILITAIRES =====

// CLASSE QUATERNION OPTIMISÉE
class Quaternion {
    constructor(w, x, y, z) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromAxisAngle(axis, angle) {
        const s = Math.sin(angle / 2);
        return new Quaternion(
            Math.cos(angle / 2),
            axis.x * s,
            axis.y * s,
            axis.z * s
        );
    }

    multiply(q) {
        return new Quaternion(
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w
        );
    }

    normalize() {
        const mag = Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
        if (mag > 1e-10) {
            this.w /= mag;
            this.x /= mag;
            this.y /= mag;
            this.z /= mag;
        }
        return this;
    }

    rotatePoint(p) {
        const qp = new Quaternion(0, p.x, p.y, p.z);
        const qConj = new Quaternion(this.w, -this.x, -this.y, -this.z);
        const res = this.multiply(qp).multiply(qConj);
        return { x: res.x, y: res.y, z: res.z };
    }

    // NOUVEAU: Conversion en matrice 3x3 pour Canvas
    toRotationMatrix() {
        const w = this.w, x = this.x, y = this.y, z = this.z;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        return [
            [1 - (yy + zz), xy + wz, xz - wy],
            [xy - wz, 1 - (xx + zz), yz + wx],
            [xz + wy, yz - wx, 1 - (xx + yy)]
        ];
    }
}

// NOUVEAU: Classe pour gérer le rendu Canvas 3D
class Canvas3DRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = 1;
        this.focalLength = 500;
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Projection 3D vers 2D
    project3D(point3D) {
        const z = point3D.z + this.focalLength;
        if (z <= 0) return null;
        
        const factor = this.focalLength / z;
        return {
            x: this.centerX + point3D.x * factor * this.scale,
            y: this.centerY - point3D.y * factor * this.scale,
            z: z
        };
    }

    // Applique rotation et translation à un point
    transformPoint(point, rotationMatrix, translation) {
        const rotated = {
            x: rotationMatrix[0][0] * point.x + rotationMatrix[0][1] * point.y + rotationMatrix[0][2] * point.z,
            y: rotationMatrix[1][0] * point.x + rotationMatrix[1][1] * point.y + rotationMatrix[1][2] * point.z,
            z: rotationMatrix[2][0] * point.x + rotationMatrix[2][1] * point.y + rotationMatrix[2][2] * point.z
        };
        
        return {
            x: rotated.x + translation.x,
            y: rotated.y + translation.y,
            z: rotated.z + translation.z
        };
    }

    // Dessine une ligne 3D
    drawLine3D(p1, p2, color = '#00e5ff', lineWidth = 2) {
        const proj1 = this.project3D(p1);
        const proj2 = this.project3D(p2);
        
        if (!proj1 || !proj2) return;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(proj1.x, proj1.y);
        this.ctx.lineTo(proj2.x, proj2.y);
        this.ctx.stroke();
    }

    // Dessine un cube 3D
    drawCube(size, rotationMatrix, translation, color = '#00ffaa') {
        const halfSize = size / 2;
        
        // Définition des 8 sommets du cube
        const vertices = [
            { x: -halfSize, y: -halfSize, z: -halfSize },
            { x: halfSize, y: -halfSize, z: -halfSize },
            { x: halfSize, y: halfSize, z: -halfSize },
            { x: -halfSize, y: halfSize, z: -halfSize },
            { x: -halfSize, y: -halfSize, z: halfSize },
            { x: halfSize, y: -halfSize, z: halfSize },
            { x: halfSize, y: halfSize, z: halfSize },
            { x: -halfSize, y: halfSize, z: halfSize }
        ];

        // Transformation et projection des sommets
        const transformedVertices = vertices.map(v => 
            this.transformPoint(v, rotationMatrix, translation)
        );

        const projectedVertices = transformedVertices.map(v => this.project3D(v));

        // Vérification que tous les points sont visibles
        if (projectedVertices.some(p => !p)) return;

        // Définition des faces avec leurs indices de sommets
        const faces = [
            { indices: [0, 1, 2, 3], color: this.shadeColor(color, 0.3) },   // Arrière
            { indices: [4, 5, 6, 7], color: this.shadeColor(color, 1.0) },   // Avant
            { indices: [0, 1, 5, 4], color: this.shadeColor(color, 0.5) },   // Bas
            { indices: [2, 3, 7, 6], color: this.shadeColor(color, 0.7) },   // Haut
            { indices: [0, 3, 7, 4], color: this.shadeColor(color, 0.4) },   // Gauche
            { indices: [1, 2, 6, 5], color: this.shadeColor(color, 0.6) }    // Droite
        ];

        // Calcul de la profondeur moyenne pour chaque face (painter's algorithm)
        const facesWithDepth = faces.map(face => {
            const avgZ = face.indices.reduce((sum, idx) => 
                sum + transformedVertices[idx].z, 0
            ) / face.indices.length;
            return { ...face, avgZ };
        });

        // Tri des faces par profondeur (les plus éloignées en premier)
        facesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

        // Dessin des faces
        facesWithDepth.forEach(face => {
            this.ctx.fillStyle = face.color;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            
            face.indices.forEach((idx, i) => {
                const p = projectedVertices[idx];
                if (i === 0) {
                    this.ctx.moveTo(p.x, p.y);
                } else {
                    this.ctx.lineTo(p.x, p.y);
                }
            });
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });

        // Dessin du texte "OBJET"
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.font = 'bold 24px "Roboto Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('OBJET', this.centerX, this.centerY);
    }

    // Fonction helper pour assombrir/éclaircir une couleur
    shadeColor(color, factor) {
        // Conversion hex vers RGB si nécessaire
        let r, g, b;
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        } else {
            return color; // Garde la couleur originale si format non reconnu
        }

        r = Math.floor(r * factor);
        g = Math.floor(g * factor);
        b = Math.floor(b * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Dessine les axes de repère
    drawAxes(rotationMatrix, translation, size = 100) {
        const origin = this.transformPoint({ x: 0, y: 0, z: 0 }, rotationMatrix, translation);
        const axisX = this.transformPoint({ x: size, y: 0, z: 0 }, rotationMatrix, translation);
        const axisY = this.transformPoint({ x: 0, y: size, z: 0 }, rotationMatrix, translation);
        const axisZ = this.transformPoint({ x: 0, y: 0, z: size }, rotationMatrix, translation);

        this.drawLine3D(origin, axisX, '#ff0077', 2);
        this.drawLine3D(origin, axisY, '#00ffaa', 2);
        this.drawLine3D(origin, axisZ, '#00aaff', 2);
    }
}

// FONCTIONS UTILITAIRES
const timeToMilliseconds = (h, m, s, ms) => {
    return (parseInt(h || 0) * 3600 + parseInt(m || 0) * 60 + parseInt(s || 0)) * 1000 + parseInt(ms || 0);
};

const millisecondsToTime = (totalMs) => {
    if (isNaN(totalMs) || totalMs < 0) return { h: 0, m: 0, s: 0, ms: 0 };
    let r = totalMs;
    const h = Math.floor(r / 3600000);
    r %= 3600000;
    const m = Math.floor(r / 60000);
    r %= 60000;
    const s = Math.floor(r / 1000);
    const ms = r % 1000;
    return { h, m, s, ms };
};

const formatTimeDisplay = (ms) => {
    const t = millisecondsToTime(ms);
    return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}:${String(t.s).padStart(2, '0')}:${String(t.ms).padStart(3, '0')}`;
};

const formatTimeVertical = (totalMs) => {
    const t = millisecondsToTime(totalMs);
    const parts = [];
    if (t.h > 0) parts.push(`<span>${String(t.h).padStart(2, '0')}H</span>`);
    if (t.m > 0 || t.h > 0) parts.push(`<span>${String(t.m).padStart(2, '0')}M</span>`);
    parts.push(`<span>${String(t.s).padStart(2, '0')}S</span>`);
    parts.push(`<span>${String(t.ms).padStart(3, '0')}ms</span>`);
    return `<div class="time-label">${parts.join('')}</div>`;
};

const getAxisColor = (axis) => {
    const colors = {
        'Axe X': 'var(--color-axex)',
        'Axe Y': 'var(--color-axey)',
        'Axe Z': 'var(--color-axez)',
        'rotation X': 'var(--color-rotx)',
        'rotation Y': 'var(--color-roty)',
        'rotation Z': 'var(--color-rotz)',
        'rotation Pivot': 'var(--color-pivot)'
    };
    return colors[axis] || 'var(--primary-glow)';
};

const getBarColor = (axis) => {
    const colors = {
        'Axe X': 'var(--bar-color-axex)',
        'Axe Y': 'var(--bar-color-axey)',
        'Axe Z': 'var(--bar-color-axez)',
        'rotation X': 'var(--bar-color-rotx)',
        'rotation Y': 'var(--bar-color-roty)',
        'rotation Z': 'var(--bar-color-rotz)',
        'rotation Pivot': 'var(--bar-color-pivot)'
    };
    return colors[axis] || 'var(--border-color)';
};

const getRandomPaleColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 30 + 30);
    const l = Math.floor(Math.random() * 15 + 70);
    return `hsl(${h}, ${s}%, ${l}%)`;
};

const downloadJson = (data, filename = 'timeline_sequence.json') => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const getBezierValue = (t, P0_y, P1_y, P2_y, P3_y) => {
    const t2 = t * t, t3 = t2 * t;
    const mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt;
    return P0_y * mt3 + 3 * P1_y * mt2 * t + 3 * P2_y * mt * t2 + P3_y * t3;
};