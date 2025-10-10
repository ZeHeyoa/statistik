// Ce fichier est chargé après gwent_population.js, il peut donc utiliser ALL_CARD_INSTANCES et getChefCard.

class DeckBuilder {
    
    constructor() {
        // Utilise la variable globale ALL_CARD_INSTANCES définie dans gwent_population.js
        this.allCardInstances = ALL_CARD_INSTANCES; 
    }

    buildDeck(royaume, herosToKeep) {
        // Filtre les cartes pour le royaume choisi + les cartes neutres
        let deck = this.allCardInstances.filter(c => c.royaume === royaume || c.royaume === 'Neutre');
        
        // Sélectionne la carte Chef et l'enlève du deck
        const chefCard = getChefCard(royaume);
        deck = deck.filter(c => c.uniqueId !== chefCard.uniqueId);

        // Les Héros ne sont pas retirés ici pour simplifier, ils restent dans le deck
        // let heros = deck.filter(c => c.capacite === 'Héros');
        // let cartesNormales = deck.filter(c => c.capacite !== 'Héros');
        
        const finalDeck = [...deck];

        // Mélanger le deck
        for (let i = finalDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalDeck[i], finalDeck[j]] = [finalDeck[j], finalDeck[i]];
        }
        
        return {
            deck: finalDeck,
            chef: chefCard
        };
    }
}

function createInitialPlateau(carteChef1, deck1, carteChef2, deck2) {
    const initLignes = () => ({
        Melee: { unites: [], corDeChasse: false, modificateurMeteo: 1 }, 
        Ranged: { unites: [], corDeChasse: false, modificateurMeteo: 1 },
        Siege: { unites: [], corDeChasse: false, modificateurMeteo: 1 },
    });

    // Piocher 10 cartes initiales
    const main1 = deck1.splice(0, 10);
    const main2 = deck2.splice(0, 10);

    return {
        mancheCourante: 1,
        joueurActifId: 'joueur1',
        cartesMeteoActives: [],
        joueur1: {
            id: 'joueur1',
            scoreTotal: 0,
            carteChef: carteChef1,
            main: main1, 
            deck: deck1,
            defausse: [],
            aPasseSonTour: false,
            // AJOUT DU CHAMP MULLIGAN
            mulligansRestants: 2, // 2 mulligans maximum par partie
            manchesGagnees: 0,
			   lignes: initLignes(), 
        },
        joueur2: {
            id: 'joueur2',
            scoreTotal: 0,
            carteChef: carteChef2,
            main: main2, 
            deck: deck2,
            defausse: [],
            aPasseSonTour: false,
            // AJOUT DU CHAMP MULLIGAN
            mulligansRestants: 2, // 2 mulligans maximum par partie
            manchesGagnees: 0,
			   lignes: initLignes(), 
        },
    };
}
