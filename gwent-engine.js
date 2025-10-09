// =====================================================================
        // CONFIGURATION ET DONNÉES
        // =====================================================================
        
        const CARD_DATABASE = {
            // Neutres
            "Geralt de Riv": { faction: "Neutre", force: 15, row: "melee", capacity: "Hero", isHero: true },
            "Ciri": { faction: "Neutre", force: 15, row: "melee", capacity: "Hero", isHero: true },
            "Yennefer": { faction: "Neutre", force: 7, row: "ranged", capacity: "Heal", isHero: true },
            "Triss": { faction: "Neutre", force: 7, row: "melee", capacity: "Rally", isHero: true },
            "Avallach": { faction: "Neutre", force: 0, row: "siege", capacity: "Spy", isHero: true },
            "Villentretenmerth": { faction: "Neutre", force: 7, row: "melee", capacity: "Scorch3", isHero: false },
            "Vesemir": { faction: "Neutre", force: 6, row: "melee", capacity: "Rally", isHero: false },
            "Zoltan": { faction: "Neutre", force: 5, row: "melee", capacity: "Rally", isHero: false },
            "Dandelion": { faction: "Neutre", force: 2, row: "ranged", capacity: "Rally", isHero: false },
            "Scorch": { faction: "Neutre", force: 0, row: "special", capacity: "Scorch", isHero: false },
            "Decoy": { faction: "Neutre", force: 0, row: "special", capacity: "Decoy", isHero: false },
            "Horn": { faction: "Neutre", force: 0, row: "special", capacity: "Horn", isHero: false },
            "Frost": { faction: "Neutre", force: 0, row: "weather", capacity: "Frost", isHero: false },
            "Fog": { faction: "Neutre", force: 0, row: "weather", capacity: "Fog", isHero: false },
            "Rain": { faction: "Neutre", force: 0, row: "weather", capacity: "Rain", isHero: false },
            "Clear": { faction: "Neutre", force: 0, row: "weather", capacity: "Clear", isHero: false },
            
            // Royaumes du Nord
            "Vernon Roche": { faction: "RN", force: 10, row: "siege", capacity: "Hero", isHero: true },
            "Philippa": { faction: "RN", force: 10, row: "ranged", capacity: "Hero", isHero: true },
            "Dijkstra": { faction: "RN", force: 4, row: "melee", capacity: "Spy", isHero: false },
            "Thaler": { faction: "RN", force: 1, row: "siege", capacity: "Spy", isHero: true },
            "Fantassin": { faction: "RN", force: 1, row: "melee", capacity: "TightBond", isHero: false },
            "Catapulte": { faction: "RN", force: 8, row: "siege", capacity: "TightBond", isHero: false },
            "Sorcier Kaedwen": { faction: "RN", force: 5, row: "ranged", capacity: "TightBond", isHero: false },
            "Medic Temeria": { faction: "RN", force: 5, row: "melee", capacity: "Medic", isHero: false },
            "Archer": { faction: "RN", force: 3, row: "ranged", capacity: "None", isHero: false },
            "Chevalier": { faction: "RN", force: 4, row: "melee", capacity: "None", isHero: false },
            "Balista": { faction: "RN", force: 6, row: "siege", capacity: "TightBond", isHero: false },
            "Trebuchet": { faction: "RN", force: 6, row: "siege", capacity: "None", isHero: false },
            
            // Nilfgaard
            "Tibor": { faction: "NG", force: 10, row: "ranged", capacity: "Hero", isHero: true },
            "Letho": { faction: "NG", force: 10, row: "melee", capacity: "Hero", isHero: true },
            "Menno": { faction: "NG", force: 10, row: "melee", capacity: "Hero", isHero: true },
            "Vattier": { faction: "NG", force: 4, row: "melee", capacity: "Spy", isHero: false },
            "Brigade Nauzicaa": { faction: "NG", force: 5, row: "melee", capacity: "TightBond", isHero: false },
            "Cavalier Albatre": { faction: "NG", force: 4, row: "ranged", capacity: "TightBond", isHero: false },
            "Archer Asser": { faction: "NG", force: 6, row: "ranged", capacity: "Agile", isHero: false },
            "Medic Aube": { faction: "NG", force: 5, row: "melee", capacity: "Medic", isHero: false },
            "Chevalier Legion": { faction: "NG", force: 4, row: "melee", capacity: "None", isHero: false },
            "Catapulte NG": { faction: "NG", force: 8, row: "siege", capacity: "None", isHero: false },
            "Trebuchet NG": { faction: "NG", force: 6, row: "siege", capacity: "None", isHero: false },
            
            // Monstres
            "Imlerith": { faction: "Monstres", force: 10, row: "melee", capacity: "Hero", isHero: true },
            "Kayran": { faction: "Monstres", force: 8, row: "melee", capacity: "Hero", isHero: true },
            "Leshen": { faction: "Monstres", force: 10, row: "ranged", capacity: "Hero", isHero: true },
            "Crone": { faction: "Monstres", force: 6, row: "melee", capacity: "Muster", isHero: false },
            "Arachas": { faction: "Monstres", force: 4, row: "melee", capacity: "Muster", isHero: false },
            "Nekker": { faction: "Monstres", force: 2, row: "melee", capacity: "Muster", isHero: false },
            "Ghoul": { faction: "Monstres", force: 1, row: "melee", capacity: "Medic", isHero: false },
            "Vampire": { faction: "Monstres", force: 4, row: "melee", capacity: "None", isHero: false },
            "Griffin": { faction: "Monstres", force: 5, row: "ranged", capacity: "TightBond", isHero: false },
            "Fiend": { faction: "Monstres", force: 6, row: "melee", capacity: "None", isHero: false },
            "Werewolf": { faction: "Monstres", force: 5, row: "melee", capacity: "None", isHero: false },
            
            // Scoia'tael
            "Iorveth": { faction: "Scoia", force: 10, row: "ranged", capacity: "Hero", isHero: true },
            "Saskia": { faction: "Scoia", force: 5, row: "melee", capacity: "Rally", isHero: true },
            "Yaevinn": { faction: "Scoia", force: 2, row: "ranged", capacity: "Spy", isHero: false },
            "Elfe Tireur": { faction: "Scoia", force: 2, row: "agile", capacity: "Agile", isHero: false },
            "Nain Commando": { faction: "Scoia", force: 5, row: "agile", capacity: "AgileBond", isHero: false },
            "Vrihedd": { faction: "Scoia", force: 4, row: "agile", capacity: "AgileBond", isHero: false },
            "Dryad": { faction: "Scoia", force: 2, row: "ranged", capacity: "Medic", isHero: false },
            "Havekar": { faction: "Scoia", force: 3, row: "ranged", capacity: "None", isHero: false },
            "Mahakam": { faction: "Scoia", force: 5, row: "melee", capacity: "TightBond", isHero: false },
            "Elf Archer": { faction: "Scoia", force: 3, row: "ranged", capacity: "None", isHero: false },
            
            // Skellige
            "Hjalmar": { faction: "Skellige", force: 10, row: "melee", capacity: "Hero", isHero: true },
            "Cerys": { faction: "Skellige", force: 10, row: "melee", capacity: "Resurrect", isHero: true },
            "Kambi": { faction: "Skellige", force: 0, row: "melee", capacity: "Spy", isHero: false },
            "Drummond": { faction: "Skellige", force: 4, row: "melee", capacity: "TightBond", isHero: false },
            "Shield Maiden": { faction: "Skellige", force: 6, row: "melee", capacity: "TightBond", isHero: false },
            "Berserker": { faction: "Skellige", force: 4, row: "melee", capacity: "Berserk", isHero: false },
            "Medic Skellige": { faction: "Skellige", force: 6, row: "siege", capacity: "Medic", isHero: false },
            "Archer Clan": { faction: "Skellige", force: 4, row: "ranged", capacity: "None", isHero: false },
            "Jarl": { faction: "Skellige", force: 8, row: "melee", capacity: "None", isHero: false }
        };

        const LEADERS = {
            RN: [
                { name: "Foltest Féroce", ability: "weather", desc: "Jouez une carte Météo" },
                { name: "Foltest Sanguinaire", ability: "clearRow", desc: "Annulez la météo d'une rangée" },
                { name: "Foltest Vétéran", ability: "scorchSiege", desc: "Détruisez les Sièges 10+" },
                { name: "Foltest Loyal", ability: "rally", desc: "Ralliement" }
            ],
            NG: [
                { name: "Emhyr Invader", ability: "drawEnemy", desc: "L'ennemi pioche 2 et en défausse 1" },
                { name: "Emhyr Relentless", ability: "spy", desc: "Jouez un Espion de votre main" },
                { name: "Emhyr Conqueror", ability: "reveal", desc: "Révélez 3 cartes ennemies" },
                { name: "Emhyr Emperor", ability: "rally", desc: "Ralliement" }
            ],
            Monstres: [
                { name: "Eredin Bringer", ability: "weather", desc: "Jouez une carte Météo" },
                { name: "Eredin King", ability: "resurrect", desc: "Ressuscitez une carte" },
                { name: "Eredin Destroyer", ability: "scorch", desc: "Incinération" },
                { name: "Eredin Commander", ability: "muster", desc: "Nuée sur une carte" }
            ],
            Scoia: [
                { name: "Francesca Queen", ability: "return", desc: "Reprenez une carte jouée" },
                { name: "Francesca Beautiful", ability: "replay", desc: "Rejouez depuis votre main" },
                { name: "Francesca Daisy", ability: "draw", desc: "Piochez 1 carte" },
                { name: "Francesca Pureblood", ability: "rally", desc: "Ralliement" }
            ],
            Skellige: [
                { name: "Crach Raider", ability: "resurrect2", desc: "Ressuscitez 2 cartes" },
                { name: "Crach Berserk", ability: "berserk", desc: "Transformez les Berserkers" },
                { name: "Crach Warrior", ability: "draw", desc: "Piochez 1 carte" },
                { name: "Crach an Craite", ability: "shield", desc: "Invoquez toutes les Shield Maidens" }
            ]
        };

        // État du jeu
        let gameState = {
            currentRound: 1,
            turnCount: 0,
            roundsWon: { A: 0, B: 0 },
            playerA: {
                faction: null,
                leader: null,
                leaderUsed: false,
                hand: [],
                deck: [],
                graveyard: [],
                passed: false,
                melee: { cards: [], horn: false },
                ranged: { cards: [], horn: false },
                siege: { cards: [], horn: false }
            },
            playerB: {
                faction: null,
                leader: null,
                leaderUsed: false,
                hand: [],
                deck: [],
                graveyard: [],
                passed: false,
                melee: { cards: [], horn: false },
                ranged: { cards: [], horn: false },
                siege: { cards: [], horn: false }
            },
            weather: {
                frost: false,
                fog: false,
                rain: false
            },
            activePlayer: 'A',
            autoPlay: false,
            keepCardRound2: null
        };

        let selectedFaction = null;
        let selectedLeader = null;
        let mulliganSelected = [];

        // =====================================================================
        // MENU DE DÉMARRAGE
        // =====================================================================

        function selectFaction(faction) {
            selectedFaction = faction;
            document.querySelectorAll('.faction-btn').forEach(btn => btn.classList.remove('selected'));
            event.target.closest('.faction-btn').classList.add('selected');
            
            const leaderDiv = document.getElementById('leader-selection');
            const leaderOptions = document.getElementById('leader-options');
            leaderDiv.style.display = 'block';
            leaderOptions.innerHTML = '';
            
            LEADERS[faction].forEach((leader, i) => {
                const btn = document.createElement('button');
                btn.className = 'leader-btn';
                btn.innerHTML = `<strong>${leader.name}</strong><br><small>${leader.desc}</small>`;
                btn.onclick = () => selectLeader(faction, i);
                leaderOptions.appendChild(btn);
            });
            
            selectedLeader = null;
            document.getElementById('start-game-btn').disabled = true;
        }

        function selectLeader(faction, index) {
            selectedLeader = LEADERS[faction][index];
            document.querySelectorAll('.leader-btn').forEach(btn => btn.classList.remove('selected'));
            event.target.closest('.leader-btn').classList.add('selected');
            document.getElementById('start-game-btn').disabled = false;
        }

        function initializeGame() {
            if (!selectedFaction || !selectedLeader) return;
            
            gameState.playerA.faction = selectedFaction;
            gameState.playerA.leader = selectedLeader;
            
            const factions = ['RN', 'NG', 'Monstres', 'Scoia', 'Skellige'].filter(f => f !== selectedFaction);
            const aiFaction = factions[Math.floor(Math.random() * factions.length)];
            gameState.playerB.faction = aiFaction;
            gameState.playerB.leader = LEADERS[aiFaction][Math.floor(Math.random() * LEADERS[aiFaction].length)];
            
            buildDeck('A');
            buildDeck('B');
            dealInitialHands();
            
            if (selectedFaction === 'Scoia') {
                gameState.activePlayer = 'A';
                logMessage("🏹 Bonus Scoia'tael : Vous choisissez de commencer !", 'success');
            } else if (aiFaction === 'Scoia') {
                gameState.activePlayer = 'B';
                logMessage("🏹 L'adversaire commence (Bonus Scoia'tael)", 'info');
            } else {
                gameState.activePlayer = Math.random() > 0.5 ? 'A' : 'B';
            }
            
            document.getElementById('start-menu').style.display = 'none';
            showMulligan();
        }

