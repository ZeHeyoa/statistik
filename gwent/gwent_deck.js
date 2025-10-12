// gwent_deck.js



// Distribution par royaume et niveau
function genererDeck(royaume, niveau) {
  let instances = gwentCardInstances.filter(c => c.royaume === royaume || c.royaume === 'Neutre');
  const heros = instances.filter(c => c.isHero);
  const nonHeros = instances.filter(c => !c.isHero);
  
  // Niveaux : max = tous, n-1 = -1 heros aléatoire, etc.
  const herosARetirer = Math.max(0, heros.length - niveau); // Ex: niveau max = heros.length, min=0
  for (let i = 0; i < herosARetirer; i++) {
    const randIndex = Math.floor(Math.random() * heros.length);
    heros.splice(randIndex, 1);
  }
  
  return [...heros, ...nonHeros];
}

// Exposer pour utilisation dans le navigateur
window.GwentDeck = {
  genererDeck
};