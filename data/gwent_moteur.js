// Ce fichier utilise les fonctions et classes globales de gwent_population.js et gwent_deck.js.

/**
 * Calcule la force effective d'une unité, en tenant compte de la Météo.
 * @param {object} unite - L'objet carte unité.
 * @param {number} modificateurMeteo - 1 si pas d'effet Météo, 0 si Météo active.
 * @returns {number} La force de base ajustée.
 */
function calculerForceUnite(unite, modificateurMeteo) {
    let forceBase = unite.force;

    // Si modificateurMeteo est 0 (météo active) et ce n'est pas une carte Héros, la force devient 1
    if (unite.capacite !== 'Héros' && unite.isHero !== true && modificateurMeteo === 0) {
        forceBase = 1;
    }

    return forceBase;
}

/**
 * Calcule le score total d'une ligne en appliquant tous les modificateurs (Lien Fraternel, Cor de Chasse, Morale).
 * @param {object} ligne - L'objet ligne (Melee, Ranged, ou Siege).
 * @returns {number} Le score total de la ligne.
 */
function calculerScoreLigne(ligne) {
    let scoreTotal = 0;
    const unitesParNom = {};
    const unitesDansLigne = ligne.unites;
    
    // 1. Décompte initial des multiplicateurs
    const nombreUnitMorale = unitesDansLigne.filter(u => u.capacite === 'Morale').length;

    unitesDansLigne.forEach(u => {
        // Compte pour Lien Fraternel
        if (u.capacite === 'Lien Fraternel') {
            unitesParNom[u.nom] = (unitesParNom[u.nom] || 0) + 1;
        }
    });
    
    // 2. Calcul des forces finales
    unitesDansLigne.forEach(u => {
        // Force de base ajustée par la Météo
        let forceFinale = calculerForceUnite(u, ligne.modificateurMeteo);
        
        // Les héros ne reçoivent AUCUN bonus de Morale ou de Cor de Chasse
        if (u.capacite !== 'Héros' && u.isHero !== true) {
            
            // a) Application du Lien Fraternel
            if (u.capacite === 'Lien Fraternel' && unitesParNom[u.nom] >= 2) {
                // Le bonus est la force de base (non-Météo) multipliée par (N-1) cartes liées
                forceFinale += u.force * (unitesParNom[u.nom] - 1);
            }
            
            // b) Application de Morale
            let boostMorale = nombreUnitMorale;
            if (u.capacite === 'Morale') {
                // L'unité Morale elle-même est boostée par les AUTRES unités Morale
                boostMorale = Math.max(0, nombreUnitMorale - 1);
            }
            forceFinale += boostMorale;
            
            // c) Application du Cor de Chasse
            if (ligne.corDeChasse === true) {
                forceFinale *= 2;
            }
        }
        
        // Si c'est un Héros, on utilise juste la force ajustée par la Météo (qui est toujours la force de base)
        
        scoreTotal += forceFinale;
    });

    return scoreTotal;
}

/**
 * Met à jour le score total de chaque joueur pour la manche en cours.
 * Cette fonction doit être appelée après chaque coup.
 * @param {object} plateau - L'état actuel du plateau.
 */
function mettreAJourScores(plateau) {
    ['joueur1', 'joueur2'].forEach(joueurId => {
        const joueur = plateau[joueurId];
        let scoreManche = 0;

        ['Melee', 'Ranged', 'Siege'].forEach(ligneName => {
            scoreManche += calculerScoreLigne(joueur.lignes[ligneName]);
        });

        joueur.scoreTotal = scoreManche;
    });
}

class GwentEngine {
    constructor(initialPlateau) {
        this.plateau = initialPlateau;
        mettreAJourScores(this.plateau);
    }
    
    /**
     * Permet à un joueur d'échanger une carte de sa main contre une carte du dessus de son deck.
     * @param {string} carteUniqueId - L'ID unique de la carte à échanger.
     * @returns {object} { carteRenvoyee: object, cartePiochee: object }
     */
    mulliganCard(carteUniqueId) {
        const joueurId = this.plateau.joueurActifId;
        const joueur = this.plateau[joueurId];

        // Vérification du nombre de mulligans (hypothèse : 2 mulligans max par joueur dans le plateau)
        if (joueur.mulligansRestants === undefined || joueur.mulligansRestants <= 0) {
            throw new Error(`${joueurId} a épuisé ses mulligans.`);
        }
        
        // 1. Trouver et retirer la carte de la main
        const indexCarte = joueur.main.findIndex(c => c.uniqueId === carteUniqueId);
        if (indexCarte === -1) {
            throw new Error("Carte non trouvée dans la main pour le mulligan.");
        }
        const carteRenvoyee = joueur.main.splice(indexCarte, 1)[0];

        // 2. La carte renvoyée est mise dans le DECK (mais doit être mélangée plus tard)
        joueur.deck.push(carteRenvoyee);
        
        // 3. Piocher la nouvelle carte
        if (joueur.deck.length === 0) {
            // Ne pas planter si le deck est vide (situation anormale après pioche initiale)
            joueur.main.push(carteRenvoyee); // Remet la carte
            throw new Error("Le deck est vide, impossible de piocher.");
        }
        const cartePiochee = joueur.deck.pop();
        joueur.main.push(cartePiochee);

        // 4. Décrémenter le compteur et mélanger le deck (pour que la carte renvoyée ne soit pas piochée immédiatement)
        joueur.mulligansRestants--;
        
        // NOTE: Le mélange du deck doit idéalement se faire dans le DeckBuilder lors de la construction
        // ou ici si l'on veut simuler un mélange rapide après l'échange. 
        // Par souci de simplicité et de performance, nous n'implémenterons pas le mélange ici, 
        // mais c'est une étape à considérer pour un jeu complet.

        return { 
            plateau: this.plateau, 
            log: `${joueurId} a renvoyé ${carteRenvoyee.nom} et a pioché une nouvelle carte. ${joueur.mulligansRestants} mulligan(s) restant(s).`,
            carteRenvoyee: carteRenvoyee,
            cartePiochee: cartePiochee,
        };
    }
    
