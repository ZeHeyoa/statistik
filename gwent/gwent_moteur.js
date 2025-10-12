
// gwent_moteur.js

// Accéder aux exports de gwent_population.js via window
if (!window.GwentPopulation) {
    console.error('Erreur: window.GwentPopulation non défini. Assurez-vous que gwent_population.js est chargé en premier.');
    throw new Error('Dépendance manquante: gwent_population.js');
}

// API pour calculer les scores (agrégateur)
function calculerScore(plateau, joueur) {
    let score = 0;
    ['melee', 'ranged', 'siege'].forEach(ligne => {
        plateau[joueur].lignes[ligne].forEach(carte => {
            score += (carte.force || 0); // Safeguard for undefined force
        });
    });
    return score;
}

function mettreAJourScores(plateau) {
    const newPlateau = { ...plateau };
    newPlateau.joueur1.score = calculerScore(newPlateau, 'joueur1');
    newPlateau.joueur2.score = calculerScore(newPlateau, 'joueur2');
    return newPlateau;
}

// API pour jouer une carte
function jouerCarte(plateau, joueur, carteId, ...args) {
    const carte = gwentCardInstances.find(c => c.id === carteId);
    if (!carte) {
        console.warn(`Carte avec ID ${carteId} non trouvée`);
        return plateau;
    }
    
    // Retirer la carte de la main du joueur
    const newPlateau = { ...plateau };
    newPlateau[joueur].main = newPlateau[joueur].main.filter(c => c.id !== carteId);
    
    // Appliquer l'effet de la carte
    const updatedPlateau = carte.onPlay(newPlateau, joueur, ...args);
    
    // Mettre à jour les scores après l'effet
    return mettreAJourScores(updatedPlateau);
}

// API pour passer tour
function passerTour(plateau, joueur) {
    const newPlateau = { ...plateau };
    newPlateau[joueur].statut = 'passe';
    newPlateau.tours = (newPlateau.tours || 0) + 1; // Incrémenter le compteur de tours

    // Vérifier et exécuter les effets différés
    if (newPlateau.effetsDifferes && newPlateau.effetsDifferes.length > 0) {
        newPlateau.effetsDifferes = newPlateau.effetsDifferes.map(effet => ({
            ...effet,
            toursRestants: effet.toursRestants - 1
        }));
        const effetsAExecuter = newPlateau.effetsDifferes.filter(e => e.toursRestants <= 0);
        newPlateau.effetsDifferes = newPlateau.effetsDifferes.filter(e => e.toursRestants > 0);

        effetsAExecuter.forEach(effet => {
            if (effet.type === 'incinerationtemporisee') {
                const adversaire = effet.joueur === 'joueur1' ? 'joueur2' : 'joueur1';
                const allLignes = ['melee', 'ranged', 'siege'];
                let maxForce = 0;
                // Trouver la force maximale des unités ennemies non-héros
                allLignes.forEach(ligne => {
                    newPlateau[adversaire].lignes[ligne].forEach(c => {
                        if (!c.isHero && c.force > maxForce) maxForce = c.force;
                    });
                });
                // Supprimer les unités ennemies non-héros avec la force maximale
                allLignes.forEach(ligne => {
                    newPlateau[adversaire].lignes[ligne] = newPlateau[adversaire].lignes[ligne].filter(c => {
                        if (!c.isHero && c.force === maxForce) {
                            newPlateau[adversaire].defausse.push(c);
                            return false;
                        }
                        return true;
                    });
                });
                console.log(`Effet Incinération Temporisée déclenché pour carte ID ${effet.carteId}`);
            }
        });
    }

    return mettreAJourScores(newPlateau);
}

// API pour fin de manche (appliquer bonus faction, reset lignes, etc.)
function finManche(plateau, royaumeJ1, royaumeJ2) {
    const newPlateau = { ...plateau };
    
    // Déterminer le gagnant
    let winner = newPlateau.joueur1.score > newPlateau.joueur2.score ? 'joueur1' : 'joueur2';
    if (newPlateau.joueur1.score === newPlateau.joueur2.score && royaumeJ2 === 'Nilfgaard') {
        winner = 'joueur2';
    }
    
    // Appliquer les bonus de faction
    if (winner === 'joueur1' && royaumeJ1 === 'Royaumes du Nord') {
        if (newPlateau.joueur1.deck.length > 0) {
            newPlateau.joueur1.main.push(newPlateau.joueur1.deck.shift());
        }
    }
    if (winner === 'joueur1' && royaumeJ1 === 'Monstres') {
        const allUnits = [
            ...newPlateau.joueur1.lignes.melee,
            ...newPlateau.joueur1.lignes.ranged,
            ...newPlateau.joueur1.lignes.siege
        ].filter(c => !c.isHero);
        if (allUnits.length > 0) {
            const randomUnit = allUnits[Math.floor(Math.random() * allUnits.length)];
            newPlateau.joueur1.lignes[randomUnit.ligne[0].toLowerCase()] = [randomUnit];
        }
    }
    if (newPlateau.manches === 3 && royaumeJ1 === 'Skellige') {
        const defausseUnits = newPlateau.joueur1.defausse.filter(c => c.type === 'Unité' && !c.isHero);
        for (let i = 0; i < 2 && defausseUnits.length > 0; i++) {
            const index = Math.floor(Math.random() * defausseUnits.length);
            const ressuscitee = defausseUnits.splice(index, 1)[0];
            newPlateau.joueur1.lignes[ressuscitee.ligne[0].toLowerCase()].push(ressuscitee);
        }
        newPlateau.joueur1.defausse = newPlateau.joueur1.defausse.filter(c => !newPlateau.joueur1.lignes[ressuscitee.ligne[0].toLowerCase()].includes(c));
    }
    
    // Déplacer toutes les cartes du plateau vers la défausse (sauf Monstres conservé)
    ['joueur1', 'joueur2'].forEach(j => {
        ['melee', 'ranged', 'siege'].forEach(ligne => {
            if (!(j === 'joueur1' && royaumeJ1 === 'Monstres' && newPlateau[j].lignes[ligne].length === 1)) {
                newPlateau[j].defausse.push(...newPlateau[j].lignes[ligne]);
                newPlateau[j].lignes[ligne] = [];
            }
        });
        newPlateau[j].statut = 'actif';
    });
    
    // Réinitialiser météo et tours
    newPlateau.meteo = { melee: false, ranged: false, siege: false };
    newPlateau.tours = 0;
    
    // Incrémenter manche (limité à 3)
    newPlateau.manches = (newPlateau.manches || 1) + 1;
    
    return mettreAJourScores(newPlateau);
}

// Exposer pour utilisation dans le navigateur
window.GwentMoteur = {
    jouerCarte,
    passerTour,
    finManche,
    mettreAJourScores
};
