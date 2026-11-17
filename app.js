const terminalContent = document.getElementById('terminal-content');
const inputArea = document.getElementById('input-area');
const commandInput = document.getElementById('command-input');
const btnSubmitCode = document.getElementById('btn-submit-code');
const quickChipsContainer = document.getElementById('quick-chips-container');
const choiceArea = document.getElementById('choice-area');
const btnContinue = document.getElementById('btn-continue');
const btnContinueText = document.getElementById('btn-continue-text');
const btnSkipTyping = document.getElementById('btn-skip-typing');
const yearDisplay = document.getElementById('year-display');
const mapBanner = document.getElementById('map-banner');
const mapStatus = document.getElementById('map-status');
const mapInstructionText = document.getElementById('map-instruction-text');

let isTyping = false;
let currentFullText = "";
let currentMsgClass = "";
let typeInterval = null;
const TYPE_SPEED = 10;
let cutsceneInterval = null;
let currentCallback = null;
let waitingForMapTarget = false;
let validMapTargets = [];

let state = { cohesion: 50, logistics: 50, morale: 50, currentScenario: 0 };

const scenarios = [
    {
        year: "1938", title: "DE SUDETENCRISIS", hotspot: "region-germany",
        cutscene: { bg: "https://placehold.co/1200x800/1e1710/f59e0b?text=1938+Grenstroepen+Sudetenland", date: "September 1938 - Grensgebied Tsjecho-Slowakije", text: "Liefste Maria,\n\nDe spanning is hier om te snijden. De Duitse troepen verzamelen zich vlak aan de grens. Men zegt dat mannen in strakke pakken in München over ons lot beslissen.\n\nHoe kunnen leiders in Londen en Parijs weten wat wij hier voelen? Als zij ons opofferen voor vrede, wie beschermt onze kinderen dan nog?\n\nDagboek van een Tsjechische grenswachter" },
        dossier: "[EDUCATIEF DOSSIER: APPEASEMENT]\nHitler eist de uitbreiding van het Duitse Rijk om alle Duitstaligen te verenigen (Heim ins Reich) en leefruimte te creëren (Lebensraum). Hij dreigt met oorlog als hij het Sudetenland (in Tsjecho-Slowakije) niet krijgt.\n\nDe Britse premier Chamberlain wil een gruwelijke oorlog zoals WO1 voorkomen. Hij voert een politiek van 'Appeasement' (verzoening): toegeven aan Hitlers eisen om de vrede te bewaren.",
        briefing: "De leiders van Groot-Brittannië, Frankrijk, Italië en Duitsland ontmoeten elkaar in München. Tsjecho-Slowakije zelf én de Sovjet-Unie (Stalin) zijn niet uitgenodigd.\n\nStalin kijkt met argusogen toe. Hij vreest dat het Westen Hitler bewust naar het Oosten (richting de USSR) stuurt.",
        decoding: { prompt: "DECODEER DE ONDERHANDELINGSSTRATEGIE ('MUNCHEN'):", codes: ['MUNCHEN'] }, mapInstruction: null,
        choices: [
            { text: "A: TEKEN VERDRAG VAN MÜNCHEN (Geef Sudetenland aan Hitler)", hiddenEffect: { c: -15, l: 15, m: 10 }, actionCutscene: { title: "VERDRAG VAN MÜNCHEN ONDERTEKEND", desc: "Diplomaten schudden handen in München. Tsjechische grensposten worden ontruimd terwijl Duitse colonnes het Sudetenland binnentrekken...", bg: "https://placehold.co/1200x800/2a1a08/f59e0b?text=Munchen+1938" }, debrief: "Je tekent het verdrag. Chamberlain keert terug met de belofte 'Peace for our time'. De oorlog is uitgesteld (Logistiek +, Moraal +).\n\nHISTORISCHE REALITEIT: Dit is wat er echt gebeurde. Het pact was echter een ramp voor de Cohesie. Stalin concludeerde dat hij het Westen niet kon vertrouwen en tekende een jaar later een niet-aanvalsverdrag met Hitler (Molotov-Ribbentroppact)." },
            { text: "B: WEIGER EN DREIG MET MILITAIR INGRIJPEN", hiddenEffect: { c: 15, l: -20, m: -20 }, actionCutscene: { title: "MOBILISATIE AFGEKONDIGD", desc: "Troepen worden naar de grenzen gestuurd. Luchtalarmsirenes loeien in Londen en Parijs. Oorlog lijkt onvermijdelijk...", bg: "https://placehold.co/1200x800/3a0808/ef4444?text=Oorlogsdreiging+1938" }, debrief: "Je weigert. Hitler is woedend. Stalin ziet dat je betrouwbaar bent (Cohesie +). Maar onze legers zijn zwak en de Britse en Franse bevolking raakt in paniek (Moraal -, Logistiek -).\n\nHISTORISCHE REALITEIT: Dit gebeurde NIET. Door de appeasement-politiek kreeg Duitsland de tijd om enorm sterk te worden." }
        ]
    },
    {
        year: "1940", title: "DE VAL VAN FRANKRIJK & SLAG OM ENGELAND", hotspot: "region-france",
        cutscene: { bg: "https://placehold.co/1200x800/182a23/a8d4c4?text=1940+De+Blitz+Londen", date: "Zomer 1940 - Londen, Engeland", text: "Lieve Vader,\n\nWe hebben wéér de hele nacht in de schuilkelder gezeten. Het angstaanjagende geluid van de sirenes en vallende bommen gaat door merg en been.\n\nOverdag zie ik de brave Spitfire-piloten hoog in de blauwe lucht vechten. Ze lijken zo klein, maar zij zijn het enige dat tussen ons en de totale ondergang staat.\n\nBrief van een burger tijdens De Blitz" },
        dossier: "[EDUCATIEF DOSSIER: BLITZKRIEG]\nIn mei 1940 valt Duitsland West-Europa aan. Door de tactiek van 'Blitzkrieg' (een snelle samenwerking tussen tanks, vliegtuigen en infanterie) wordt het Franse leger binnen enkele weken compleet verslagen.\n\nGroot-Brittannië (nu onder leiding van Winston Churchill) is van het continent verdreven en staat er helemaal alleen voor tegen het Duitse rijk.",
        briefing: "Frankrijk is gevallen. Hitler bereidt Operatie Seelöwe voor: de invasie van Engeland. De Luftwaffe begint met enorme bombardementen op Britse steden (De Blitz).\n\nTegelijkertijd proberen Duitse U-boten (onderzeeërs) Groot-Brittannië uit te hongeren door schepen op de Atlantische Oceaan te torpederen. Waar zetten we onze middelen in?",
        decoding: null, mapInstruction: { text: "MAP VERPLICHT: Klik op 'Groot-Brittannië' (Luchtmacht) of 'Atlantische Oceaan' (Marine)", validTargets: ['region-uk', 'region-atlantic'] },
        choices: [
            { targetId: 'region-uk', text: "BOUW RADARSTATIONS EN SPITFIRES (Slag om Engeland)", hiddenEffect: { c: 0, l: -10, m: 20 }, actionCutscene: { title: "LUCHTGEVECHTEN BOVEN HET KANAAL", desc: "Spitfires stijgen op! Bommenwerpers worden onderschept dankzij radar-detectie. Explosies vullen de lucht boven het zuiden van Engeland...", bg: "https://placehold.co/1200x800/0f2b48/60a5fa?text=Battle+of+Britain" }, debrief: "De Royal Air Force (RAF) verslaat de Luftwaffe mede dankzij de nieuwe radar! Het moraal van de bevolking stijgt enorm. De Atlantische vloot lijdt echter zware verliezen.\n\nHISTORISCHE REALITEIT: Groot-Brittannië won de Slag om Engeland door superieure technologie (radar) en de inzet van piloten." },
            { targetId: 'region-atlantic', text: "FOCUS OP KONVOOIBESCHERMING & ANTI-DUIKBOOT", hiddenEffect: { c: 10, l: 15, m: -15 }, actionCutscene: { title: "SLAG OM DE ATLANTISCHE OCEAAN", desc: "Dieptebommen exploderen onder water. Konvooien varen zwaar bewaakt door de woeste golven terwijl Duitse U-boten op de loer liggen...", bg: "https://placehold.co/1200x800/081e28/38bdf8?text=U-Boat+Warfare" }, debrief: "De aanvoerlijnen over zee blijven veilig. Logistiek verbetert. Maar door het gebrek aan luchtverdediging worden Britse steden platgebombardeerd (Moraal daalt zwaar).\n\nHISTORISCHE REALITEIT: Gevechtsvliegtuigen kregen in 1940 historische prioriteit, waardoor een Duitse invasie van land werd voorkomen." }
        ]
    },
    {
        year: "1941", title: "OPERATIE BARBAROSSA", hotspot: "region-ussr",
        cutscene: { bg: "https://placehold.co/1200x800/1f2024/ffffff?text=1941+Oostfront+Winter", date: "November 1941 - Buitenwijken van Moskou", text: "Liefste Moeder,\n\nDe kou is niet te beschrijven. Onze geweren vriezen vast aan onze handschoenen. We wijken dag na dag terug door verbrande dorpen, maar achter ons ligt Moskou.\n\nWe vechten voor elke meter sneeuw. Ze zeggen dat er hulp onderweg is uit Amerika, maar de tanks en vrachtwagens laten op zich wachten.\n\nBrief van een Russische soldaat" },
        dossier: "[EDUCATIEF DOSSIER: LEND-LEASE & HET OOSTFRONT]\nIn juni 1941 verbreekt Hitler het pact met Stalin en valt de Sovjet-Unie binnen (Operatie Barbarossa). Strijd op het Oostfront wordt een vernietigingsoorlog.\n\nStalin sluit zich aan bij de Geallieerden. Amerika bedenkt de 'Lend-Lease Act' om wapens te leveren aan landen die vechten tegen nazi-Duitsland.",
        briefing: "Het Rode Leger lijdt miljoenen verliezen en trekt zich terug in de bittere kou. Stalin eist dat de VS en Groot-Brittannië massaal vrachtwagens, voedsel en staal naar de USSR sturen.",
        decoding: { prompt: "ONTSLEUTEL HET MATERIEEL VERDRAG ('LENDLEASE'):", codes: ['LENDLEASE'] }, mapInstruction: null,
        choices: [
            { text: "STUUR LEND-LEASE MATERIEEL NAAR STALIN", hiddenEffect: { c: 25, l: -15, m: 0 }, actionCutscene: { title: "KONVOOIEN NAAR MURMANSK", desc: "Duizenden Amerikaanse vrachtwagens en tonnen graan worden door ijszeeën naar de havens van de Sovjet-Unie gevaren...", bg: "https://placehold.co/1200x800/1e293b/38bdf8?text=Lend-Lease+Supply" }, debrief: "Het wantrouwen van Stalin neemt af (Cohesie stijgt), maar dit kost onze eigen legers wapens.\n\nHISTORISCHE REALITEIT: Dit is precies wat de VS deed. De USSR versloeg het grootste deel van het Duitse leger mede dankzij Amerikaans materieel." },
            { text: "HOUD VOORRADEN ACHTER VOOR EIGEN LEGEROPBOUW", hiddenEffect: { c: -30, l: 20, m: 0 }, debrief: "Je weigert hulp. Stalin voelt zich verraden en moet voor Moskou vechten met enorme tekorten (Cohesie -30!).\n\nHISTORISCHE REALITEIT: Zonder deze steun had de USSR mogelijk een aparte vrede gesloten of de oorlog verloren." }
        ]
    }
];