    /**
     * Joue une carte de la main. (La même que précédemment)
     */
    playCard(carteUniqueId, ligne, cibleUniqueId = null) {
        const joueurId = this.plateau.joueurActifId;
        const joueur = this.plateau[joueurId];
        
        // ... (Logique de playCard inchangée par rapport à la réponse précédente) ...
        // 1. Trouver et retirer la carte de la main
        const indexCarte = joueur.main.findIndex(c => c.uniqueId === carteUniqueId);
        if (indexCarte === -1) {
            throw new Error("Carte non trouvée dans la main.");
        }
        const carteJouee = joueur.main.splice(indexCarte, 1)[0];
        
        let log = `${joueurId} joue ${carteJouee.nom} (${carteJouee.capacite}) dans la ligne ${ligne}.`;

        // 2. Traitement des cartes Spéciales vs Unités
        if (carteJouee.type === 'Spécial') {
            
            if (carteJouee.capacite === 'Leurre') {
                if (!cibleUniqueId) {
                    joueur.main.push(carteJouee); 
                    throw new Error("La carte Leurre doit être jouée en sélectionnant une unité alliée à récupérer.");
                }
                this.plateau = carteJouee.appliquerEffet(this.plateau, ligne, joueurId, cibleUniqueId);
            } 
            else {
                this.plateau = carteJouee.appliquerEffet(this.plateau, ligne, joueurId, cibleUniqueId);
                
                if (carteJouee.capacite !== 'Météo' && carteJouee.capacite !== 'Temps Dégagé') {
                     this.plateau.joueur1.defausse.push(carteJouee); 
                }
            }
            
        } else { // C'est une carte Unité
            
            // 3. Placer l'unité sur le plateau AVANT l'effet, sauf pour Espion
            if (carteJouee.capacite !== 'Espion') {
                 
                // GESTION DE LA CAPACITÉ AGILE
                const isAgile = carteJouee.ligne.includes('Agile');
                const isLigneValide = isAgile || carteJouee.ligne.includes(ligne);
                
                if (!isLigneValide) {
                    joueur.main.push(carteJouee); 
                    throw new Error(`Ligne invalide pour ${carteJouee.nom}. Doit être ${carteJouee.ligne.join(' ou ')}.`);
                }
                
                joueur.lignes[ligne].unites.push(carteJouee);
            }

            // 4. Appliquer les effets d'unité (Espion, Ralliement, Médecin, Morale, etc.)
            this.plateau = carteJouee.appliquerEffet(this.plateau, ligne, joueurId, cibleUniqueId);
        }

        // 5. Mettre à jour les scores après l'action
        mettreAJourScores(this.plateau);
        
        // 6. Basculer le tour
        if (carteJouee.capacite !== 'Ralliement') {
            this.plateau.joueurActifId = joueurId === 'joueur1' ? 'joueur2' : 'joueur1';
        }

        return { plateau: this.plateau, log };
    }
    
    // ... (Reste de la classe GwentEngine, useLeaderAbility, et resetRoundState inchangés) ...
    
    useLeaderAbility(ligne) {
        const joueurId = this.plateau.joueurActifId;
        const joueur = this.plateau[joueurId];
        const carteChef = joueur.carteChef;

        if (carteChef.utilise) {
            throw new Error("La capacité du Chef a déjà été utilisée.");
        }
        
        if (!ligne || !['Melee', 'Ranged', 'Siege'].includes(ligne)) {
             throw new Error("Ligne invalide pour la capacité du Chef.");
        }

        this.plateau = carteChef.appliquerEffet(this.plateau, ligne, joueurId);
        joueur.carteChef.utilise = true;
        mettreAJourScores(this.plateau);

        return { plateau: this.plateau, log: `${joueurId} utilise la capacité de son Chef sur la ligne ${ligne}.` };
    }


    resetRoundState() {
        ['joueur1', 'joueur2'].forEach(joueurId => {
            const joueur = this.plateau[joueurId];
            
            ['Melee', 'Ranged', 'Siege'].forEach(ligneName => {
                const ligne = joueur.lignes[ligneName];
                joueur.defausse.push(...ligne.unites); 
                ligne.unites = [];
                ligne.corDeChasse = false;
                ligne.modificateurMeteo = 1;
            });
            
            if (joueur.deck.length > 0) {
                joueur.main.push(joueur.deck.pop());
            }

            joueur.scoreTotal = 0;
            joueur.aPasseSonTour = false;
            joueur.carteChef.utilise = false; 
            // NOTE : Le nombre de mulligans n'est pas réinitialisé ici, car il est par PARTIE
        });

        const defausseGlobale = this.plateau.joueur1.defausse;
        defausseGlobale.push(...this.plateau.cartesMeteoActives);
        this.plateau.cartesMeteoActives = [];
        
        // Le joueur qui a perdu la manche précédente commence la nouvelle (logique simplifiée)
        this.plateau.joueurActifId = 'joueur1'; 
    }
}
