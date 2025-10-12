
// gwent_population.js

// Fonction pour normaliser les accents et convertir en minuscules
function normalizeString(str) {
  if (!str) return '';
  return str
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
    .replace(/[\s()]/g, '') // Supprime espaces et parenthèses
    .toLowerCase(); // Convertit tout en minuscules
}

// Fonction utilitaire pour normaliser la ligne (tableau ou chaîne)
function normalizeLigne(ligne) {
  if (Array.isArray(ligne) && ligne.length > 0) {
    return ligne[0].toLowerCase();
  } else if (typeof ligne === 'string' && ligne.length > 0) {
    return ligne.toLowerCase();
  }
  return 'melee'; // Valeur par défaut si ligne invalide
}

// Centralisation des stratégies de capacités (Pattern Strategy)
const CapaciteStrategies = {
  heros: (plateau, joueur, carte, position) => {
    const newPlateau = { ...plateau };
    newPlateau[joueur].lignes[position].push({ ...carte, isHero: true });
    return newPlateau;
  },
  medecin: (plateau, joueur, carte, position, cibleDefausse) => {
    const newPlateau = { ...plateau };
    newPlateau[joueur].lignes[position].push(carte);
    if (cibleDefausse && !cibleDefausse.isHero && cibleDefausse.ligne && typeof cibleDefausse.ligne !== 'undefined') {
      const index = newPlateau[joueur].defausse.findIndex(c => c.id === cibleDefausse.id);
      if (index !== -1) {
        const ressuscitee = newPlateau[joueur].defausse.splice(index, 1)[0];
        const ligne = normalizeLigne(ressuscitee.ligne);
        if (['melee', 'ranged', 'siege'].includes(ligne)) {
          newPlateau[joueur].lignes[ligne].push(ressuscitee);
        }
      }
    }
    return newPlateau;
  },
  ralliement: (plateau, joueur, carte, position) => {
    const newPlateau = { ...plateau };
    newPlateau[joueur].lignes[position].push(carte);
    if (newPlateau[joueur].deck.length > 0) {
      const piocheeIndex = Math.floor(Math.random() * newPlateau[joueur].deck.length);
      const piochee = newPlateau[joueur].deck.splice(piocheeIndex, 1)[0];
      if (piochee.type === 'Unité' && piochee.ligne) {
        const posPiochee = normalizeLigne(piochee.ligne);
        if (['melee', 'ranged', 'siege'].includes(posPiochee)) {
          newPlateau[joueur].lignes[posPiochee].push(piochee);
        }
      }
    }
    return newPlateau;
  },
  espion: (plateau, joueur, carte, position) => {
    const adversaire = joueur === 'joueur1' ? 'joueur2' : 'joueur1';
    const newPlateau = { ...plateau };
    newPlateau[adversaire].lignes[position].push(carte);
    for (let i = 0; i < 2 && newPlateau[joueur].deck.length > 0; i++) {
      const piochee = newPlateau[joueur].deck.shift();
      newPlateau[joueur].main.push(piochee);
    }
    return newPlateau;
  },
  incineration: (plateau, joueur, carte) => {
    const newPlateau = { ...plateau };
    const allLignes = ['melee', 'ranged', 'siege'];
    let maxForce = 0;
    allLignes.forEach(ligne => {
      ['joueur1', 'joueur2'].forEach(j => {
        newPlateau[j].lignes[ligne].forEach(c => {
          if (!c.isHero && c.force > maxForce) maxForce = c.force;
        });
      });
    });
    allLignes.forEach(ligne => {
      ['joueur1', 'joueur2'].forEach(j => {
        newPlateau[j].lignes[ligne] = newPlateau[j].lignes[ligne].filter(c => {
          if (!c.isHero && c.force === maxForce) {
            newPlateau[j].defausse.push(c);
            return false;
          }
          return true;
        });
      });
    });
    return newPlateau;
  },
  incinerationtemporisee: (plateau, joueur, carte) => {
    const newPlateau = { ...plateau };
    // Placer la carte sur la ligne melee
    newPlateau[joueur].lignes['melee'].push(carte);
    // Enregistrer l'effet différé
    newPlateau.effetsDifferes = newPlateau.effetsDifferes || [];
    newPlateau.effetsDifferes.push({
      type: 'incinerationtemporisee',
      joueur: joueur,
      carteId: carte.id,
      toursRestants: 3
    });
    console.log(`Effet différé Incinération Temporisée enregistré pour ${carte.nom}, déclenchement dans 3 tours`);
    return newPlateau;
  },
  leurre: (plateau, joueur, carte, cible) => {
    const newPlateau = { ...plateau };
    if (cible && !cible.isHero && cible.ligne && typeof cible.ligne !== 'undefined' && cible.ligne.length > 0) {
      const ligne = normalizeLigne(cible.ligne);
      if (['melee', 'ranged', 'siege'].includes(ligne)) {
        const index = newPlateau[joueur].lignes[ligne].findIndex(c => c.id === cible.id);
        if (index !== -1) {
          const retiree = newPlateau[joueur].lignes[ligne].splice(index, 1)[0];
          newPlateau[joueur].main.push(retiree);
          newPlateau[joueur].lignes[ligne].push(carte);
        }
      }
    }
    return newPlateau;
  },
  cordechasse: (plateau, joueur, carte, ligneCible) => {
    const newPlateau = { ...plateau };
    if (ligneCible && typeof ligneCible === 'string' && ligneCible.length > 0) {
      const targetLigne = ligneCible.toLowerCase();
      if (['melee', 'ranged', 'siege'].includes(targetLigne)) {
        newPlateau[joueur].lignes[targetLigne] = newPlateau[joueur].lignes[targetLigne].map(c => {
          if (!c.isHero) return { ...c, force: c.force * 2 };
          return c;
        });
      }
    }
    return newPlateau;
  },
  meteo: (plateau, joueur, carte) => {
    console.log(`Appel de la stratégie meteo pour la carte ${carte.nom} avec ligne: ${carte.ligne}`);
    const newPlateau = { ...plateau };
    if (carte.ligne && typeof carte.ligne !== 'undefined' && carte.ligne.length > 0) {
      const ligne = normalizeLigne(carte.ligne);
      console.log(`Ligne normalisée: ${ligne}`);
      if (['melee', 'ranged', 'siege'].includes(ligne)) {
        newPlateau.meteo[ligne] = true;
        ['joueur1', 'joueur2'].forEach(j => {
          newPlateau[j].lignes[ligne] = newPlateau[j].lignes[ligne].map(c => {
            if (!c.isHero) return { ...c, force: 1 };
            return c;
          });
        });
        console.log(`Météo appliquée sur ${ligne}: ${newPlateau.meteo[ligne]}`);
      } else {
        console.warn(`Ligne invalide '${ligne}' pour la carte ${carte.nom} dans meteo.`);
      }
    } else {
      console.warn(`Propriété ligne invalide pour la carte ${carte.nom}: ${carte.ligne}`);
    }
    return newPlateau;
  },
  tempsdegage: (plateau, joueur, carte) => {
    const newPlateau = { ...plateau };
    newPlateau.meteo = { melee: false, ranged: false, siege: false };
    ['joueur1', 'joueur2'].forEach(j => {
      ['melee', 'ranged', 'siege'].forEach(ligne => {
        newPlateau[j].lignes[ligne] = newPlateau[j].lignes[ligne].map(c => ({ ...c, force: c.forceBase || c.force }));
      });
    });
    return newPlateau;
  },
  lienfraternel: (plateau, joueur, carte, position) => {
    const newPlateau = { ...plateau };
    newPlateau[joueur].lignes[position].push(carte);
    const count = newPlateau[joueur].lignes[position].filter(c => c.nom === carte.nom).length;
    if (count > 1) {
      newPlateau[joueur].lignes[position] = newPlateau[joueur].lignes[position].map(c => {
        if (c.nom === carte.nom && !c.isHero) return { ...c, force: c.forceBase * 2 };
        return c;
      });
    }
    return newPlateau;
  },
  chef: (plateau, joueur, carte, sousCapacite) => {
    const newPlateau = { ...plateau };
    newPlateau[joueur].chef = carte; // Placement du chef
    console.log(`Chef placé pour ${joueur}: ${carte.nom}, sousCapacite: ${sousCapacite}`);
    sousCapacite = normalizeString(sousCapacite || '');
    if (sousCapacite === 'meteo') {
      if (carte.nom.includes('Féroce')) {
        const meteoCards = newPlateau[joueur].deck.filter(c => normalizeString(c.capacite) === 'meteo');
        if (meteoCards.length > 0) {
          const piochee = meteoCards[Math.floor(Math.random() * meteoCards.length)];
          newPlateau[joueur].deck.splice(newPlateau[joueur].deck.indexOf(piochee), 1);
          return CapaciteStrategies.meteo(newPlateau, joueur, piochee);
        }
      } else if (carte.nom.includes('Sanguinaire')) {
        newPlateau.meteo.melee = false;
        ['joueur1', 'joueur2'].forEach(j => {
          newPlateau[j].lignes.melee = newPlateau[j].lignes.melee.map(c => ({
            ...c,
            force: c.forceBase || c.force
          }));
        });
      }
    } else if (sousCapacite === 'incineration') {
      const adversaire = joueur === 'joueur1' ? 'joueur2' : 'joueur1';
      newPlateau[adversaire].lignes.siege = newPlateau[adversaire].lignes.siege.filter(c => {
        if (!c.isHero && c.force >= 10) {
          newPlateau[adversaire].defausse.push(c);
          return false;
        }
        return true;
      });
    } else if (sousCapacite === 'ralliement') {
      return CapaciteStrategies.ralliement(newPlateau, joueur, carte, 'melee');
    }
    return newPlateau;
  },
  soifdesang: (plateau, joueur, carte, position) => {
    const newPlateau = { ...plateau };
    const adversaire = joueur === 'joueur1' ? 'joueur2' : 'joueur1';
    const force = newPlateau[adversaire].defausse.length > newPlateau[joueur].defausse.length ? carte.force * 2 : carte.force;
    newPlateau[joueur].lignes[position].push({ ...carte, force });
    return newPlateau;
  },
  transformation: (plateau, joueur, carte, position) => {
    const newPlateau = { ...plateau };
    const transformed = carte.nom.includes('Jeune Berserker') && (newPlateau.meteo.melee || normalizeString(newPlateau[joueur].chef?.capacite || '') === 'transformation');
    const newCarte = transformed
      ? { ...carte, nom: 'Berserker Enragé', force: 8, forceBase: 8 }
      : carte;
    newPlateau[joueur].lignes[position].push(newCarte);
    return newPlateau;
  },
  nuee: (plateau, joueur, carte, position) => {
    const newPlateau = { ...plateau };
    newPlateau[joueur].lignes[position].push(carte);
    const copies = newPlateau[joueur].deck.filter(c => c.nom === carte.nom);
    newPlateau[joueur].deck = newPlateau[joueur].deck.filter(c => c.nom !== carte.nom);
    newPlateau[joueur].lignes[position].push(...copies);
    return newPlateau;
  }
};