function goToStep(step) {
    document.getElementById('modal-step-1').style.display = 'none';
    document.getElementById('modal-step-2').style.display = 'none';
    document.getElementById('modal-step-3').style.display = 'none';
    document.getElementById('modal-step-' + step).style.display = 'block';
}

function closeIntroModal() {
    document.getElementById('intro-modal-overlay').style.display = 'none';
    initMap();
    startScenario(0);
}

function initMap() {
    const root = document.getElementById('d3-map-root');
    root.innerHTML = `<svg viewBox="0 0 600 420" class="w-full h-full">
        <rect id="region-atlantic" class="clickable-ocean" x="0" y="0" width="600" height="420" />
        <text x="80" y="180" fill="#38bdf8" font-size="11" font-family="monospace" pointer-events="none">ATLANTISCHE OCEAAN</text>
        <polygon id="region-uk" class="map-region" stroke="#475569" points="160,120 205,110 215,175 155,180" />
        <text x="165" y="155" fill="#cbd5e1" font-size="10" font-family="monospace" pointer-events="none">UK</text>
        <polygon id="region-france" class="map-region" stroke="#475569" points="180,210 265,205 270,295 175,285" />
        <text x="200" y="255" fill="#cbd5e1" font-size="10" font-family="monospace" pointer-events="none">FRANKRIJK</text>
        <polygon id="region-germany" class="map-region" stroke="#475569" points="265,175 365,175 365,260 265,260" />
        <text x="285" y="220" fill="#cbd5e1" font-size="10" font-family="monospace" pointer-events="none">DUITSLAND</text>
        <polygon id="region-ussr" class="map-region" stroke="#475569" points="370,70 580,70 580,310 370,310" />
        <text x="450" y="190" fill="#cbd5e1" font-size="12" font-family="monospace" pointer-events="none">SOVJET-UNIE</text>
    </svg>`;

    ['region-atlantic', 'region-uk', 'region-france', 'region-germany', 'region-ussr'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => handleMapClick(id));
    });
}

