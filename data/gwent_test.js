// gwent_test.js (Version finale avec corrections de portée et de synchronisation)

let currentEngine; // La référence à l'instance du moteur pour la partie en cours
let LogHistorique = [];
let globalSuccess = true; // Variable globale pour suivre le succès


// =========================================================================
// --- 1. FONCTIONS UTILITAIRES DE LOGGING ---
// =========================================================================

/**
 * Crée une copie profonde (clone) d'un objet (utilisé pour les cartes de test).
 */
function deepClone(obj) {
    // Note: Cela ne clone pas les fonctions comme 'appliquerEffet', mais ça suffit pour nos objets cartes simples
    return JSON.parse(JSON.stringify(obj)); 
}

/**
 * Fonction utilitaire pour logguer à l'écran et en historique.
 */
function logToScreen(message) {
    LogHistorique.push(message);
    const outputLog = document.getElementById('outputLog');
    if (outputLog) {
        outputLog.textContent += message + '\n';
        outputLog.scrollTop = outputLog.scrollHeight;
    } else {
        console.log(message);
    }
}

/**
 * Log un résultat de test unitaire.
 * @param {boolean} success - Si le test a réussi.
 * @param {string} name - Le nom du test.
 * @param {number} expected - La valeur attendue.
 * @param {number} obtained - La valeur obtenue.
 * @param {string} logMessage - Message d'erreur supplémentaire.
 */
function logTestResult(success, name, expected = null, obtained = null, logMessage = null) {
    const status = success ? 'SUCCÈS' : 'ÉCHEC';
    let message = `[${status}] ${name}`;
    
    if (expected !== null && obtained !== null) {
        message += `: Attendu ${expected}, Obtenu ${obtained}`;
    } else if (logMessage) {
        message += `: ${logMessage}`;
    }
    
    logToScreen(message);
    
    // Suivi des échecs globaux
    if (!success) {
        globalSuccess = false;
        if (logMessage && logMessage.startsWith('Erreur d\'exécution:')) {
            logToScreen(`  ${logMessage}`);
        }
    }
}

// =========================================================================
// --- 2. FONCTION DE PRÉPARATION DU PLATEAU (RESET) ---
// =========================================================================

/**
 * Prépare un plateau propre pour le test, y compris des cartes spécifiques dans la main de J1.
 * @returns {object|null} Un plateau de jeu initialisé ou null en cas d'erreur.
 */
// Dans gwent_test.js

/**
 * Prépare un plateau propre pour le test, y compris des cartes spécifiques dans la main de J1.
 * @returns {object|null} Un plateau de jeu initialisé ou null en cas d'erreur.
 */
