// Ce fichier utilise les fonctions globales mettreAJourScores et capaciteToFunction
// (supposées globales et définies dans gwent_moteur.js et gwent_population.js).

class GwentAI {
    
    /**
     * Utilitaire pour copier profondément le plateau.
     */
    static deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Choisit la meilleure action à effectuer (jouer une carte, utiliser le Chef, ou passer).
     */
    static chooseAction(plateau, joueurId) {
        const joueur = plateau[joueurId];
        const adversaireId = joueurId === 'joueur1' ? 'joueur2' : 'joueur1';
        const lignes = ['Melee', 'Ranged', 'Siege'];

        let meilleurScoreEcart = -Infinity;
        let meilleureAction = { action: 'PASS' };

        // 1. Logique pour PASSER (Stratégie de base)
        if (plateau[adversaireId].aPasseSonTour && joueur.scoreTotal > plateau[adversaireId].scoreTotal) {
             return { action: 'PASS' };
        }
        
        // Utilitaires de cibles (pour Leurre)
        const unitesAllieesNonHero = [];
        lignes.forEach(l => {
            joueur.lignes[l].unites.filter(u => u.capacite !== 'Héros' && u.isHero !== true).forEach(u => {
                unitesAllieesNonHero.push({ ...u, ligne: l }); 
            });
        });


        // --- 2. Simuler l'utilisation de la CAPACITÉ DU CHEF ---
        const carteChef = joueur.carteChef;
        if (!carteChef.utilise) {
            
            // Simuler l'effet pour chaque ligne possible (Chef générique = Cor de Chasse)
            lignes.forEach(ligne => {
                const plateauSimule = GwentAI.deepCopy(plateau);
                const joueurSimule = plateauSimule[joueurId];
                
                try {
                    const actionFunction = capaciteToFunction['Chef']; 
                    
                    // Appliquer l'effet (Cor de Chasse)
                    plateauSimule = actionFunction(carteChef, plateauSimule, ligne, joueurId);

                    // Marquer l'usage
                    joueurSimule.carteChef.utilise = true;
                    
                    // Mettre à jour les scores (après Cor de Chasse virtuel)
                    mettreAJourScores(plateauSimule);
                    
                    const ecart = plateauSimule[joueurId].scoreTotal - plateauSimule[adversaireId].scoreTotal;

                    if (ecart > meilleurScoreEcart) {
                        meilleurScoreEcart = ecart;
                        meilleureAction = {
                            action: 'LEADER', // Nouvelle action
                            ligne: ligne,
                        };
                    }
                } catch (e) {
                    // Ignorer si le Chef ne peut pas être utilisé
                }
            });
        }


        // --- 3. Simuler toutes les cartes jouables ---
        joueur.main.forEach(carte => {
            const isSpecial = carte.type === 'Spécial';
            const isMedic = carte.capacite === 'Médecin';
            const isDecoy = carte.capacite === 'Leurre';

            let ciblesPossibles = [{ uniqueId: null, ligne: null, force: 0 }]; 
            let lignesPossibles = [];

            // A. Déterminer les cibles et lignes possibles
            if (isMedic) {
                const nonHeroDefausse = joueur.defausse.filter(c => c.capacite !== 'Héros' && c.isHero !== true);
                if (nonHeroDefausse.length === 0) return; 

                const meilleureCible = nonHeroDefausse.reduce((max, c) => (c.force > max.force ? c : max), nonHeroDefausse[0]);
                ciblesPossibles = [meilleureCible];
                lignesPossibles = carte.ligne.includes('Agile') ? lignes : carte.ligne;

            } else if (isDecoy) {
                if (unitesAllieesNonHero.length === 0) return; 
                ciblesPossibles = unitesAllieesNonHero; 
                lignesPossibles = [null]; 
                
            } else if (isSpecial) {
                if (carte.nom === 'Cor de Chasse') { lignesPossibles = lignes; } 
                else if (carte.capacite === 'Météo') { lignesPossibles = [carte.ligne]; } 
                else if (carte.nom === 'Temps Dégagé' || carte.nom === 'Incinération') { lignesPossibles = ['Melee']; } 
            } else {
                // Unités standard (inclut Morale, Espion, Ralliement, Aucune)
                lignesPossibles = carte.ligne.includes('Agile') ? lignes : carte.ligne;
            }
            
            // B. Simuler le jeu pour chaque ligne/cible possible
            ciblesPossibles.forEach(cible => {
                const cibleUniqueId = cible.uniqueId;
                
                let lignesPourSimulation = [];
                if (isDecoy) {
                    if (cible.ligne) lignesPourSimulation = [cible.ligne];
                } else {
                    lignesPourSimulation = lignesPossibles;
                }

                lignesPourSimulation.forEach(ligne => {
                    if (!ligne) return; 
                    
                    const plateauSimule = GwentAI.deepCopy(plateau);
                    const joueurSimule = plateauSimule[joueurId];

                    try {
                        const indexCarte = joueurSimule.main.findIndex(c => c.uniqueId === carte.uniqueId);
                        if (indexCarte === -1) return; 

                        const carteJouee = joueurSimule.main.splice(indexCarte, 1)[0];
                        let plateauApresEffet = plateauSimule;
                        const actionFunction = capaciteToFunction[carteJouee.actionKey];

                        // 3.1 Simuler l'effet
                        if (carteJouee.type === 'Spécial') {
                            plateauApresEffet = actionFunction(carteJouee, plateauApresEffet, ligne, joueurId, cibleUniqueId);
                            
                            if (carteJouee.capacite !== 'Météo' && carteJouee.capacite !== 'Temps Dégagé' && carteJouee.capacite !== 'Leurre') {
                                plateauApresEffet.joueur1.defausse.push(carteJouee); 
                            }
                        } else { 
                            if (carteJouee.capacite !== 'Espion') {
                                plateauApresEffet[joueurId].lignes[ligne].unites.push(carteJouee);
                            }
                            plateauApresEffet = actionFunction(carteJouee, plateauApresEffet, ligne, joueurId, cibleUniqueId);
                        }
                        
                        // 3.2 Mettre à jour les scores
                        if (typeof mettreAJourScores === 'function') {
                            mettreAJourScores(plateauApresEffet); 
                        } else {
                            return;
                        }

                        // 3.3 Évaluer le coup : différence de score
                        const ecart = plateauApresEffet[joueurId].scoreTotal - plateauApresEffet[adversaireId].scoreTotal;

                        // 3.4 Mettre à jour la meilleure action
                        if (ecart > meilleurScoreEcart) {
                            meilleurScoreEcart = ecart;
                            meilleureAction = {
                                action: 'PLAY',
                                carteUniqueId: carte.uniqueId,
                                ligne: ligne,
                                cibleUniqueId: cibleUniqueId, 
                            };
                        }
                    } catch (e) {
                        // Ignorer les coups qui provoquent des erreurs
                    }
                });
            });
        });

        // 4. Décision finale : Jouer le meilleur coup, utiliser le Chef, ou Passer ?
        const scoreActuelEcart = joueur.scoreTotal - plateau[adversaireId].scoreTotal;
        const mainAdverse = plateau[adversaireId].main.length;

        // On joue ou on utilise le chef si ça améliore l'écart de score actuel.
        if (meilleurScoreEcart > scoreActuelEcart) {
            return meilleureAction;
        }

        // Si rien n'améliore et que l'adversaire n'a pas passé, on passe pour conserver les cartes.
        if (joueur.main.length <= mainAdverse) {
            return { action: 'PASS' };
        }
        
        return meilleureAction;
    }
}
