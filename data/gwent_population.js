// Ce fichier est responsable de la création des instances de cartes uniques
// à partir des modèles définis dans gwent_info_carte2.js et de la définition
// des fonctions d'effets spéciaux.

// NOTE IMPORTANTE : Les fonctions globales comme calculerForceUnite sont supposées être définies dans gwent_moteur.js.

// --- Fonctions d'Action Spéciale ---

const Aucune = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    return plateau;
};

// La carte Morale est une unité, son effet est géré dans le score du moteur,
// mais elle a besoin d'une fonction d'action lors de sa pose.
const Morale = Aucune; 

const clearAllWeather = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    const lignes = ['Melee', 'Ranged', 'Siege'];
    for (const joueurId_all of ['joueur1', 'joueur2']) {
        lignes.forEach(ligne => {
            plateau[joueurId_all].lignes[ligne].modificateurMeteo = 1; 
        });
    }

    plateau.cartesMeteoActives = [];
    return plateau;
};

const Meteo = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    const ligneAffectee = carte.ligne; 
    
    for (const joueurId_all of ['joueur1', 'joueur2']) {
        plateau[joueurId_all].lignes[ligneAffectee].modificateurMeteo = 0;
    }
    
    plateau.cartesMeteoActives.push(carte);
    return plateau;
};


const Espion = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    const joueur = plateau[joueurId];
    const adversaireId = joueurId === 'joueur1' ? 'joueur2' : 'joueur1';
    const adversaire = plateau[adversaireId];

    adversaire.lignes[ligne].unites.push(carte);

    for (let i = 0; i < 2; i++) {
        if (joueur.deck.length > 0) {
            joueur.main.push(joueur.deck.pop());
        }
    }

    return plateau;
};

const Ralliement = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    const joueur = plateau[joueurId];

    if (joueur.deck.length > 0) {
        const cartePiochee = joueur.deck.pop();
        joueur.main.push(cartePiochee);
    }
    
    return plateau;
};

const CorDeChasse = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    const joueur = plateau[joueurId];
    
    if (joueur.lignes[ligne]) {
        joueur.lignes[ligne].corDeChasse = true;
    }
    
    return plateau;
};

const Incineration = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    let maxForce = 0;
    const cibles = [];
    const lignes = ['Melee', 'Ranged', 'Siege'];

    if (typeof calculerForceUnite !== 'function') {
        console.error("Erreur critique : Incineration nécessite la fonction globale calculerForceUnite.");
        return plateau;
    }

    // 1. Trouver la force maximale parmi toutes les unités non-Héros
    for (const joueurId_all of ['joueur1', 'joueur2']) {
        lignes.forEach(ligneName => {
            const ligne = plateau[joueurId_all].lignes[ligneName];
            
            ligne.unites.forEach(unite => {
                if (unite.capacite !== 'Héros' && unite.isHero !== true) {
                    let forceAjustee = calculerForceUnite(unite, ligne.modificateurMeteo); 
                    
                    if (ligne.corDeChasse === true) {
                        forceAjustee *= 2; 
                    }

                    if (forceAjustee > maxForce) {
                        maxForce = forceAjustee;
                        cibles.length = 0; 
                        cibles.push({ joueurId: joueurId_all, ligneName, unite });
                    } else if (forceAjustee === maxForce && maxForce > 0) {
                        cibles.push({ joueurId: joueurId_all, ligneName, unite });
                    }
                }
            });
        });
    }

    // 2. Détruire toutes les cibles
    cibles.forEach(cible => {
        const ligneUnites = plateau[cible.joueurId].lignes[cible.ligneName].unites;
        const index = ligneUnites.findIndex(u => u.uniqueId === cible.unite.uniqueId);
        if (index !== -1) {
            const carteDetruite = ligneUnites.splice(index, 1)[0];
            plateau[cible.joueurId].defausse.push(carteDetruite);
        }
    });

    return plateau;
};


const Leurre = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    const joueur = plateau[joueurId];
    
    if (!cibleUniqueId || !ligne) {
        throw new Error("Leurre nécessite un ID de carte cible et une ligne.");
    }
    
    const ligneUnites = joueur.lignes[ligne].unites;
    
    // 1. Trouver l'unité ciblée sur le plateau
    const indexCible = ligneUnites.findIndex(u => u.uniqueId === cibleUniqueId);
    
    if (indexCible !== -1) {
        const carteCible = ligneUnites.splice(indexCible, 1)[0];
        joueur.main.push(carteCible);
        
        // 4. Placer la carte Leurre (la carte jouée) à la place de l'unité retirée
        ligneUnites.splice(indexCible, 0, carte); 
    } else {
        throw new Error("Carte cible non trouvée sur la ligne spécifiée pour Leurre.");
    }

    return plateau;
};


const Medecin = (carte, plateau, ligne, joueurId, cibleUniqueId) => {
    const joueur = plateau[joueurId];

    if (!cibleUniqueId) {
        return plateau;
    }
    
    // 1. Trouver et retirer la carte ciblée de la défausse
    const indexCible = joueur.defausse.findIndex(c => c.uniqueId === cibleUniqueId);
    
    if (indexCible !== -1) {
        const carteCible = joueur.defausse.splice(indexCible, 1)[0];
        joueur.main.push(carteCible);
    } 

    return plateau;
};