function resetPlateau() {
    let deck1Data = null;
    let deck2Data = null;
    let plateau = null;
    
    try {
        // NOTE: Assurez-vous que DeckBuilder, createInitialPlateau existent globalement
        const deckBuilder = new DeckBuilder();
        deck1Data = deckBuilder.buildDeck('Royaumes du Nord', 3);
        deck2Data = deckBuilder.buildDeck('Monstres', 1);
        plateau = createInitialPlateau(deck1Data.chef, deck1Data.deck, deck2Data.chef, deck2Data.deck);
    } catch (e) {
        logToScreen(`ERREUR FATALE: Impossible de créer le plateau. Vérifiez DeckBuilder. ${e.message}`);
        return null;
    }
    
    if (!plateau) return null;
    
    // Vider la main et le deck de J1
    plateau.joueur1.main.length = 0;
    plateau.joueur1.deck.length = 0; 

    // --- CARACTÉRISTIQUES DE TEST (Recherche et CLONAGE) ---
    const cardsToFind = [
        { name: "Agile (Capacité)", search: () => ALL_CARD_INSTANCES.find(c => c.ligne.includes('Agile') && c.type === 'Unité') },
        { name: "Morale (Capacité)", search: () => ALL_CARD_INSTANCES.find(c => c.capacite === 'Morale' && c.type === 'Unité') },
        { name: "Lien Fraternel (Modèle)", search: () => ALL_CARD_INSTANCES.filter(c => c.capacite === 'Lien Fraternel')[0] },
        { name: "Héros (Neutre)", search: () => ALL_CARD_INSTANCES.find(c => c.capacite === 'Héros' && c.royaume === 'Neutre') },
        { name: "Unité Normale (Force 5)", search: () => ALL_CARD_INSTANCES.find(c => c.capacite === 'Aucune' && c.ligne.includes('Melee') && c.force === 5) },
        { name: "Unité Forte (Force >= 10)", search: () => ALL_CARD_INSTANCES.find(c => c.capacite === 'Aucune' && c.ligne.includes('Melee') && c.force >= 10) },
        { name: "Cor de Chasse (Nom)", search: () => ALL_CARD_INSTANCES.find(c => c.nom === 'Cor de Chasse') },
        { name: "Météo (Melee)", search: () => ALL_CARD_INSTANCES.find(c => c.capacite === 'Météo' && c.ligne.includes('Melee')) },
        { name: "Incinération (Capacité)", search: () => ALL_CARD_INSTANCES.find(c => c.capacite === 'Incinération') },
        { name: "Temps Dégagé (Capacité)", search: () => ALL_CARD_INSTANCES.find(c => c.capacite === 'Temps Dégagé') },
    ];

    const foundCards = {};
    let missingCardName = null;

    for (const card of cardsToFind) {
        foundCards[card.name] = card.search();
        if (!foundCards[card.name]) {
            missingCardName = card.name;
            break;
        }
    }

    const fraternelTemplate = foundCards["Lien Fraternel (Modèle)"];
    let fraternelCard1 = null;
    let fraternelCard2 = null;
    if (fraternelTemplate) {
        // Pour les cartes Lien Fraternel, on prend des instances uniques (ID se terminant par 1 et 2)
        fraternelCard1 = ALL_CARD_INSTANCES.find(c => c.nom === fraternelTemplate.nom && c.uniqueId.endsWith('1'));
        fraternelCard2 = ALL_CARD_INSTANCES.find(c => c.nom === fraternelTemplate.nom && c.uniqueId.endsWith('2'));
    }
    
    // Vérification finale
    if (missingCardName || !fraternelCard1 || !fraternelCard2) {
        logToScreen("--- ÉCHEC DU SETUP DU TEST ---");
        if (missingCardName) { logToScreen(`  CARTE MANQUANTE : ${missingCardName}`); } 
        else if (!fraternelCard1 || !fraternelCard2) { logToScreen(`  CARTE MANQUANTE : Lien Fraternel (Instance unique)`); }
        return null;
    }

    // CLONAGE PROFOND OBLIGATOIRE avant l'insertion dans la main pour isoler les états de carte.
    // Si la carte a déjà été jouée (Mulligan ou précédent Test), l'objet original est corrompu.
    var agileCard = deepClone(foundCards["Agile (Capacité)"]);
    var moraleCard = deepClone(foundCards["Morale (Capacité)"]);
    var heros = deepClone(foundCards["Héros (Neutre)"]);
    var uniteNormale = deepClone(foundCards["Unité Normale (Force 5)"]);
    var uniteForte = deepClone(foundCards["Unité Forte (Force >= 10)"]);
    var corDeChasse = deepClone(foundCards["Cor de Chasse (Nom)"]);
    var meteo = deepClone(foundCards["Météo (Melee)"]);
    var incineration = deepClone(foundCards["Incinération (Capacité)"]);
    var tempsDegage = deepClone(foundCards["Temps Dégagé (Capacité)"]);
    
    // Le Lien Fraternel a déjà des ID uniques, donc on le clone aussi par précaution
    fraternelCard1 = deepClone(fraternelCard1);
    fraternelCard2 = deepClone(fraternelCard2);

    // Insertion des cartes dans la main J1
    plateau.joueur1.main.push(
        agileCard, // 0 
        moraleCard, // 1 
        fraternelCard1, // 2 
        fraternelCard2, // 3 
        uniteNormale, // 4 
        corDeChasse, // 5 
        meteo, // 6 
        heros, // 7 
        uniteForte, // 8 
        incineration, // 9 
        tempsDegage // 10 
    );
    
    // Carte pour le Mulligan (doit être un nouvel objet)
    plateau.joueur1.deck.push(deepClone({ 
        uniqueId: 'card-mulligan-test', 
        nom: 'Carte Piochee', 
        force: 1, 
        capacite: 'Aucune', 
        type: 'Unité', 
        ligne: ['Melee'], 
        appliquerEffet: function(p) { return p; } 
    }));

    plateau.joueur1.carteChef = deck1Data.chef; 
    
    // Assurer que J2 a des cartes (clonées)
    if (plateau.joueur2.main.length < 5) {
         plateau.joueur2.main.push(deepClone(uniteForte), deepClone(uniteNormale), deepClone(agileCard));
    }

    return plateau;
}

// =========================================================================
// --- 3. FONCTION DE TESTS UNITAIRES ---
// =========================================================================

/**
 * Exécute tous les tests unitaires des capacités et des mécaniques de base.
 */
