// gwent_ia.js


// IA simple : Choisit carte maximisant score, avec timeout.
async function proposerCarte(plateau, joueur, tempsMax = 5000) {
  const start = Date.now();
  const main = plateau[joueur].main;
  let meilleureCarte = null;
  let meilleurScore = -Infinity;
  
  for (const carte of main) {
    if (Date.now() - start > tempsMax) break;
    // Simuler jeu (copie plateau)
    const simuPlateau = JSON.parse(JSON.stringify(plateau)); // Deep copy
    const position = carte.ligne[0].toLowerCase();
    const newPlateau = jouerCarte(simuPlateau, joueur, carte.id, position);
    const score = newPlateau[joueur].score - newPlateau[joueur === 'joueur1' ? 'joueur2' : 'joueur1'].score;
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleureCarte = carte;
    }
  }
  return meilleureCarte ? meilleureCarte.id : null; // Ou passer si null
}

// Exposer pour utilisation dans le navigateur
window.GwentIA = {
  proposerCarte
};