/**
 * Fonction générique pour la capacité du Chef (simule un Cor de Chasse).
 * @param {object} carteChef - La carte Chef.
 * @param {object} plateau - L'état actuel du plateau de jeu.
 * @param {string} ligne - La ligne ciblée par la capacité (Melee, Ranged, ou Siege).
 * @param {string} joueurId - L'ID du joueur actif.
 * @returns {object} Le plateau mis à jour.
 */
const ChefGenerique = (carteChef, plateau, ligne, joueurId) => {
    const joueur = plateau[joueurId];
    
    if (joueur.lignes[ligne]) {
        // Applique l'effet Cor de Chasse sur la ligne ciblée
        joueur.lignes[ligne].corDeChasse = true;
    }
    
    // NOTE : La gestion du drapeau "utilise" est faite dans le moteur.
    return plateau;
}


// --- Mappage des Capacités aux Fonctions ---

const capaciteToFunction = {
    'Aucune': Aucune,
    'Héros': Aucune, 
    'Espion': Espion,
    'Ralliement': Ralliement,
    'Médecin': Medecin,
    'Météo': Meteo,
    'Temps Dégagé': clearAllWeather,
    'Cor de Chasse': CorDeChasse,
    'Incinération': Incineration,
    'Leurre': Leurre, 
    'Morale': Morale, // Ajout de la capacité Morale
    'Chef': ChefGenerique, // Ajout du Chef
};


// --- Génération de la Population de Cartes ---

let globalCardId = 1;

function generateUniqueCardInstances() {
    if (typeof gwentCardData === 'undefined') {
        console.error("Erreur: gwentCardData n'est pas défini. Assurez-vous que gwent_info_carte2.js est chargé.");
        return [];
    }

    const population = [];

    gwentCardData.forEach(template => {
        let actionKey = template.capacite;
        
        // Normalisation/Correction
        if (template.nom === "Temps Dégagé") { actionKey = 'Temps Dégagé'; }
        if (template.nom === "Cor de Chasse") { actionKey = 'Cor de Chasse'; }
        if (template.nom === "Incinération") { actionKey = 'Incinération'; }
        if (template.nom === "Leurre") { actionKey = 'Leurre'; }
        
        // Gérer les Héros
        if (template.isHero === true) {
            if (template.capacite === 'Médecin') actionKey = 'Médecin';
            if (template.capacite === 'Ralliement') actionKey = 'Ralliement';
            // Le chef a le type 'Chef' et la capacité 'Chef'
            if (template.type === 'Chef') actionKey = 'Chef'; 
            if (template.capacite === 'Héros') actionKey = 'Aucune';
        }

        // Cas particulier de Morale (si la carte info utilise ce nom)
        if (template.capacite === 'Morale') { actionKey = 'Morale'; }
        
        const actionFunction = capaciteToFunction[actionKey] || capaciteToFunction['Aucune'];

    for (let i = 1; i <= template.max_copies; i++) { // ATTENTION : On commence la boucle à i=1 pour le suffixe
        const lignesValides = Array.isArray(template.ligne) ? template.ligne : (template.ligne ? [template.ligne] : []);
        
        // Cloner la fonction actionFunction si nécessaire (si elle est définie dans la boucle, ce n'est pas nécessaire)
        const actionFunction = capaciteToFunction[actionKey] || capaciteToFunction['Aucune'];
        
        const instance = {
            ...template,
            ligne: lignesValides,
            // CORRECTION CRUCIALE : Ajout du suffixe de copie -${i} pour le test de Lien Fraternel.
            uniqueId: `card-${template.id}-${i}`, 
            actionKey: actionKey, 
            appliquerEffet: function(plateau, ligne, joueurId, cibleUniqueId = null) {
                // On passe toujours cibleUniqueId, même si c'est null
                return actionFunction(this, plateau, ligne, joueurId, cibleUniqueId);
            }
        };
        // C'est ici que l'ID global est incrémenté pour s'assurer que CHAQUE ID est unique, même si on le n'utilise pas dans le nom.
        globalCardId++; 
        population.push(instance);
    }
    });
    return population;
}

const ALL_CARD_INSTANCES = generateUniqueCardInstances();


function getChefCard(royaume) {
    if (typeof gwentCardData === 'undefined') return null;
    
    // Utiliser ALL_CARD_INSTANCES car elles ont la fonction appliquerEffet
    const chefsPotentiels = ALL_CARD_INSTANCES.filter(c => 
        c.royaume === royaume && c.type === 'Chef' && c.max_copies === 1
    );
    
    if (chefsPotentiels.length > 0) {
        const randomIndex = Math.floor(Math.random() * chefsPotentiels.length);
        // Ajout du drapeau 'utilise' pour le moteur
        return { ...chefsPotentiels[randomIndex], utilise: false }; 
    }

    return null;
}