function testUnitaireCapacites() {
    logToScreen("--- Démarrage des Tests Unitaires (Capacités & Mécaniques) ---");
    
    globalSuccess = true;
    let plateau = resetPlateau();
    
    if (!plateau) {
        return false;
    }

    // Récupérer les ID uniques (Stables) de la main de J1 AVANT tout jeu.
    const mainJ1IDs = plateau.joueur1.main.map(c => c.uniqueId);

    // Initialisation du Moteur de jeu
    let engine = new GwentEngine(plateau); 

    // --- TEST 1 : Mulligan (Échange/Compteur) ---
    try {
        const mulliganResult = engine.mulliganCard(mainJ1IDs[0]); 
        plateau = mulliganResult.plateau;
        
        const carteRenvoyeeAbsente = !plateau.joueur1.main.some(c => c.uniqueId === mainJ1IDs[0]);
        const mulliganRestantsOK = plateau.joueur1.mulligansRestants === 1; 

        logTestResult(carteRenvoyeeAbsente && mulliganRestantsOK, 
                      `Mulligan (Échange/Compteur)`, 
                      '1 carte échangée, 1 mulligan restant', 
                      `Main J1 taille: ${plateau.joueur1.main.length}`);
    } catch (e) {
        logTestResult(false, `Mulligan (Échange/Compteur)`, null, null, `Erreur d'exécution: ${e.message}`);
    }

    // --- RE-INITIALISATION POUR LES TESTS DE JEU (état propre requis) ---
    plateau = resetPlateau(); 
    engine = new GwentEngine(plateau); 
    const mainJ1IDs2 = plateau.joueur1.main.map(c => c.uniqueId); 

    // *** VÉRIFICATION DE DÉBOGAGE ***
    logToScreen(`[DEBUG] Main J1 après Reset: ${plateau.joueur1.main.length} cartes. ID recherché pour Test 2: ${mainJ1IDs2[4]}`);
    logToScreen(`[DEBUG] Carte trouvée dans main: ${plateau.joueur1.main.some(c => c.uniqueId === mainJ1IDs2[4]) ? 'OUI' : 'NON'}`);


    // --- TEST 2 : Unité Normale (5) ---
    try {
        const result = engine.playCard(mainJ1IDs2[4], 'Melee'); 
        plateau = result.plateau;
        mettreAJourScores(plateau); 
        logTestResult(plateau.joueur1.scoreTotal === 5, "Unité Normale (5)", 5, plateau.joueur1.scoreTotal);
    } catch (e) {
        logTestResult(false, "Unité Normale (5)", null, null, `Erreur d'exécution: ${e.message}`);
    }

    // --- TEST 3 : Morale (1) + Boost ---
    try {
        const result = engine.playCard(mainJ1IDs2[1], 'Melee');
        plateau = result.plateau;
        mettreAJourScores(plateau); 
        logTestResult(plateau.joueur1.scoreTotal === 8, "Morale (1) + Boost", 8, plateau.joueur1.scoreTotal);
    } catch (e) {
        logTestResult(false, "Morale (1) + Boost", null, null, `Erreur d'exécution: ${e.message}`);
    }


    // --- TEST 4 : Agile (3) + Placement Ranged ---
    try {
        const result = engine.playCard(mainJ1IDs2[0], 'Ranged');
        plateau = result.plateau;
        mettreAJourScores(plateau);
        logTestResult(plateau.joueur1.scoreTotal === 12, "Agile (3) + Placement Ranged", 12, plateau.joueur1.scoreTotal);
    } catch (e) {
        logTestResult(false, "Agile (3) + Placement Ranged", null, null, `Erreur d'exécution: ${e.message}`);
    }


    // --- RE-INITIALISATION POUR LES TESTS DE LIEN FRATERNEL ---
    plateau = resetPlateau(); 
    engine = new GwentEngine(plateau); 
    const mainJ1IDs3 = plateau.joueur1.main.map(c => c.uniqueId);

    // 5a. Lien Fraternel (1/2)
    try {
        const result = engine.playCard(mainJ1IDs3[2], 'Melee'); 
        plateau = result.plateau;
        mettreAJourScores(plateau);
        logTestResult(plateau.joueur1.scoreTotal === 4, "Lien Fraternel (1/2)", 4, plateau.joueur1.scoreTotal);
    } catch (e) {
        logTestResult(false, "Lien Fraternel (1/2)", null, null, `Erreur d'exécution: ${e.message}`);
    }

    // 5b. Lien Fraternel (2/2)
    try {
        const result = engine.playCard(mainJ1IDs3[3], 'Melee'); 
        plateau = result.plateau;
        mettreAJourScores(plateau);
        logTestResult(plateau.joueur1.scoreTotal === 16, "Lien Fraternel (2/2) + Boost", 16, plateau.joueur1.scoreTotal);
    } catch (e) {
        logTestResult(false, "Lien Fraternel (2/2) + Boost", null, null, `Erreur d'exécution: ${e.message}`);
    }


    // --- TEST 6 : Cor de Chasse (Spécial) ---
    try {
        const result = engine.playCard(mainJ1IDs3[5], 'Melee'); 
        plateau = result.plateau;
        mettreAJourScores(plateau);
        logTestResult(plateau.joueur1.scoreTotal === 32, "Cor de Chasse (Spécial)", 32, plateau.joueur1.scoreTotal);
    } catch (e) {
        logTestResult(false, "Cor de Chasse (Spécial)", null, null, `Erreur d'exécution: ${e.message}`);
    }


    // --- RE-INITIALISATION POUR LES TESTS DE MÉTÉO/INCINÉRATION ---
    plateau = resetPlateau(); 
    engine = new GwentEngine(plateau); 
    const mainJ1IDs4 = plateau.joueur1.main.map(c => c.uniqueId);

    // Setup : Héros(15) et Unité Forte(10) sur Melee
    engine.playCard(mainJ1IDs4[7], 'Melee'); 
    engine.playCard(mainJ1IDs4[8], 'Melee'); 
    mettreAJourScores(plateau);
    logTestResult(plateau.joueur1.scoreTotal === 25, "Setup (Héros+Forte)", 25, plateau.joueur1.scoreTotal);


    // 7a. MÉTÉO (Melee)
    try {
        const result = engine.playCard(mainJ1IDs4[6], 'Melee'); 
        plateau = result.plateau;
        mettreAJourScores(plateau);
        logTestResult(plateau.joueur1.scoreTotal === 16, "MÉTÉO (Melee)", 16, plateau.joueur1.scoreTotal);
    } catch (e) {
        logTestResult(false, "MÉTÉO (Melee)", null, null, `Erreur d'exécution: ${e.message}`);
    }


    // 7b. Incinération (Scorch)
    try {
        // Simuler J2 pour que l'incinération cible J1
        plateau.joueurActifId = 'joueur2';
        engine.playCard(mainJ1IDs4[9], 'Melee'); 
        plateau.joueurActifId = 'joueur1'; 
        mettreAJourScores(plateau);
        
        const uniteRestante = plateau.joueur1.lignes.Melee.unites.length === 1 && plateau.joueur1.lignes.Melee.unites[0].capacite === 'Héros';
        logTestResult(plateau.joueur1.scoreTotal === 15 && uniteRestante, 
                      "Incinération (Scorch)", 
                      15, 
                      plateau.joueur1.scoreTotal,
                      uniteRestante ? 'Unité Héros restante' : 'Erreur de destruction');

    } catch (e) {
        logTestResult(false, "Incinération (Scorch)", null, null, `Erreur d'exécution: ${e.message}`);
    }


    // 7c. Temps Dégagé (Clear Weather)
    try {
        engine.playCard(mainJ1IDs4[10], 'Melee'); 
        mettreAJourScores(plateau);
        
        const tempsDegagePass = plateau.joueur1.lignes.Melee.modificateurMeteo === 1 && plateau.cartesMeteoActives.length === 0;
        logTestResult(plateau.joueur1.scoreTotal === 15 && tempsDegagePass, 
                      "Temps Dégagé (Clear Weather)", 
                      15, 
                      plateau.joueur1.scoreTotal,
                      tempsDegagePass ? 'Météo retirée' : 'Météo non retirée');
                      
    } catch (e) {
        logTestResult(false, "Temps Dégagé (Clear Weather)", null, null, `Erreur d'exécution: ${e.message}`);
    }


    logToScreen("--- Fin des Tests Unitaires ---");
    return globalSuccess;
}