function handleMapClick(id) {
    if (!waitingForMapTarget || !validMapTargets.includes(id)) return;
    waitingForMapTarget = false;
    mapBanner.classList.add('translate-y-16', 'opacity-0');
    document.querySelectorAll('.active-target').forEach(el => el.classList.remove('active-target'));
    const sc = scenarios[state.currentScenario];
    const choice = sc.choices.find(c => c.targetId === id);
    if (choice) executeChoice(choice);
}

function updateMeters() {
    ['cohesion', 'logistics', 'morale'].forEach(k => {
        state[k] = Math.max(0, Math.min(100, state[k]));
        document.getElementById('val-' + k).textContent = state[k] + '%';
        document.getElementById('meter-' + k).style.width = state[k] + '%';
    });
}

function typeMessage(text, cssClass, callback) {
    clearInterval(typeInterval);
    isTyping = true;
    currentFullText = text;
    currentMsgClass = cssClass;
    currentCallback = callback;
    btnSkipTyping.classList.remove('hidden');

    const p = document.createElement('div');
    p.className = cssClass + ' whitespace-pre-wrap';
    terminalContent.appendChild(p);

    let i = 0;
    typeInterval = setInterval(() => {
        p.textContent += text.charAt(i);
        i++;
        terminalContent.scrollTop = terminalContent.scrollHeight;
        if (i >= text.length) finishTyping();
    }, TYPE_SPEED);
}