// Structure de base du plateau (généraliste)
const PlateauTemplate = {
  joueur1: {
    deck: [],
    main: [],
    defausse: [],
    chef: null,
    statut: 'actif',
    score: 0,
    lignes: { melee: [], ranged: [], siege: [] },
  },
  joueur2: {
    deck: [],
    main: [],
    defausse: [],
    chef: null,
    statut: 'actif',
    score: 0,
    lignes: { melee: [], ranged: [], siege: [] },
  },
  meteo: { melee: false, ranged: false, siege: false },
  tours: 0, // Compteur de tours dans la manche
  manches: 1, // Compteur de manches (1 à 3)
  effetsDifferes: [] // File pour effets différés (ex: Incinération Temporisée)
};

// Création des instances de duplicatas
if (!window.gwentCardData) {
  console.error('Erreur: window.gwentCardData non défini. Assurez-vous que gwent_info_carte.js est chargé.');
  throw new Error('Dépendance manquante: gwent_info_carte.js');
}
const gwentCardInstances = [];

let globalId = 1;
window.gwentCardData.forEach(template => {
  for (let copy = 1; copy <= template.max_copies; copy++) {
    const instance = {
      ...template,
      id: globalId++,
      forceBase: template.force,
      onPlay: (plateau, joueur, ...args) => {
        const capacite = template.capacite || '';
        let capaciteKey = normalizeString(capacite.replace(/\s*\([^)]*\)/g, '')); // Supprime la partie entre parenthèses pour la clé
        let sousCapacite = null;
        const match = capacite.match(/\s*\(([^)]*)\)/);
        if (match) {
          sousCapacite = normalizeString(match[1]);
        }
        console.log(`Capacité normalisée: ${capacite} -> clé: ${capaciteKey}, sous: ${sousCapacite}`);
        const validRows = ['melee', 'ranged', 'siege'];
        const strategy = CapaciteStrategies[capaciteKey] || ((p, j, c, position) => {
          console.warn(`Capacité non reconnue: ${capaciteKey} pour la carte ${c.nom}. Utilisation du fallback.`);
          const ligne = normalizeLigne(c.ligne);
          if (validRows.includes(ligne)) {
            p[j].lignes[ligne].push(c);
          } else {
            console.warn(`Ligne invalide '${ligne}' pour la carte ${c.nom}. Placement par défaut dans 'melee'.`);
            p[j].lignes['melee'].push(c);
          }
          return p;
        });
        // Appel de la stratégie : pour 'chef', passe sousCapacite, sinon ...args
        if (capaciteKey === 'chef') {
          return strategy(plateau, joueur, instance, sousCapacite);
        } else {
          return strategy(plateau, joueur, instance, ...args);
        }
      },
    };
    gwentCardInstances.push(instance);
  }
});

// Exposer pour utilisation dans le navigateur
window.GwentPopulation = {
  gwentCardInstances,
  PlateauTemplate,
  CapaciteStrategies
};