// =========================================================================
// --- 4. FONCTIONS SCÉNARIO ET LANCEMENT (runAllTests) ---
// =========================================================================

/**
 * Simule une partie complète IA vs IA.
 */
async function testScenarioComplet() {
    logToScreen("\n--- Démarrage du Scénario Complet (IA vs IA) ---");
    
    const initialPlateau = resetPlateau();
    if (!initialPlateau) { 
        logToScreen("Scénario non lancé car le plateau initial n'est pas valide.");
        return false; 
    }
    currentEngine = new GwentEngine(initialPlateau);

    const maxTours = 200; 
    let tour = 0;
    let isGameOver = false;

    // Phase de Mulligan (simulée pour l'IA)
    try {
        currentEngine.plateau.joueurActifId = 'joueur2';
        currentEngine.mulliganCard(currentEngine.plateau.joueur2.main[0].uniqueId);
        currentEngine.mulliganCard(currentEngine.plateau.joueur2.main[0].uniqueId); 
        currentEngine.plateau.joueurActifId = 'joueur1'; // Rétablir le joueur actif
        logToScreen("Mulligan J2 effectué (2 cartes échangées).");
    } catch(e) {
         logToScreen(`AVERTISSEMENT: Mulligan J2 impossible. ${e.message}`);
    }


    while (!isGameOver && tour < maxTours) {
        const joueurActifId = currentEngine.plateau.joueurActifId;
        const joueurPassifId = joueurActifId === 'joueur1' ? 'joueur2' : 'joueur1';
        
        let action;
        try {
            action = GwentAI.chooseAction(currentEngine.plateau, joueurActifId);
        } catch(e) {
            logToScreen(`ERREUR FATALE IA: ${e.message}`);
            break;
        }

        let result;
        if (action.action === 'PLAY') {
            try {
                result = currentEngine.playCard(action.carteUniqueId, action.ligne, action.cibleUniqueId);
            } catch (e) {
                logToScreen(`ERREUR: ${joueurActifId} n'a pas pu jouer la carte ${action.carteUniqueId}. Erreur: ${e.message}`);
                action.action = 'PASS';
            }
        }
        
        if (action.action === 'LEADER') {
            try {
                result = currentEngine.useLeaderAbility(action.ligne);
                currentEngine.plateau.joueurActifId = joueurActifId; 
            } catch (e) {
                logToScreen(`ERREUR: ${joueurActifId} n'a pas pu utiliser le Chef. Erreur: ${e.message}`);
                action.action = 'PASS';
            }
        }

        if (action.action === 'PASS') {
            currentEngine.plateau[joueurActifId].aPasseSonTour = true;
            result = currentEngine.checkRoundEnd(); 
            logToScreen(`${joueurActifId} PASSE. Scores: J1: ${currentEngine.plateau.joueur1.scoreTotal} | J2: ${currentEngine.plateau.joueur2.scoreTotal}`);

            if (result.isRoundOver) {
                if (result.isGameOver) {
                    isGameOver = true;
                } else {
                    currentEngine.plateau.joueurActifId = joueurActifId === 'joueur1' ? 'joueur2' : 'joueur1';
                }
            } else {
                currentEngine.plateau.joueurActifId = joueurPassifId;
            }
        }
        
        if (result && result.log) {
             logToScreen(result.log);
        }

        tour++;
        
        if (currentEngine.plateau.joueur1.aPasseSonTour && currentEngine.plateau.joueur2.aPasseSonTour) {
             const endResult = currentEngine.checkRoundEnd();
             logToScreen(endResult.log);
             if (endResult.isGameOver) {
                 isGameOver = true;
             }
        }
    }
    
    const j1Final = currentEngine.plateau.joueur1;
    const j2Final = currentEngine.plateau.joueur2;
    const scenarioPass = (j1Final.manchesGagnees === 2 || j2Final.manchesGagnees === 2);
    
    logToScreen(`\n--- Résultat Final: J1: ${j1Final.manchesGagnees} | J2: ${j2Final.manchesGagnees} ---`);
    logToScreen("--- Test de Scénario Complet : " + (scenarioPass ? "SUCCÈS (Partie terminée)" : "ÉCHEC (Partie non terminée ou erreur)"));
    
    return scenarioPass;
}

// --- FONCTION PRINCIPALE ---

function runAllTests() {
    document.getElementById('outputLog').textContent = '';
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');

    let unitTestSuccess = testUnitaireCapacites();
    
    if (unitTestSuccess) {
        testScenarioComplet().then(scenarioSuccess => {
             const globalResult = globalSuccess && scenarioSuccess; // Utiliser la variable globale
             logToScreen("\n*** TOUS LES TESTS TERMINÉS ***");
             logToScreen("Résultat Global: " + (globalResult ? "SUCCÈS" : "ÉCHEC"));
             if (loadingIndicator) loadingIndicator.classList.add('hidden');
        }).catch(e => {
            logToScreen(`ERREUR CRITIQUE dans le scénario: ${e.message}`);
            logToScreen("\n*** TOUS LES TESTS TERMINÉS ***");
            logToScreen("Résultat Global: ÉCHEC");
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
        });
    } else {
        logToScreen("\n*** TOUS LES TESTS TERMINÉS ***");
        logToScreen("Résultat Global: ÉCHEC (Tests Unitaires)");
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('runTestsBtn').addEventListener('click', runAllTests);
});
