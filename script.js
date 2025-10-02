document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const JSON_PATH = 'data/export_competitions_par_annee.json';
    const SECONDS_PER_YEAR = 1;
    // Hauteur de ligne mise à jour pour correspondre au CSS (50px height + 8px margin)
    const ROW_HEIGHT = 58;

    // --- ÉLÉMENTS DU DOM ---
    const chart = document.getElementById('ranking-chart');
    const yearDisplay = document.getElementById('year-display');

    // --- DONNÉES DE L'APPLICATION ---
    let allCountries = {};
    let yearlyWins = {};
    let sortedYears = [];

    // --- MAPPING (inchangé) ---
    const countryNameMap = {
        'EGYPTE': { name: 'Égypte', code: 'EG' }, 'ETHIOPIE': { name: 'Éthiopie', code: 'ET' },
        'GHANA': { name: 'Ghana', code: 'GH' }, 'CAMEROUN': { name: 'Cameroun', code: 'CM' },
        'COTE IVOIRE': { name: 'Côte d\'Ivoire', code: 'CI' }, 'RD CONGO': { name: 'RD Congo', code: 'CD' },
        'SOUDAN': { name: 'Soudan', code: 'SD' }, 'CONGO BRAZA': { name: 'Congo', code: 'CG' },
        'GUINEE CONAKRY': { name: 'Guinée', code: 'GN' }, 'MAROC': { name: 'Maroc', code: 'MA' },
        'ALGERIE': { name: 'Algérie', code: 'DZ' }, 'NIGERIA': { name: 'Nigéria', code: 'NG' },
        'KENYA': { name: 'Kenya', code: 'KE' }, 'TUNISIE': { name: 'Tunisie', code: 'TN' },
        'ZAMBIE': { name: 'Zambie', code: 'ZM' }, 'AFS': { name: 'Afrique du Sud', code: 'ZA' },
        'ANGOLA': { name: 'Angola', code: 'AO' }, 'GAMBIE': { name: 'Gambie', code: 'GM' },
        'GUINEE EQUATORIALE': { name: 'Guinée Équatoriale', code: 'GQ' }, 'LIBYE': { name: 'Libye', code: 'LY' },
        'MALI': { name: 'Mali', code: 'ML' }, 'GABON': { name: 'Gabon', code: 'GA' },
        'BURKINA FASO': { name: 'Burkina Faso', code: 'BF' }, 'MADAGASCAR': { name: 'Madagascar', code: 'MG' },
        'SENEGAL': { name: 'Sénégal', code: 'SN' }
    };

    function normalizeCountryName(rawName) {
        if (!rawName) return null;
        return rawName.trim().toUpperCase().split('\n').pop();
    }

    async function init() {
        await parseData();
        createDOMElements();
        startAnimation();
    }

    async function parseData() {
        const response = await fetch(JSON_PATH);
        const data = await response.json();

        data.Annees.forEach(yearData => {
            const year = yearData.Annee;
            const winsThisYear = {};
            for (const comp in yearData.competition) {
                const winnerString = yearData.competition[comp];
                let count = (winnerString.match(/\(x(\d+)\)/) || [0, 1])[1];
                const countryKey = normalizeCountryName(winnerString);
                if (countryKey) {
                    if (!allCountries[countryKey]) {
                        const info = countryNameMap[countryKey] || { name: countryKey, code: 'XX' };
                        allCountries[countryKey] = { 
                            key: countryKey, name: info.name, code: info.code,
                            totalTrophies: 0, element: null, hasAppeared: false // Ajout d'un drapeau
                        };
                    }
                    winsThisYear[countryKey] = (winsThisYear[countryKey] || 0) + parseInt(count);
                }
            }
            if (Object.keys(winsThisYear).length > 0) {
                yearlyWins[year] = winsThisYear;
            }
        });
        sortedYears = Object.keys(yearlyWins).sort((a, b) => parseInt(a) - parseInt(b));
    }
    
    function createDOMElements() {
        const countriesArray = Object.values(allCountries).sort((a, b) => a.name.localeCompare(b.name));
        countriesArray.forEach((country, index) => {
            const row = document.createElement('div');
            row.className = 'country-row';
            row.innerHTML = `
                <div class="country-info">
                    <img src="https://flagsapi.com/${country.code}/flat/64.png" alt="Drapeau ${country.name}" class="flag">
                    <span class="country-name">${country.name}</span>
                    <div class="progress-container">
                        <div class="progress-bar"></div>
                    </div>
                    <span class="trophy-count">0</span>
                </div>
            `;
            chart.appendChild(row);
            // Positionne initialement hors de l'écran ou à sa place mais invisible
            gsap.set(row, { y: index * ROW_HEIGHT });
            allCountries[country.key].element = row;
        });
        chart.style.height = `${countriesArray.length * ROW_HEIGHT}px`;
    }

    function startAnimation() {
        let yearIndex = 0;
        const timer = setInterval(() => {
            if (yearIndex >= sortedYears.length) {
                clearInterval(timer);
                yearDisplay.innerHTML = `FINAL`;
                return;
            }
            updateRankingForYear(sortedYears[yearIndex]);
            yearIndex++;
        }, SECONDS_PER_YEAR * 1000);
    }

    function updateRankingForYear(year) {
        yearDisplay.textContent = year;
        if (yearlyWins[year]) {
            for (const countryKey in yearlyWins[year]) {
                allCountries[countryKey].totalTrophies += yearlyWins[year][countryKey];
            }
        }

        const rankedCountries = Object.values(allCountries).sort((a, b) => b.totalTrophies - a.totalTrophies);
        const maxTrophies = Math.max(1, rankedCountries[0].totalTrophies);
        const chartHeight = chart.clientHeight;

        rankedCountries.forEach((country, index) => {
            const countryRow = country.element;
            const progressBar = countryRow.querySelector('.progress-bar');
            const trophyCount = countryRow.querySelector('.trophy-count');
            const newY = index * ROW_HEIGHT;

            // CAS 1 : Le pays gagne son premier trophée
            if (country.totalTrophies > 0 && !country.hasAppeared) {
                country.hasAppeared = true;
                // Animation d'entrée depuis le bas
                gsap.fromTo(countryRow, {
                    y: chartHeight, // Position de départ : bas du graphique
                    opacity: 0,
                    visibility: 'visible'
                }, {
                    y: newY, // Position d'arrivée : sa place dans le classement
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out'
                });
            } 
            // CAS 2 : Le pays est déjà visible, on anime juste sa position
            else if (country.hasAppeared) {
                gsap.to(countryRow, {
                    y: newY,
                    duration: .5,
                    ease: 'power3.inOut'
                });
            }

            // Animer la barre et le compteur pour tous les pays visibles
            if (country.hasAppeared) {
                gsap.to(progressBar, {
                    width: `${(country.totalTrophies / maxTrophies) * 100}%`,
                    duration: 0.5,
                    ease: 'power3.inOut'
                });
                gsap.to(trophyCount, {
                    innerText: country.totalTrophies,
                    duration: 0.5,
                    snap: { innerText: 1 },
                    ease: 'power1.in'
                });
            }
        });
    }

    init();
});