function buildDeck(player) {
            const p = gameState[`player${player}`];
            const faction = p.faction;
            const deck = [];
            
            const factionCards = Object.keys(CARD_DATABASE).filter(name => 
                CARD_DATABASE[name].faction === faction
            );
            factionCards.forEach(name => {
                const count = CARD_DATABASE[name].isHero ? 1 : (Math.random() > 0.5 ? 2 : 3);
                for (let i = 0; i < count; i++) deck.push(name);
            });
            
            const neutrals = ['Geralt de Riv', 'Ciri', 'Vesemir', 'Zoltan', 'Scorch', 'Decoy', 'Horn', 'Frost', 'Fog', 'Rain', 'Clear'];
            neutrals.forEach(name => {
                if (Math.random() > 0.6) deck.push(name);
            });
            
            shuffle(deck);
            p.deck = deck;
        }

        function dealInitialHands() {
            for (let i = 0; i < 10; i++) {
                if (gameState.playerA.deck.length > 0) {
                    gameState.playerA.hand.push(gameState.playerA.deck.pop());
                }
                if (gameState.playerB.deck.length > 0) {
                    gameState.playerB.hand.push(gameState.playerB.deck.pop());
                }
            }
        }

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // =====================================================================
        // MULLIGAN
        // =====================================================================

        function showMulligan() {
            const mulliganDiv = document.getElementById('mulligan-screen');
            const handDiv = document.getElementById('mulligan-hand');
            mulliganDiv.style.display = 'block';
            handDiv.innerHTML = '';
            mulliganSelected = [];
            
            gameState.playerA.hand.forEach(cardName => {
                const card = CARD_DATABASE[cardName];
                const cardEl = document.createElement('div');
                cardEl.className = 'mulligan-card';
                cardEl.innerHTML = `
                    <div class="force">${card.force || '-'}</div>
                    <div style="margin-top: 5px; flex-grow: 1;">${cardName}</div>
                    <div style="font-size: 9px; color: #888;">${card.capacity}</div>
                `;
                cardEl.onclick = () => toggleMulliganCard(cardName, cardEl);
                handDiv.appendChild(cardEl);
            });
        }

        function toggleMulliganCard(cardName, element) {
            if (mulliganSelected.includes(cardName)) {
                mulliganSelected = mulliganSelected.filter(c => c !== cardName);
                element.classList.remove('selected');
            } else {
                if (mulliganSelected.length < 2) {
                    mulliganSelected.push(cardName);
                    element.classList.add('selected');
                } else {
                    logMessage("❌ Vous ne pouvez échanger que 2 cartes maximum", 'error');
                }
            }
        }

        function confirmMulligan() {
            mulliganSelected.forEach(cardName => {
                const index = gameState.playerA.hand.indexOf(cardName);
                if (index > -1) {
                    gameState.playerA.hand.splice(index, 1);
                    gameState.playerA.deck.push(cardName);
                }
            });
            
            shuffle(gameState.playerA.deck);
            for (let i = 0; i < mulliganSelected.length; i++) {
                if (gameState.playerA.deck.length > 0) {
                    gameState.playerA.hand.push(gameState.playerA.deck.pop());
                }
            }
            
            logMessage(`🔄 ${mulliganSelected.length} cartes échangées`, 'success');
            
            const weakCards = gameState.playerB.hand
                .filter(name => CARD_DATABASE[name].force < 4)
                .slice(0, 2);
            weakCards.forEach(cardName => {
                const index = gameState.playerB.hand.indexOf(cardName);
                gameState.playerB.hand.splice(index, 1);
                gameState.playerB.deck.push(cardName);
            });
            shuffle(gameState.playerB.deck);
            for (let i = 0; i < weakCards.length; i++) {
                if (gameState.playerB.deck.length > 0) {
                    gameState.playerB.hand.push(gameState.playerB.deck.pop());
                }
            }
            
            document.getElementById('mulligan-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            
            updateDisplay();
            logMessage(`🎮 La partie commence ! ${gameState.activePlayer === 'A' ? 'Vous commencez' : "L'IA commence"}`, 'info');
            
            if (gameState.activePlayer === 'B') {
                setTimeout(aiTurn, 1500);
            }
        }

   // =====================================================================
        // MOTEUR DE JEU - ACTIONS
        // =====================================================================

        function playCard(player, cardName, targetRow = null) {
            const p = gameState[`player${player}`];
            const card = CARD_DATABASE[cardName];
            
            if (!card) {
                logMessage(`❌ Carte inconnue: ${cardName}`, 'error');
                return false;
            }
            
            const handIndex = p.hand.indexOf(cardName);
            if (handIndex === -1) {
                logMessage(`❌ ${cardName} n'est pas dans la main`, 'error');
                return false;
            }
            p.hand.splice(handIndex, 1);
            
            gameState.turnCount++;
            logMessage(`${player === 'A' ? '🛡️ Vous' : '🦅 IA'} joue: ${cardName}`, 'info');
            
            switch (card.capacity) {
                case 'Spy':
                    handleSpy(player, cardName, card);
                    break;
                case 'Medic':
                    handleMedic(player, cardName, card);
                    break;
                case 'Rally':
                    handleRally(player, cardName, card);
                    break;
                case 'Scorch':
                    handleScorch();
                    break;
                case 'Decoy':
                    handleDecoy(player);
                    break;
                case 'Horn':
                    handleHorn(player, targetRow || card.row);
                    break;
                case 'Frost':
                case 'Fog':
                case 'Rain':
                    handleWeather(card.capacity);
                    break;
                case 'Clear':
                    handleClearWeather();
                    break;
                case 'Muster':
                    handleMuster(player, cardName, card);
                    break;
                case 'Agile':
                case 'AgileBond':
                    handleAgile(player, cardName, card, targetRow);
                    break;
                case 'Heal':
                    handleHeal(player, cardName, card);
                    break;
                case 'Resurrect':
                    handleResurrect(player, cardName, card);
                    break;
                case 'Berserk':
                    handleBerserk(player, cardName, card);
                    break;
                default:
                    placeCard(player, cardName, card, targetRow || card.row);
            }
            
            updateDisplay();
            return true;
        }

        function placeCard(player, cardName, card, row) {
            const p = gameState[`player${player}`];
            const rowKey = row === 'agile' ? 'melee' : row;
            
            if (p[rowKey]) {
                p[rowKey].cards.push(cardName);
            }
        }

        function handleSpy(player, cardName, card) {
            const opponent = player === 'A' ? 'B' : 'A';
            const opp = gameState[`player${opponent}`];
            const rowKey = card.row === 'agile' ? 'melee' : card.row;
            opp[rowKey].cards.push(cardName);
            
            const p = gameState[`player${player}`];
            for (let i = 0; i < 2; i++) {
                if (p.deck.length > 0) {
                    p.hand.push(p.deck.pop());
                }
            }
            logMessage(`🕵️ Espion : ${player === 'A' ? 'Vous piochez' : 'IA pioche'} 2 cartes`, 'success');
        }

        function handleMedic(player, cardName, card) {
            placeCard(player, cardName, card, card.row);
            
            const p = gameState[`player${player}`];
            if (p.graveyard.length > 0) {
                const targets = p.graveyard.filter(name => !CARD_DATABASE[name].isHero);
                if (targets.length > 0) {
                    const resurrected = targets[Math.floor(Math.random() * targets.length)];
                    p.graveyard = p.graveyard.filter(c => c !== resurrected);
                    const resCard = CARD_DATABASE[resurrected];
                    placeCard(player, resurrected, resCard, resCard.row);
                    logMessage(`⚕️ Médecin : ${resurrected} ressuscité !`, 'success');
                }
            }
        }

        function handleRally(player, cardName, card) {
            placeCard(player, cardName, card, card.row);
            
            const p = gameState[`player${player}`];
            if (p.deck.length > 0) {
                const units = p.deck.filter(name => {
                    const c = CARD_DATABASE[name];
                    return c.row !== 'special' && c.row !== 'weather';
                });
                if (units.length > 0) {
                    const drawn = units[0];
                    p.deck = p.deck.filter(c => c !== drawn);
                    const drawnCard = CARD_DATABASE[drawn];
                    placeCard(player, drawn, drawnCard, drawnCard.row);
                    logMessage(`📣 Ralliement : ${drawn} invoqué !`, 'success');
                }
            }
        }

        function handleScorch() {
            let maxForce = 0;
            const allCards = [];
            
            ['A', 'B'].forEach(pl => {
                ['melee', 'ranged', 'siege'].forEach(row => {
                    gameState[`player${pl}`][row].cards.forEach(name => {
                        const card = CARD_DATABASE[name];
                        if (!card.isHero) {
                            const force = calculateCardForce(pl, row, name);
                            allCards.push({ player: pl, row, name, force });
                            if (force > maxForce) maxForce = force;
                        }
                    });
                });
            });
            
            const toDestroy = allCards.filter(c => c.force === maxForce);
            toDestroy.forEach(({ player, row, name }) => {
                const p = gameState[`player${player}`];
                p[row].cards = p[row].cards.filter(c => c !== name);
                p.graveyard.push(name);
            });
            
            logMessage(`🔥 Incinération : ${toDestroy.length} carte(s) détruites (force ${maxForce})`, 'warning');
        }

        function handleDecoy(player) {
            const p = gameState[`player${player}`];
            for (const row of ['melee', 'ranged', 'siege']) {
                if (p[row].cards.length > 0) {
                    const recovered = p[row].cards.pop();
                    p.hand.push(recovered);
                    logMessage(`🎭 Leurre : ${recovered} récupéré en main`, 'success');
                    return;
                }
            }
        }

        function handleHorn(player, targetRow) {
            const rowKey = targetRow === 'agile' ? 'melee' : targetRow;
            const p = gameState[`player${player}`];
            if (p[rowKey]) {
                p[rowKey].horn = true;
                logMessage(`📯 Corne sur ${rowKey}`, 'success');
            }
        }

        function handleWeather(type) {
            if (type === 'Frost') gameState.weather.frost = true;
            if (type === 'Fog') gameState.weather.fog = true;
            if (type === 'Rain') gameState.weather.rain = true;
            logMessage(`🌧️ Météo : ${type} activée`, 'warning');
        }

        function handleClearWeather() {
            gameState.weather = { frost: false, fog: false, rain: false };
            logMessage(`☀️ Temps Dégagé : toutes les météos annulées`, 'success');
        }

        function handleMuster(player, cardName, card) {
            placeCard(player, cardName, card, card.row);
            
            const p = gameState[`player${player}`];
            const copies = p.deck.filter(name => name === cardName);
            copies.forEach(name => {
                p.deck = p.deck.filter(c => c !== name);
                placeCard(player, name, card, card.row);
            });
            
            if (copies.length > 0) {
                logMessage(`🐺 Nuée : ${copies.length} ${cardName} invoqués !`, 'success');
            }
        } 

function handleAgile(player, cardName, card, targetRow) {
            const row = targetRow || (Math.random() > 0.5 ? 'melee' : 'ranged');
            placeCard(player, cardName, card, row);
        }

        function handleHeal(player, cardName, card) {
            placeCard(player, cardName, card, card.row);
            
            const p = gameState[`player${player}`];
            const toHeal = p.graveyard.filter(name => {
                const c = CARD_DATABASE[name];
                return c.row === 'melee' && !c.isHero;
            });
            
            toHeal.forEach(name => {
                p.graveyard = p.graveyard.filter(c => c !== name);
                const healCard = CARD_DATABASE[name];
                placeCard(player, name, healCard, 'melee');
            });
            
            if (toHeal.length > 0) {
                logMessage(`💚 Soins : ${toHeal.length} cartes de Mêlée ressuscitées`, 'success');
            }
        }

        function handleResurrect(player, cardName, card) {
            placeCard(player, cardName, card, card.row);
            
            const p = gameState[`player${player}`];
            for (let i = 0; i < 2; i++) {
                if (p.graveyard.length > 0) {
                    const resurrected = p.graveyard[Math.floor(Math.random() * p.graveyard.length)];
                    p.graveyard = p.graveyard.filter(c => c !== resurrected);
                    const resCard = CARD_DATABASE[resurrected];
                    placeCard(player, resurrected, resCard, resCard.row === 'agile' ? 'melee' : resCard.row);
                }
            }
            logMessage(`⚰️ Résurrection : cartes ramenées du cimetière`, 'success');
        }

        function handleBerserk(player, cardName, card) {
            placeCard(player, cardName, card, card.row);
            logMessage(`⚔️ Berserker enragé !`, 'warning');
        }

        // =====================================================================
        // CALCUL DES SCORES
        // =====================================================================

        function calculateCardForce(player, row, cardName) {
            const card = CARD_DATABASE[cardName];
            const p = gameState[`player${player}`];
            
            if (card.isHero) return card.force;
            
            let force = card.force;
            
            if (row === 'melee' && gameState.weather.frost) force = 1;
            if (row === 'ranged' && gameState.weather.fog) force = 1;
            if (row === 'siege' && gameState.weather.rain) force = 1;
            
            return force;
        }

        function calculateRowScore(player, row) {
            const p = gameState[`player${player}`];
            const rowData = p[row];
            let score = 0;
            const processed = new Set();
            
            rowData.cards.forEach(cardName => {
                if (processed.has(cardName)) return;
                
                const card = CARD_DATABASE[cardName];
                const baseForce = calculateCardForce(player, row, cardName);
                
                if (card.capacity === 'TightBond' || card.capacity === 'AgileBond') {
                    const copies = rowData.cards.filter(c => c === cardName);
                    if (copies.length > 1) {
                        score += baseForce * 2 * copies.length;
                        copies.forEach(c => processed.add(c));
                    } else {
                        score += baseForce;
                        processed.add(cardName);
                    }
                } else {
                    score += baseForce;
                    processed.add(cardName);
                }
            });
            
            if (rowData.horn) {
                score *= 2;
            }
            
            return score;
        }

        function calculateTotalScore(player) {
            return calculateRowScore(player, 'melee') + 
                   calculateRowScore(player, 'ranged') + 
                   calculateRowScore(player, 'siege');
        }

        // =====================================================================
        // CAPACITÉS CHEF
        // =====================================================================

        function useLeaderAbility() {
            const player = 'A';
            const p = gameState.playerA;
            
            if (p.leaderUsed) {
                logMessage("❌ Capacité Chef déjà utilisée", 'error');
                return;
            }
            
            const ability = p.leader.ability;
            p.leaderUsed = true;
            document.getElementById('leader-btn').disabled = true;
            
            logMessage(`👑 Capacité Chef activée : ${p.leader.name}`, 'success');
            
            switch (ability) {
                case 'weather':
                    const weatherCards = p.deck.filter(name => {
                        const c = CARD_DATABASE[name];
                        return c.row === 'weather' && c.capacity !== 'Clear';
                    });
                    if (weatherCards.length > 0) {
                        const weather = weatherCards[0];
                        playCard('A', weather);
                    }
                    break;
                    
                case 'clearRow':
                    if (gameState.weather.frost) gameState.weather.frost = false;
                    else if (gameState.weather.fog) gameState.weather.fog = false;
                    else if (gameState.weather.rain) gameState.weather.rain = false;
                    logMessage("☀️ Météo d'une rangée annulée", 'success');
                    break;
                    
                case 'scorchSiege':
                    ['A', 'B'].forEach(pl => {
                        const siegeCards = gameState[`player${pl}`].siege.cards.filter(name => {
                            const c = CARD_DATABASE[name];
                            return !c.isHero && c.force >= 10;
                        });
                        siegeCards.forEach(name => {
                            gameState[`player${pl}`].siege.cards = gameState[`player${pl}`].siege.cards.filter(c => c !== name);
                            gameState[`player${pl}`].graveyard.push(name);
                        });
                    });
                    logMessage("🔥 Sièges 10+ détruits", 'warning');
                    break;
                    
                case 'rally':
                    if (p.deck.length > 0) {
                        const units = p.deck.filter(name => {
                            const c = CARD_DATABASE[name];
                            return c.row !== 'special' && c.row !== 'weather';
                        });
                        if (units.length > 0) {
                            playCard('A', units[0]);
                        }
                    }
                    break;
                    
                case 'draw':
                    if (p.deck.length > 0) {
                        p.hand.push(p.deck.pop());
                        logMessage("📥 1 carte piochée", 'success');
                    }
                    break;
                    
                case 'resurrect':
                    if (p.graveyard.length > 0) {
                        const target = p.graveyard[0];
                        p.graveyard.shift();
                        const card = CARD_DATABASE[target];
                        placeCard('A', target, card, card.row);
                        logMessage(`⚰️ ${target} ressuscité`, 'success');
                    }
                    break;
                    
                case 'resurrect2':
                    for (let i = 0; i < 2; i++) {
                        if (p.graveyard.length > 0) {
                            const target = p.graveyard.pop();
                            const card = CARD_DATABASE[target];
                            placeCard('A', target, card, card.row === 'agile' ? 'melee' : card.row);
                        }
                    }
                    logMessage("⚰️ 2 cartes ressuscitées", 'success');
                    break;
                    
                case 'scorch':
                    handleScorch();
                    break;
                    
                case 'return':
                    for (const row of ['melee', 'ranged', 'siege']) {
                        if (p[row].cards.length > 0) {
                            const returned = p[row].cards.pop();
                            p.hand.push(returned);
                            logMessage(`↩️ ${returned} repris en main`, 'success');
                            break;
                        }
                    }
                    break;
                    
                default:
                    logMessage(`⚙️ Capacité ${ability} activée`, 'info');
            }
            
            updateDisplay();
            
            if (!gameState.playerA.passed) {
                switchTurn();
            }
        }

        // =====================================================================
        // TOUR DE JEU
        // =====================================================================

        function playerPass() {
            if (gameState.playerA.passed) {
                logMessage("❌ Vous avez déjà passé", 'error');
                return;
            }
            
            gameState.playerA.passed = true;
            logMessage("⏭️ Vous passez votre tour", 'warning');
            updateDisplay();
            
            if (gameState.playerB.passed) {
                endRound();
            } else {
                switchTurn();
            }
        }

        function switchTurn() {
            gameState.activePlayer = gameState.activePlayer === 'A' ? 'B' : 'A';
            updateDisplay();
            
            if (gameState.activePlayer === 'B' && !gameState.playerB.passed) {
                setTimeout(aiTurn, 1500);
            }
        }

        function aiTurn() {
            if (gameState.playerB.passed) {
                switchTurn();
                return;
            }
            
            const ai = gameState.playerB;
            const scoreA = calculateTotalScore('A');
            const scoreB = calculateTotalScore('B');
            
            if (scoreB > scoreA + 10 && Math.random() > 0.3) {
                gameState.playerB.passed = true;
                logMessage("⏭️ L'IA passe son tour", 'info');
                updateDisplay();
                
                if (gameState.playerA.passed) {
                    endRound();
                } else {
                    switchTurn();
                }
                return;
            }
            
            if (ai.hand.length === 0) {
                gameState.playerB.passed = true;
                logMessage("⏭️ L'IA n'a plus de cartes et passe", 'info');
                updateDisplay();
                
                if (gameState.playerA.passed) {
                    endRound();
                } else {
                    switchTurn();
                }
                return;
            }
            
            const playableCards = ai.hand.filter(name => {
                const card = CARD_DATABASE[name];
                return card.row !== 'weather' || Math.random() > 0.7;
            });
            
            if (playableCards.length === 0) {
                gameState.playerB.passed = true;
                logMessage("⏭️ L'IA passe", 'info');
                updateDisplay();
                
                if (gameState.playerA.passed) {
                    endRound();
                } else {
                    switchTurn();
                }
                return;
            }
            
            playableCards.sort((a, b) => {
                const cardA = CARD_DATABASE[a];
                const cardB = CARD_DATABASE[b];
                return (cardB.force || 0) - (cardA.force || 0);
            });
            
            const cardToPlay = playableCards[0];
            playCard('B', cardToPlay);
            
            if (gameState.playerA.passed && gameState.playerB.passed) {
                endRound();
            } else {
                switchTurn();
            }
        }

 // =====================================================================
        // FIN DE MANCHE
        // =====================================================================

        function endRound() {
            const scoreA = calculateTotalScore('A');
            const scoreB = calculateTotalScore('B');
            
            let winner = null;
            
            if (scoreA > scoreB) {
                winner = 'A';
            } else if (scoreB > scoreA) {
                winner = 'B';
            } else {
                if (gameState.playerA.faction === 'NG' && gameState.playerB.faction !== 'NG') {
                    winner = 'A';
                    logMessage("⚖️ Égalité ! Bonus Nilfgaard : Vous gagnez la manche", 'success');
                } else if (gameState.playerB.faction === 'NG' && gameState.playerA.faction !== 'NG') {
                    winner = 'B';
                    logMessage("⚖️ Égalité ! Bonus Nilfgaard : L'IA gagne la manche", 'warning');
                } else {
                    logMessage("⚖️ Égalité parfaite ! Personne ne gagne", 'info');
                }
            }
            
            if (winner) {
                gameState.roundsWon[winner]++;
                logMessage(`🏆 Manche ${gameState.currentRound} : ${winner === 'A' ? 'VOUS' : 'IA'} gagnez ! (${scoreA} vs ${scoreB})`, winner === 'A' ? 'success' : 'warning');
                
                if (winner === 'A' && gameState.playerA.faction === 'RN') {
                    if (gameState.playerA.deck.length > 0) {
                        gameState.playerA.hand.push(gameState.playerA.deck.pop());
                        logMessage("🛡️ Bonus RN : Vous piochez 1 carte", 'success');
                    }
                }
                if (winner === 'B' && gameState.playerB.faction === 'RN') {
                    if (gameState.playerB.deck.length > 0) {
                        gameState.playerB.hand.push(gameState.playerB.deck.pop());
                    }
                }
                
                if (winner === 'A' && gameState.playerA.faction === 'Monstres') {
                    const allCards = [...gameState.playerA.melee.cards, ...gameState.playerA.ranged.cards, ...gameState.playerA.siege.cards];
                    const nonHeroes = allCards.filter(name => !CARD_DATABASE[name].isHero);
                    if (nonHeroes.length > 0) {
                        gameState.keepCardRound2 = nonHeroes[Math.floor(Math.random() * nonHeroes.length)];
                        logMessage(`👹 Bonus Monstres : ${gameState.keepCardRound2} sera conservé`, 'success');
                    }
                }
            }
            
            if (gameState.roundsWon.A === 2) {
                showModal("🎉 VICTOIRE !", `Vous avez gagné la partie ${gameState.roundsWon.A}-${gameState.roundsWon.B} !`);
                return;
            }
            if (gameState.roundsWon.B === 2) {
                showModal("😔 DÉFAITE", `L'IA a gagné la partie ${gameState.roundsWon.B}-${gameState.roundsWon.A}`);
                return;
            }
            
            setTimeout(() => {
                startNextRound();
            }, 3000);
        }

        function startNextRound() {
            gameState.currentRound++;
            gameState.turnCount = 0;
            gameState.playerA.passed = false;
            gameState.playerB.passed = false;
            
            ['A', 'B'].forEach(player => {
                const p = gameState[`player${player}`];
                ['melee', 'ranged', 'siege'].forEach(row => {
                    p[row].cards.forEach(cardName => {
                        if (gameState.keepCardRound2 !== cardName) {
                            p.graveyard.push(cardName);
                        }
                    });
                    p[row].cards = [];
                    p[row].horn = false;
                });
            });
            
            if (gameState.keepCardRound2) {
                const card = CARD_DATABASE[gameState.keepCardRound2];
                gameState.playerA.melee.cards.push(gameState.keepCardRound2);
                gameState.keepCardRound2 = null;
            }
            
            gameState.weather = { frost: false, fog: false, rain: false };
            
            if (gameState.currentRound === 3) {
                if (gameState.playerA.faction === 'Skellige') {
                    for (let i = 0; i < 2; i++) {
                        if (gameState.playerA.graveyard.length > 0) {
                            const resurrected = gameState.playerA.graveyard.pop();
                            const card = CARD_DATABASE[resurrected];
                            placeCard('A', resurrected, card, card.row === 'agile' ? 'melee' : card.row);
                        }
                    }
                    logMessage("⚓ Bonus Skellige : 2 cartes ressuscitées pour la manche 3 !", 'success');
                }
                if (gameState.playerB.faction === 'Skellige') {
                    for (let i = 0; i < 2; i++) {
                        if (gameState.playerB.graveyard.length > 0) {
                            const resurrected = gameState.playerB.graveyard.pop();
                            const card = CARD_DATABASE[resurrected];
                            const rowKey = card.row === 'agile' ? 'melee' : card.row;
                            if (gameState.playerB[rowKey]) {
                                gameState.playerB[rowKey].cards.push(resurrected);
                            }
                        }
                    }
                }
            }
            
            logMessage(`\n🎮 === MANCHE ${gameState.currentRound} === 🎮`, 'info');
            updateDisplay();
            
            if (gameState.activePlayer === 'B') {
                setTimeout(aiTurn, 1500);
            }
        }

        // =====================================================================
        // INTERFACE UTILISATEUR
        // =====================================================================

        function updateDisplay() {
            document.getElementById('current-round').textContent = gameState.currentRound;
            document.getElementById('turn-count').textContent = gameState.turnCount;
            document.getElementById('wins-a').textContent = `${gameState.roundsWon.A} victoires`;
            document.getElementById('wins-b').textContent = `${gameState.roundsWon.B} victoires`;
            
            const factionIcons = {
                'RN': '🛡️',
                'NG': '🦅',
                'Monstres': '👹',
                'Scoia': '🏹',
                'Skellige': '⚓'
            };
            document.getElementById('player-a-faction').textContent = `${factionIcons[gameState.playerA.faction]} Vous (${gameState.playerA.faction})`;
            document.getElementById('player-b-faction').textContent = `${factionIcons[gameState.playerB.faction]} IA (${gameState.playerB.faction})`;
            
            document.getElementById('passed-a').style.display = gameState.playerA.passed ? 'inline' : 'none';
            document.getElementById('passed-b').style.display = gameState.playerB.passed ? 'inline' : 'none';
            
            document.getElementById('player-a-zone').classList.toggle('active', gameState.activePlayer === 'A');
            document.getElementById('player-b-zone').classList.toggle('active', gameState.activePlayer === 'B');
            
            const scoreA = calculateTotalScore('A');
            const scoreB = calculateTotalScore('B');
            document.getElementById('score-a').textContent = scoreA;
            document.getElementById('score-b').textContent = scoreB;
            document.getElementById('total-score-a').textContent = scoreA;
            document.getElementById('total-score-b').textContent = scoreB;
            
            ['A', 'B'].forEach(player => {
                const p = player.toLowerCase();
                document.getElementById(`score-${p}-melee`).textContent = calculateRowScore(player, 'melee');
                document.getElementById(`score-${p}-ranged`).textContent = calculateRowScore(player, 'ranged');
                document.getElementById(`score-${p}-siege`).textContent = calculateRowScore(player, 'siege');
                
                document.getElementById(`horn-${p}-melee`).style.display = gameState[`player${player}`].melee.horn ? 'inline' : 'none';
                document.getElementById(`horn-${p}-ranged`).style.display = gameState[`player${player}`].ranged.horn ? 'inline' : 'none';
                document.getElementById(`horn-${p}-siege`).style.display = gameState[`player${player}`].siege.horn ? 'inline' : 'none';
            });
            
            const weatherIcons = {
                melee: gameState.weather.frost ? '🥶' : '',
                ranged: gameState.weather.fog ? '🌫️' : '',
                siege: gameState.weather.rain ? '🌧️' : ''
            };
            document.getElementById('weather-melee').textContent = weatherIcons.melee;
            document.getElementById('weather-ranged').textContent = weatherIcons.ranged;
            document.getElementById('weather-siege').textContent = weatherIcons.siege;
            document.getElementById('weather-melee-a').textContent = weatherIcons.melee;
            document.getElementById('weather-ranged-a').textContent = weatherIcons.ranged;
            document.getElementById('weather-siege-a').textContent = weatherIcons.siege;
            
            ['A', 'B'].forEach(player => {
                ['melee', 'ranged', 'siege'].forEach(row => {
                    const elementId = `${row}-${player.toLowerCase()}-cards`;
                    const container = document.getElementById(elementId);
                    container.innerHTML = '';
                    
                    gameState[`player${player}`][row].cards.forEach(cardName => {
                        const card = CARD_DATABASE[cardName];
                        const cardEl = createCardElement(cardName, card, player, row);
                        container.appendChild(cardEl);
                    });
                });
            });
            
            const handContainer = document.getElementById('player-hand');
            handContainer.innerHTML = '';
            document.getElementById('hand-count').textContent = gameState.playerA.hand.length;
            
            gameState.playerA.hand.forEach(cardName => {
                const card = CARD_DATABASE[cardName];
                const cardEl = createHandCard(cardName, card);
                handContainer.appendChild(cardEl);
            });
            
            document.getElementById('pass-btn').disabled = gameState.playerA.passed || gameState.activePlayer !== 'A';
            
            if (gameState.playerA.leader && !gameState.playerA.leaderUsed) {
                document.getElementById('leader-btn').style.display = 'inline-block';
                document.getElementById('leader-btn').disabled = gameState.activePlayer !== 'A';
            }
        }

        function createCardElement(cardName, card, player, row) {
            const div = document.createElement('div');
            div.className = 'card';
            
            // --- LOGIQUE DATA-ROW POUR LES CARTES SUR LE PLATEAU ---
            let dataRowValue = card.row;
            if (dataRowValue === 'agile') {
                dataRowValue = 'melee,ranged';
            } 
            div.setAttribute('data-row', dataRowValue);
            // --------------------------------------------------
            
            if (card.isHero) div.classList.add('hero');
            if (card.capacity === 'Spy') div.classList.add('spy');
            
            const isWeatherAffected = !card.isHero && (
                (row === 'melee' && gameState.weather.frost) ||
                (row === 'ranged' && gameState.weather.fog) ||
                (row === 'siege' && gameState.weather.rain)
            );
            if (isWeatherAffected) div.classList.add('weather-affected');
            
            const force = calculateCardForce(player, row, cardName);
            
            div.innerHTML = `
                <div class="card-force">${force}</div>
                <div class="card-name">${cardName}</div>
                <div class="card-capacity">${card.capacity}</div>
            `;
            
            return div;
        }

        function createHandCard(cardName, card) {
            const div = document.createElement('div');
            div.className = 'hand-card';
            
            // --- LOGIQUE DATA-ROW POUR LES CARTES DANS LA MAIN (AJOUT) ---
            let dataRowValue = card.row;
            if (dataRowValue === 'agile') {
                dataRowValue = 'melee,ranged';
            } 
            div.setAttribute('data-row', dataRowValue);
            // -----------------------------------------------------------
            
            const canPlay = gameState.activePlayer === 'A' && !gameState.playerA.passed;
            if (canPlay) div.classList.add('playable');
            
            div.innerHTML = `
                <div class="force">${card.force || '-'}</div>
                <div style="margin: 5px 0; flex-grow: 1; font-size: 10px;">${cardName}</div>
                <div style="font-size: 8px; color: #888;">${card.capacity}</div>
            `;
            
            if (canPlay) {
                div.onclick = () => {
                    if (playCard('A', cardName)) {
                        if (!gameState.playerA.passed && !gameState.playerB.passed) {
                            switchTurn();
                        } else if (gameState.playerA.passed && gameState.playerB.passed) {
                            endRound();
                        }
                    }
                };
            }
            
            return div;
        }

        function logMessage(message, type = 'info') {
            const log = document.getElementById('log');
            const div = document.createElement('div');
            div.className = `log-item log-${type}`;
            div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            log.insertBefore(div, log.firstChild);
            
            while (log.children.length > 50) {
                log.removeChild(log.lastChild);
            }
        }

        function showModal(title, message) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-message').textContent = message;
            document.getElementById('modal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
            location.reload();
        }

        function toggleAutoPlay() {
            gameState.autoPlay = !gameState.autoPlay;
            event.target.textContent = `Mode Auto: ${gameState.autoPlay ? 'ON' : 'OFF'}`;
            
            if (gameState.autoPlay && gameState.activePlayer === 'A' && !gameState.playerA.passed) {
                setTimeout(() => autoPlayTurn(), 1000);
            }
        }


function autoPlayTurn() {
            if (!gameState.autoPlay || gameState.activePlayer !== 'A' || gameState.playerA.passed) return;
            
            const hand = gameState.playerA.hand;
            if (hand.length === 0) {
                playerPass();
                return;
            }
            
            const cardToPlay = hand[Math.floor(Math.random() * hand.length)];
            if (playCard('A', cardToPlay)) {
                if (!gameState.playerA.passed && !gameState.playerB.passed) {
                    switchTurn();
                } else if (gameState.playerA.passed && gameState.playerB.passed) {
                    endRound();
                }
            }
            
            if (gameState.autoPlay && gameState.activePlayer === 'A' && !gameState.playerA.passed) {
                setTimeout(() => autoPlayTurn(), 2000);
            }
        }

        // =====================================================================
        // INITIALISATION
        // =====================================================================

        window.onload = () => {
            logMessage("🎮 Bienvenue dans Gwent !", 'success');
        };