function finishTyping() {
    if (!isTyping) return;
    clearInterval(typeInterval);
    isTyping = false;
    btnSkipTyping.classList.add('hidden');
    if (terminalContent.lastChild) terminalContent.lastChild.textContent = currentFullText;
    terminalContent.scrollTop = terminalContent.scrollHeight;
    if (currentCallback) {
        const cb = currentCallback;
        currentCallback = null;
        cb();
    }
}

btnSkipTyping.addEventListener('click', finishTyping);

function showCutscene(data, onComplete) {
    const overlay = document.getElementById('cutscene-overlay');
    const textEl = document.getElementById('cutscene-text');
    document.getElementById('cutscene-visual').style.backgroundImage = `url('${data.bg}')`;
    document.getElementById('cutscene-date').textContent = data.date;
    textEl.textContent = '';

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    setTimeout(() => overlay.classList.remove('opacity-0'), 20);

    let i = 0;
    clearInterval(cutsceneInterval);
    cutsceneInterval = setInterval(() => {
        textEl.textContent += data.text.charAt(i);
        i++;
        if (i >= data.text.length) clearInterval(cutsceneInterval);
    }, 20);

    document.getElementById('btn-skip-cutscene').onclick = () => {
        clearInterval(cutsceneInterval);
        overlay.classList.add('opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
            if (onComplete) onComplete();
        }, 500);
    };
}

function startScenario(idx) {
    if (idx >= scenarios.length) {
        endGame();
        return;
    }
    state.currentScenario = idx;
    const sc = scenarios[idx];
    yearDisplay.textContent = sc.year;
    terminalContent.innerHTML = '';
    inputArea.classList.add('hidden');
    choiceArea.classList.add('hidden');
    btnContinue.classList.add('hidden');
    btnContinue.classList.remove('flex');
    waitingForMapTarget = false;

    document.querySelectorAll('.map-region, .clickable-ocean').forEach(el => el.classList.remove('hotspot', 'active-target'));
    if (sc.hotspot && document.getElementById(sc.hotspot)) {
        document.getElementById(sc.hotspot).classList.add('hotspot');
    }
    mapStatus.textContent = sc.year + ' // ACTIEF';

    showCutscene(sc.cutscene, () => {
        typeMessage(`=== ${sc.year}: ${sc.title} ===`, 'msg-alert', () => {
            typeMessage(sc.dossier, 'msg-dossier', () => {
                typeMessage(sc.briefing, 'msg-intel', () => {
                    setupInteraction(sc);
                });
            });
        });
    });
}

function setupInteraction(sc) {
    if (sc.decoding) {
        inputArea.classList.remove('hidden');
        document.getElementById('input-prompt-label').textContent = sc.decoding.prompt;
        commandInput.value = '';
        quickChipsContainer.innerHTML = '<span class="text-xs text-slate-500">Ontcijferde codes:</span>';
        sc.decoding.codes.forEach(code => {
            const chip = document.createElement('button');
            chip.className = 'text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-2 py-1 rounded font-mono-military';
            chip.textContent = code;
            chip.onclick = () => { commandInput.value = code; };
            quickChipsContainer.appendChild(chip);
        });
        btnSubmitCode.onclick = () => {
            const val = commandInput.value.trim().toUpperCase();
            if (sc.decoding.codes.includes(val)) {
                inputArea.classList.add('hidden');
                typeMessage(`[CODE GEACCEPTEERD: ${val}]`, 'msg-success', () => showChoices(sc));
            } else {
                typeMessage(`[FOUTE CODE: '${val}'. Probeer opnieuw.]`, 'msg-alert');
            }
        };
    } else if (sc.mapInstruction) {
        waitingForMapTarget = true;
        validMapTargets = sc.mapInstruction.validTargets;
        mapInstructionText.textContent = sc.mapInstruction.text;
        mapBanner.textContent = sc.mapInstruction.text;
        mapBanner.classList.remove('translate-y-16', 'opacity-0');
        validMapTargets.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('active-target');
        });
    } else {
        showChoices(sc);
    }
}

function showChoices(sc) {
    choiceArea.innerHTML = '';
    choiceArea.classList.remove('hidden');
    sc.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left bg-slate-800 hover:bg-slate-700 border border-slate-600 p-3.5 rounded-xl text-sm font-semibold text-amber-300 transition shadow';
        btn.textContent = choice.text;
        btn.onclick = () => {
            choiceArea.classList.add('hidden');
            executeChoice(choice);
        };
        choiceArea.appendChild(btn);
    });
}

function executeChoice(choice) {
    state.cohesion += choice.hiddenEffect.c;
    state.logistics += choice.hiddenEffect.l;
    state.morale += choice.hiddenEffect.m;
    updateMeters();

    const finishDebrief = () => {
        typeMessage(choice.debrief, 'msg-history', () => {
            btnContinueText.textContent = state.currentScenario + 1 < scenarios.length ? "VOLGEND SCENARIO" : "EINDRAPPORT BEKIJKEN";
            btnContinue.classList.remove('hidden');
            btnContinue.classList.add('flex');
            btnContinue.onclick = () => startScenario(state.currentScenario + 1);
        });
    };

    if (choice.actionCutscene) {
        const ov = document.getElementById('action-cutscene-overlay');
        const prog = document.getElementById('action-progress');
        document.getElementById('action-cutscene-bg').style.backgroundImage = `url('${choice.actionCutscene.bg}')`;
        document.getElementById('action-cutscene-title').textContent = choice.actionCutscene.title;
        document.getElementById('action-cutscene-desc').textContent = choice.actionCutscene.desc;
        prog.style.width = '0%';

        ov.classList.remove('hidden');
        ov.classList.add('flex');
        setTimeout(() => {
            ov.classList.remove('opacity-0');
            prog.style.width = '100%';
        }, 50);

        setTimeout(() => {
            ov.classList.add('opacity-0');
            setTimeout(() => {
                ov.classList.add('hidden');
                ov.classList.remove('flex');
                finishDebrief();
            }, 500);
        }, 3100);
    } else {
        finishDebrief();
    }
}

function endGame() {
    terminalContent.innerHTML = '';
    mapStatus.textContent = 'SIMULATIE VOLTOOID';
    const avg = Math.round((state.cohesion + state.logistics + state.morale) / 3);
    const verdict = avg >= 50
        ? "OVERWINNING: Het Geallieerde bondgenootschap heeft standgehouden en de Asmogendheden teruggedrongen!"
        : "NEDERLAAG: Door gebrek aan samenhang, voorraden of moraal is het Geallieerde front ingestort.";

    typeMessage("=== EINDRAPPORT GEALLIEERD OPPERBEVEL ===", "msg-alert", () => {
        typeMessage(`Eindscores:\n- Cohesie: ${state.cohesion}%\n- Logistiek: ${state.logistics}%\n- Moraal: ${state.morale}%\n\n${verdict}`, "msg-success", () => {
            btnContinueText.textContent = "OPNIEUW SPELEN";
            btnContinue.classList.remove('hidden');
            btnContinue.classList.add('flex');
            btnContinue.onclick = () => {
                state = { cohesion: 50, logistics: 50, morale: 50, currentScenario: 0 };
                updateMeters();
                startScenario(0);
            };
        });
    });
}