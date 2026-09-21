document.addEventListener("DOMContentLoaded", () => {
    // Mappa delle aree cliniche specifiche
    const specificClinicalAreasMap = {
        Mammella: ["HER2 positive", "Luminali", "TNBC"],
        Polmone: ["NSCLC", "SCLC", "Mesotelioma"],
        "Gastro-Intestinale": [
            "Esofago",
            "Stomaco",
            "Colon",
            "Retto",
            "Ano",
            "Vie biliari",
            "Pancreas",
            "Fegato",
        ],
        Ginecologico: ["Endometrio", "Ovaio", "Cervice", "Vulva", "Altri"],
        "Prostata e Vie Urinarie": [
            "Prostata",
            "Rene",
            "Vescica",
            "Altre vie Urinarie",
        ],
        "Melanoma e Cute": ["Melanoma", "SCC", "Basalioma"],
        "Testa-Collo": [
            "Cavo orale: lingua anteriore, labbra, gengive, mucosa buccale, pavimento della bocca, palato duro",
            "Orofaringe: base della lingua, tonsille palatine, palato molle",
            "Laringe: sopraglottica, glottide, sottoglottica",
            "Ipofaringe",
            "Nasofaringe (o rinofaringe)",
            "Cavità nasali e seni paranasali: seni mascellari, etmoidali, sfenoidali e frontali",
            "Ghiandole Salivari: parotide, sottomandibolare, sottolinguale, ghiandole salivari minori",
        ],
    };

    // ---- Mappa delle Specifiche Ulteriori per Specifica Area Clinica ----
    // Ogni chiave è la specifica area clinica; il valore è un array di opzioni.
    // Le opzioni PDL1 usano type:"pdl1_range" con range 0-100.

    // --- BASE MAMMELLA (condivisa tra sottotipi) ---
    const BASE_MAMMELLA = [
        { id: "Duttale", label: "Duttale" },
        { id: "Lobulare", label: "Lobulare" },
        { id: "ESR1mut", label: "ESR1mut" },
        { id: "PIK3CAmut", label: "PIK3CAmut" },
        { id: "AKTmut", label: "AKTmut" },
        { id: "PTENmut", label: "PTENmut" },
        { id: "BRCA1/2mut", label: "BRCA1/2mut" },
        { id: "PALB2", label: "PALB2" },
    ];
    const HER2_LOW_OPTIONS = [
        { id: "HER2 low", label: "HER2 low" },
        { id: "HER2 ultra-low", label: "HER2 ultra-low" },
    ];

    // --- BASE GI (biomarcatori agnostici condivisi nel GI) ---
    const BASE_GI_AGNOSTIC = [
        { id: "MSI-H-gi", label: "MSI-H / dMMR" },
        { id: "NTRK-gi", label: "NTRK" },
    ];

    // --- BASE TESTA-COLLO (condivisa tra sottosedi HNSCC) ---
    const BASE_HNSCC = [
        { id: "SCC-HNSCC", label: "Carcinoma Squamocellulare (SCC)" },
        { id: "PDL1-CPS-HNSCC", label: "PDL1 CPS (%)", type: "pdl1_range" },
        { id: "EGFR-over-HNSCC", label: "EGFR overespresso" },
        { id: "MSI-H-HNSCC", label: "MSI-H / dMMR" },
        { id: "platino-eligible-HNSCC", label: "Platino-eligible" },
        { id: "platino-refrattario-HNSCC", label: "Platino-refrattario" },
    ];

    const furtherSpecificsMap = {

        // ============================================================
        // MAMMELLA
        // ============================================================
        "HER2 positive": [...BASE_MAMMELLA],
        "Luminali": [...BASE_MAMMELLA, ...HER2_LOW_OPTIONS],
        "TNBC": [...BASE_MAMMELLA, ...HER2_LOW_OPTIONS],

        // ============================================================
        // POLMONE
        // ============================================================
        "NSCLC": [
            { id: "ADK", label: "ADK (Adenocarcinoma)" },
            { id: "SCC-NSCLC", label: "SCC (Squamoso)" },
            { id: "PDL1", label: "PDL1 (%)", type: "pdl1_range" },
            { id: "EGFR", label: "EGFR" },
            { id: "ALK", label: "ALK" },
            { id: "KRAS", label: "KRAS" },
            { id: "ROS1", label: "ROS1" },
            { id: "BRAF-V600", label: "BRAF-V600" },
            { id: "RET", label: "RET" },
            { id: "NTRK", label: "NTRK" },
            { id: "HER2", label: "HER2" },
            { id: "MET", label: "MET" },
            { id: "EGFR ex20ins", label: "EGFR ex20ins" },
        ],
        // SCLC: nessuna specifica ulteriore
        "Mesotelioma": [
            { id: "Epitelioide", label: "Epitelioide" },
            { id: "Bifasico", label: "Bifasico" },
            { id: "Sarcomatoide", label: "Sarcomatoide" },
        ],

        // ============================================================
        // GASTRO-INTESTINALE
        // ============================================================
        "Esofago": [
            { id: "Adenocarcinoma-esofago", label: "Adenocarcinoma" },
            { id: "SCC-esofago", label: "Squamocellulare" },
            { id: "HER2-esofago", label: "HER2 positivo" },
            { id: "PDL1-CPS-esofago", label: "PDL1 CPS (%)", type: "pdl1_range" },
            { id: "MSI-H-esofago", label: "MSI-H / dMMR" },
            { id: "NTRK-esofago", label: "NTRK" },
        ],
        "Stomaco": [
            { id: "Adenocarcinoma-gastrico", label: "Adenocarcinoma" },
            { id: "Signet-ring-gastrico", label: "Cellule ad anello con castone" },
            { id: "HER2-stomaco", label: "HER2 positivo" },
            { id: "PDL1-CPS-stomaco", label: "PDL1 CPS (%)", type: "pdl1_range" },
            { id: "FGFR2b", label: "FGFR2b positivo" },
            { id: "CLDN18-2", label: "CLDN18.2 positivo" },
            { id: "EBV-stomaco", label: "EBV positivo" },
            { id: "MSI-H-stomaco", label: "MSI-H / dMMR" },
            { id: "NTRK-stomaco", label: "NTRK" },
        ],
        "Colon": [
            { id: "MSI-H-colon", label: "MSI-H / dMMR" },
            { id: "KRAS-colon", label: "KRAS" },
            { id: "KRAS-G12C-colon", label: "KRAS G12C" },
            { id: "BRAF-V600E-colon", label: "BRAF V600E" },
            { id: "HER2-colon", label: "HER2 amplificazione" },
            { id: "NTRK-colon", label: "NTRK" },
            { id: "lato-dx-colon", label: "Colon destro" },
            { id: "lato-sx-colon", label: "Colon sinistro" },
            { id: "signet-ring-colon", label: "Cellule ad anello con castone" },
        ],
        "Retto": [
            { id: "MSI-H-retto", label: "MSI-H / dMMR" },
            { id: "KRAS-retto", label: "KRAS" },
            { id: "KRAS-G12C-retto", label: "KRAS G12C" },
            { id: "BRAF-V600E-retto", label: "BRAF V600E" },
            { id: "HER2-retto", label: "HER2 amplificazione" },
            { id: "NTRK-retto", label: "NTRK" },
            { id: "retto-alto", label: "Retto alto" },
            { id: "retto-medio", label: "Retto medio" },
            { id: "retto-basso", label: "Retto basso" },
        ],
        "Ano": [
            { id: "SCC-anale", label: "Carcinoma Squamocellulare anale" },
            { id: "HPV-ano", label: "HPV correlato" },
            { id: "PDL1-ano", label: "PDL1 (%)", type: "pdl1_range" },
            { id: "MSI-H-ano", label: "MSI-H / dMMR" },
        ],
        "Vie biliari": [
            { id: "CCA-intraepatico", label: "Colangiocarcinoma intraepatico" },
            { id: "CCA-ilare", label: "Colangiocarcinoma ilare (Klatskin)" },
            { id: "CCA-distale", label: "Colangiocarcinoma distale" },
            { id: "Colecisti", label: "Colecisti" },
            { id: "FGFR2-fus", label: "FGFR2 fusione / riarrangiamento" },
            { id: "IDH1mut", label: "IDH1 mut" },
            { id: "IDH2mut", label: "IDH2 mut" },
            { id: "BRAF-V600E-vb", label: "BRAF V600E" },
            { id: "HER2-vb", label: "HER2 amplificazione" },
            { id: "ERBB2mut-vb", label: "ERBB2 mut" },
            { id: "PDL1-vb", label: "PDL1 (%)", type: "pdl1_range" },
            { id: "MSI-H-vb", label: "MSI-H / dMMR" },
            { id: "NTRK-vb", label: "NTRK" },
        ],
        "Pancreas": [
            { id: "PDAC", label: "Adenocarcinoma duttale (PDAC)" },
            { id: "pNET", label: "Tumore neuroendocrino (pNET)" },
            { id: "BRCA1-panc", label: "BRCA1 mut" },
            { id: "BRCA2-panc", label: "BRCA2 mut" },
            { id: "PALB2-panc", label: "PALB2 mut" },
            { id: "ATM-panc", label: "ATM mut" },
            { id: "KRAS-panc", label: "KRAS" },
            { id: "KRAS-G12C-panc", label: "KRAS G12C" },
            { id: "MSI-H-panc", label: "MSI-H / dMMR" },
            { id: "NTRK-panc", label: "NTRK" },
        ],
        "Fegato": [
            { id: "Child-Pugh-A", label: "Child-Pugh A" },
            { id: "Child-Pugh-B7", label: "Child-Pugh B (score 7)" },
            { id: "HBV", label: "HBV correlato" },
            { id: "HCV", label: "HCV correlato" },
            { id: "AFP-alto", label: "AFP elevata (>400 ng/mL)" },
        ],

        // ============================================================
        // GINECOLOGICO
        // ============================================================
        "Endometrio": [
            { id: "Endometrioide-end", label: "Endometrioide" },
            { id: "Sieroso-end", label: "Sieroso" },
            { id: "CelluleChiare-end", label: "A cellule chiare" },
            { id: "Carcinosarcoma-end", label: "Carcinosarcoma" },
            { id: "MSI-H-end", label: "MSI-H / dMMR" },
            { id: "p53mut-end", label: "p53 mutato (TCGA IV)" },
            { id: "POLEmut-end", label: "POLE mutato (TCGA I)" },
            { id: "HER2-end", label: "HER2 positivo" },
            { id: "FGFR2mut-end", label: "FGFR2 mut" },
            { id: "ERPR-end", label: "ER/PR positivo" },
        ],
        "Ovaio": [
            { id: "HGSOC", label: "Sieroso alto grado (HGSOC)" },
            { id: "LGSOC", label: "Sieroso basso grado (LGSOC)" },
            { id: "Mucinoso-ov", label: "Mucinoso" },
            { id: "Endometrioide-ov", label: "Endometrioide" },
            { id: "CelluleChiare-ov", label: "A cellule chiare" },
            { id: "BRCA1/2-ov", label: "BRCA1/2 mut" },
            { id: "HRD-pos-ov", label: "HRD positivo (non BRCA)" },
            { id: "HRD-neg-ov", label: "HRD negativo" },
            { id: "platino-sens-ov", label: "Platino-sensibile" },
            { id: "platino-res-ov", label: "Platino-resistente" },
            { id: "platino-refr-ov", label: "Platino-refrattaria" },
            { id: "FRalfa-ov", label: "FRα positivo (FOLR1)" },
        ],
        "Cervice": [
            { id: "SCC-cervice", label: "Carcinoma Squamocellulare" },
            { id: "Adenocarcinoma-cervice", label: "Adenocarcinoma" },
            { id: "HPV-cervice", label: "HPV correlato" },
            { id: "PDL1-CPS-cervice", label: "PDL1 CPS (%)", type: "pdl1_range" },
            { id: "MSI-H-cervice", label: "MSI-H / dMMR" },
        ],
        "Vulva": [
            { id: "SCC-vulva", label: "Carcinoma Squamocellulare" },
            { id: "HPV-vulva", label: "HPV correlato" },
            { id: "TP53mut-vulva", label: "TP53 mutato" },
            { id: "PDL1-vulva", label: "PDL1 (%)", type: "pdl1_range" },
        ],

        // ============================================================
        // PROSTATA E VIE URINARIE
        // ============================================================
        "Prostata": [
            { id: "Adenocarcinoma-prost", label: "Adenocarcinoma" },
            { id: "NEPC-prost", label: "Carcinoma neuroendocrino / piccole cellule" },
            { id: "CRPC-prost", label: "CRPC (castrazione resistente)" },
            { id: "mHSPC-prost", label: "mHSPC (metastatico ormono-sensibile)" },
            { id: "BRCA1/2-prost", label: "BRCA1/2 mut" },
            { id: "ATM-prost", label: "ATM mut" },
            { id: "MSI-H-prost", label: "MSI-H / dMMR" },
            { id: "PTEN-loss-prost", label: "PTEN loss" },
            { id: "Gleason-prost", label: "Gleason Score", type: "number", min: 6, max: 10, placeholder: "6-10" },
        ],
        "Rene": [
            { id: "ccRCC", label: "Cellule chiare (ccRCC)" },
            { id: "pRCC1", label: "Papillare tipo 1 (MET driven)" },
            { id: "pRCC2", label: "Papillare tipo 2 (FH mut)" },
            { id: "chRCC", label: "Cromofobo" },
            { id: "VHL-rene", label: "VHL mut" },
        ],
        "Vescica": [
            { id: "Uroteliale-vesc", label: "Carcinoma uroteliale" },
            { id: "SCC-vesc", label: "Carcinoma Squamocellulare" },
            { id: "Adenocarcinoma-vesc", label: "Adenocarcinoma" },
            { id: "PDL1-vesc", label: "PDL1 (%)", type: "pdl1_range" },
            { id: "FGFR3-vesc", label: "FGFR3 alterazione" },
            { id: "FGFR2-fus-vesc", label: "FGFR2 fusione" },
            { id: "HER2-vesc", label: "HER2 amplificazione" },
            { id: "MSI-H-vesc", label: "MSI-H / dMMR" },
            { id: "platino-elig-vesc", label: "Platino-eligible" },
            { id: "platino-inelig-vesc", label: "Platino-ineligible" },
        ],
        "Altre vie Urinarie": [
            { id: "Uroteliale-pelvi", label: "Carcinoma uroteliale della pelvi renale" },
            { id: "Uroteliale-uretere", label: "Carcinoma uroteliale dell'uretere" },
            { id: "Carcinoma-uretrale", label: "Carcinoma uretrale" },
            { id: "FGFR3-altreVU", label: "FGFR3 alterazione" },
            { id: "PDL1-altreVU", label: "PDL1 (%)", type: "pdl1_range" },
            { id: "HER2-altreVU", label: "HER2 amplificazione" },
            { id: "FGFR2-fus-altreVU", label: "FGFR2 fusione" },
            { id: "MSI-H-altreVU", label: "MSI-H / dMMR" },
        ],

        // ============================================================
        // MELANOMA E CUTE
        // ============================================================
        "Melanoma": [
            { id: "Cutaneo-mel", label: "Cutaneo" },
            { id: "Mucosale-mel", label: "Mucosale" },
            { id: "Uveale-mel", label: "Uveale / Oculare" },
            { id: "Acrale-mel", label: "Acrale" },
            { id: "BRAF-V600E-mel", label: "BRAF V600E" },
            { id: "BRAF-V600K-mel", label: "BRAF V600K" },
            { id: "NRAS-mel", label: "NRAS mut" },
            { id: "KIT-mel", label: "KIT mut" },
            { id: "PDL1-mel", label: "PDL1 (%)", type: "pdl1_range" },
            { id: "MSI-H-mel", label: "MSI-H / dMMR" },
            { id: "met-encefaliche-mel", label: "Metastasi encefaliche" },
            { id: "LDH-elevata-mel", label: "LDH elevata" },
        ],
        "SCC": [
            { id: "PDL1-SCC-cut", label: "PDL1 (%)", type: "pdl1_range" },
        ],
        "Basalioma": [],

        // ============================================================
        // TESTA-COLLO (specifiche per singola sottosede)
        // ============================================================
        "Cavo orale: lingua anteriore, labbra, gengive, mucosa buccale, pavimento della bocca, palato duro": [
            ...BASE_HNSCC,
            { id: "Adenocarcinoma-CO", label: "Adenocarcinoma" },
            { id: "Mucoepidermoide-CO", label: "Carcinoma mucoepidermoide" },
        ],
        "Orofaringe: base della lingua, tonsille palatine, palato molle": [
            ...BASE_HNSCC,
            { id: "HPV-p16-OF", label: "HPV positivo (p16+)" },
            { id: "HPV-neg-OF", label: "HPV negativo" },
        ],
        "Laringe: sopraglottica, glottide, sottoglottica": [
            ...BASE_HNSCC,
            { id: "Sovraglottica-LAR", label: "Sovraglottica" },
            { id: "Glottide-LAR", label: "Glottide" },
            { id: "Sottoglottica-LAR", label: "Sottoglottica" },
        ],
        "Ipofaringe": [
            ...BASE_HNSCC,
        ],
        "Nasofaringe (o rinofaringe)": [
            ...BASE_HNSCC,
            { id: "EBV-NPC", label: "EBV positivo" },
        ],
        "Cavità nasali e seni paranasali: seni mascellari, etmoidali, sfenoidali e frontali": [
            ...BASE_HNSCC,
            { id: "Adenocarcinoma-SNS", label: "Adenocarcinoma (intestinal-type)" },
            { id: "Esthesioneuroblastoma", label: "Esthesioneuroblastoma" },
            { id: "SNUC", label: "Carcinoma sinonasale indifferenziato (SNUC)" },
        ],
        "Ghiandole Salivari: parotide, sottomandibolare, sottolinguale, ghiandole salivari minori": [
            ...BASE_HNSCC,
            { id: "Mucoepidermoide-GS", label: "Carcinoma mucoepidermoide" },
            { id: "Adenoidocistico-GS", label: "Carcinoma adenoidocistico" },
            { id: "Acinico-GS", label: "Carcinoma acinico" },
            { id: "HER2-GS", label: "HER2 positivo" },
            { id: "NTRK-GS", label: "NTRK" },
            { id: "HRAS-GS", label: "HRAS mut" },
            { id: "MYBL1-NFIB-GS", label: "Fusione MYBL1-NFIB" },
        ],
    };

    /**
     * Costruisce i checkbox/numeric input di "Specifiche Ulteriori"
     * nel container passato, in base alle specifiche aree selezionate.
     * savedValues: oggetto {id: true} per checkbox, {id: number} per numerici paziente,
     *              {id: {op:">=",val:1}} / {id:{op:"range",min:1,max:49}} per pdl1_range studio.
     * mode: "study" (default) | "patient"
     */
    function renderFurtherSpecifics(containerEl, selectedSpecificAreas, savedValues, mode) {
        if (!containerEl) return;
        const isStudy = (mode !== "patient");
        containerEl.innerHTML = "";

        // Raccoglie tutte le opzioni uniche per le aree selezionate
        const seen = new Set();
        const allOptions = [];
        (Array.isArray(selectedSpecificAreas) ? selectedSpecificAreas : [selectedSpecificAreas])
            .forEach(area => {
                const opts = furtherSpecificsMap[area] || [];
                opts.forEach(opt => {
                    if (!seen.has(opt.id)) {
                        seen.add(opt.id);
                        allOptions.push(opt);
                    }
                });
            });

        if (allOptions.length === 0) return;

        allOptions.forEach(opt => {
            if (opt.type === "pdl1_range") {
                if (isStudy) {
                    // --- STUDIO: operatore + valore(i) ---
                    const saved = savedValues && savedValues[opt.id];
                    const savedOp  = (saved && saved.op)  ? saved.op  : ">=";
                    const savedVal = (saved && saved.val !== undefined) ? saved.val : "";
                    const savedMin = (saved && saved.min !== undefined) ? saved.min : "";
                    const savedMax = (saved && saved.max !== undefined) ? saved.max : "";

                    const wrapper = document.createElement("div");
                    wrapper.className = "flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] flex-wrap";
                    wrapper.dataset.pdlId = opt.id;

                    wrapper.innerHTML = `
                        <span class="font-semibold text-slate-700 whitespace-nowrap">PDL1 (%):</span>
                        <select class="pdl1-op-select text-[11px] border border-slate-200 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer" data-id="${opt.id}">
                            <option value=">=" ${savedOp === ">=" ? "selected" : ""}>≥ (almeno)</option>
                            <option value="<=" ${savedOp === "<=" ? "selected" : ""}>≤ (al massimo)</option>
                            <option value="range" ${savedOp === "range" ? "selected" : ""}>Compreso tra</option>
                        </select>
                        <input type="number" class="pdl1-val-input w-14 p-1 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-400 ${savedOp === "range" ? "hidden" : ""}"
                               data-id="${opt.id}" min="0" max="100" placeholder="%" value="${savedVal}">
                        <span class="pdl1-range-sep text-slate-400 ${savedOp !== "range" ? "hidden" : ""}">Min:</span>
                        <input type="number" class="pdl1-min-input w-14 p-1 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-400 ${savedOp !== "range" ? "hidden" : ""}"
                               data-id="${opt.id}" min="0" max="100" placeholder="%" value="${savedMin}">
                        <span class="pdl1-range-sep2 text-slate-400 ${savedOp !== "range" ? "hidden" : ""}">Max:</span>
                        <input type="number" class="pdl1-max-input w-14 p-1 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-400 ${savedOp !== "range" ? "hidden" : ""}"
                               data-id="${opt.id}" min="0" max="100" placeholder="%" value="${savedMax}">
                        <span class="text-slate-400 text-[10px] ml-0.5">%</span>
                    `;
                    containerEl.appendChild(wrapper);

                    // Mostra/nasconde i campi in base all'operatore selezionato
                    const opSel  = wrapper.querySelector(".pdl1-op-select");
                    const valInp = wrapper.querySelector(".pdl1-val-input");
                    const sep1   = wrapper.querySelector(".pdl1-range-sep");
                    const minInp = wrapper.querySelector(".pdl1-min-input");
                    const sep2   = wrapper.querySelector(".pdl1-range-sep2");
                    const maxInp = wrapper.querySelector(".pdl1-max-input");
                    opSel.addEventListener("change", () => {
                        const isRange = opSel.value === "range";
                        valInp.classList.toggle("hidden", isRange);
                        sep1.classList.toggle("hidden", !isRange);
                        minInp.classList.toggle("hidden", !isRange);
                        sep2.classList.toggle("hidden", !isRange);
                        maxInp.classList.toggle("hidden", !isRange);
                    });
                } else {
                    // --- PAZIENTE: campo numerico semplice (valore reale del paziente) ---
                    const savedNum = savedValues && savedValues[opt.id] !== undefined ? savedValues[opt.id] : "";
                    const wrapper = document.createElement("div");
                    wrapper.className = "flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px]";
                    wrapper.innerHTML = `
                        <label class="font-semibold text-slate-700 whitespace-nowrap">PDL1 (%):</label>
                        <input type="number"
                               class="further-specific-number w-16 p-1 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-400"
                               data-id="${opt.id}"
                               min="0" max="100" placeholder="0-100"
                               value="${savedNum !== "" ? savedNum : ""}">
                        <span class="text-slate-400 text-[10px]">%</span>
                    `;
                    containerEl.appendChild(wrapper);
                }
            } else if (opt.type === "number") {
                // Campo numerico generico
                const wrapper = document.createElement("div");
                wrapper.className = "flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px]";
                const savedNum = savedValues && savedValues[opt.id] !== undefined ? savedValues[opt.id] : "";
                wrapper.innerHTML = `
                    <label class="font-semibold text-slate-700 whitespace-nowrap">${opt.label}</label>
                    <input type="number"
                           class="further-specific-number w-16 p-1 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-400"
                           data-id="${opt.id}"
                           min="${opt.min}" max="${opt.max}"
                           placeholder="${opt.placeholder || ''}"
                           value="${savedNum !== "" ? savedNum : ""}">
                `;
                containerEl.appendChild(wrapper);
            } else {
                // Checkbox
                const isChecked = savedValues && savedValues[opt.id] === true;
                const wrapper = document.createElement("label");
                wrapper.className = `flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg border text-[11px] font-semibold select-none transition-colors ${isChecked ? "bg-purple-100 border-purple-300 text-purple-900" : "bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50"}`;
                wrapper.innerHTML = `
                    <input type="checkbox" class="further-specific-cb hidden" data-id="${opt.id}" ${isChecked ? "checked" : ""}>
                    <span>${opt.label}</span>
                `;
                // Toggle visual state on click
                wrapper.addEventListener("click", () => {
                    const cb = wrapper.querySelector("input[type=checkbox]");
                    setTimeout(() => {
                        if (cb.checked) {
                            wrapper.className = "flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg border text-[11px] font-semibold select-none transition-colors bg-purple-100 border-purple-300 text-purple-900";
                        } else {
                            wrapper.className = "flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg border text-[11px] font-semibold select-none transition-colors bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-purple-50";
                        }
                    }, 0);
                });
                containerEl.appendChild(wrapper);
            }
        });
    }

    /**
     * Legge i valori delle Specifiche Ulteriori da un container.
     * Per pdl1_range (studio): ritorna {op, val} o {op:"range", min, max}
     * Per numerico semplice (paziente): ritorna il numero
     */
    function collectFurtherSpecifics(containerEl) {
        const result = {};
        if (!containerEl) return result;

        // Checkbox
        containerEl.querySelectorAll(".further-specific-cb").forEach(cb => {
            if (cb.checked) result[cb.dataset.id] = true;
        });

        // Numerici semplici (paziente o generico)
        containerEl.querySelectorAll(".further-specific-number").forEach(inp => {
            const v = inp.value.trim();
            if (v !== "") result[inp.dataset.id] = parseFloat(v);
        });

        // PDL1 range (studio): ogni wrapper con data-pdl-id
        containerEl.querySelectorAll("[data-pdl-id]").forEach(wrapper => {
            const id = wrapper.dataset.pdlId;
            const opSel  = wrapper.querySelector(".pdl1-op-select");
            const valInp = wrapper.querySelector(".pdl1-val-input");
            const minInp = wrapper.querySelector(".pdl1-min-input");
            const maxInp = wrapper.querySelector(".pdl1-max-input");
            if (!opSel) return;
            const op = opSel.value;
            if (op === "range") {
                const min = minInp && minInp.value.trim() !== "" ? parseFloat(minInp.value) : undefined;
                const max = maxInp && maxInp.value.trim() !== "" ? parseFloat(maxInp.value) : undefined;
                if (min !== undefined || max !== undefined) result[id] = { op: "range", min, max };
            } else {
                const val = valInp && valInp.value.trim() !== "" ? parseFloat(valInp.value) : undefined;
                if (val !== undefined) result[id] = { op, val };
            }
        });

        return result;
    }

    /** Formatta un valore PDL1 per la pill del modale */
    function formatPDL1Value(v) {
        if (typeof v === "number") return `PDL1: ${v}%`;
        if (v && typeof v === "object") {
            if (v.op === ">=") return `PDL1 ≥ ${v.val}%`;
            if (v.op === "<=") return `PDL1 ≤ ${v.val}%`;
            if (v.op === "range") {
                const parts = [];
                if (v.min !== undefined) parts.push(`≥${v.min}%`);
                if (v.max !== undefined) parts.push(`≤${v.max}%`);
                return `PDL1 ${parts.join(" e ")}`;
            }
        }
        return "PDL1";
    }

    /** Mostra/nasconde e popola il container specifiche ulteriori per il form Trial */
    function updateStudyFurtherSpecifics(selectedSpecificAreas, savedValues) {
        const container = document.getElementById("studyFurtherSpecificsContainer");
        const list = document.getElementById("studyFurtherSpecificsList");
        if (!container || !list) return;
        const hasFurther = (Array.isArray(selectedSpecificAreas) ? selectedSpecificAreas : [selectedSpecificAreas])
            .some(a => furtherSpecificsMap[a] && furtherSpecificsMap[a].length > 0);
        if (hasFurther) {
            container.classList.remove("hidden");
            renderFurtherSpecifics(list, selectedSpecificAreas, savedValues || {}, "study");
        } else {
            container.classList.add("hidden");
            list.innerHTML = "";
        }
    }

    /** Mostra/nasconde e popola il container specifiche ulteriori per il form Paziente */
    function updatePatientFurtherSpecifics(selectedSpecificArea, savedValues) {
        const container = document.getElementById("patientFurtherSpecificsContainer");
        const list = document.getElementById("patientFurtherSpecificsList");
        if (!container || !list) return;
        const areas = selectedSpecificArea ? [selectedSpecificArea] : [];
        const hasFurther = areas.some(a => furtherSpecificsMap[a] && furtherSpecificsMap[a].length > 0);
        if (hasFurther) {
            container.classList.remove("hidden");
            renderFurtherSpecifics(list, areas, savedValues || {}, "patient");
        } else {
            container.classList.add("hidden");
            list.innerHTML = "";
        }
    }


    // ----- Selettori per la Pagina Paziente -----
    const searchForm = document.getElementById("searchForm");
    const clinicalAreaSelect = document.getElementById("clinicalArea");
    const specificClinicalAreasSelect = document.getElementById(
        "specificClinicalAreas",
    );
    const specificClinicalAreaContainer = document.getElementById(
        "specificClinicalAreaContainer",
    );
    const treatmentSettingSelect = document.getElementById("treatmentSetting");
    const treatmentLineContainer = document.getElementById(
        "treatmentLineContainer",
    );
    const patientTreatmentLineInput = document.getElementById(
        "patientTreatmentLine",
    );
    const patientTrialListDiv = document.querySelector(
        "#searchResults #trialList",
    );
    

    // ----- Selettori per la Pagina Trial -----
    const studyForm = document.getElementById("studyForm");
    const criteriaListDiv = document.getElementById("criteriaList");
    const addCriteriaBtn = document.getElementById("addCriteriaBtn");
    const studyTitleInput = document.getElementById("studyTitle");
    const studyCodeInput = document.getElementById("studyCode");
    const codeErrorMsg = document.getElementById("codeError");
    const studySubtitleInput = document.getElementById("studySubtitle");
    const studyTreatmentSettingSelect = document.getElementById(
        "studyTreatmentSetting",
    );
    const studyTreatmentLineContainer = document.getElementById(
        "studyTreatmentLineContainer",
    );
    const minTreatmentLineInput = document.getElementById("minTreatmentLine");
    const maxTreatmentLineInput = document.getElementById("maxTreatmentLine");
    const studyClinicalAreasSelect =
        document.getElementById("studyClinicalAreas");
    const studySpecificClinicalAreasSelect = document.getElementById(
        "studySpecificClinicalAreas",
    );
    const studySpecificClinicalAreaContainer = document.getElementById(
        "studySpecificClinicalAreaContainer",
    );
    const studyStatusSelect = document.getElementById("studyStatus");
    const doctorTrialListDiv = document.querySelector(
        "#trialListSection #trialList",
    );
    // ----- Import Studio (JSON) -----
    const studyImportTextarea = document.getElementById("studyImportTextarea");
    const studyImportBtn = document.getElementById("studyImportBtn");
    const studyImportClearBtn = document.getElementById("studyImportClearBtn");
    const studyImportMsg = document.getElementById("studyImportMsg");

    // Filtri per la pagina Trial
    const filterClinicalAreaSelect =
        document.getElementById("filterClinicalArea");
    const filterSpecificClinicalAreasSelect = document.getElementById(
        "filterSpecificClinicalAreas",
    );
    const filterSpecificClinicalAreaContainer = document.getElementById(
        "filterSpecificClinicalAreaContainer",
    );
    const filterTreatmentSettingSelect = document.getElementById(
        "filterTreatmentSetting",
    );

    // ----- Selettori per il Modale -----
    const studyDetailModal = document.getElementById("studyDetailModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const criteriaContainer = document.getElementById("criteriaContainer");
    const checkEligibilityBtn = document.getElementById("checkEligibilityBtn");
    const eligibilityResultDiv = document.getElementById(
        "eligibilityResultDiv",
    );
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalClinicalAreas = document.getElementById("modalClinicalAreas");
    const modalSpecificClinicalAreas = document.getElementById(
        "modalSpecificClinicalAreas",
    );
    const modalTreatmentSetting = document.getElementById(
        "modalTreatmentSetting",
    );
    const modalTreatmentLineContainer = document.getElementById(
        "modalTreatmentLineContainer",
    );
    const modalTreatmentLine = document.getElementById("modalTreatmentLine");
    const modalStudyCode = document.getElementById("modalStudyCode");
    const modalStudyCodeContainer = document.getElementById("modalStudyCodeContainer");
    const modalInternalNotesContainer = document.getElementById("modalInternalNotesContainer");
    const modalInternalNotes = document.getElementById("modalInternalNotes");
    const modalPiContactsContainer = document.getElementById("modalPiContactsContainer");
    const modalPiContacts = document.getElementById("modalPiContacts");
    const modalStudyStatusBadge = document.getElementById("modalStudyStatusBadge");
    // legacy elements (possono essere null nel nuovo layout)
    const modalStudyStatus = document.getElementById("modalStudyStatus");
    const modalStudyStatusCard = document.getElementById("modalStudyStatusCard");
    const modalStudyStatusIcon = document.getElementById("modalStudyStatusIcon");
    const studyInternalNotesInput = document.getElementById("studyInternalNotes");
    const studyPiContactsInput = document.getElementById("studyPiContacts");
    const studyArmsCount = document.getElementById("studyArmsCount");
    const studyArmsContainer = document.getElementById("studyArmsContainer");
    const armsList = document.getElementById("armsList");

    // File management state (used by showStudyDetails and file management section)
    let _currentFilesMeta = null;
    
    if (studyArmsCount) {
      studyArmsCount.addEventListener("change", () => {
        const count = parseInt(studyArmsCount.value, 10);

        if (count <= 1) {
          studyArmsContainer.classList.add("hidden");
          armsList.innerHTML = "";
          return;
        }

        // Leggi le etichette dei bracci già digitate prima di rigenerare
        const existingLabels = [];
        armsList.querySelectorAll(".arm-label").forEach(input => {
          existingLabels.push(input.value);
        });

        studyArmsContainer.classList.remove("hidden");
        armsList.innerHTML = "";

        const defaultCodes = ["A", "B", "C", "D"];

        for (let i = 0; i < count; i++) {
          const code = defaultCodes[i] || String.fromCharCode(65 + i) || `ARM${i+1}`;
          const labelVal = existingLabels[i] || "";

          const div = document.createElement("div");
          div.className = "flex space-x-2";

          div.innerHTML = `
            <input type="text"
                   class="arm-code p-2 w-1/4 border border-gray-300 rounded-lg bg-gray-50"
                   value="${code}"
                   readonly>

            <input type="text"
                   class="arm-label p-2 w-3/4 border border-gray-300 rounded-lg"
                   value="${escapeHtml(labelVal)}"
                   placeholder="Nome braccio (es: Sperimentale)">
          `;

          armsList.appendChild(div);
        }
      });
    }

    // ----- Modale Password -----
    const passwordModal = document.createElement("div");
    passwordModal.id = "passwordModal";
    passwordModal.className =
        "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center hidden z-[20000]";
    passwordModal.style.zIndex = "20000";
    passwordModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl w-80">
            <h3 class="text-lg font-bold mb-4">Inserisci la password</h3>
            <input type="password" id="passwordInput" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage" placeholder="Password" />
            <p id="passwordError" class="text-red-400 text-sm mt-2 hidden">Password errata.</p>
            <div class="flex justify-end mt-4 space-x-2">
                <button id="cancelPasswordBtn" class="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">Annulla</button>
                <button id="confirmPasswordBtn" class="bg-sage text-white font-bold py-2 px-4 rounded-lg hover:bg-dark-sage transition-colors">Conferma</button>
            </div>
        </div>
    `;
    document.body.appendChild(passwordModal);

    const passwordInput = document.getElementById("passwordInput");
    const passwordError = document.getElementById("passwordError");
    const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
    const confirmPasswordBtn = document.getElementById("confirmPasswordBtn");
    let passwordCallback = null;

    // La password NON viene più verificata solo qui nel browser (era
    // bypassabile da chiunque). Ora viene solo memorizzata e inviata
    // al server con ogni richiesta di modifica: è il server a deciderne
    // la validità (vedi authFetch più sotto e requireEditAuth in index.js).
    window._editPwd = window._editPwd || null;

    function showPasswordModal(callback) {
        passwordCallback = callback;
        passwordInput.value = "";
        passwordError.classList.add("hidden");
        passwordModal.classList.remove("hidden");
    }
    cancelPasswordBtn.addEventListener("click", () =>
        passwordModal.classList.add("hidden"),
    );
    confirmPasswordBtn.addEventListener("click", async () => {
        const typed = passwordInput.value;
        try {
            const res = await fetch("/api/verify-password", {
                method: "POST",
                headers: { "x-edit-password": typed },
            });
            if (res.ok) {
                window._editPwd = typed;
                passwordModal.classList.add("hidden");
                if (passwordCallback) passwordCallback();
            } else {
                passwordError.classList.remove("hidden");
            }
        } catch (err) {
            console.error("Errore verifica password:", err);
            passwordError.classList.remove("hidden");
        }
    });

    // Helper: fetch che allega la password di modifica come header.
    // Se il server risponde 403 (password sbagliata), mostra di nuovo
    // il modale invece di far finta che l'operazione sia riuscita.
    async function authFetch(url, options = {}) {
        const headers = {
            ...(options.headers || {}),
            "x-edit-password": window._editPwd || "",
        };
        const res = await fetch(url, { ...options, headers });
        if (res.status === 403) {
            window._editPwd = null;
            alert("Password di modifica errata. Riprova.");
        }
        return res;
    }

    // Escaping HTML di base: usato ovunque un testo inserito da un utente
    // (titolo studio, nome braccio, ecc.) finisce dentro innerHTML, per
    // evitare che simboli come < > vengano interpretati come codice.
    function escapeHtml(str) {
        return String(str ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        })[c]);
    }
    // =====================================================
    // IMPORT STUDIO (JSON da ChatGPT) -> PRECOMPILA IL FORM
    // =====================================================

    function showStudyImportMsg(text, ok = true) {
        if (!studyImportMsg) return;
        studyImportMsg.classList.remove("hidden");
        studyImportMsg.classList.remove("text-green-700", "text-red-600");
        studyImportMsg.classList.add(ok ? "text-green-700" : "text-red-600");
        studyImportMsg.textContent = text;
    }

    function normalizeTreatmentSetting(v) {
        const s = String(v ?? "").trim();
        const allowed = ["Metastatico", "Adiuvante", "Neo-adiuvante"];
        return allowed.includes(s) ? s : "";
    }

    function normalizeClinicalAreas(arr) {
        const allowed = [
            "Mammella",
            "Polmone",
            "Gastro-Intestinale",
            "Ginecologico",
            "Prostata e Vie Urinarie",
            "Melanoma e Cute",
            "Testa-Collo",
            "Fase 1",
            "Altro",
        ];

        const input = Array.isArray(arr) ? arr : arr ? [arr] : [];
        const cleaned = input
            .map((x) => String(x ?? "").trim())
            .filter((x) => allowed.includes(x));

        return Array.from(new Set(cleaned)); // dedup
    }

    function normalizeSpecificAreas(arr) {
        const input = Array.isArray(arr) ? arr : arr ? [arr] : [];
        const cleaned = input.map((x) => String(x ?? "").trim()).filter(Boolean);
        return Array.from(new Set(cleaned));
    }

    function parseStudyImportJson(raw) {
        let obj;
        try {
            obj = JSON.parse(raw);
        } catch {
            throw new Error("JSON non valido: controlla virgole, parentesi e virgolette.");
        }

        // accetto sia {study:{...}} sia {...}
        const study = obj?.study || obj;
        if (!study || typeof study !== "object") {
            throw new Error("JSON valido, ma manca l'oggetto 'study'.");
        }

        const study_code = String(study.study_code ?? study.code ?? "").trim();
        const internal_notes = String(study.internal_notes ?? study.notes ?? "").trim();
        const pi_contacts = String(study.pi_contacts ?? study.contacts ?? study.pi ?? "").trim();
        const status = study.status && ["in_attivazione", "attivo"].includes(study.status) ? study.status : null;

        const title = String(study.title ?? "").trim();
        if (!title) throw new Error("Manca 'title'.");

        const subtitle = String(study.subtitle ?? "").trim();

        const clinical_areas = normalizeClinicalAreas(study.clinical_areas);
        if (clinical_areas.length === 0) {
            throw new Error(
                "Manca o non è valida 'clinical_areas' (deve usare le opzioni della tua lista).",
            );
        }

        const treatment_setting = normalizeTreatmentSetting(study.treatment_setting);
        if (!treatment_setting) {
            throw new Error(
                "Manca o non è valido 'treatment_setting' (Metastatico/Adiuvante/Neo-adiuvante).",
            );
        }

        const specific_clinical_areas = normalizeSpecificAreas(
            study.specific_clinical_areas,
        );

        const min_treatment_line =
            treatment_setting === "Metastatico"
                ? study.min_treatment_line === null ||
                  study.min_treatment_line === undefined ||
                  study.min_treatment_line === ""
                    ? null
                    : parseInt(study.min_treatment_line, 10)
                : null;

        const max_treatment_line =
            treatment_setting === "Metastatico"
                ? study.max_treatment_line === null ||
                  study.max_treatment_line === undefined ||
                  study.max_treatment_line === ""
                    ? null
                    : parseInt(study.max_treatment_line, 10)
                : null;

        const criteriaArr = Array.isArray(study.criteria) ? study.criteria : [];
        const criteria = criteriaArr
            .map((c) => ({
                type: String(c?.type ?? "").trim(),
                text: String(c?.text ?? "").trim(),
            }))
            .filter(
                (c) =>
                    (c.type === "inclusion" || c.type === "exclusion") &&
                    c.text.length > 0,
            );

        const armsArr = Array.isArray(study.arms) ? study.arms : [];
        const arms = armsArr.map((a, idx) => {
            if (typeof a === "string") {
                const code = String.fromCharCode(65 + idx); // A, B, C...
                return { arm_code: code, arm_label: a.trim() };
            } else if (a && typeof a === "object") {
                const code = String(a.arm_code || a.code || String.fromCharCode(65 + idx)).trim();
                const label = String(a.arm_label || a.label || a.name || code).trim();
                return { arm_code: code, arm_label: label };
            }
            return null;
        }).filter(Boolean);

        // Parse events
        const eventsArr = Array.isArray(study.events) ? study.events : [];
        const events = eventsArr.map(ev => ({
            event_type: ev.event_type || "custom",
            title: ev.title || "",
            notes: ev.notes || "",
            indications: ev.indications || "",
            billing: ev.billing || null,
            arm_codes: Array.isArray(ev.arm_codes) ? ev.arm_codes : ["ALL"],
            one_shot: ev.one_shot === true || ev.one_shot === "true",
            at_day: ev.at_day !== undefined ? ev.at_day : null,
            repeat_every_days: ev.repeat_every_days !== undefined ? ev.repeat_every_days : null,
            start_day: ev.start_day !== undefined ? ev.start_day : null,
            stop_day: ev.stop_day !== undefined ? ev.stop_day : null,
            window_before_days: ev.window_before_days !== undefined ? ev.window_before_days : null,
            window_after_days: ev.window_after_days !== undefined ? ev.window_after_days : null,
        }));

        const cycle_weeks = typeof study.cycle_weeks === "number" ? study.cycle_weeks : 4;
        let total_weeks = typeof study.total_weeks === "number" ? study.total_weeks : null;
        if (!total_weeks) {
            let maxDay = 0;
            events.forEach(ev => {
                if (ev.one_shot && typeof ev.at_day === "number") {
                    if (ev.at_day > maxDay) maxDay = ev.at_day;
                } else {
                    if (typeof ev.stop_day === "number") {
                        if (ev.stop_day > maxDay) maxDay = ev.stop_day;
                    } else if (typeof ev.start_day === "number") {
                        if (ev.start_day > maxDay) maxDay = ev.start_day;
                    }
                }
            });
            if (maxDay > 0) {
                total_weeks = Math.ceil((maxDay + 1) / 7);
                // arrotola al multiplo del ciclo
                total_weeks = Math.ceil(total_weeks / cycle_weeks) * cycle_weeks;
            } else {
                total_weeks = 24;
            }
        }

        return {
            study_code,
            title,
            subtitle,
            clinical_areas,
            specific_clinical_areas,
            treatment_setting,
            min_treatment_line: Number.isNaN(min_treatment_line)
                ? null
                : min_treatment_line,
            max_treatment_line: Number.isNaN(max_treatment_line)
                ? null
                : max_treatment_line,
            internal_notes,
            pi_contacts,
            status,
            criteria,
            arms,
            events,
            total_weeks,
            cycle_weeks,
        };
    }

    function setMultiSelectValues(selectEl, values) {
        if (!selectEl) return;
        const set = new Set(values || []);
        Array.from(selectEl.options).forEach((opt) => {
            opt.selected = set.has(opt.value);
        });
    }

    function applyStudyImportToForm(study) {
        // Titolo & sottotitolo
        if (studyTitleInput) studyTitleInput.value = study.title || "";
        if (studySubtitleInput) studySubtitleInput.value = study.subtitle || "";

        // Aree cliniche (multi): prima le setto, poi aggiorno il dropdown specifiche
        setMultiSelectValues(studyClinicalAreasSelect, study.clinical_areas || []);

        // Aggiorna dropdown specifiche in base alle aree selezionate
        if (studyClinicalAreasSelect) {
            const selectedOptions = Array.from(
                studyClinicalAreasSelect.selectedOptions,
            ).map((o) => o.value);
            updateSpecificAreasDropdown(
                selectedOptions,
                studySpecificClinicalAreasSelect,
                studySpecificClinicalAreaContainer,
            );
        }

        // Specifiche (multi): le imposto DOPO aver popolato il dropdown
        setMultiSelectValues(
            studySpecificClinicalAreasSelect,
            study.specific_clinical_areas || [],
        );

        // Codice Studio: usa quello del JSON se presente, altrimenti autogenera con area+specifica
        if (studyCodeInput) {
            if (study.study_code) {
                studyCodeInput.value = study.study_code;
                validateStudyCode();
            } else {
                const selectedAreas = studyClinicalAreasSelect
                    ? Array.from(studyClinicalAreasSelect.selectedOptions).map(o => o.value)
                    : [];
                const selectedSpecific = studySpecificClinicalAreasSelect
                    ? Array.from(studySpecificClinicalAreasSelect.selectedOptions).map(o => o.value)
                    : [];
                autoGenerateStudyCode(selectedAreas, selectedSpecific);
            }
        }

        // Setting
        if (studyTreatmentSettingSelect)
            studyTreatmentSettingSelect.value = study.treatment_setting || "";

        // Sincronizza lo stato visivo delle card e dei chip
        const studyAreaGrid = document.getElementById("studyClinicalAreasCardGrid");
        if (studyClinicalAreasSelect && studyAreaGrid) {
            syncVisualAreaState(studyClinicalAreasSelect, studyAreaGrid, true);
        }
        const studySettingGrid = document.getElementById("studyTreatmentSettingCardGrid");
        if (studyTreatmentSettingSelect && studySettingGrid) {
            syncVisualSettingState(studyTreatmentSettingSelect, studySettingGrid);
        }
        const studyPillGrid = document.getElementById("studySpecificClinicalAreasPillGrid");
        if (studySpecificClinicalAreasSelect && studyPillGrid) {
            renderVisualSubtypePills(studySpecificClinicalAreasSelect, studyPillGrid, true);
        }

        // Linee
        if (study.treatment_setting === "Metastatico") {
            if (studyTreatmentLineContainer)
                studyTreatmentLineContainer.classList.remove("hidden");
            if (minTreatmentLineInput)
                minTreatmentLineInput.value =
                    study.min_treatment_line === null ? "" : String(study.min_treatment_line);
            if (maxTreatmentLineInput)
                maxTreatmentLineInput.value =
                    study.max_treatment_line === null ? "" : String(study.max_treatment_line);
        } else {
            if (studyTreatmentLineContainer)
                studyTreatmentLineContainer.classList.add("hidden");
            if (minTreatmentLineInput) minTreatmentLineInput.value = "";
            if (maxTreatmentLineInput) maxTreatmentLineInput.value = "";
        }

        // Note interne e contatti PI
        if (studyInternalNotesInput) studyInternalNotesInput.value = study.internal_notes || "";
        if (studyPiContactsInput) studyPiContactsInput.value = study.pi_contacts || "";
        if (studyStatusSelect) studyStatusSelect.value = study.status || "";

        // Sincronizza card per Numero Bracci e Stato Studio
        const studyArmsGrid = document.getElementById("studyArmsCountCardGrid");
        if (studyArmsCount && studyArmsGrid) {
            syncVisualArmsCountState(studyArmsCount, studyArmsGrid);
        }
        const studyStatusGrid = document.getElementById("studyStatusCardGrid");
        if (studyStatusSelect && studyStatusGrid) {
            syncVisualStudyStatusState(studyStatusSelect, studyStatusGrid);
        }

        // Criteri: svuota e ricrea
        if (criteriaListDiv) criteriaListDiv.innerHTML = "";
        if (study.criteria && study.criteria.length > 0) {
            study.criteria.forEach((c) => addCriteriaRow(c.text, c.type));
        } else {
            addCriteriaRow();
        }

        // Bracci: svuota e ricrea
        if (studyArmsCount && armsList && studyArmsContainer) {
            const count = Array.isArray(study.arms) ? study.arms.length : 1;
            studyArmsCount.value = String(count);
            if (count <= 1) {
                studyArmsContainer.classList.add("hidden");
                armsList.innerHTML = "";
            } else {
                studyArmsContainer.classList.remove("hidden");
                armsList.innerHTML = "";
                study.arms.forEach((a) => {
                    const div = document.createElement("div");
                    div.className = "flex space-x-2";
                    div.innerHTML = `
                        <input type="text"
                               class="arm-code p-2 w-1/4 border border-gray-300 rounded-lg bg-gray-50"
                               value="${escapeHtml(a.arm_code)}"
                               readonly>
                        <input type="text"
                               class="arm-label p-2 w-3/4 border border-gray-300 rounded-lg"
                               value="${escapeHtml(a.arm_label)}"
                               placeholder="Nome braccio (es: Sperimentale)">
                    `;
                    armsList.appendChild(div);
                });
            }
        }

        // Memorizza gli eventi e le impostazioni per l'invio al salvataggio
        window._importedStudyEvents = Array.isArray(study.events) ? study.events : [];
        window._importedTotalWeeks = study.total_weeks || null;
        window._importedCycleWeeks = study.cycle_weeks || null;

        // Specifiche Ulteriori: pre-popola in base a specific_clinical_areas e further_specifics salvati
        {
            const specificAreas = Array.isArray(study.specific_clinical_areas)
                ? study.specific_clinical_areas
                : (study.specific_clinical_areas ? [study.specific_clinical_areas] : []);
            const savedFS = study.further_specifics || {};
            updateStudyFurtherSpecifics(specificAreas, savedFS);
        }
    }

    const areaPrefixes = {
        "Mammella": "MA",
        "Polmone": "PO",
        "Gastro-Intestinale": "GI",
        "Ginecologico": "GY",
        "Prostata e Vie Urinarie": "PR",
        "Melanoma e Cute": "MC",
        "Testa-Collo": "TC",
        "Fase 1": "F1",
        "Altro": "AL"
    };

    let isCodeDuplicate = false;

    async function validateStudyCode() {
        if (!studyCodeInput || !codeErrorMsg) return;
        const codeValue = studyCodeInput.value.trim();
        if (!codeValue) {
            codeErrorMsg.classList.add("hidden");
            isCodeDuplicate = false;
            return;
        }

        try {
            const response = await fetch("/api/studies");
            const studies = await response.json();

            const duplicateExists = studies.some(
                (s) => s.study_code && s.study_code.trim().toLowerCase() === codeValue.toLowerCase()
            );

            if (duplicateExists) {
                codeErrorMsg.classList.remove("hidden");
                isCodeDuplicate = true;
            } else {
                codeErrorMsg.classList.add("hidden");
                isCodeDuplicate = false;
            }
        } catch (error) {
            console.error("Errore durante la validazione del codice studio:", error);
        }
    }

    async function autoGenerateStudyCode(selectedAreas, selectedSpecificAreas) {
        if (!selectedAreas || selectedAreas.length === 0) {
            if (studyCodeInput) studyCodeInput.value = "";
            return;
        }

        const primaryArea = selectedAreas[0];
        // Prefisso area principale
        const areaPrefix = areaPrefixes[primaryArea] || primaryArea.substring(0, 2).toUpperCase();

        // Prefisso area specifica (se selezionata)
        let specPrefix = "GEN";
        if (selectedSpecificAreas && selectedSpecificAreas.length > 0) {
            const spec = selectedSpecificAreas[0];
            // Abbreviazione fino a 3 caratteri, maiuscolo, senza spazi
            specPrefix = spec.replace(/[^A-Za-z0-9]/g, "").substring(0, 3).toUpperCase();
            if (!specPrefix) specPrefix = "GEN";
        }

        try {
            const response = await fetch("/api/studies");
            const studies = await response.json();

            // Pattern: AREAPREFIX-SPECPREFIX-NNN
            const pattern = new RegExp(`^${areaPrefix}-${specPrefix}-(\\d+)$`, 'i');
            let maxNum = 0;

            studies.forEach((s) => {
                if (s.study_code) {
                    const match = s.study_code.match(pattern);
                    if (match) {
                        const num = parseInt(match[1], 10);
                        if (num > maxNum) maxNum = num;
                    }
                }
            });

            const nextNum = maxNum + 1;
            const newCode = `${areaPrefix}-${specPrefix}-${String(nextNum).padStart(3, "0")}`;

            if (studyCodeInput) {
                studyCodeInput.value = newCode;
                validateStudyCode();
            }
        } catch (error) {
            console.error("Errore durante l'autogenerazione del codice studio:", error);
        }
    }

    // =====================================================
    // SELETTORI VISIVI CUSTOM (CARD GRID & PILLS)
    // =====================================================

    const CLINICAL_AREA_CONFIG = {
        "Mammella": { icon: "fas fa-ribbon", bg: "bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-300", activeBg: "bg-pink-600 text-white border-pink-600 shadow-md ring-2 ring-pink-500/20" },
        "Polmone": { icon: "fas fa-lungs", bg: "bg-cyan-50 text-cyan-700 border-cyan-200 hover:border-cyan-300", activeBg: "bg-cyan-600 text-white border-cyan-600 shadow-md ring-2 ring-cyan-500/20" },
        "Gastro-Intestinale": { icon: "fas fa-utensils", bg: "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300", activeBg: "bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20" },
        "Ginecologico": { icon: "fas fa-venus", bg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:border-fuchsia-300", activeBg: "bg-fuchsia-600 text-white border-fuchsia-600 shadow-md ring-2 ring-fuchsia-500/20" },
        "Prostata e Vie Urinarie": { icon: "fas fa-dna", bg: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300", activeBg: "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20" },
        "Melanoma e Cute": { icon: "fas fa-sun", bg: "bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-300", activeBg: "bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-500/20" },
        "Testa-Collo": { icon: "fas fa-user-nurse", bg: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300", activeBg: "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20" },
        "Fase 1": { icon: "fas fa-bolt", bg: "bg-violet-50 text-violet-700 border-violet-200 hover:border-violet-300", activeBg: "bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-500/20" },
        "Altro": { icon: "fas fa-folder-open", bg: "bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300", activeBg: "bg-slate-800 text-white border-slate-800 shadow-md ring-2 ring-slate-800/20" },
    };

    const SETTING_CONFIG = {
        "Metastatico": { icon: "fas fa-disease", badge: "💥", title: "Metastatico", desc: "Fase avanzata / IV stadio" },
        "Adiuvante": { icon: "fas fa-shield-alt", badge: "🛡️", title: "Adiuvante", desc: "Post-operatorio" },
        "Neo-adiuvante": { icon: "fas fa-rocket", badge: "🚀", title: "Neo-adiuvante", desc: "Pre-operatorio" },
    };

    /** Inizializza la griglia visiva di card per Area Clinica */
    function renderVisualAreaSelector(selectEl, gridContainerEl, isMultiple = false) {
        if (!selectEl || !gridContainerEl) return;
        gridContainerEl.innerHTML = "";

        const areas = [
            "Mammella", "Polmone", "Gastro-Intestinale", "Ginecologico",
            "Prostata e Vie Urinarie", "Melanoma e Cute", "Testa-Collo", "Fase 1", "Altro"
        ];

        areas.forEach(area => {
            const cfg = CLINICAL_AREA_CONFIG[area] || CLINICAL_AREA_CONFIG["Altro"];
            const card = document.createElement("button");
            card.type = "button";
            card.dataset.value = area;

            const isSelected = isMultiple
                ? Array.from(selectEl.selectedOptions).some(o => o.value === area)
                : selectEl.value === area;

            card.className = isSelected
                ? `visual-area-card relative p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-200 cursor-pointer select-none ${cfg.activeBg}`
                : `visual-area-card relative p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-200 cursor-pointer select-none group ${cfg.bg}`;

            card.innerHTML = `
                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-white/70 text-slate-700 shadow-2xs group-hover:scale-105 transition-transform'}">
                    <i class="${cfg.icon} text-xs"></i>
                </div>
                <div class="flex-grow min-w-0">
                    <span class="block text-xs font-bold leading-snug truncate">${area}</span>
                </div>
                <div class="visual-check-icon ${isSelected ? 'block' : 'hidden'} text-xs">
                    <i class="fas fa-check-circle"></i>
                </div>
            `;

            card.addEventListener("click", () => {
                if (isMultiple) {
                    const opt = Array.from(selectEl.options).find(o => o.value === area);
                    if (opt) opt.selected = !opt.selected;
                } else {
                    selectEl.value = area;
                }
                selectEl.dispatchEvent(new Event("change"));
                syncVisualAreaState(selectEl, gridContainerEl, isMultiple);
            });

            gridContainerEl.appendChild(card);
        });
    }

    /** Sincronizza lo stato evidenziato delle card Area Clinica */
    function syncVisualAreaState(selectEl, gridContainerEl, isMultiple = false) {
        if (!selectEl || !gridContainerEl) return;
        const selectedValues = isMultiple
            ? new Set(Array.from(selectEl.selectedOptions).map(o => o.value))
            : new Set([selectEl.value]);

        gridContainerEl.querySelectorAll(".visual-area-card").forEach(card => {
            const val = card.dataset.value;
            const isSelected = selectedValues.has(val);
            const cfg = CLINICAL_AREA_CONFIG[val] || CLINICAL_AREA_CONFIG["Altro"];
            const iconBox = card.querySelector("div:first-child");
            const checkIcon = card.querySelector(".visual-check-icon");

            if (isSelected) {
                card.className = `visual-area-card relative p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-200 cursor-pointer select-none ${cfg.activeBg}`;
                if (iconBox) iconBox.className = "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/20 text-white";
                if (checkIcon) checkIcon.classList.remove("hidden");
            } else {
                card.className = `visual-area-card relative p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-200 cursor-pointer select-none group ${cfg.bg}`;
                if (iconBox) iconBox.className = "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/70 text-slate-700 shadow-2xs group-hover:scale-105 transition-transform";
                if (checkIcon) checkIcon.classList.add("hidden");
            }
        });
    }

    /** Inizializza i selettori visivi a schede per Setting del Trattamento */
    function renderVisualSettingSelector(selectEl, gridContainerEl) {
        if (!selectEl || !gridContainerEl) return;
        gridContainerEl.innerHTML = "";

        const settings = ["Metastatico", "Adiuvante", "Neo-adiuvante"];

        settings.forEach(setting => {
            const cfg = SETTING_CONFIG[setting];
            const isSelected = selectEl.value === setting;

            const card = document.createElement("button");
            card.type = "button";
            card.dataset.value = setting;
            card.className = isSelected
                ? "visual-setting-card p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold text-left transition-all duration-200 shadow-xs cursor-pointer select-none flex items-center justify-between"
                : "visual-setting-card p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 text-left transition-all duration-200 cursor-pointer select-none flex items-center justify-between group";

            card.innerHTML = `
                <div class="flex items-center gap-2.5">
                    <span class="text-base">${cfg.badge}</span>
                    <div>
                        <span class="block text-xs font-bold text-slate-900">${cfg.title}</span>
                        <span class="block text-[10px] text-slate-500 font-normal">${cfg.desc}</span>
                    </div>
                </div>
                <i class="fas fa-check-circle text-emerald-600 text-xs ${isSelected ? 'block' : 'hidden'} visual-setting-check"></i>
            `;

            card.addEventListener("click", () => {
                selectEl.value = setting;
                selectEl.dispatchEvent(new Event("change"));
                syncVisualSettingState(selectEl, gridContainerEl);
            });

            gridContainerEl.appendChild(card);
        });
    }

    /** Sincronizza lo stato visivo delle card Setting */
    function syncVisualSettingState(selectEl, gridContainerEl) {
        if (!selectEl || !gridContainerEl) return;
        const currentVal = selectEl.value;

        gridContainerEl.querySelectorAll(".visual-setting-card").forEach(card => {
            const val = card.dataset.value;
            const isSelected = val === currentVal;
            const check = card.querySelector(".visual-setting-check");

            if (isSelected) {
                card.className = "visual-setting-card p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold text-left transition-all duration-200 shadow-xs cursor-pointer select-none flex items-center justify-between";
                if (check) check.classList.remove("hidden");
            } else {
                card.className = "visual-setting-card p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 text-left transition-all duration-200 cursor-pointer select-none flex items-center justify-between group";
                if (check) check.classList.add("hidden");
            }
        });
    }

    /** Inizializza il selettore visivo per Numero Bracci con opzione Inserimento Manuale */
    function renderVisualArmsCountSelector(selectEl, gridContainerEl) {
        if (!selectEl || !gridContainerEl) return;
        gridContainerEl.innerHTML = "";

        const options = [
            { val: "1", title: "1 Braccio", desc: "Studio a braccio singolo" },
            { val: "2", title: "2 Bracci", desc: "Studio a 2 bracci" },
            { val: "3", title: "3 Bracci", desc: "Studio a 3 bracci" },
            { val: "manual", title: "✏️ Manuale", desc: "Inserisci numero a scelta" },
        ];

        const currentCount = parseInt(selectEl.value, 10) || 1;
        const manualContainer = document.getElementById("manualArmsInputContainer");
        const manualInput = document.getElementById("manualArmsCountInput");

        options.forEach(opt => {
            const isManualSelected = opt.val === "manual" && (currentCount > 3 || selectEl.dataset.isManual === "true");
            const isSelected = opt.val === "manual" ? isManualSelected : (currentCount === parseInt(opt.val, 10) && !isManualSelected);

            const card = document.createElement("button");
            card.type = "button";
            card.dataset.value = opt.val;
            card.className = isSelected
                ? "visual-arms-card p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold text-center transition-all duration-200 shadow-xs cursor-pointer select-none"
                : "visual-arms-card p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 text-center transition-all duration-200 cursor-pointer select-none group";

            card.innerHTML = `
                <div class="flex flex-col items-center justify-center gap-1">
                    <span class="block text-xs font-bold text-slate-900">${opt.title}</span>
                    <span class="block text-[10px] text-slate-400 font-normal truncate max-w-full">${opt.desc}</span>
                </div>
            `;

            card.addEventListener("click", () => {
                if (opt.val === "manual") {
                    selectEl.dataset.isManual = "true";
                    if (manualContainer) manualContainer.classList.remove("hidden");
                    let val = 2;
                    if (manualInput && manualInput.value.trim() !== "") {
                        val = parseInt(manualInput.value, 10) || 2;
                    } else if (currentCount > 1) {
                        val = currentCount;
                    }
                    if (manualInput) manualInput.value = String(val);
                    selectEl.value = String(val);
                    if (manualInput) manualInput.focus();
                } else {
                    selectEl.dataset.isManual = "false";
                    if (manualContainer) manualContainer.classList.add("hidden");
                    selectEl.value = opt.val;
                }
                selectEl.dispatchEvent(new Event("change"));
                syncVisualArmsCountState(selectEl, gridContainerEl);
            });

            gridContainerEl.appendChild(card);
        });
    }

    /** Sincronizza lo stato visivo delle card Numero Bracci */
    function syncVisualArmsCountState(selectEl, gridContainerEl) {
        if (!selectEl || !gridContainerEl) return;
        const currentVal = parseInt(selectEl.value, 10) || 1;
        const isManual = selectEl.dataset.isManual === "true" || currentVal > 3;

        const manualContainer = document.getElementById("manualArmsInputContainer");
        const manualInput = document.getElementById("manualArmsCountInput");

        if (isManual) {
            if (manualContainer) manualContainer.classList.remove("hidden");
            if (manualInput && document.activeElement !== manualInput) {
                manualInput.value = String(currentVal);
            }
        } else {
            if (manualContainer) manualContainer.classList.add("hidden");
        }

        gridContainerEl.querySelectorAll(".visual-arms-card").forEach(card => {
            const val = card.dataset.value;
            const isSelected = val === "manual" ? isManual : (currentVal === parseInt(val, 10) && !isManual);

            if (isSelected) {
                card.className = "visual-arms-card p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold text-center transition-all duration-200 shadow-xs cursor-pointer select-none";
            } else {
                card.className = "visual-arms-card p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 text-center transition-all duration-200 cursor-pointer select-none group";
            }
        });
    }

    /** Inizializza il selettore visivo per Stato dello Studio */
    function renderVisualStudyStatusSelector(selectEl, gridContainerEl) {
        if (!selectEl || !gridContainerEl) return;
        gridContainerEl.innerHTML = "";

        const statuses = [
            { val: "", badge: "⚪", title: "Non Specificato", desc: "Nessun dettaglio sullo stato", activeStyle: "border-2 border-slate-600 bg-slate-100 text-slate-900" },
            { val: "in_attivazione", badge: "🟡", title: "In Attivazione", desc: "Studio in preparazione", activeStyle: "border-2 border-amber-500 bg-amber-50/70 text-amber-950" },
            { val: "attivo", badge: "🟢", title: "Attivo", desc: "Aperto ed arruolante", activeStyle: "border-2 border-emerald-600 bg-emerald-50/70 text-emerald-950" },
        ];

        statuses.forEach(st => {
            const isSelected = (selectEl.value || "") === st.val;
            const card = document.createElement("button");
            card.type = "button";
            card.dataset.value = st.val;
            card.className = isSelected
                ? `visual-status-card p-3 rounded-xl ${st.activeStyle} font-semibold text-left transition-all duration-200 shadow-xs cursor-pointer select-none flex items-center justify-between`
                : "visual-status-card p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 text-left transition-all duration-200 cursor-pointer select-none flex items-center justify-between group";

            card.innerHTML = `
                <div class="flex items-center gap-2.5">
                    <span class="text-base">${st.badge}</span>
                    <div>
                        <span class="block text-xs font-bold text-slate-900">${st.title}</span>
                        <span class="block text-[10px] text-slate-500 font-normal">${st.desc}</span>
                    </div>
                </div>
                <i class="fas fa-check-circle ${st.val === 'in_attivazione' ? 'text-amber-600' : 'text-emerald-600'} text-xs ${isSelected ? 'block' : 'hidden'} visual-status-check"></i>
            `;

            card.addEventListener("click", () => {
                selectEl.value = st.val;
                selectEl.dispatchEvent(new Event("change"));
                syncVisualStudyStatusState(selectEl, gridContainerEl);
            });

            gridContainerEl.appendChild(card);
        });
    }

    /** Sincronizza lo stato visivo delle card Stato Studio */
    function syncVisualStudyStatusState(selectEl, gridContainerEl) {
        if (!selectEl || !gridContainerEl) return;
        const currentVal = selectEl.value || "";

        const statusesMap = {
            "": "border-2 border-slate-600 bg-slate-100 text-slate-900",
            "in_attivazione": "border-2 border-amber-500 bg-amber-50/70 text-amber-950",
            "attivo": "border-2 border-emerald-600 bg-emerald-50/70 text-emerald-950"
        };

        gridContainerEl.querySelectorAll(".visual-status-card").forEach(card => {
            const val = card.dataset.value;
            const isSelected = val === currentVal;
            const check = card.querySelector(".visual-status-check");
            const activeStyle = statusesMap[val] || statusesMap[""];

            if (isSelected) {
                card.className = `visual-status-card p-3 rounded-xl ${activeStyle} font-semibold text-left transition-all duration-200 shadow-xs cursor-pointer select-none flex items-center justify-between`;
                if (check) check.classList.remove("hidden");
            } else {
                card.className = "visual-status-card p-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 text-left transition-all duration-200 cursor-pointer select-none flex items-center justify-between group";
                if (check) check.classList.add("hidden");
            }
        });
    }

    /** Genera i chip interattivi per la Specifica Area Clinica (Sottotipo) */
    function renderVisualSubtypePills(selectEl, pillGridEl, isMultiple = false) {
        if (!selectEl || !pillGridEl) return;
        pillGridEl.innerHTML = "";

        const options = Array.from(selectEl.options).filter(o => o.value !== "");
        if (options.length === 0) return;

        options.forEach(opt => {
            const val = opt.value;
            const isSelected = opt.selected;

            const pill = document.createElement("button");
            pill.type = "button";
            pill.dataset.value = val;
            pill.className = isSelected
                ? "px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white border border-emerald-600 shadow-xs transition-all cursor-pointer select-none flex items-center gap-1.5"
                : "px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer select-none flex items-center gap-1.5";

            pill.innerHTML = `<span>${escapeHtml(val)}</span> <i class="fas fa-check text-[10px] ${isSelected ? 'inline-block' : 'hidden'}"></i>`;

            pill.addEventListener("click", () => {
                if (isMultiple) {
                    opt.selected = !opt.selected;
                } else {
                    Array.from(selectEl.options).forEach(o => o.selected = (o.value === val));
                    selectEl.value = val;
                }
                selectEl.dispatchEvent(new Event("change"));
                renderVisualSubtypePills(selectEl, pillGridEl, isMultiple);
            });

            pillGridEl.appendChild(pill);
        });
    }

    function updateSpecificAreasDropdown(
        selectedAreas,
        selectElement,
        container,
    ) {
        const allSpecificAreas = new Set();
        (Array.isArray(selectedAreas)
            ? selectedAreas
            : [selectedAreas]
        ).forEach((area) => {
            const specificAreas = specificClinicalAreasMap[area];
            if (specificAreas) {
                specificAreas.forEach((sa) => allSpecificAreas.add(sa));
            }
        });
        selectElement.innerHTML = "";
        if (allSpecificAreas.size > 0) {
            if (!selectElement.multiple) {
                const defaultOpt = document.createElement("option");
                defaultOpt.value = "";
                defaultOpt.textContent = "Seleziona un'area specifica (opzionale)";
                defaultOpt.selected = true;
                selectElement.appendChild(defaultOpt);
            }
            Array.from(allSpecificAreas).forEach((area) => {
                const option = document.createElement("option");
                option.value = area;
                option.textContent = area;
                selectElement.appendChild(option);
            });
            container.classList.remove("hidden");

            // Aggiorna anche la griglia visiva dei chip per il sottotipo
            if (selectElement.id === "specificClinicalAreas") {
                const pillGrid = document.getElementById("specificClinicalAreasPillGrid");
                renderVisualSubtypePills(selectElement, pillGrid, false);
            } else if (selectElement.id === "studySpecificClinicalAreas") {
                const pillGrid = document.getElementById("studySpecificClinicalAreasPillGrid");
                renderVisualSubtypePills(selectElement, pillGrid, true);
            }
        } else {
            container.classList.add("hidden");
        }
    }

    // Inizializza i selettori visivi al caricamento del DOM
    const patientAreaGrid = document.getElementById("clinicalAreaCardGrid");
    if (clinicalAreaSelect && patientAreaGrid) {
        renderVisualAreaSelector(clinicalAreaSelect, patientAreaGrid, false);
    }
    const patientSettingGrid = document.getElementById("treatmentSettingCardGrid");
    if (treatmentSettingSelect && patientSettingGrid) {
        renderVisualSettingSelector(treatmentSettingSelect, patientSettingGrid);
    }

    const studyAreaGrid = document.getElementById("studyClinicalAreasCardGrid");
    if (studyClinicalAreasSelect && studyAreaGrid) {
        renderVisualAreaSelector(studyClinicalAreasSelect, studyAreaGrid, true);
    }
    const studySettingGrid = document.getElementById("studyTreatmentSettingCardGrid");
    if (studyTreatmentSettingSelect && studySettingGrid) {
        renderVisualSettingSelector(studyTreatmentSettingSelect, studySettingGrid);
    }

    const studyArmsGrid = document.getElementById("studyArmsCountCardGrid");
    const manualArmsInput = document.getElementById("manualArmsCountInput");

    if (studyArmsCount && studyArmsGrid) {
        renderVisualArmsCountSelector(studyArmsCount, studyArmsGrid);
        studyArmsCount.addEventListener("change", () => syncVisualArmsCountState(studyArmsCount, studyArmsGrid));
    }
    if (manualArmsInput && studyArmsCount) {
        manualArmsInput.addEventListener("input", (e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val) || val < 1) val = 1;
            studyArmsCount.value = String(val);
            studyArmsCount.dispatchEvent(new Event("change"));
        });
    }
    const studyStatusGrid = document.getElementById("studyStatusCardGrid");
    if (studyStatusSelect && studyStatusGrid) {
        renderVisualStudyStatusSelector(studyStatusSelect, studyStatusGrid);
        studyStatusSelect.addEventListener("change", () => syncVisualStudyStatusState(studyStatusSelect, studyStatusGrid));
    }

    if (clinicalAreaSelect) {
        clinicalAreaSelect.addEventListener("change", (e) => {
            updateSpecificAreasDropdown(
                e.target.value,
                specificClinicalAreasSelect,
                specificClinicalAreaContainer,
            );
            // Aggiorna / nasconde le specifiche ulteriori del paziente
            const currentVal = specificClinicalAreasSelect ? specificClinicalAreasSelect.value : "";
            updatePatientFurtherSpecifics(currentVal, {});
            syncVisualAreaState(clinicalAreaSelect, patientAreaGrid, false);
        });
    }
    // Aggiorna specifiche ulteriori paziente quando cambia specifica area clinica
    if (specificClinicalAreasSelect) {
        specificClinicalAreasSelect.addEventListener("change", (e) => {
            updatePatientFurtherSpecifics(e.target.value, {});
            const pillGrid = document.getElementById("specificClinicalAreasPillGrid");
            renderVisualSubtypePills(specificClinicalAreasSelect, pillGrid, false);
        });
    }
    if (studyClinicalAreasSelect) {
        studyClinicalAreasSelect.addEventListener("change", (e) => {
            const selectedAreas = Array.from(e.target.selectedOptions).map((o) => o.value);
            updateSpecificAreasDropdown(
                selectedAreas,
                studySpecificClinicalAreasSelect,
                studySpecificClinicalAreaContainer,
            );
            // Rigenera il codice con area + specifica area corrente
            const selectedSpecific = studySpecificClinicalAreasSelect
                ? Array.from(studySpecificClinicalAreasSelect.selectedOptions).map((o) => o.value)
                : [];
            autoGenerateStudyCode(selectedAreas, selectedSpecific);
            syncVisualAreaState(studyClinicalAreasSelect, studyAreaGrid, true);
        });
    }
    // Rigenera il codice anche quando cambia la Specifica Area Clinica
    // E mostra/nasconde le Specifiche Ulteriori
    if (studySpecificClinicalAreasSelect) {
        studySpecificClinicalAreasSelect.addEventListener("change", () => {
            const selectedAreas = studyClinicalAreasSelect
                ? Array.from(studyClinicalAreasSelect.selectedOptions).map((o) => o.value)
                : [];
            const selectedSpecific = Array.from(studySpecificClinicalAreasSelect.selectedOptions).map((o) => o.value);
            autoGenerateStudyCode(selectedAreas, selectedSpecific);
            // Aggiorna specifiche ulteriori basandosi sulla specifica area clinica
            updateStudyFurtherSpecifics(selectedSpecific, {});
            const pillGrid = document.getElementById("studySpecificClinicalAreasPillGrid");
            renderVisualSubtypePills(studySpecificClinicalAreasSelect, pillGrid, true);
        });
    }
    if (studyCodeInput) {
        studyCodeInput.addEventListener("input", validateStudyCode);
        studyCodeInput.addEventListener("change", validateStudyCode);
    }
    if (filterClinicalAreaSelect) {
        filterClinicalAreaSelect.addEventListener("change", () => {
            updateSpecificAreasDropdown(
                filterClinicalAreaSelect.value,
                filterSpecificClinicalAreasSelect,
                filterSpecificClinicalAreaContainer,
            );
            fetchAndRenderTrials();
        });
    }
    if (filterSpecificClinicalAreasSelect) {
        filterSpecificClinicalAreasSelect.addEventListener(
            "change",
            fetchAndRenderTrials,
        );
    }
    if (filterTreatmentSettingSelect) {
        filterTreatmentSettingSelect.addEventListener(
            "change",
            fetchAndRenderTrials,
        );
    }

    if (treatmentSettingSelect) {
        treatmentSettingSelect.addEventListener("change", (e) => {
            if (e.target.value === "Metastatico") {
                treatmentLineContainer.classList.remove("hidden");
            } else {
                treatmentLineContainer.classList.add("hidden");
                patientTreatmentLineInput.value = "";
            }
            syncVisualSettingState(treatmentSettingSelect, patientSettingGrid);
        });
    }
    if (studyTreatmentSettingSelect) {
        studyTreatmentSettingSelect.addEventListener("change", (e) => {
            if (e.target.value === "Metastatico") {
                studyTreatmentLineContainer.classList.remove("hidden");
            } else {
                studyTreatmentLineContainer.classList.add("hidden");
                minTreatmentLineInput.value = "";
                maxTreatmentLineInput.value = "";
            }
            syncVisualSettingState(studyTreatmentSettingSelect, studySettingGrid);
        });
    }

    function addCriteriaRow(text = "", type = "inclusion") {
        if (!criteriaListDiv) return;
        const row = document.createElement("div");
        row.className =
            "criteria-item flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4";
        const isExclusion = type === "exclusion";
        row.innerHTML = `
            <input type="text" value="${text}" class="criteria-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage" placeholder="Descrizione del criterio" required>
            <div class="flex items-center space-x-2">
                <button type="button" class="type-toggle-btn px-4 py-2 rounded-full font-semibold text-xs transition-colors whitespace-nowrap ${isExclusion ? "bg-red-400 text-white" : "bg-sage text-white"}">
                    ${isExclusion ? "Esclusione" : "Inclusione"}
                </button>
                <button type="button" class="remove-criteria-btn text-red-400 hover:text-red-600 transition-colors"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        const typeToggleButton = row.querySelector(".type-toggle-btn");
        typeToggleButton.addEventListener("click", () => {
            const isExclusion =
                typeToggleButton.textContent.trim() === "Esclusione";
            if (isExclusion) {
                typeToggleButton.textContent = "Inclusione";
                typeToggleButton.classList.remove("bg-red-400");
                typeToggleButton.classList.add("bg-sage");
            } else {
                typeToggleButton.textContent = "Esclusione";
                typeToggleButton.classList.remove("bg-sage");
                typeToggleButton.classList.add("bg-red-400");
            }
        });
        criteriaListDiv.appendChild(row);
        row.querySelector(".remove-criteria-btn").addEventListener(
            "click",
            (e) => e.target.closest(".criteria-item").remove(),
        );
    }
    if (addCriteriaBtn)
        addCriteriaBtn.addEventListener("click", () => addCriteriaRow());
    // ======================
    // LISTENER IMPORT STUDIO
    // ======================

    if (studyImportClearBtn && studyImportTextarea) {
        studyImportClearBtn.addEventListener("click", () => {
            studyImportTextarea.value = "";
            if (studyImportMsg) studyImportMsg.classList.add("hidden");
        });
    }

    if (studyImportBtn && studyImportTextarea) {
        studyImportBtn.addEventListener("click", () => {
            try {
                const raw = (studyImportTextarea.value || "").trim();
                if (!raw) {
                    showStudyImportMsg("Incolla un JSON prima di precompilare.", false);
                    return;
                }

                const study = parseStudyImportJson(raw);
                applyStudyImportToForm(study);

                if (!study.criteria || study.criteria.length === 0) {
                    showStudyImportMsg(
                        "Precompilazione OK. Nota: nessun criterio trovato nel JSON, inseriscili a mano.",
                        true,
                    );
                } else {
                    showStudyImportMsg(
                        `Precompilazione OK: caricati ${study.criteria.length} criteri. Controlla e poi salva.`,
                        true,
                    );
                }
            } catch (e) {
                showStudyImportMsg(`❌ ${e.message}`, false);
            }
        });
    }

    // ---- Pulsante Modifica nel modale dello studio ----
    const modalEditStudyBtn = document.getElementById("modalEditStudyBtn");
    const studyFormSubmitBtn = document.getElementById("studyFormSubmitBtn");
    const studyFormCancelEditBtn = document.getElementById("studyFormCancelEditBtn");

    // Porta il form in modalità creazione
    function resetFormEditMode() {
        window._editingStudyId = null;
        if (studyFormSubmitBtn) {
            studyFormSubmitBtn.textContent = "Salva Studio";
            studyFormSubmitBtn.style.backgroundColor = "#10b981";
        }
        if (studyFormCancelEditBtn) studyFormCancelEditBtn.classList.add("hidden");
        const editBanner = document.getElementById("studyFormEditBanner");
        if (editBanner) editBanner.remove();
    }

    // Porta il form in modalità modifica e pre-compila con i dati dello studio
    async function enterFormEditMode(studyId) {
        try {
            const res = await fetch(`/api/studies/${studyId}`);
            if (!res.ok) { alert("Studio non trovato."); return; }
            const study = await res.json();

            // Fallback se arms non è ancora presente
            if (!Array.isArray(study.arms) || study.arms.length === 0) {
                try {
                    const armsRes = await fetch(`/api/studies/${studyId}/arms`);
                    if (armsRes.ok) {
                        const fetchedArms = await armsRes.json();
                        if (Array.isArray(fetchedArms) && fetchedArms.length > 0) {
                            study.arms = fetchedArms;
                        }
                    }
                } catch (e) {
                    console.warn("Impossibile recuperare i bracci dello studio:", e);
                }
            }

            // Chiude il modale dettagli
            closeDetailModal();

            // Pre-compila il form
            applyStudyImportToForm(study);

            // Entra in edit mode
            window._editingStudyId = studyId;

            if (studyFormSubmitBtn) {
                studyFormSubmitBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Aggiorna Studio';
                studyFormSubmitBtn.style.backgroundColor = "#d97706"; // amber
            }
            if (studyFormCancelEditBtn) studyFormCancelEditBtn.classList.remove("hidden");

            // Aggiunge banner informativo
            const existingBanner = document.getElementById("studyFormEditBanner");
            if (!existingBanner) {
                const banner = document.createElement("div");
                banner.id = "studyFormEditBanner";
                banner.className = "mb-4 px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-sm font-semibold flex items-center gap-2";
                banner.innerHTML = `<i class="fas fa-edit"></i> Stai modificando lo studio: <span class="font-mono">${escapeHtml(study.study_code || study.title)}</span>`;
                const studyFormEl = document.getElementById("studyForm");
                if (studyFormEl) studyFormEl.insertAdjacentElement("beforebegin", banner);
            }

            // Scrolla al form
            const formSection = document.querySelector(".bg-white.border.border-slate-200.p-8.rounded-2xl");
            if (formSection) formSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (err) {
            console.error("enterFormEditMode error:", err);
            alert("Errore nel caricamento dei dati dello studio.");
        }
    }

    if (modalEditStudyBtn) {
        modalEditStudyBtn.addEventListener("click", () => {
            const studyId = studyDetailModal ? studyDetailModal.dataset.studyId : null;
            if (!studyId) return;

            if (window.location.pathname === "/trials") {
                // Sulla pagina trial: pre-compila il form direttamente
                showPasswordModal(() => enterFormEditMode(studyId));
            } else {
                // Da altre pagine: vai alla pagina trial con parametro ?edit=
                showPasswordModal(() => {
                    window.location.href = `/trials?edit=${studyId}`;
                });
            }
        });
    }

    if (studyFormCancelEditBtn) {
        studyFormCancelEditBtn.addEventListener("click", () => {
            resetFormEditMode();
            if (studyForm) studyForm.reset();
            if (criteriaListDiv) { criteriaListDiv.innerHTML = ""; addCriteriaRow(); }
            if (studySpecificClinicalAreaContainer) studySpecificClinicalAreaContainer.classList.add("hidden");
            if (studyTreatmentLineContainer) studyTreatmentLineContainer.classList.add("hidden");
            if (studyArmsCount) studyArmsCount.value = "1";
            if (armsList) armsList.innerHTML = "";
            if (studyArmsContainer) studyArmsContainer.classList.add("hidden");
        });
    }

    if (studyForm) {
        studyForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Leggi il codice PRIMA di aprire il modale password
            const codeValue = studyCodeInput ? studyCodeInput.value.trim() : "";
            if (!codeValue) {
                if (studyCodeInput) studyCodeInput.focus();
                alert("Il Codice Studio è obbligatorio. Seleziona un'area clinica per generarlo automaticamente.");
                return;
            }

            // Controlla duplicati in tempo reale prima del modale password
            // (in edit mode, esclude lo studio corrente)
            try {
                const dupRes = await fetch("/api/studies");
                const allStudies = await dupRes.json();
                const isDup = allStudies.some(
                    (s) => s.study_code &&
                           s.study_code.trim().toLowerCase() === codeValue.toLowerCase() &&
                           String(s.id) !== String(window._editingStudyId || "")
                );
                if (isDup) {
                    if (codeErrorMsg) codeErrorMsg.classList.remove("hidden");
                    alert("Impossibile salvare: il Codice Studio inserito è già esistente.");
                    return;
                }
                if (codeErrorMsg) codeErrorMsg.classList.add("hidden");
            } catch (err) {
                console.warn("Validazione duplicati fallita, si procede comunque:", err);
            }

            // Helper per leggere file in Base64
            const getFileBase64 = (file) => {
                if (!file) return Promise.resolve(null);
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve({ data: e.target.result, name: file.name, mime: file.type });
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(file);
                });
            };

            showPasswordModal(async () => {
                const criteriaItems = document.querySelectorAll(".criteria-item");
                const criteria = Array.from(criteriaItems).map((item) => ({
                    text: item.querySelector(".criteria-input").value,
                    type:
                        item.querySelector(".type-toggle-btn").textContent.trim() === "Esclusione"
                            ? "exclusion"
                            : "inclusion",
                }));
                const selectedClinicalAreas = Array.from(
                    studyClinicalAreasSelect.selectedOptions,
                ).map((o) => o.value);
                const selectedSpecificClinicalAreas = studySpecificClinicalAreasSelect
                    ? Array.from(studySpecificClinicalAreasSelect.selectedOptions).map((o) => o.value)
                    : [];
                const arms = [];

                if (studyArmsCount && parseInt(studyArmsCount.value, 10) > 1) {
                  document.querySelectorAll("#armsList > div").forEach(div => {
                    const code = div.querySelector(".arm-code")?.value;
                    const label = div.querySelector(".arm-label")?.value;

                    if (code && label && label.trim()) {
                      arms.push({
                        arm_code: code,
                        arm_label: label.trim()
                      });
                    }
                  });
                }

                // Leggi i file caricati nel form
                let protocol_pdf = null;
                let study_schema = null;
                let study_schema_mime = null;
                const extra_files = [];

                const protocolInput = document.getElementById("studyFormProtocol");
                if (protocolInput && protocolInput.files && protocolInput.files[0]) {
                    const res = await getFileBase64(protocolInput.files[0]);
                    if (res) protocol_pdf = res.data;
                }

                const schemaInput = document.getElementById("studyFormSchema");
                if (schemaInput && schemaInput.files && schemaInput.files[0]) {
                    const res = await getFileBase64(schemaInput.files[0]);
                    if (res) {
                        study_schema = res.data;
                        study_schema_mime = res.mime;
                    }
                }

                const extrasInput = document.getElementById("studyFormExtras");
                if (extrasInput && extrasInput.files && extrasInput.files.length > 0) {
                    const limit = Math.min(extrasInput.files.length, 4);
                    for (let i = 0; i < limit; i++) {
                        const file = extrasInput.files[i];
                        const res = await getFileBase64(file);
                        if (res) {
                            extra_files.push({ name: res.name, mime: res.mime, data: res.data });
                        }
                    }
                }

                // Leggi eventi e impostazioni dall'import JSON (se presenti)
                const importedEvents = window._importedStudyEvents || [];
                const importedTotalWeeks = window._importedTotalWeeks || null;
                const importedCycleWeeks = window._importedCycleWeeks || null;
                window._importedStudyEvents = null;
                window._importedTotalWeeks = null;
                window._importedCycleWeeks = null;

                const newStudy = {
                  study_code: codeValue,
                  title: studyTitleInput.value,
                  subtitle: studySubtitleInput.value,
                  clinical_areas: selectedClinicalAreas,
                  specific_clinical_areas: selectedSpecificClinicalAreas,
                  further_specifics: collectFurtherSpecifics(document.getElementById("studyFurtherSpecificsList")),
                  treatment_setting: studyTreatmentSettingSelect.value,
                  min_treatment_line:
                    studyTreatmentSettingSelect.value === "Metastatico"
                      ? parseInt(minTreatmentLineInput.value)
                      : null,
                  max_treatment_line:
                    studyTreatmentSettingSelect.value === "Metastatico"
                      ? parseInt(maxTreatmentLineInput.value)
                      : null,
                  internal_notes: studyInternalNotesInput ? studyInternalNotesInput.value.trim() : "",
                  pi_contacts: studyPiContactsInput ? studyPiContactsInput.value.trim() : "",
                  status: studyStatusSelect ? (studyStatusSelect.value || null) : null,
                  criteria,
                  arms,
                  events: importedEvents,
                  total_weeks: importedTotalWeeks,
                  cycle_weeks: importedCycleWeeks,
                  protocol_pdf,
                  study_schema,
                  study_schema_mime,
                  extra_files
                };


                const isEditMode = !!window._editingStudyId;
                const apiUrl = isEditMode
                    ? `/api/studies/${window._editingStudyId}`
                    : "/api/studies";
                const apiMethod = isEditMode ? "PUT" : "POST";

                const response = await authFetch(apiUrl, {
                    method: apiMethod,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newStudy),
                });
                if (!response.ok) {
                    if (response.status !== 403) {
                        try {
                            const errData = await response.json();
                            alert("Errore salvataggio: " + (errData.error || response.statusText));
                        } catch (_) {
                            alert("Errore salvataggio: " + response.statusText);
                        }
                    }
                    return;
                }
                // Reset edit mode
                resetFormEditMode();
                studyForm.reset();
                if (codeErrorMsg) codeErrorMsg.classList.add("hidden");
                isCodeDuplicate = false;
                if (studyInternalNotesInput) studyInternalNotesInput.value = "";
                if (studyPiContactsInput) studyPiContactsInput.value = "";
                if (studyStatusSelect) studyStatusSelect.value = "";
                studySpecificClinicalAreaContainer.classList.add("hidden");
                studyTreatmentLineContainer.classList.add("hidden");
                criteriaListDiv.innerHTML = "";
                addCriteriaRow();
                
                // Reset Bracci
                if (studyArmsCount) studyArmsCount.value = "1";
                if (armsList) armsList.innerHTML = "";
                if (studyArmsContainer) studyArmsContainer.classList.add("hidden");

                // Reset Import JSON
                if (studyImportTextarea) studyImportTextarea.value = "";
                if (studyImportMsg) studyImportMsg.classList.add("hidden");
                window._importedStudyEvents = null;
                window._importedTotalWeeks = null;
                window._importedCycleWeeks = null;

                fetchAndRenderTrials();
            });
        });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const patientData = {
                clinicalAreas: clinicalAreaSelect.value,
                specificClinicalAreas: specificClinicalAreasSelect.value,
                treatmentSetting: treatmentSettingSelect.value,
                treatmentLine: patientTreatmentLineInput.value
                    ? parseInt(patientTreatmentLineInput.value)
                    : null,
                furtherSpecifics: collectFurtherSpecifics(document.getElementById("patientFurtherSpecificsList")),
            };
            const response = await fetch("/api/studies");
            const studies = await response.json();
            const filteredStudies = studies.filter((study) => {
                const clinicalAreaMatch = study.clinical_areas.includes(
                    patientData.clinicalAreas,
                );
                const specificClinicalAreaMatch =
                    patientData.specificClinicalAreas === "" ||
                    !patientData.specificClinicalAreas ||
                    study.specific_clinical_areas.includes(
                        patientData.specificClinicalAreas,
                    );
                const treatmentSettingMatch =
                    study.treatment_setting === patientData.treatmentSetting;
                let treatmentLineMatch = true;
                if (
                    patientData.treatmentSetting === "Metastatico" &&
                    patientData.treatmentLine !== null
                ) {
                    const minLine = study.min_treatment_line || 0;
                    const maxLine = study.max_treatment_line || 999;
                    treatmentLineMatch =
                        patientData.treatmentLine >= minLine &&
                        patientData.treatmentLine <= maxLine;
                }
                // Specifiche Ulteriori: se lo studio richiede specifiche ulteriori,
                // vengono verificate solo se il paziente ha inserito/selezionato una specifica nel form di ricerca.
                // Se il paziente NON specifica un valore (patientVal === undefined), lo studio viene comunque incluso.
                let furtherSpecificsMatch = true;
                let studyFS = study.further_specifics;
                if (typeof studyFS === "string") {
                    try { studyFS = JSON.parse(studyFS); } catch(e) { studyFS = {}; }
                }
                if (studyFS && typeof studyFS === "object" && Object.keys(studyFS).length > 0) {
                    furtherSpecificsMatch = Object.keys(studyFS).every(key => {
                        const studyVal = studyFS[key];
                        const patientVal = patientData.furtherSpecifics ? patientData.furtherSpecifics[key] : undefined;

                        // Se lo studio richiede un'istologia incompatibile con quella del paziente, lo studio non è idoneo
                        if (studyVal === true) {
                            if (key === "SCC" && patientData.furtherSpecifics?.ADK === true && !patientVal) return false;
                            if (key === "ADK" && patientData.furtherSpecifics?.SCC === true && !patientVal) return false;
                            if (key === "Duttale" && patientData.furtherSpecifics?.Lobulare === true && !patientVal) return false;
                            if (key === "Lobulare" && patientData.furtherSpecifics?.Duttale === true && !patientVal) return false;
                        }

                        // Se il paziente NON ha specificato nulla per questa opzione, non escludiamo lo studio
                        if (patientVal === undefined || patientVal === "" || patientVal === null) {
                            return true;
                        }

                        if (studyVal === true) {
                            // Booleano (es. ADK): se il paziente ha specificato la spunta, deve essere true
                            return patientVal === true;
                        }
                        if (typeof studyVal === "number") {
                            // Numerico legacy (es. PDL1 ≥ soglia dello studio)
                            return typeof patientVal === "number" && patientVal >= studyVal;
                        }
                        if (studyVal && typeof studyVal === "object") {
                            // Oggetto con operatore (es. { op: ">=", val: 50 }, { op: "<=", val: 1 }, { op: "range", min: 1, max: 49 })
                            if (typeof patientVal !== "number") return true;
                            if (studyVal.op === ">=") {
                                return studyVal.val !== undefined ? patientVal >= studyVal.val : true;
                            }
                            if (studyVal.op === "<=") {
                                return studyVal.val !== undefined ? patientVal <= studyVal.val : true;
                            }
                            if (studyVal.op === "range") {
                                const minOk = studyVal.min !== undefined ? patientVal >= studyVal.min : true;
                                const maxOk = studyVal.max !== undefined ? patientVal <= studyVal.max : true;
                                return minOk && maxOk;
                            }
                        }
                        return true;
                    });
                }
                return (
                    clinicalAreaMatch &&
                    specificClinicalAreaMatch &&
                    treatmentSettingMatch &&
                    treatmentLineMatch &&
                    furtherSpecificsMatch
                );

            });
            renderSearchResults(filteredStudies, "patient");
            // Mostra la sezione CT.gov e memorizza i dati del paziente
            window._ctgovPatientData = patientData;
            window._ctgovEnabledParams = {
                area: true,        // Selezionato di default
                specific: !!patientData.specificClinicalAreas, // Selezionato di default se presente
                setting: true,     // Selezionato di default
                line: false,       // Deselezionato di default (selezionabile a scelta del medico)
                further: {}        // Tutti deselezionati di default (selezionabili a scelta del medico)
            };

            const ctgovSection = document.getElementById("ctgovSection");
            if (ctgovSection) {
                ctgovSection.classList.remove("hidden");
                renderCtgovActivePills();
            }
            // Reset risultati precedenti
            const ctgovResults = document.getElementById("ctgovResults");
            if (ctgovResults) ctgovResults.innerHTML = "";
        });
    }

    // =========================================================
    //  CLINICALTRIALS.GOV INTEGRATION
    // =========================================================

    // =========================================================
    //  CLINICALTRIALS.GOV INTEGRATION
    // =========================================================

    // Mappe di sinonimi arricchite per ricerca booleana su CT.gov API v2
    const CTGOV_AREA_MAP = {
        "Mammella": '"breast cancer" OR "breast carcinoma" OR "breast neoplasm" OR "breast tumor" OR "breast tumour" OR "mammary"',
        "Polmone": '"lung cancer" OR "lung carcinoma" OR "lung neoplasm" OR "lung tumor" OR "lung tumour" OR "pulmonary" OR "thoracic cancer"',
        "Gastro-Intestinale": '"gastrointestinal cancer" OR "gastrointestinal oncology" OR "GI cancer" OR "gastric cancer" OR "colorectal cancer" OR "pancreatic cancer" OR "esophageal cancer" OR "liver cancer"',
        "Ginecologico": '"gynecologic cancer" OR "gynecological cancer" OR "ovarian cancer" OR "endometrial cancer" OR "cervical cancer" OR "uterine cancer" OR "vulvar cancer"',
        "Prostata e Vie Urinarie": '"prostate cancer" OR "prostatic cancer" OR "bladder cancer" OR "renal cancer" OR "kidney cancer" OR "urothelial carcinoma" OR "urinary tract cancer"',
        "Melanoma e Cute": '"melanoma" OR "skin cancer" OR "skin carcinoma" OR "cutaneous carcinoma" OR "cutaneous squamous cell" OR "basal cell carcinoma"',
        "Testa-Collo": '"head and neck cancer" OR "head and neck squamous cell carcinoma" OR "HNSCC" OR "laryngeal cancer" OR "pharyngeal cancer" OR "oral cancer"',
        "Fase 1": '"solid tumor" OR "advanced cancer" OR "metastatic cancer" OR "refractory solid tumor"',
        "Altro": '"cancer" OR "tumor" OR "tumour" OR "neoplasm" OR "malignancy"',
    };

    const CTGOV_SETTING_MAP = {
        "Metastatico": '"metastatic" OR "advanced" OR "stage IV" OR "disseminated" OR "stage 4"',
        "Adiuvante": '"adjuvant" OR "postoperative" OR "post-operative" OR "post-resection" OR "post resection"',
        "Neo-adiuvante": '"neoadjuvant" OR "preoperative" OR "pre-operative" OR "induction chemotherapy" OR "primary systemic therapy"',
    };

    const CTGOV_LINE_MAP = {
        1: '"first-line" OR "first line" OR "1st-line" OR "1st line" OR "1-line" OR "1L" OR "front-line" OR "front line" OR "previously untreated" OR "untreated" OR "treatment-naive" OR "naive"',
        2: '"second-line" OR "second line" OR "2nd-line" OR "2nd line" OR "2-line" OR "2L" OR "previously treated" OR "prior therapy" OR "relapsed" OR "refractory"',
        3: '"third-line" OR "third line" OR "3rd-line" OR "3rd line" OR "3-line" OR "3L" OR "heavily pretreated"',
    };

    const CTGOV_SPECIFIC_MAP = {
        // --- MAMMELLA ---
        "Luminali":      '"luminal" OR "HR positive" OR "HR-positive" OR "hormone receptor positive" OR "ER positive" OR "ER-positive" OR "estrogen receptor positive" OR "estrogen-dependent" OR "HR+/HER2-" OR "HR+/HER2" OR "HR+ / HER2-"',
        "TNBC":          '"TNBC" OR "triple negative" OR "triple-negative" OR "triple negative breast"',
        "HER2 positive": '"HER2 positive" OR "HER2-positive" OR "HER-2 positive" OR "HER-2-positive" OR "HER2+" OR "HER2 amplified" OR "HER2-overexpressing"',
        // --- POLMONE ---
        "NSCLC":         '"NSCLC" OR "non-small cell lung cancer" OR "non small cell lung cancer" OR "non-small-cell lung"',
        "SCLC":          '"SCLC" OR "small cell lung cancer" OR "small-cell lung cancer"',
        "Mesotelioma":   '"mesothelioma" OR "pleural mesothelioma" OR "peritoneal mesothelioma"',
        // --- GASTRO-INTESTINALE ---
        "Esofago":       '"esophagus" OR "esophageal" OR "esophageal cancer" OR "oesophagus" OR "oesophageal" OR "gastroesophageal junction" OR "GEJ" OR "Siewert"',
        "Stomaco":       '"gastric" OR "stomach" OR "gastric cancer" OR "gastric adenocarcinoma" OR "gastroesophageal" OR "GEJ" OR "gastric carcinoma"',
        "Colon":         '"colon" OR "colonic" OR "colorectal" OR "colon cancer" OR "colonic cancer"',
        "Retto":         '"rectum" OR "rectal" OR "colorectal" OR "rectal cancer" OR "rectal carcinoma"',
        "Ano":           '"anal" OR "anus" OR "anal canal" OR "anal carcinoma" OR "anal squamous cell"',
        "Vie biliari":   '"biliary" OR "cholangiocarcinoma" OR "gallbladder" OR "bile duct" OR "biliary tract" OR "intrahepatic cholangiocarcinoma" OR "extrahepatic cholangiocarcinoma" OR "hilar" OR "Klatskin"',
        "Pancreas":      '"pancreas" OR "pancreatic" OR "pancreatic ductal adenocarcinoma" OR "PDAC" OR "pancreatic cancer" OR "exocrine pancreas"',
        "Fegato":        '"liver" OR "hepatocellular" OR "HCC" OR "hepatocellular carcinoma" OR "hepatic cancer" OR "liver cancer"',
        // --- GINECOLOGICO ---
        "Endometrio":    '"endometrial" OR "endometrium" OR "endometrial cancer" OR "uterine cancer" OR "uterine corpus" OR "corpus uteri"',
        "Ovaio":         '"ovarian" OR "ovary" OR "ovarian cancer" OR "ovarian carcinoma" OR "fallopian tube" OR "peritoneal carcinoma" OR "primary peritoneal"',
        "Cervice":       '"cervical" OR "cervix" OR "cervical cancer" OR "cervix uteri"',
        "Vulva":         '"vulvar" OR "vulva" OR "vulval" OR "vulvar cancer" OR "vulvar carcinoma"',
        "Altri":         "",
        // --- PROSTATA E VIE URINARIE ---
        "Prostata":      '"prostate" OR "prostatic" OR "prostate cancer" OR "prostatic adenocarcinoma" OR "castration"',
        "Rene":          '"renal" OR "kidney" OR "renal cell carcinoma" OR "RCC" OR "renal cell cancer" OR "clear cell renal"',
        "Vescica":       '"bladder" OR "urothelial" OR "urothelial carcinoma" OR "bladder cancer" OR "transitional cell carcinoma"',
        "Altre vie Urinarie": '"urinary" OR "urothelial" OR "renal pelvis" OR "ureter" OR "ureteral" OR "urethral" OR "upper tract urothelial"',
        // --- MELANOMA E CUTE ---
        "Melanoma":      '"melanoma" OR "cutaneous melanoma" OR "malignant melanoma" OR "uveal melanoma" OR "acral melanoma" OR "mucosal melanoma"',
        "SCC":           '"squamous cell skin" OR "cutaneous squamous cell" OR "cSCC" OR "skin squamous cell carcinoma" OR "cutaneous SCC"',
        "Basalioma":     '"basal cell skin" OR "basal cell carcinoma" OR "BCC" OR "basal cell cancer" OR "basalioma"',
        // --- TESTA-COLLO ---
        "Cavo orale: lingua anteriore, labbra, gengive, mucosa buccale, pavimento della bocca, palato duro":
            '"oral cavity" OR "oral cancer" OR "tongue" OR "mouth" OR "buccal" OR "gingival" OR "lip" OR "floor of mouth" OR "hard palate"',
        "Orofaringe: base della lingua, tonsille palatine, palato molle":
            '"oropharynx" OR "oropharyngeal" OR "tonsil" OR "tonsillar" OR "base of tongue" OR "soft palate"',
        "Laringe: sopraglottica, glottide, sottoglottica":
            '"larynx" OR "laryngeal" OR "glottic" OR "supraglottic" OR "subglottic" OR "laryngeal cancer"',
        "Ipofaringe":
            '"hypopharynx" OR "hypopharyngeal" OR "pyriform sinus" OR "posterior pharyngeal wall"',
        "Nasofaringe (o rinofaringe)":
            '"nasopharynx" OR "nasopharyngeal" OR "nasopharyngeal carcinoma" OR "NPC" OR "rhinopharynx"',
        "Cavità nasali e seni paranasali: seni mascellari, etmoidali, sfenoidali e frontali":
            '"nasal cavity" OR "paranasal" OR "maxillary sinus" OR "ethmoid" OR "sphenoid" OR "frontal sinus" OR "sinonasal"',
        "Ghiandole Salivari: parotide, sottomandibolare, sottolinguale, ghiandole salivari minori":
            '"salivary gland" OR "salivary" OR "parotid" OR "submandibular" OR "sublingual" OR "minor salivary"',
    };

    const CTGOV_FURTHER_MAP = {

        // ============================================================
        // POLMONE — Istologie & Biomarcatori
        // ============================================================
        "ADK":           '"adenocarcinoma" OR "adenocarcinomas" OR "ADK" OR "glandular carcinoma" OR "acinar" OR "papillary adenocarcinoma" OR "mucinous adenocarcinoma"',
        "SCC-NSCLC":     '"squamous" OR "squamous cell" OR "squamous cell carcinoma" OR "SCC" OR "epidermoid" OR "epidermoid carcinoma" OR "squamous lung"',
        "PDL1":          '"PD-L1" OR "PDL1" OR "PD L1" OR "CD274" OR "programmed death-ligand 1" OR "programmed cell death ligand 1" OR "programmed death ligand 1"',
        "EGFR":          '"EGFR" OR "E.G.F.R." OR "ERBB1" OR "ERBB-1" OR "ERBB 1" OR "epidermal growth factor receptor"',
        "ALK":           '"ALK" OR "A.L.K." OR "anaplastic lymphoma kinase" OR "ALK-positive" OR "ALK positive" OR "ALK rearrangement" OR "ALK fusion"',
        "KRAS":          '"KRAS" OR "K-RAS" OR "K RAS" OR "K-ras proto-oncogene" OR "KRAS mutation" OR "KRAS mutated"',
        "ROS1":          '"ROS1" OR "ROS-1" OR "ROS 1" OR "ROS proto-oncogene 1" OR "ROS1 rearrangement" OR "ROS1 fusion"',
        "BRAF-V600":     '"BRAF" OR "B-RAF" OR "B RAF" OR "V600" OR "V600E" OR "V600K" OR "BRAF-V600" OR "BRAF V600" OR "BRAF-V600E"',
        "RET":           '"RET" OR "RET-rearranged" OR "RET rearrangement" OR "RET fusion" OR "RET proto-oncogene"',
        "NTRK":          '"NTRK" OR "NTRK1" OR "NTRK2" OR "NTRK3" OR "neurotrophic tyrosine receptor kinase" OR "NTRK fusion" OR "TRK fusion"',
        "HER2":          '"HER2" OR "HER-2" OR "HER 2" OR "ERBB2" OR "ERBB-2" OR "ERBB 2" OR "human epidermal growth factor receptor 2" OR "neu"',
        "MET":           '"MET" OR "c-MET" OR "cMET" OR "c-Met" OR "MET exon 14" OR "MET amplification" OR "hepatocyte growth factor receptor" OR "MET skipping"',
        "EGFR ex20ins":  '"EGFR exon 20" OR "EGFR-exon-20" OR "EGFR ex20ins" OR "exon 20 insertion" OR "exon 20 ins" OR "exon 20 ins EGFR"',

        // ============================================================
        // MESOTELIOMA
        // ============================================================
        "Epitelioide":   '"epithelioid" OR "epithelial mesothelioma" OR "epithelioid mesothelioma"',
        "Bifasico":      '"biphasic" OR "mixed mesothelioma" OR "biphasic mesothelioma"',
        "Sarcomatoide":  '"sarcomatoid" OR "sarcomatous" OR "sarcomatoid mesothelioma"',

        // ============================================================
        // MAMMELLA
        // ============================================================
        "Duttale":       '"ductal" OR "ductal carcinoma" OR "infiltrating ductal" OR "invasive ductal" OR "IDC"',
        "Lobulare":      '"lobular" OR "lobular carcinoma" OR "infiltrating lobular" OR "invasive lobular" OR "ILC"',
        "ESR1mut":       '"ESR1" OR "ESR-1" OR "ESR 1" OR "estrogen receptor 1" OR "ESR1 mutation" OR "ESR1 mutated"',
        "PIK3CAmut":     '"PIK3CA" OR "PIK3-CA" OR "PI3K" OR "PI3Kalpha" OR "phosphatidylinositol-4,5-bisphosphate 3-kinase catalytic subunit alpha"',
        "AKTmut":        '"AKT" OR "AKT1" OR "AKT-1" OR "AKT 1" OR "AKT1 E17K" OR "protein kinase B"',
        "PTENmut":       '"PTEN" OR "phosphatase and tensin homolog" OR "PTEN loss" OR "PTEN deletion"',
        "BRCA1/2mut":    '"BRCA" OR "BRCA1" OR "BRCA-1" OR "BRCA 1" OR "BRCA2" OR "BRCA-2" OR "BRCA 2" OR "breast cancer gene" OR "BRCA mutated" OR "BRCA mutation" OR "gBRCA" OR "germline BRCA"',
        "PALB2":         '"PALB2" OR "PALB-2" OR "partner and localizer of BRCA2"',
        "HER2 low":      '"HER2 low" OR "HER2-low" OR "HER-2 low" OR "HER-2-low" OR "HER 2 low" OR "HER2 1+" OR "HER2 2+" OR "HER2 1-plus" OR "HER2 2-plus"',
        "HER2 ultra-low":'"HER2 ultra-low" OR "HER2-ultralow" OR "HER2 ultralow" OR "HER-2 ultra low" OR "HER-2 ultralow" OR "HER-2-ultralow"',

        // ============================================================
        // GASTRO-INTESTINALE — Esofago
        // ============================================================
        "Adenocarcinoma-esofago": '"esophageal adenocarcinoma" OR "adenocarcinoma of the esophagus" OR "gastroesophageal junction adenocarcinoma" OR "GEJ adenocarcinoma" OR "AEG"',
        "SCC-esofago":            '"esophageal squamous" OR "squamous cell carcinoma of the esophagus" OR "esophageal SCC" OR "esophageal squamous cell carcinoma" OR "ESCC"',
        "HER2-esofago":           '"HER2" OR "HER-2" OR "ERBB2" OR "HER2 positive" OR "HER2-positive" OR "HER2 amplified"',
        "PDL1-CPS-esofago":       '"PD-L1" OR "PDL1" OR "PD L1" OR "CPS" OR "combined positive score" OR "programmed death-ligand 1"',
        "MSI-H-esofago":          '"MSI-H" OR "MSI" OR "microsatellite instability" OR "microsatellite instability-high" OR "dMMR" OR "mismatch repair deficient" OR "MMR deficient"',
        "NTRK-esofago":           '"NTRK" OR "NTRK1" OR "NTRK2" OR "NTRK3" OR "TRK" OR "neurotrophic tyrosine receptor kinase" OR "NTRK fusion"',

        // ============================================================
        // GASTRO-INTESTINALE — Stomaco
        // ============================================================
        "Adenocarcinoma-gastrico": '"gastric adenocarcinoma" OR "adenocarcinoma of the stomach" OR "gastric cancer" OR "stomach adenocarcinoma"',
        "Signet-ring-gastrico":   '"signet ring" OR "signet-ring cell" OR "signet ring cell carcinoma" OR "poorly cohesive carcinoma"',
        "HER2-stomaco":           '"HER2 gastric" OR "HER2-positive gastric" OR "gastric HER2" OR "ERBB2 gastric" OR "trastuzumab gastric"',
        "PDL1-CPS-stomaco":       '"PD-L1" OR "PDL1" OR "CPS" OR "combined positive score" OR "programmed death-ligand 1"',
        "FGFR2b":                 '"FGFR2b" OR "FGFR2" OR "fibroblast growth factor receptor 2" OR "FGFR2b overexpression" OR "bemarituzumab"',
        "CLDN18-2":               '"CLDN18.2" OR "CLDN18" OR "claudin 18.2" OR "claudin-18.2" OR "claudin 18" OR "zolbetuximab" OR "IMAB362"',
        "EBV-stomaco":            '"EBV" OR "Epstein-Barr" OR "Epstein Barr virus" OR "EBV-positive" OR "EBV-associated" OR "EBV-associated gastric"',
        "MSI-H-stomaco":          '"MSI-H" OR "MSI" OR "microsatellite instability" OR "microsatellite instability-high" OR "dMMR" OR "mismatch repair deficient"',
        "NTRK-stomaco":           '"NTRK" OR "NTRK1" OR "NTRK2" OR "NTRK3" OR "TRK fusion" OR "neurotrophic tyrosine receptor kinase"',

        // ============================================================
        // GASTRO-INTESTINALE — Colon
        // ============================================================
        "MSI-H-colon":            '"MSI-H" OR "MSI" OR "microsatellite instability" OR "microsatellite instability-high" OR "dMMR" OR "mismatch repair" OR "MMR-deficient"',
        "KRAS-colon":             '"KRAS" OR "KRAS mutation" OR "KRAS mutated" OR "KRAS-mutant" OR "KRAS mutant"',
        "KRAS-G12C-colon":        '"KRAS G12C" OR "KRAS-G12C" OR "KRAS G12C mutation" OR "G12C mutation" OR "sotorasib" OR "adagrasib" OR "KRAS p.G12C"',
        "BRAF-V600E-colon":       '"BRAF V600E" OR "BRAF-V600E" OR "BRAF mutation" OR "BRAF-mutant" OR "encorafenib" OR "BRAF V600E colorectal"',
        "HER2-colon":             '"HER2 amplification" OR "HER2-amplified" OR "HER2 amplified colorectal" OR "HER2 colorectal" OR "ERBB2 amplification" OR "HER2 positive colorectal"',
        "NTRK-colon":             '"NTRK" OR "NTRK1" OR "NTRK2" OR "NTRK3" OR "TRK" OR "TRK fusion" OR "neurotrophic tyrosine receptor kinase"',
        "lato-dx-colon":          '"right colon" OR "right-sided colon" OR "right-sided colorectal" OR "ascending colon" OR "cecum" OR "hepatic flexure" OR "right colon cancer" OR "right-sided"',
        "lato-sx-colon":          '"left colon" OR "left-sided colon" OR "left-sided colorectal" OR "descending colon" OR "sigmoid" OR "splenic flexure" OR "left colon cancer" OR "left-sided"',
        "signet-ring-colon":      '"signet ring" OR "signet-ring cell" OR "signet ring cell carcinoma" OR "poorly cohesive"',

        // ============================================================
        // GASTRO-INTESTINALE — Retto
        // ============================================================
        "MSI-H-retto":            '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient" OR "MSI-H rectal"',
        "KRAS-retto":             '"KRAS" OR "KRAS mutated" OR "KRAS mutation" OR "KRAS-mutant rectal"',
        "KRAS-G12C-retto":        '"KRAS G12C" OR "KRAS-G12C" OR "G12C mutation" OR "sotorasib rectal" OR "adagrasib rectal"',
        "BRAF-V600E-retto":       '"BRAF V600E" OR "BRAF-V600E" OR "BRAF mutation rectal" OR "encorafenib rectal"',
        "HER2-retto":             '"HER2 amplification rectal" OR "HER2 rectal" OR "ERBB2 amplification rectal"',
        "NTRK-retto":             '"NTRK" OR "NTRK1" OR "NTRK2" OR "NTRK3" OR "TRK fusion"',
        "retto-alto":             '"upper rectal" OR "high rectal" OR "upper third rectum" OR "upper rectal cancer"',
        "retto-medio":            '"mid rectal" OR "middle rectal" OR "middle third rectum" OR "mid-rectal cancer"',
        "retto-basso":            '"low rectal" OR "lower rectal" OR "lower third rectum" OR "low rectal cancer"',

        // ============================================================
        // GASTRO-INTESTINALE — Ano
        // ============================================================
        "SCC-anale":              '"anal squamous" OR "anal squamous cell carcinoma" OR "squamous cell carcinoma of the anus" OR "anal SCC" OR "anal canal squamous"',
        "HPV-ano":                '"HPV" OR "human papillomavirus" OR "HPV-associated" OR "HPV-positive anal" OR "HPV-related"',
        "PDL1-ano":               '"PD-L1" OR "PDL1" OR "programmed death-ligand 1" OR "pembrolizumab anal" OR "immune checkpoint"',
        "MSI-H-ano":              '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient"',

        // ============================================================
        // GASTRO-INTESTINALE — Vie Biliari
        // ============================================================
        "CCA-intraepatico":       '"intrahepatic cholangiocarcinoma" OR "intrahepatic CCA" OR "iCCA" OR "intrahepatic bile duct" OR "intrahepatic biliary"',
        "CCA-ilare":              '"hilar cholangiocarcinoma" OR "Klatskin tumor" OR "Klatskin" OR "perihilar cholangiocarcinoma" OR "perihilar CCA" OR "pCCA"',
        "CCA-distale":            '"distal cholangiocarcinoma" OR "distal bile duct" OR "distal CCA" OR "extrahepatic distal"',
        "Colecisti":              '"gallbladder cancer" OR "gallbladder carcinoma" OR "gallbladder adenocarcinoma" OR "cholecystic"',
        "FGFR2-fus":              '"FGFR2" OR "FGFR2 fusion" OR "FGFR2 rearrangement" OR "fibroblast growth factor receptor 2" OR "pemigatinib" OR "infigratinib" OR "futibatinib" OR "FGFR inhibitor"',
        "IDH1mut":                '"IDH1" OR "IDH1 mutation" OR "IDH1-mutated" OR "IDH1 mutant" OR "ivosidenib" OR "isocitrate dehydrogenase 1"',
        "IDH2mut":                '"IDH2" OR "IDH2 mutation" OR "IDH2-mutated" OR "IDH2 mutant" OR "enasidenib" OR "isocitrate dehydrogenase 2"',
        "BRAF-V600E-vb":          '"BRAF V600E" OR "BRAF-V600E" OR "BRAF mutation" OR "BRAF biliary" OR "BRAF cholangiocarcinoma"',
        "HER2-vb":                '"HER2 amplification" OR "HER2-amplified" OR "ERBB2 amplification" OR "HER2 biliary" OR "HER2 cholangiocarcinoma"',
        "ERBB2mut-vb":            '"ERBB2 mutation" OR "HER2 mutation" OR "ERBB2 mutated" OR "HER2-mutated" OR "ERBB2 mutant"',
        "PDL1-vb":                '"PD-L1" OR "PDL1" OR "programmed death-ligand 1" OR "durvalumab" OR "TOPAZ" OR "immune checkpoint biliary"',
        "MSI-H-vb":               '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient"',
        "NTRK-vb":                '"NTRK" OR "NTRK1" OR "NTRK2" OR "NTRK3" OR "TRK" OR "neurotrophic tyrosine receptor kinase"',

        // ============================================================
        // GASTRO-INTESTINALE — Pancreas
        // ============================================================
        "PDAC":                   '"pancreatic ductal adenocarcinoma" OR "PDAC" OR "ductal adenocarcinoma" OR "exocrine pancreatic"',
        "pNET":                   '"pancreatic neuroendocrine" OR "pNET" OR "neuroendocrine tumor pancreas" OR "islet cell tumor" OR "carcinoid pancreas" OR "NET pancreas" OR "pancreatic NET"',
        "BRCA1-panc":             '"BRCA1" OR "BRCA-1" OR "BRCA1 mutation" OR "BRCA1 mutated" OR "germline BRCA1" OR "gBRCA1"',
        "BRCA2-panc":             '"BRCA2" OR "BRCA-2" OR "BRCA2 mutation" OR "BRCA2 mutated" OR "germline BRCA2" OR "gBRCA2" OR "olaparib pancreatic"',
        "PALB2-panc":             '"PALB2" OR "PALB-2" OR "partner and localizer of BRCA2" OR "PALB2 mutation"',
        "ATM-panc":               '"ATM" OR "ATM mutation" OR "ATM-mutated" OR "ataxia telangiectasia mutated" OR "ATM deficient"',
        "KRAS-panc":              '"KRAS" OR "KRAS mutation" OR "KRAS-mutated" OR "KRAS mutant pancreatic"',
        "KRAS-G12C-panc":         '"KRAS G12C" OR "KRAS-G12C" OR "G12C pancreatic" OR "sotorasib pancreatic" OR "adagrasib pancreatic"',
        "MSI-H-panc":             '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient" OR "MSI pancreatic"',
        "NTRK-panc":              '"NTRK" OR "NTRK1" OR "NTRK2" OR "NTRK3" OR "TRK fusion" OR "neurotrophic tyrosine receptor kinase"',

        // ============================================================
        // GASTRO-INTESTINALE — Fegato
        // ============================================================
        "Child-Pugh-A":           '"Child-Pugh A" OR "Child-Pugh class A" OR "CPA" OR "Child Pugh A" OR "preserved liver function" OR "well-compensated cirrhosis"',
        "Child-Pugh-B7":          '"Child-Pugh B" OR "Child-Pugh B7" OR "Child-Pugh B score 7" OR "CPS B7" OR "compensated cirrhosis B"',
        "HBV":                    '"HBV" OR "hepatitis B" OR "hepatitis B virus" OR "HBV-related" OR "HBV-associated" OR "HBsAg positive" OR "hepatitis B surface antigen"',
        "HCV":                    '"HCV" OR "hepatitis C" OR "hepatitis C virus" OR "HCV-related" OR "HCV-associated" OR "anti-HCV positive"',
        "AFP-alto":               '"AFP" OR "alpha-fetoprotein" OR "alpha fetoprotein" OR "AFP elevated" OR "AFP high" OR "AFP >400"',

        // ============================================================
        // GINECOLOGICO — Endometrio
        // ============================================================
        "Endometrioide-end":      '"endometrioid" OR "endometrioid endometrial" OR "endometrioid adenocarcinoma" OR "endometrioid carcinoma"',
        "Sieroso-end":            '"serous endometrial" OR "endometrial serous" OR "uterine serous" OR "serous carcinoma endometrial" OR "serous uterine"',
        "CelluleChiare-end":      '"clear cell endometrial" OR "clear cell carcinoma endometrial" OR "endometrial clear cell" OR "uterine clear cell"',
        "Carcinosarcoma-end":     '"carcinosarcoma" OR "uterine carcinosarcoma" OR "malignant mixed Mullerian tumor" OR "MMMT" OR "mixed carcinosarcoma"',
        "MSI-H-end":              '"MSI-H" OR "MSI" OR "microsatellite instability" OR "microsatellite instability-high" OR "dMMR" OR "mismatch repair deficient" OR "MSI-H endometrial"',
        "p53mut-end":             '"p53" OR "TP53" OR "TP53 mutation" OR "p53 mutated" OR "p53-abnormal" OR "TCGA group IV" OR "serous-like endometrial"',
        "POLEmut-end":            '"POLE" OR "POLE mutation" OR "POLE-mutated" OR "POLE mutant" OR "polymerase epsilon" OR "TCGA group I" OR "ultramutated" OR "ultra-mutated"',
        "HER2-end":               '"HER2" OR "HER-2" OR "ERBB2" OR "HER2-positive endometrial" OR "HER2 endometrial" OR "HER2-positive serous endometrial"',
        "FGFR2mut-end":           '"FGFR2" OR "FGFR2 mutation" OR "fibroblast growth factor receptor 2" OR "FGFR2 mutated" OR "FGFR2-mutant"',
        "ERPR-end":               '"estrogen receptor" OR "ER positive" OR "progesterone receptor" OR "PR positive" OR "hormone receptor" OR "ER/PR" OR "progestin" OR "medroxyprogesterone" OR "levonorgestrel"',

        // ============================================================
        // GINECOLOGICO — Ovaio
        // ============================================================
        "HGSOC":                  '"high grade serous" OR "HGSOC" OR "high-grade serous ovarian" OR "high grade serous ovarian carcinoma" OR "high-grade ovarian"',
        "LGSOC":                  '"low grade serous" OR "LGSOC" OR "low-grade serous ovarian" OR "low grade serous ovarian carcinoma" OR "low-grade ovarian"',
        "Mucinoso-ov":            '"mucinous ovarian" OR "mucinous ovarian carcinoma" OR "ovarian mucinous" OR "mucinous epithelial ovarian"',
        "Endometrioide-ov":       '"endometrioid ovarian" OR "endometrioid ovarian carcinoma" OR "ovarian endometrioid"',
        "CelluleChiare-ov":       '"clear cell ovarian" OR "clear cell carcinoma ovarian" OR "ovarian clear cell"',
        "BRCA1/2-ov":             '"BRCA" OR "BRCA1" OR "BRCA2" OR "BRCA-1" OR "BRCA-2" OR "BRCA1/2" OR "germline BRCA" OR "BRCA-mutated ovarian"',
        "HRD-pos-ov":             '"HRD" OR "homologous recombination deficiency" OR "HRD positive" OR "HRD-positive" OR "BRCAness" OR "BRCA-like" OR "homologous recombination" OR "HRD score"',
        "HRD-neg-ov":             '"HRD negative" OR "HRD-negative" OR "HRD-low" OR "homologous recombination proficient" OR "HRP"',
        "platino-sens-ov":        '"platinum sensitive" OR "platinum-sensitive" OR "platinum-sensitive ovarian" OR "platinum sensitive relapsed"',
        "platino-res-ov":         '"platinum resistant" OR "platinum-resistant" OR "platinum-resistant ovarian" OR "platinum resistance" OR "platinum-refractory ovarian"',
        "platino-refr-ov":        '"platinum refractory" OR "platinum-refractory" OR "refractory to platinum" OR "primary platinum refractory"',
        "FRalfa-ov":              '"folate receptor" OR "folate receptor alpha" OR "FRalpha" OR "FOLR1" OR "mirvetuximab" OR "mirvetuximab soravtansine" OR "IMGN853" OR "folate receptor-positive"',

        // ============================================================
        // GINECOLOGICO — Cervice
        // ============================================================
        "SCC-cervice":            '"cervical squamous" OR "squamous cell carcinoma of the cervix" OR "cervical SCC" OR "squamous cervical cancer"',
        "Adenocarcinoma-cervice": '"cervical adenocarcinoma" OR "adenocarcinoma of the cervix" OR "endocervical adenocarcinoma"',
        "HPV-cervice":            '"HPV" OR "human papillomavirus" OR "HPV-associated cervical" OR "HPV-positive cervical" OR "HPV-related cervical"',
        "PDL1-CPS-cervice":       '"PD-L1" OR "PDL1" OR "CPS" OR "combined positive score" OR "pembrolizumab cervical" OR "programmed death-ligand 1"',
        "MSI-H-cervice":          '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient"',

        // ============================================================
        // GINECOLOGICO — Vulva
        // ============================================================
        "SCC-vulva":              '"vulvar squamous" OR "squamous cell carcinoma of the vulva" OR "vulvar SCC" OR "squamous vulvar cancer"',
        "HPV-vulva":              '"HPV" OR "human papillomavirus" OR "HPV-associated vulvar" OR "HPV-positive vulvar"',
        "TP53mut-vulva":          '"TP53" OR "p53" OR "TP53 mutation" OR "p53 mutated" OR "TP53-mutated vulvar" OR "differentiated VIN"',
        "PDL1-vulva":             '"PD-L1" OR "PDL1" OR "programmed death-ligand 1" OR "pembrolizumab vulvar" OR "immune checkpoint vulvar"',

        // ============================================================
        // PROSTATA
        // ============================================================
        "Adenocarcinoma-prost":   '"prostate adenocarcinoma" OR "prostatic adenocarcinoma" OR "acinar adenocarcinoma prostate"',
        "NEPC-prost":             '"neuroendocrine prostate" OR "NEPC" OR "prostate small cell" OR "small cell prostate cancer" OR "neuroendocrine carcinoma prostate" OR "CRPC-NE"',
        "CRPC-prost":             '"CRPC" OR "castration-resistant" OR "castration resistant prostate cancer" OR "castration-resistant prostate cancer" OR "enzalutamide" OR "abiraterone" OR "darolutamide"',
        "mHSPC-prost":            '"mHSPC" OR "metastatic hormone-sensitive prostate" OR "hormone-sensitive prostate cancer" OR "castration-sensitive" OR "CSPC" OR "mCSPC" OR "hormone naive prostate"',
        "BRCA1/2-prost":          '"BRCA" OR "BRCA1" OR "BRCA2" OR "BRCA-1" OR "BRCA-2" OR "BRCA1/2" OR "gBRCA" OR "olaparib prostate" OR "PROfound"',
        "ATM-prost":              '"ATM" OR "ATM mutation prostate" OR "ATM-mutated prostate" OR "ataxia telangiectasia mutated prostate"',
        "MSI-H-prost":            '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient prostate" OR "pembrolizumab prostate"',
        "PTEN-loss-prost":        '"PTEN loss" OR "PTEN deletion" OR "PTEN-deficient" OR "PTEN lost" OR "ipatasertib" OR "capivasertib" OR "PI3K pathway prostate"',
        "Gleason-prost":          '"Gleason" OR "Gleason score" OR "ISUP" OR "Gleason 6" OR "Gleason 7" OR "Gleason 8" OR "Gleason 9" OR "Gleason 10"',

        // ============================================================
        // RENE
        // ============================================================
        "ccRCC":                  '"clear cell renal" OR "clear cell RCC" OR "ccRCC" OR "clear cell renal cell carcinoma" OR "clear cell kidney cancer"',
        "pRCC1":                  '"papillary renal" OR "papillary RCC type 1" OR "type 1 papillary" OR "papillary type 1 renal" OR "MET-driven papillary"',
        "pRCC2":                  '"papillary renal type 2" OR "type 2 papillary" OR "papillary type 2 renal" OR "FH-deficient" OR "HLRCC" OR "hereditary leiomyomatosis"',
        "chRCC":                  '"chromophobe renal" OR "chromophobe RCC" OR "chRCC" OR "chromophobe renal cell carcinoma"',
        "VHL-rene":               '"VHL" OR "VHL mutation" OR "von Hippel-Lindau" OR "VHL-mutated" OR "belzutifan" OR "HIF inhibitor" OR "VHL-deficient"',

        // ============================================================
        // VESCICA
        // ============================================================
        "Uroteliale-vesc":        '"urothelial carcinoma" OR "transitional cell carcinoma" OR "urothelial bladder" OR "bladder urothelial" OR "TCC"',
        "SCC-vesc":               '"squamous cell carcinoma bladder" OR "bladder SCC" OR "squamous bladder" OR "squamous cell bladder cancer"',
        "Adenocarcinoma-vesc":    '"bladder adenocarcinoma" OR "adenocarcinoma of the bladder" OR "urachal adenocarcinoma"',
        "PDL1-vesc":              '"PD-L1" OR "PDL1" OR "PD-L1 IC" OR "PD-L1 CPS" OR "atezolizumab bladder" OR "pembrolizumab bladder"',
        "FGFR3-vesc":             '"FGFR3" OR "FGFR3 mutation" OR "FGFR3 alteration" OR "FGFR3-mutated" OR "erdafitinib" OR "fibroblast growth factor receptor 3" OR "FGFR3 rearrangement"',
        "FGFR2-fus-vesc":         '"FGFR2 fusion" OR "FGFR2 rearrangement" OR "FGFR2 alteration" OR "fibroblast growth factor receptor 2 fusion"',
        "HER2-vesc":              '"HER2 bladder" OR "HER2-positive bladder" OR "ERBB2 bladder" OR "HER2 amplification bladder" OR "HER2 urothelial"',
        "MSI-H-vesc":             '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient"',
        "platino-elig-vesc":      '"platinum-eligible" OR "cisplatin-eligible" OR "fit for cisplatin" OR "gemcitabine cisplatin" OR "GC" OR "MVAC"',
        "platino-inelig-vesc":    '"platinum-ineligible" OR "cisplatin-ineligible" OR "unfit for cisplatin" OR "platinum unfit" OR "carboplatin" OR "gemcitabine carboplatin"',

        // ============================================================
        // ALTRE VIE URINARIE
        // ============================================================
        "Uroteliale-pelvi":       '"renal pelvis" OR "upper tract urothelial" OR "pelvic urothelial" OR "urothelial carcinoma of the renal pelvis" OR "renal pelvic carcinoma" OR "UTUC"',
        "Uroteliale-uretere":     '"ureter" OR "ureteral" OR "urothelial carcinoma of the ureter" OR "ureteral carcinoma" OR "UTUC" OR "upper urinary tract"',
        "Carcinoma-uretrale":     '"urethral carcinoma" OR "urethra cancer" OR "urethral cancer" OR "urethral squamous" OR "urethral adenocarcinoma"',
        "FGFR3-altreVU":          '"FGFR3" OR "FGFR3 mutation" OR "FGFR3 alteration" OR "erdafitinib upper tract" OR "FGFR3-mutated upper tract"',
        "PDL1-altreVU":           '"PD-L1" OR "PDL1" OR "programmed death-ligand 1"',
        "HER2-altreVU":           '"HER2" OR "ERBB2" OR "HER2 amplification"',
        "FGFR2-fus-altreVU":      '"FGFR2 fusion" OR "FGFR2 rearrangement"',
        "MSI-H-altreVU":          '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient"',

        // ============================================================
        // MELANOMA
        // ============================================================
        "Cutaneo-mel":            '"cutaneous melanoma" OR "skin melanoma" OR "primary cutaneous" OR "melanoma of the skin"',
        "Mucosale-mel":           '"mucosal melanoma" OR "mucosal" OR "sinonasal melanoma" OR "anorectal melanoma" OR "vaginal melanoma" OR "mucosal primary"',
        "Uveale-mel":             '"uveal melanoma" OR "ocular melanoma" OR "choroidal melanoma" OR "ciliary body melanoma" OR "iris melanoma" OR "tebentafusp" OR "HLA-A*02:01"',
        "Acrale-mel":             '"acral melanoma" OR "acral lentiginous" OR "acral lentiginous melanoma" OR "ALM" OR "subungual melanoma" OR "plantar melanoma"',
        "BRAF-V600E-mel":         '"BRAF V600E" OR "BRAF-V600E" OR "V600E" OR "BRAF-mutated melanoma" OR "vemurafenib" OR "dabrafenib" OR "encorafenib" OR "BRAF V600E melanoma"',
        "BRAF-V600K-mel":         '"BRAF V600K" OR "BRAF-V600K" OR "V600K" OR "V600 non-E" OR "BRAF non-V600E"',
        "NRAS-mel":               '"NRAS" OR "NRAS mutation" OR "NRAS-mutated" OR "NRAS mutant" OR "NRAS Q61" OR "binimetinib" OR "MEK inhibitor melanoma"',
        "KIT-mel":                '"KIT" OR "c-KIT" OR "KIT mutation" OR "KIT-mutated" OR "imatinib melanoma" OR "KIT-driven" OR "acral KIT"',
        "PDL1-mel":               '"PD-L1" OR "PDL1" OR "programmed death-ligand 1" OR "pembrolizumab melanoma" OR "nivolumab melanoma" OR "immune checkpoint melanoma"',
        "MSI-H-mel":              '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR"',
        "met-encefaliche-mel":    '"brain metastasis" OR "brain metastases" OR "CNS metastasis" OR "brain met" OR "brain mets" OR "intracranial metastasis"',
        "LDH-elevata-mel":        '"LDH" OR "lactate dehydrogenase" OR "elevated LDH" OR "LDH elevated" OR "LDH high" OR "LDH elevated melanoma"',

        // ============================================================
        // SCC CUTANEO
        // ============================================================
        "PDL1-SCC-cut":           '"PD-L1" OR "PDL1" OR "programmed death-ligand 1" OR "cemiplimab" OR "pembrolizumab cSCC" OR "immune checkpoint cSCC"',

        // ============================================================
        // TESTA-COLLO — Specifiche per sottosede
        // ============================================================
        // Comuni a tutte le sottosedi HNSCC
        "SCC-HNSCC":              '"squamous cell carcinoma" OR "SCC" OR "HNSCC" OR "head and neck squamous" OR "squamous head neck"',
        "PDL1-CPS-HNSCC":         '"PD-L1" OR "PDL1" OR "CPS" OR "combined positive score" OR "pembrolizumab head neck" OR "nivolumab head neck" OR "immune checkpoint HNSCC"',
        "EGFR-over-HNSCC":        '"EGFR" OR "epidermal growth factor receptor" OR "cetuximab" OR "EGFR overexpression" OR "EGFR-overexpressing HNSCC"',
        "MSI-H-HNSCC":            '"MSI-H" OR "MSI" OR "microsatellite instability" OR "dMMR" OR "mismatch repair deficient"',
        "platino-eligible-HNSCC": '"platinum-eligible" OR "cisplatin-eligible" OR "fit for cisplatin" OR "platinum-based head neck"',
        "platino-refrattario-HNSCC": '"platinum-refractory" OR "platinum refractory" OR "platinum resistant HNSCC" OR "post-platinum" OR "refractory to platinum"',
        // Orofaringe
        "HPV-p16-OF":             '"HPV" OR "HPV-positive" OR "p16" OR "p16-positive" OR "HPV-related oropharyngeal" OR "HPV-associated oropharyngeal" OR "oropharyngeal HPV"',
        "HPV-neg-OF":             '"HPV-negative" OR "HPV negative oropharyngeal" OR "p16 negative oropharyngeal" OR "HPV-unrelated"',
        // Laringe
        "Sovraglottica-LAR":      '"supraglottic" OR "supraglottis" OR "supraglottic laryngeal" OR "epiglottis"',
        "Glottide-LAR":           '"glottic" OR "glottis" OR "glottic laryngeal" OR "vocal cord carcinoma" OR "vocal fold"',
        "Sottoglottica-LAR":      '"subglottic" OR "subglottis" OR "subglottic laryngeal"',
        // Nasofaringe
        "EBV-NPC":                '"EBV" OR "Epstein-Barr virus" OR "EBV-positive nasopharyngeal" OR "EBV-associated NPC" OR "EBV-driven" OR "EBV nasopharyngeal"',
        // Seni paranasali
        "Adenocarcinoma-SNS":     '"sinonasal adenocarcinoma" OR "intestinal-type adenocarcinoma" OR "ITAC" OR "non-intestinal-type adenocarcinoma" OR "sinonasal adenocarcinoma woodworker"',
        "Esthesioneuroblastoma":  '"esthesioneuroblastoma" OR "olfactory neuroblastoma" OR "olfactory neuroepithelial tumor" OR "Kadish"',
        "SNUC":                   '"sinonasal undifferentiated carcinoma" OR "SNUC" OR "undifferentiated sinonasal" OR "sinonasal carcinoma undifferentiated"',
        // Ghiandole Salivari
        "Mucoepidermoide-GS":     '"mucoepidermoid carcinoma" OR "mucoepidermoid" OR "MEC salivary" OR "mucoepidermoid salivary gland"',
        "Adenoidocistico-GS":     '"adenoid cystic carcinoma" OR "adenoidocystic" OR "ACC salivary" OR "adenoid cystic salivary" OR "cribriform" OR "cylindroma"',
        "Acinico-GS":             '"acinic cell carcinoma" OR "acinar cell carcinoma" OR "acinic cell" OR "acinic cell salivary gland"',
        "HER2-GS":                '"HER2" OR "HER-2" OR "ERBB2" OR "HER2-positive salivary" OR "HER2 salivary gland"',
        "NTRK-GS":                '"NTRK" OR "NTRK1" OR "NTRK2" OR "NTRK3" OR "TRK fusion" OR "neurotrophic tyrosine receptor kinase" OR "TRK salivary"',
        "HRAS-GS":                '"HRAS" OR "HRAS mutation" OR "H-RAS" OR "HRAS mutated" OR "HRAS-mutant salivary"',
        // Cavo Orale
        "Adenocarcinoma-CO":     '"oral cavity adenocarcinoma" OR "adenocarcinoma of the oral cavity" OR "oral adenocarcinoma" OR "glandular carcinoma oral"',
        "Mucoepidermoide-CO":    '"oral mucoepidermoid" OR "mucoepidermoid carcinoma of the oral cavity" OR "mucoepidermoid oral" OR "MEC oral"',
    };

    /** Restituisce i sinonimi ampliati per una chiave, con fallback generatore dinamico per chiavi future */
    function getExpandedSynonyms(key, map) {
        if (map && map[key]) return map[key];

        // Generatore dinamico per chiavi non ancora mappate a mano:
        const terms = new Set();
        const cleanKey = key.replace(/mut$/i, "").replace(/pos$/i, "").trim();
        terms.add(`"${key}"`);
        terms.add(`"${cleanKey}"`);

        if (cleanKey.includes("-")) {
            terms.add(`"${cleanKey.replace(/-/g, " ")}"`);
        } else if (cleanKey.includes(" ")) {
            terms.add(`"${cleanKey.replace(/ /g, "-")}"`);
        }
        terms.add(`"${cleanKey} mutation"`);
        terms.add(`"${cleanKey} mutated"`);

        return Array.from(terms).join(" OR ");
    }

    /** Genera i tag pillola interattivi e rimovibili per la ricerca CT.gov */
    function renderCtgovActivePills() {
        const container = document.getElementById("ctgovActivePillsContainer");
        if (!container) return;
        container.innerHTML = "";
        const data = window._ctgovPatientData;
        const enabled = window._ctgovEnabledParams;
        if (!data || !enabled) return;

        const createPill = (icon, label, isEnabled, onClick) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = isEnabled
                ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-white shadow-xs hover:bg-slate-700 transition-all select-none"
                : "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60 hover:bg-slate-200 transition-all select-none";
            btn.innerHTML = `${icon} <span>${escapeHtml(label)}</span> <i class="fas ${isEnabled ? 'fa-check-circle text-emerald-400' : 'fa-times-circle text-slate-400'} ml-0.5"></i>`;
            btn.addEventListener("click", onClick);
            return btn;
        };

        // 1. Area Clinica (Default: ATTIVA)
        if (data.clinicalAreas) {
            container.appendChild(createPill("🏢 Area:", data.clinicalAreas, enabled.area !== false, () => {
                enabled.area = !enabled.area;
                renderCtgovActivePills();
                runCtgovSearch(false);
            }));
        }

        // 2. Specifica Area Clinica / Sottotipo (Default: ATTIVA)
        if (data.specificClinicalAreas) {
            container.appendChild(createPill("🧬 Sottotipo:", data.specificClinicalAreas, enabled.specific !== false, () => {
                enabled.specific = !enabled.specific;
                renderCtgovActivePills();
                runCtgovSearch(false);
            }));
        }

        // 3. Setting del Trattamento (Default: ATTIVA)
        if (data.treatmentSetting) {
            container.appendChild(createPill("⚙️ Setting:", data.treatmentSetting, enabled.setting !== false, () => {
                enabled.setting = !enabled.setting;
                renderCtgovActivePills();
                runCtgovSearch(false);
            }));
        }

        // 4. Linea di trattamento del paziente (Default: DESELEZIONATA)
        if (data.treatmentLine !== null && data.treatmentLine !== undefined) {
            container.appendChild(createPill("🔢 Linea:", `${data.treatmentLine}ª linea`, enabled.line === true, () => {
                enabled.line = !enabled.line;
                renderCtgovActivePills();
                runCtgovSearch(false);
            }));
        }

        // 5. Mostra SOLO le Specifiche Ulteriori effettivamente inserite/selezionate per questo specifico paziente
        if (data.furtherSpecifics && typeof data.furtherSpecifics === "object") {
            Object.entries(data.furtherSpecifics).forEach(([key, patientVal]) => {
                if (patientVal === undefined || patientVal === null || patientVal === "") return;

                let labelText = key;
                if (key === "PDL1" || (patientVal && typeof patientVal === "object")) {
                    labelText = formatPDL1Value(patientVal);
                } else if (typeof patientVal === "number") {
                    labelText = `${key}: ${patientVal}`;
                }

                // Default: DESELEZIONATE (false) tranne se il medico le clicca manualmente per attivarle
                const isEnabled = enabled.further ? enabled.further[key] === true : false;

                container.appendChild(createPill("🧪", labelText, isEnabled, () => {
                    if (!enabled.further) enabled.further = {};
                    enabled.further[key] = !isEnabled;
                    renderCtgovActivePills();
                    runCtgovSearch(false);
                }));
            });
        }
    }

    /** Costruisce i parametri query per l'API CT.gov v2 incorporando tutte le informazioni paziente e sinonimi */
    function buildCtgovParams(patientData, countryFilter, statusFilter, studyTypeFilter) {
        const queryParts = [];
        const enabled = window._ctgovEnabledParams || {};

        // 1. Area Clinica Principale
        if (enabled.area !== false && patientData.clinicalAreas) {
            const areaSynonyms = CTGOV_AREA_MAP[patientData.clinicalAreas];
            if (areaSynonyms) queryParts.push(`(${areaSynonyms})`);
        }

        // 2. Setting del Trattamento — RIMOSSO DALLA QUERY API
        // Il setting viene ora usato SOLO per classificazione client-side in analyzeCtgovStudy.
        // Motivo: molti studi metastatici validi non usano esplicitamente la parola "metastatic" nel titolo/summary.

        // 3. Linea di trattamento (solo se esplicitamente abilitata dal medico)
        if (enabled.line === true && patientData.treatmentLine !== null && patientData.treatmentLine !== undefined) {
            const lineSynonyms = CTGOV_LINE_MAP[patientData.treatmentLine];
            if (lineSynonyms) queryParts.push(`(${lineSynonyms})`);
        }

        // 4. Sottotipo Specifico
        if (enabled.specific !== false && patientData.specificClinicalAreas) {
            const specificSynonyms = CTGOV_SPECIFIC_MAP[patientData.specificClinicalAreas];
            if (specificSynonyms) {
                queryParts.push(`(${specificSynonyms})`);
            } else {
                queryParts.push(`("${patientData.specificClinicalAreas}")`);
            }
        }

        // 5. Specifiche Ulteriori (PDL1, mutazioni, istologie) con generatore sinonimi dinamico
        // IMPORTANTE: le specifiche ulteriori sono DESELEZIONATE di default (enabled.further parte da {}).
        // Vengono aggiunte alla query SOLO se il medico le ha esplicitamente abilitate (=== true).
        if (enabled.further && typeof enabled.further === "object" && patientData.furtherSpecifics) {
            Object.entries(patientData.furtherSpecifics).forEach(([key, val]) => {
                if (enabled.further[key] === true) {  // Solo se esplicitamente abilitato dal medico
                    const syn = getExpandedSynonyms(key, CTGOV_FURTHER_MAP);
                    if (syn) {
                        queryParts.push(`(${syn})`);
                    }
                }
            });
        }

        // Filtro tipo studio tramite query syntax
        if (studyTypeFilter === "INTERVENTIONAL") {
            queryParts.push("AREA[StudyType]INTERVENTIONAL");
        }

        const queryTerm = queryParts.join(" AND ") || "cancer";

        // pageSize=400 per massima copertura; il filtro location è gestito client-side
        // sulla base dei dati strutturati locations[].country (più affidabile di query.locn testuale)
        const params = new URLSearchParams({
            "query.term": queryTerm,
            "pageSize": "400",
            "format": "json",
        });
        if (statusFilter !== "all") params.set("filter.overallStatus", statusFilter);
        // NOTA: query.locn rimosso — il filtro per paese è applicato client-side dopo il fetch
        return params;
    }

    const CTGOV_REGEX_MAP = {
        // Polmone / Istologie & Biomarcatori
        "ADK": /\b(adenocarcinoma|adenocarcinomas|ADK|glandular carcinoma|acinar|mucinous adenocarcinoma)\b/i,
        "SCC-NSCLC": /\b(squamous|squamous cell|squamous cell carcinoma|SCC|epidermoid)\b/i,
        "PDL1": /\b(PD-L1|PDL1|PD L1|CD274|programmed death-ligand 1|programmed cell death ligand 1)\b/i,
        "EGFR": /\b(EGFR|ERBB1|epidermal growth factor receptor)\b/i,
        "ALK": /\b(ALK|anaplastic lymphoma kinase)\b/i,
        "KRAS": /\b(KRAS|K-RAS|K-ras)\b/i,
        "ROS1": /\b(ROS1|ROS-1)\b/i,
        "BRAF-V600": /\b(BRAF|B-RAF|V600|V600E|V600K|BRAF-V600)\b/i,
        "RET": /\b(RET|RET-rearranged|RET rearrangement|RET fusion)\b/i,
        "NTRK": /\b(NTRK|NTRK1|NTRK2|NTRK3|neurotrophic tyrosine receptor kinase)\b/i,
        "HER2": /\b(HER2|HER-2|HER 2|ERBB2|human epidermal growth factor receptor 2|neu)\b/i,
        "MET": /\b(MET|c-MET|cMET|MET exon 14)\b/i,
        "EGFR ex20ins": /\b(exon 20|ex20ins|exon 20 insertion|ex20)\b/i,

        // Mesotelioma
        "Epitelioide": /\b(epithelioid|epithelial mesothelioma)\b/i,
        "Bifasico": /\b(biphasic|mixed mesothelioma)\b/i,
        "Sarcomatoide": /\b(sarcomatoid|sarcomatous)\b/i,

        // Mammella
        "Duttale": /\b(ductal|ductal carcinoma|IDC)\b/i,
        "Lobulare": /\b(lobular|lobular carcinoma|ILC)\b/i,
        "ESR1mut": /\b(ESR1|ESR-1|estrogen receptor 1)\b/i,
        "PIK3CAmut": /\b(PIK3CA|PI3K|PI3Kalpha)\b/i,
        "AKTmut": /\b(AKT|AKT1|AKT1 E17K)\b/i,
        "PTENmut": /\b(PTEN)\b/i,
        "BRCA1/2mut": /\b(BRCA|BRCA1|BRCA2|BRCA-1|BRCA-2)\b/i,
        "PALB2": /\b(PALB2)\b/i,
        "HER2 low": /\b(HER2 low|HER2-low|HER2 1\+|HER2 2\+)\b/i,
        "HER2 ultra-low": /\b(HER2 ultra-low|HER2-ultralow|HER2 ultralow)\b/i,

        // Linee
        1: /\b(first-line|first line|1st-line|1st line|1L|front-line|untreated|naive)\b/i,
        2: /\b(second-line|second line|2nd-line|2nd line|2L|previously treated|prior therapy|relapsed|refractory)\b/i,
        3: /\b(third-line|third line|3rd-line|3rd line|3L|heavily pretreated)\b/i,

        // Gastro-Intestinale
        "Adenocarcinoma-esofago": /\b(adenocarcinoma|AEG|GEJ|gastroesophageal junction)\b/i,
        "SCC-esofago": /\b(squamous|squamous cell|ESCC|SCC)\b/i,
        "HER2-esofago": /\b(HER2|HER-2|ERBB2)\b/i,
        "PDL1-CPS-esofago": /\b(PD-L1|PDL1|CPS|combined positive score)\b/i,
        "MSI-H-esofago": /\b(MSI-H|MSI|microsatellite instability|dMMR|mismatch repair)\b/i,
        "NTRK-esofago": /\b(NTRK|NTRK1|NTRK2|NTRK3|TRK)\b/i,
        "Adenocarcinoma-gastrico": /\b(adenocarcinoma|gastric cancer|stomach adenocarcinoma)\b/i,
        "Signet-ring-gastrico": /\b(signet ring|signet-ring|poorly cohesive)\b/i,
        "HER2-stomaco": /\b(HER2|HER-2|ERBB2)\b/i,
        "PDL1-CPS-stomaco": /\b(PD-L1|PDL1|CPS|combined positive score)\b/i,
        "FGFR2b": /\b(FGFR2b|FGFR2|bemarituzumab)\b/i,
        "CLDN18-2": /\b(CLDN18|claudin|zolbetuximab|IMAB362)\b/i,
        "EBV-stomaco": /\b(EBV|Epstein-Barr)\b/i,
        "MSI-H-stomaco": /\b(MSI-H|MSI|microsatellite instability|dMMR|mismatch repair)\b/i,
        "NTRK-stomaco": /\b(NTRK|NTRK1|NTRK2|NTRK3|TRK)\b/i,
        "MSI-H-colon": /\b(MSI-H|MSI|microsatellite instability|dMMR|mismatch repair)\b/i,
        "KRAS-colon": /\b(KRAS)\b/i,
        "KRAS-G12C-colon": /\b(G12C|sotorasib|adagrasib)\b/i,
        "BRAF-V600E-colon": /\b(BRAF|V600E|encorafenib)\b/i,
        "HER2-colon": /\b(HER2|ERBB2)\b/i,
        "NTRK-colon": /\b(NTRK|NTRK1|NTRK2|NTRK3|TRK)\b/i,
        "lato-dx-colon": /\b(right|right-sided|ascending|cecum|hepatic flexure)\b/i,
        "lato-sx-colon": /\b(left|left-sided|descending|sigmoid|splenic flexure)\b/i,
        "signet-ring-colon": /\b(signet ring|signet-ring|poorly cohesive)\b/i,
        "MSI-H-retto": /\b(MSI-H|MSI|microsatellite instability|dMMR|mismatch repair)\b/i,
        "KRAS-retto": /\b(KRAS)\b/i,
        "KRAS-G12C-retto": /\b(G12C|sotorasib|adagrasib)\b/i,
        "BRAF-V600E-retto": /\b(BRAF|V600E|encorafenib)\b/i,
        "HER2-retto": /\b(HER2|ERBB2)\b/i,
        "NTRK-retto": /\b(NTRK|NTRK1|NTRK2|NTRK3|TRK)\b/i,
        "retto-alto": /\b(high rectal|upper rectal|upper third)\b/i,
        "retto-medio": /\b(mid rectal|middle rectal|middle third)\b/i,
        "retto-basso": /\b(low rectal|lower rectal|lower third)\b/i,
        "SCC-anale": /\b(squamous|squamous cell|SCC)\b/i,
        "HPV-ano": /\b(HPV|human papillomavirus)\b/i,
        "PDL1-ano": /\b(PD-L1|PDL1|pembrolizumab)\b/i,
        "MSI-H-ano": /\b(MSI-H|MSI|microsatellite instability|dMMR)\b/i,
        "CCA-intraepatico": /\b(intrahepatic|iCCA)\b/i,
        "CCA-ilare": /\b(hilar|Klatskin|perihilar|pCCA)\b/i,
        "CCA-distale": /\b(distal cholangiocarcinoma|distal bile duct)\b/i,
        "Colecisti": /\b(gallbladder|cholecystic)\b/i,
        "FGFR2-fus": /\b(FGFR2|pemigatinib|infigratinib|futibatinib)\b/i,
        "IDH1mut": /\b(IDH1|ivosidenib)\b/i,
        "IDH2mut": /\b(IDH2|enasidenib)\b/i,
        "BRAF-V600E-vb": /\b(BRAF|V600E)\b/i,
        "HER2-vb": /\b(HER2|ERBB2)\b/i,
        "ERBB2mut-vb": /\b(ERBB2|HER2)\b/i,
        "PDL1-vb": /\b(PD-L1|PDL1|durvalumab)\b/i,
        "MSI-H-vb": /\b(MSI-H|MSI|microsatellite instability|dMMR)\b/i,
        "NTRK-vb": /\b(NTRK|NTRK1|NTRK2|NTRK3|TRK)\b/i,
        "PDAC": /\b(PDAC|ductal adenocarcinoma|exocrine)\b/i,
        "pNET": /\b(neuroendocrine|pNET|islet cell|carcinoid)\b/i,
        "BRCA1-panc": /\b(BRCA1|BRCA-1)\b/i,
        "BRCA2-panc": /\b(BRCA2|BRCA-2|olaparib)\b/i,
        "PALB2-panc": /\b(PALB2)\b/i,
        "ATM-panc": /\b(ATM)\b/i,
        "KRAS-panc": /\b(KRAS)\b/i,
        "KRAS-G12C-panc": /\b(G12C|sotorasib|adagrasib)\b/i,
        "MSI-H-panc": /\b(MSI-H|MSI|microsatellite instability|dMMR)\b/i,
        "NTRK-panc": /\b(NTRK|NTRK1|NTRK2|NTRK3|TRK)\b/i,
        "Child-Pugh-A": /\b(Child-Pugh A|Child Pugh A|CPA)\b/i,
        "Child-Pugh-B7": /\b(Child-Pugh B|Child Pugh B|CPS B7)\b/i,
        "HBV": /\b(HBV|hepatitis B|HBsAg)\b/i,
        "HCV": /\b(HCV|hepatitis C)\b/i,
        "AFP-alto": /\b(AFP|alpha-fetoprotein|fetoprotein)\b/i,

        // Ginecologico
        "Endometrioide-end": /\b(endometrioid)\b/i,
        "Sieroso-end": /\b(serous)\b/i,
        "CelluleChiare-end": /\b(clear cell)\b/i,
        "Carcinosarcoma-end": /\b(carcinosarcoma|MMMT|mixed Mullerian)\b/i,
        "MSI-H-end": /\b(MSI-H|MSI|microsatellite instability|dMMR)\b/i,
        "p53mut-end": /\b(p53|TP53)\b/i,
        "POLEmut-end": /\b(POLE|polymerase epsilon)\b/i,
        "HER2-end": /\b(HER2|ERBB2)\b/i,
        "FGFR2mut-end": /\b(FGFR2)\b/i,
        "ERPR-end": /\b(estrogen|progesterone|ER|PR|progestin)\b/i,
        "HGSOC": /\b(high grade serous|HGSOC|high-grade serous)\b/i,
        "LGSOC": /\b(low grade serous|LGSOC|low-grade serous)\b/i,
        "Mucinoso-ov": /\b(mucinous)\b/i,
        "Endometrioide-ov": /\b(endometrioid)\b/i,
        "CelluleChiare-ov": /\b(clear cell)\b/i,
        "BRCA1/2-ov": /\b(BRCA|BRCA1|BRCA2|BRCA-1|BRCA-2)\b/i,
        "HRD-pos-ov": /\b(HRD|homologous recombination deficiency|BRCAness)\b/i,
        "HRD-neg-ov": /\b(HRD negative|HRP|homologous recombination proficient)\b/i,
        "platino-sens-ov": /\b(platinum sensitive|platinum-sensitive)\b/i,
        "platino-res-ov": /\b(platinum resistant|platinum-resistant)\b/i,
        "platino-refr-ov": /\b(platinum refractory|platinum-refractory)\b/i,
        "FRalfa-ov": /\b(folate receptor|FRalpha|FOLR1|mirvetuximab)\b/i,
        "SCC-cervice": /\b(squamous|squamous cell|SCC)\b/i,
        "Adenocarcinoma-cervice": /\b(adenocarcinoma)\b/i,
        "HPV-cervice": /\b(HPV|human papillomavirus)\b/i,
        "PDL1-CPS-cervice": /\b(PD-L1|PDL1|CPS|pembrolizumab)\b/i,
        "MSI-H-cervice": /\b(MSI-H|MSI|dMMR)\b/i,
        "SCC-vulva": /\b(squamous|squamous cell|SCC)\b/i,
        "HPV-vulva": /\b(HPV|human papillomavirus)\b/i,
        "TP53mut-vulva": /\b(TP53|p53|TP53 mutation)\b/i,
        "PDL1-vulva": /\b(PD-L1|PDL1|pembrolizumab)\b/i,

        // Prostata, Rene, Vescica, Altre Vie Urinarie
        "Adenocarcinoma-prost": /\b(adenocarcinoma|acinar)\b/i,
        "NEPC-prost": /\b(neuroendocrine|NEPC|small cell)\b/i,
        "CRPC-prost": /\b(CRPC|castration-resistant|castrate-resistant|enzalutamide|abiraterone|darolutamide)\b/i,
        "mHSPC-prost": /\b(mHSPC|hormone-sensitive|castration-sensitive|CSPC|mCSPC)\b/i,
        "BRCA1/2-prost": /\b(BRCA|BRCA1|BRCA2|BRCA-1|BRCA-2)\b/i,
        "ATM-prost": /\b(ATM)\b/i,
        "MSI-H-prost": /\b(MSI-H|MSI|dMMR)\b/i,
        "PTEN-loss-prost": /\b(PTEN|ipatasertib|capivasertib)\b/i,
        "Gleason-prost": /\b(Gleason|ISUP)\b/i,
        "ccRCC": /\b(clear cell|ccRCC)\b/i,
        "pRCC1": /\b(papillary|pRCC|type 1|MET)\b/i,
        "pRCC2": /\b(papillary|pRCC|type 2|FH|HLRCC)\b/i,
        "chRCC": /\b(chromophobe|chRCC)\b/i,
        "VHL-rene": /\b(VHL|belzutifan|HIF)\b/i,
        "Uroteliale-vesc": /\b(urothelial|transitional cell|TCC)\b/i,
        "SCC-vesc": /\b(squamous|squamous cell|SCC)\b/i,
        "Adenocarcinoma-vesc": /\b(adenocarcinoma|urachal)\b/i,
        "PDL1-vesc": /\b(PD-L1|PDL1)\b/i,
        "FGFR3-vesc": /\b(FGFR3|erdafitinib)\b/i,
        "FGFR2-fus-vesc": /\b(FGFR2|FGFR2 fusion)\b/i,
        "HER2-vesc": /\b(HER2|ERBB2)\b/i,
        "MSI-H-vesc": /\b(MSI-H|MSI|dMMR)\b/i,
        "platino-elig-vesc": /\b(platinum-eligible|cisplatin-eligible|fit for cisplatin|GC|MVAC)\b/i,
        "platino-inelig-vesc": /\b(platinum-ineligible|cisplatin-ineligible|unfit|carboplatin)\b/i,
        "Uroteliale-pelvi": /\b(renal pelvis|pelvic urothelial|UTUC)\b/i,
        "Uroteliale-uretere": /\b(ureter|ureteral|UTUC)\b/i,
        "Carcinoma-uretrale": /\b(urethral|urethra)\b/i,
        "FGFR3-altreVU": /\b(FGFR3|erdafitinib)\b/i,
        "PDL1-altreVU": /\b(PD-L1|PDL1)\b/i,
        "HER2-altreVU": /\b(HER2|ERBB2)\b/i,
        "FGFR2-fus-altreVU": /\b(FGFR2|FGFR2 fusion)\b/i,
        "MSI-H-altreVU": /\b(MSI-H|MSI|dMMR)\b/i,

        // Melanoma & Cute
        "Cutaneo-mel": /\b(cutaneous|skin melanoma)\b/i,
        "Mucosale-mel": /\b(mucosal)\b/i,
        "Uveale-mel": /\b(uveal|ocular|choroidal|ciliary|tebentafusp)\b/i,
        "Acrale-mel": /\b(acral|acral lentiginous|ALM)\b/i,
        "BRAF-V600E-mel": /\b(BRAF|V600E|vemurafenib|dabrafenib|encorafenib)\b/i,
        "BRAF-V600K-mel": /\b(BRAF|V600K)\b/i,
        "NRAS-mel": /\b(NRAS|binimetinib)\b/i,
        "KIT-mel": /\b(KIT|c-KIT|imatinib)\b/i,
        "PDL1-mel": /\b(PD-L1|PDL1|pembrolizumab|nivolumab)\b/i,
        "MSI-H-mel": /\b(MSI-H|MSI|dMMR)\b/i,
        "met-encefaliche-mel": /\b(brain metastas|CNS metastas|brain mets)\b/i,
        "LDH-elevata-mel": /\b(LDH|lactate dehydrogenase)\b/i,
        "PDL1-SCC-cut": /\b(PD-L1|PDL1|cemiplimab|pembrolizumab)\b/i,

        // Testa-Collo
        "Cavo orale": /\b(oral cavity|oral|tongue|mouth|buccal|gingival|lip|floor of mouth)\b/i,
        "Orofaringe": /\b(oropharynx|oropharyngeal|tonsil|tonsillar|base of tongue|soft palate)\b/i,
        "Laringe": /\b(larynx|laryngeal|glottic|supraglottic|subglottic)\b/i,
        "Ipofaringe": /\b(hypopharynx|hypopharyngeal)\b/i,
        "Nasofaringe": /\b(nasopharynx|nasopharyngeal|rhinopharynx|rhinopharyngeal)\b/i,
        "Cavità nasali e seni paranasali": /\b(nasal cavity|paranasal|maxillary sinus|ethmoid|sphenoid|frontal sinus)\b/i,
        "Ghiandole Salivari": /\b(salivary gland|salivary|parotid|submandibular|sublingual)\b/i,
        "SCC-HNSCC": /\b(squamous|squamous cell|SCC|HNSCC)\b/i,
        "PDL1-CPS-HNSCC": /\b(PD-L1|PDL1|CPS|pembrolizumab|nivolumab)\b/i,
        "EGFR-over-HNSCC": /\b(EGFR|cetuximab)\b/i,
        "MSI-H-HNSCC": /\b(MSI-H|MSI|dMMR)\b/i,
        "platino-eligible-HNSCC": /\b(platinum-eligible|cisplatin-eligible)\b/i,
        "platino-refrattario-HNSCC": /\b(platinum-refractory|platinum refractory|platinum resistant)\b/i,
        "Adenocarcinoma-CO": /\b(adenocarcinoma)\b/i,
        "Mucoepidermoide-CO": /\b(mucoepidermoid)\b/i,
        "HPV-p16-OF": /\b(HPV|p16|HPV-positive|p16-positive)\b/i,
        "HPV-neg-OF": /\b(HPV-negative|p16-negative)\b/i,
        "Sovraglottica-LAR": /\b(supraglottic|supraglottis|epiglottis)\b/i,
        "Glottide-LAR": /\b(glottic|glottis|vocal cord)\b/i,
        "Sottoglottica-LAR": /\b(subglottic|subglottis)\b/i,
        "EBV-NPC": /\b(EBV|Epstein-Barr)\b/i,
        "Adenocarcinoma-SNS": /\b(adenocarcinoma|ITAC)\b/i,
        "Esthesioneuroblastoma": /\b(esthesioneuroblastoma|olfactory neuroblastoma|Kadish)\b/i,
        "SNUC": /\b(sinonasal undifferentiated|SNUC)\b/i,
        "Mucoepidermoide-GS": /\b(mucoepidermoid|MEC)\b/i,
        "Adenoidocistico-GS": /\b(adenoid cystic|adenoidocystic|ACC|cylindroma)\b/i,
        "Acinico-GS": /\b(acinic cell|acinar cell)\b/i,
        "HER2-GS": /\b(HER2|ERBB2)\b/i,
        "NTRK-GS": /\b(NTRK|TRK)\b/i,
        "HRAS-GS": /\b(HRAS|H-RAS)\b/i,
        "MYBL1-NFIB-GS": /\b(MYBL1|NFIB)\b/i,
    };

    /** Analizza lo studio CT.gov restituendo i centri in Italia e la verifica testuale dei criteri con Regex a confini di parola */
    function analyzeCtgovStudy(study, patientData, enabledParams) {
        const proto = study.protocolSection || {};
        const idMod = proto.identificationModule || {};
        const descMod = proto.descriptionModule || {};
        const locMod = proto.contactsLocationsModule || {};
        const eligMod = proto.eligibilityModule || {};
        const condMod = proto.conditionsModule || {};

        const locations = locMod.locations || [];
        const hasItalySite = locations.some(l => l.country && (l.country.toLowerCase() === "italy" || l.country.toLowerCase() === "italia"));

        // Corpus di testo ampliato: include titolo ufficiale, condizioni, keyword, bracci e criteri
        const armsMod = proto.armsInterventionsModule || {};
        const condKeywords = proto.conditionsModule?.keywords || [];
        const armsText = (armsMod.interventions || []).map(i => `${i.name || ''} ${i.description || ''}`).join(" ");
        const text = (
            (idMod.briefTitle || "") + " " +
            (idMod.officialTitle || "") + " " +
            (descMod.briefSummary || "") + " " +
            (descMod.detailedDescription || "") + " " +
            (eligMod.eligibilityCriteria || "") + " " +
            (condMod.conditions ? condMod.conditions.join(" ") : "") + " " +
            condKeywords.join(" ") + " " +
            armsText
        );

        const confirmed = [];
        const unconfirmed = [];
        const enabled = enabledParams || {};

        // Setting del Trattamento — classificazione client-side
        // Per "Metastatico": se lo studio NON è esplicitamente adiuvante/neoadiuvante → compatibile.
        // Logica: studi privi di indicazione di setting si assumono metastatici (la maggior parte degli RCT oncologici).
        if (enabled.setting !== false && patientData.treatmentSetting) {
            const setting = patientData.treatmentSetting;
            const adjuvantRx = /\b(adjuvant|neoadjuvant|neo-adjuvant|post-?operative|pre-?operative|early[\s-]stage|perioperative|curative[\s-]intent|resect(able|ed)|localized)\b/i;
            const metastaticRx = /\b(metastatic|metastases?|advanced|stage\s*(iv|4)|disseminated|unresectable|inoperable|palliative)\b/i;

            if (setting === "Metastatico") {
                // Compatibile se: menziona metastatic/advanced, OPPURE non menziona esplicitamente adiuvante/neoadiuvante
                const isExplicitlyNonMetastatic = adjuvantRx.test(text) && !metastaticRx.test(text);
                if (isExplicitlyNonMetastatic) unconfirmed.push("Setting: Metastatico");
                else confirmed.push("Setting: Metastatico");
            } else if (setting === "Adiuvante") {
                const adiuvRx = /\b(adjuvant|post-?operative|post-?resection|postoperative)\b/i;
                if (adiuvRx.test(text)) confirmed.push("Setting: Adiuvante");
                else unconfirmed.push("Setting: Adiuvante");
            } else if (setting === "Neo-adiuvante") {
                const neoAdjRx = /\b(neoadjuvant|neo-adjuvant|pre-?operative|preoperative|induction|primary\s*systemic)\b/i;
                if (neoAdjRx.test(text)) confirmed.push("Setting: Neo-adiuvante");
                else unconfirmed.push("Setting: Neo-adiuvante");
            }
        }

        // Linea di trattamento
        if (enabled.line === true && patientData.treatmentLine !== null && patientData.treatmentLine !== undefined) {
            const l = patientData.treatmentLine;
            const rx = CTGOV_REGEX_MAP[l] || new RegExp(`\\b${l}\\b`, "i");
            if (rx.test(text)) confirmed.push(`${l}ª linea`);
            else unconfirmed.push(`${l}ª linea`);
        }

        // Sottotipo
        if (enabled.specific !== false && patientData.specificClinicalAreas) {
            const sca = patientData.specificClinicalAreas;
            const rx = CTGOV_REGEX_MAP[sca] || new RegExp(`\\b${sca.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i");
            if (rx.test(text)) confirmed.push(sca);
            else unconfirmed.push(sca);
        }

        // Specifiche Ulteriori (solo quelle attive / spuntate dal medico)
        if (enabled.further && typeof enabled.further === "object") {
            Object.entries(enabled.further).forEach(([k, isEnabled]) => {
                if (isEnabled === true) {
                    const patientVal = patientData.furtherSpecifics ? patientData.furtherSpecifics[k] : undefined;
                    let label = k;
                    if (k === "PDL1" || (patientVal && typeof patientVal === "object")) label = formatPDL1Value(patientVal);
                    else if (typeof patientVal === "number") label = `${k}: ${patientVal}`;

                    const rx = CTGOV_REGEX_MAP[k] || new RegExp(`\\b${k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, "i");
                    if (rx.test(text)) {
                        confirmed.push(label);
                    } else {
                        unconfirmed.push(label);
                    }
                }
            });
        }

        return {
            hasItalySite,
            confirmed,
            unconfirmed,
            isCompleteMatch: unconfirmed.length === 0,
        };
    }

    /** Tronca il testo a maxLen caratteri con ellissi */
    function truncateText(text, maxLen) {
        if (!text || text.length <= maxLen) return text || "";
        return text.substring(0, maxLen).trimEnd() + "…";
    }

    /** Crea una card HTML per un singolo risultato CT.gov con stato corrispondenza e warning per criteri non confermati */
    function createCtgovCard(study, patientData, analysis) {
        const proto = study.protocolSection || {};
        const idMod = proto.identificationModule || {};
        const statusMod = proto.statusModule || {};
        const descMod = proto.descriptionModule || {};
        const designMod = proto.designModule || {};
        const locMod = proto.contactsLocationsModule || {};
        const sponsorMod = proto.sponsorCollaboratorsModule || {};

        const nctId = idMod.nctId || "";
        const title = escapeHtml(idMod.briefTitle || "Titolo non disponibile");
        const status = statusMod.overallStatus || "";
        const summary = escapeHtml(truncateText(descMod.briefSummary || "", 280));
        const studyType = designMod.studyType || "";
        const phases = (designMod.phases || []).join(", ") || "N/A";
        const sponsor = escapeHtml(sponsorMod.leadSponsor?.name || "");
        const locations = locMod.locations || [];
        const url = `https://clinicaltrials.gov/study/${nctId}`;

        // Status badge colore
        const statusColor = status === "RECRUITING" ? "#16a34a" :
                            status === "NOT_YET_RECRUITING" ? "#d97706" :
                            status === "COMPLETED" ? "#64748b" : "#64748b";
        const statusLabel = status === "RECRUITING" ? "🟢 In reclutamento" :
                            status === "NOT_YET_RECRUITING" ? "🟡 Apertura imminente" :
                            status === "COMPLETED" ? "Completato" : escapeHtml(status);

        // Centri — mostra prioritariamente tutti i centri italiani se disponibili, altrimenti max 4 centri
        let centersHtml = "<span class='text-slate-400 text-xs'>Nessun centro registrato</span>";
        if (locations.length > 0) {
            const italianLocs = locations.filter(l => l.country && (l.country.toLowerCase() === "italy" || l.country.toLowerCase() === "italia"));
            if (italianLocs.length > 0) {
                const shown = italianLocs.map(l => {
                    const parts = [l.facility, l.city].filter(Boolean);
                    // Mostra lo stato per sede (RECRUITING vs NOT_YET_RECRUITING)
                    const siteStatus = l.status;
                    const siteStatusIcon = siteStatus === "RECRUITING" ? "🟢" :
                                          siteStatus === "NOT_YET_RECRUITING" ? "🟡" : "";
                    const siteStatusLabel = siteStatus === "RECRUITING" ? " (attivo)" :
                                            siteStatus === "NOT_YET_RECRUITING" ? " (apertura imminente)" : "";
                    const bgClass = siteStatus === "NOT_YET_RECRUITING"
                        ? "bg-amber-50 text-amber-900 border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200";
                    return `<span class="inline-block text-xs ${bgClass} border px-2 py-0.5 rounded-full font-medium">${siteStatusIcon} 🇮🇹 ${escapeHtml(parts.join(", "))}${siteStatusLabel}</span>`;
                });
                const extraCount = locations.length - italianLocs.length;
                const extra = extraCount > 0 ? `<span class="text-xs text-slate-400 font-semibold ml-1">+${extraCount} altri centri esteri</span>` : "";
                centersHtml = `<div class="flex flex-wrap gap-1.5 mt-1">${shown.join("") + extra}</div>`;
            } else {
                const shown = locations.slice(0, 4).map(l => {
                    const parts = [l.facility, l.city, l.country].filter(Boolean);
                    return `<span class="inline-block text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">${escapeHtml(parts.join(", "))}</span>`;
                });
                const extra = locations.length > 4 ? `<span class="text-xs text-slate-400 font-semibold ml-1">+${locations.length - 4} altri</span>` : "";
                centersHtml = `<div class="flex flex-wrap gap-1.5 mt-1">${shown.join("") + extra}</div>`;
            }
        }

        // Badge di verifica e avviso per criteri non confermati nel testo
        let matchBadgeHtml = "";
        if (analysis) {
            if (analysis.isCompleteMatch) {
                matchBadgeHtml = `
                    <div class="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                        <span>✅</span> <strong class="font-semibold">Corrispondenza Completa:</strong> tutti i criteri attivi del paziente sono stati confermati o inclusi nella ricerca.
                    </div>`;
            } else {
                matchBadgeHtml = `
                    <div class="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                        <div class="flex items-center gap-1.5 font-bold mb-1">
                            <span>⚠️</span> <span>Criteri da verificare manualmente nel protocollo:</span>
                        </div>
                        <p class="text-amber-800 text-[11px]">
                            Non è stato possibile verificare esplicitamente nel testo sintetico: <strong>${escapeHtml(analysis.unconfirmed.join(", "))}</strong>. 
                            Verificare i criteri di inclusione dettagliati su ClinicalTrials.gov.
                        </p>
                    </div>`;
            }
        }

        const card = document.createElement("div");
        card.className = "ctgov-card";
        card.innerHTML = `
            <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1.5">
                        <span class="ctgov-badge">ClinicalTrials.gov</span>
                        <span class="text-[10px] font-mono text-slate-400">${escapeHtml(nctId)}</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:#eff6ff;color:${statusColor}">${statusLabel}</span>
                        ${analysis?.hasItalySite ? `<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">🇮🇹 Centro in Italia</span>` : ""}
                    </div>
                    <h3 class="font-bold text-slate-800 text-sm leading-snug">${title}</h3>
                    ${sponsor ? `<p class="text-xs text-slate-500 mt-0.5">${sponsor}</p>` : ""}
                </div>
                <a href="${url}" target="_blank" rel="noopener noreferrer"
                   class="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-semibold text-white transition-colors"
                   style="background:#1a3a5c;"
                   onmouseover="this.style.background='#0f2440'" onmouseout="this.style.background='#1a3a5c'"
                   onclick="event.stopPropagation()">
                    Apri <i class="fas fa-external-link-alt ml-1"></i>
                </a>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                <div class="bg-slate-50 rounded-lg px-3 py-2">
                    <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tipo</span>
                    <span class="text-xs font-semibold text-slate-700">${escapeHtml(studyType || "N/D")}</span>
                </div>
                <div class="bg-slate-50 rounded-lg px-3 py-2">
                    <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fase</span>
                    <span class="text-xs font-semibold text-slate-700">${escapeHtml(phases)}</span>
                </div>
                <div class="bg-slate-50 rounded-lg px-3 py-2">
                    <span class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Centri</span>
                    <span class="text-xs font-semibold text-slate-700">${locations.length || "N/D"}</span>
                </div>
            </div>
            ${summary ? `<p class="text-xs text-slate-600 leading-relaxed mb-2">${summary}</p>` : ""}
            <div>
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Centri disponibili</span>
                ${centersHtml}
            </div>
            ${matchBadgeHtml}
        `;
        return card;
    }

    /** Aggiorna dinamicamente i link ai registri esterni (EU CTR) */
    function updateExternalRegistryLinks() {
        const patientData = window._ctgovPatientData;
        if (!patientData) return;

        const euctrLink = document.getElementById("euctrSearchLink");
        if (!euctrLink) return;

        const params = buildCtgovParams(patientData, "all", "all", "INTERVENTIONAL");
        const queryTerm = params.get("query.term") || "cancer";
        
        euctrLink.href = `https://www.clinicaltrialsregister.eu/ctr-search/search?query=${encodeURIComponent(queryTerm)}&country=it`;
    }

    /** Esegue la ricerca su CT.gov, ordina e raggruppa in 4 sezioni gerarchiche */
    async function runCtgovSearch(loadMore = false) {
        const patientData = window._ctgovPatientData;
        if (!patientData) return;

        const ctgovResults = document.getElementById("ctgovResults");
        if (!ctgovResults) return;

        const loadMoreContainer = document.getElementById("ctgovLoadMoreContainer");
        const loadMoreBtn = document.getElementById("ctgovLoadMoreBtn");

        const countryFilter = document.querySelector("input[name='ctgov_country']:checked")?.value || "Italy";
        const statusFilter  = document.querySelector("input[name='ctgov_status']:checked")?.value  || "RECRUITING";
        const studyTypeFilter = document.querySelector("input[name='ctgov_studytype']:checked")?.value || "INTERVENTIONAL";

        updateExternalRegistryLinks();

        let tempSpinner = null;

        if (!loadMore) {
            ctgovResults.innerHTML = `
                <div class="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
                    <svg class="animate-spin w-8 h-8" style="color:#1a3a5c;" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span class="text-sm font-medium">Ricerca in corso su ClinicalTrials.gov…</span>
                </div>`;
            if (loadMoreContainer) loadMoreContainer.classList.add("hidden");
            window._ctgovNextPageToken = null;
        } else {
            if (loadMoreBtn) loadMoreBtn.disabled = true;
            tempSpinner = document.createElement("div");
            tempSpinner.className = "flex justify-center py-4";
            tempSpinner.innerHTML = `
                <svg class="animate-spin w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>`;
            ctgovResults.appendChild(tempSpinner);
        }

        try {
            const params = buildCtgovParams(patientData, countryFilter, statusFilter, studyTypeFilter);
            
            if (loadMore && window._ctgovNextPageToken) {
                params.set("pageToken", window._ctgovNextPageToken);
            }

            const res = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const rawStudies = data.studies || [];

            if (tempSpinner && tempSpinner.parentNode) {
                tempSpinner.parentNode.removeChild(tempSpinner);
            }
            if (loadMoreBtn) loadMoreBtn.disabled = false;

            if (!loadMore) {
                ctgovResults.innerHTML = "";
            }

            if (rawStudies.length === 0 && !loadMore) {
                ctgovResults.innerHTML = `
                    <div class="p-6 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                        <i class="fas fa-search-minus text-2xl mb-2 text-slate-300"></i>
                        <p class="text-sm font-medium">Nessuno studio trovato su ClinicalTrials.gov con questi filtri.</p>
                        <p class="text-xs text-slate-400 mt-1">Prova a deselezionare alcuni tag in alto per allargare la ricerca.</p>
                    </div>`;
                return;
            }

            // Analizza e ordina gli studi in 4 gruppi gerarchici
            const enabledParams = window._ctgovEnabledParams || {};
            const italyComplete = [];
            const italyPartial  = [];
            const intlComplete  = [];
            const intlPartial   = [];

            // Filtro location CLIENT-SIDE sui dati strutturati locations[].country (più preciso di query.locn testuale API)
            const activeCountryFilter = countryFilter; // "Italy" o "all"

            rawStudies.forEach(s => {
                const analysis = analyzeCtgovStudy(s, patientData, enabledParams);
                s._analysis = analysis;
                if (analysis.hasItalySite) {
                    if (analysis.isCompleteMatch) italyComplete.push(s);
                    else italyPartial.push(s);
                } else {
                    // Se il filtro è "Italy", non mostriamo gli studi senza centri italiani
                    if (activeCountryFilter === "Italy") return;
                    if (analysis.isCompleteMatch) intlComplete.push(s);
                    else intlPartial.push(s);
                }
            });

            const groups = [
                { title: "🇮🇹 Studi con Centri in Italia — Corrispondenza Completa", subtitle: "Soddisfano tutti i criteri specificati", items: italyComplete, badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300" },
                { title: "🇮🇹 Studi con Centri in Italia — Criteri Parziali / Da Verificare", subtitle: "Centri italiani presenti; alcuni sottocriteri richiedono verifica manuale", items: italyPartial, badgeBg: "bg-amber-100 text-amber-900 border-amber-300" },
                { title: "🌍 Studi Internazionali — Corrispondenza Completa", subtitle: "Studi esteri che soddisfano tutti i criteri", items: intlComplete, badgeBg: "bg-blue-100 text-blue-900 border-blue-300" },
                { title: "🌐 Studi Internazionali — Criteri Parziali / Da Verificare", subtitle: "Studi esteri con requisiti da verificare nel protocollo", items: intlPartial, badgeBg: "bg-slate-100 text-slate-800 border-slate-300" },
            ];

            let countTotal = rawStudies.length;
            if (!loadMore) {
                const header = document.createElement("div");
                header.className = "mb-4 flex items-center justify-between";
                header.innerHTML = `<span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${countTotal}${data.nextPageToken ? '+' : ''} studi recuperati da ClinicalTrials.gov (raggruppati per priorità)</span>`;
                ctgovResults.appendChild(header);
            }

            groups.forEach(g => {
                if (g.items.length === 0) return;
                const groupSection = document.createElement("div");
                groupSection.className = "mb-6 space-y-3";
                groupSection.innerHTML = `
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div>
                            <h3 class="text-sm font-bold text-slate-800">${g.title}</h3>
                            <p class="text-[11px] text-slate-500">${g.subtitle}</p>
                        </div>
                        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full border ${g.badgeBg}">${g.items.length} ${g.items.length === 1 ? 'studio' : 'studi'}</span>
                    </div>
                `;
                const container = document.createElement("div");
                container.className = "space-y-4 mt-2";
                g.items.forEach(s => container.appendChild(createCtgovCard(s, patientData, s._analysis)));
                groupSection.appendChild(container);
                ctgovResults.appendChild(groupSection);
            });

            if (data.nextPageToken) {
                window._ctgovNextPageToken = data.nextPageToken;
                if (loadMoreContainer) loadMoreContainer.classList.remove("hidden");
            } else {
                window._ctgovNextPageToken = null;
                if (loadMoreContainer) loadMoreContainer.classList.add("hidden");
            }

        } catch (err) {
            if (tempSpinner && tempSpinner.parentNode) {
                tempSpinner.parentNode.removeChild(tempSpinner);
            }
            if (loadMoreBtn) loadMoreBtn.disabled = false;

            if (!loadMore) {
                ctgovResults.innerHTML = `
                    <div class="p-6 text-center text-red-500 bg-white border border-red-200 rounded-xl">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <p class="text-sm font-medium">Errore durante la ricerca su ClinicalTrials.gov.</p>
                        <p class="text-xs text-red-400 mt-1">Controllare la connessione internet e riprovare.</p>
                    </div>`;
            } else {
                alert("Impossibile caricare ulteriori studi. Controllare la connessione internet.");
            }
        }
    }

    // Pulsante cerca CT.gov
    const ctgovSearchBtn = document.getElementById("ctgovSearchBtn");
    if (ctgovSearchBtn) {
        ctgovSearchBtn.addEventListener("click", () => runCtgovSearch(false));
    }

    // Pulsante carica altri studi CT.gov
    const ctgovLoadMoreBtn = document.getElementById("ctgovLoadMoreBtn");
    if (ctgovLoadMoreBtn) {
        ctgovLoadMoreBtn.addEventListener("click", () => runCtgovSearch(true));
    }

    // Toggle stile pill filtri CT.gov (radio buttons)
    document.querySelectorAll(".ctgov-filter-pill").forEach(label => {
        label.addEventListener("click", () => {
            const group = label.dataset.group;
            document.querySelectorAll(`.ctgov-filter-pill[data-group="${group}"]`)
                    .forEach(l => l.classList.remove("active"));
            label.classList.add("active");
            
            const radio = label.querySelector("input[type='radio']");
            if (radio) {
                radio.checked = true;
                runCtgovSearch(false);
            }
        });
    });

    // Toggle stile checkbox-pill (inclusione parametri AND)
    document.querySelectorAll(".ctgov-checkbox-pill input[type='checkbox']").forEach(chk => {
        chk.addEventListener("change", () => {
            const label = chk.closest(".ctgov-checkbox-pill");
            if (label) {
                if (chk.checked) {
                    label.classList.add("active");
                } else {
                    label.classList.remove("active");
                }
            }
            // Aggiorna dinamicamente i link esterni e rifai la ricerca
            updateExternalRegistryLinks();
            runCtgovSearch(false);
        });
    });

    // =========================================================
    //  END CLINICALTRIALS.GOV INTEGRATION
    // =========================================================

    function createStudyCardElement(study, page) {
        const card = document.createElement("div");
        card.className =
            "bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200";
        card.dataset.studyId = study.id;
        // NOTA SICUREZZA: titolo/sottotitolo sono testo inserito da un utente
        // (chi crea lo studio) e vanno sempre passati da escapeHtml() prima
        // di finire dentro innerHTML, altrimenti un titolo malevolo potrebbe
        // eseguire codice nel browser di chi consulta l'app (XSS).
        const safeTitle = escapeHtml(study.title);
        const safeSubtitle = escapeHtml(study.subtitle);
        const safeCode = escapeHtml(study.study_code || "");
        const codeBadge = safeCode
            ? `<span class="study-code-badge">${safeCode}</span>`
            : "";
        const statusBadge = study.status === "attivo"
            ? `<span class="px-2 py-0.5 ml-1 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Attivo</span>`
            : study.status === "in_attivazione"
            ? `<span class="px-2 py-0.5 ml-1 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">In attivazione</span>`
            : "";

        let furtherSpecificsBadge = "";
        const fs = study.further_specifics;
        if (fs && typeof fs === "object" && Object.keys(fs).length > 0) {
            const parts = Object.entries(fs).map(([k, v]) => {
                if (v === true) return k;
                if (k === "PDL1" || (v && typeof v === "object")) return formatPDL1Value(v);
                if (typeof v === "number") return `${k}: ${v}`;
                return k;
            });
            if (parts.length > 0) {
                furtherSpecificsBadge = `
                    <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-100/90 text-purple-900 border border-purple-200/80 shadow-xs">
                            <span class="text-xs">🧬</span> ${parts.join(" · ")}
                        </span>
                    </div>`;
            }
        }

        let content = `
            <div>
                <div class="mb-1">${codeBadge}${statusBadge}<h4 class="inline font-bold text-dark-gray ml-1">${safeTitle}</h4></div>
                ${safeSubtitle ? `<p class="text-sm text-gray-600">${safeSubtitle}</p>` : ""}
                ${furtherSpecificsBadge}
            </div>`;
        if (page === "trial") {
            content = `
                <div class="flex justify-between items-start">
                    <div>
                        <div class="mb-1">${codeBadge}${statusBadge}<h4 class="inline font-bold text-dark-gray ml-1">${safeTitle}</h4></div>
                        ${safeSubtitle ? `<p class="text-sm text-gray-600">${safeSubtitle}</p>` : ""}
                        ${furtherSpecificsBadge}
                    </div>
                    <button class="remove-study-btn text-red-400 hover:text-red-600 transition-colors ml-3 flex-shrink-0" data-id="${study.id}"><i class="fas fa-trash-alt"></i></button>
                </div>`;
        }
        card.innerHTML = content;
        card.addEventListener("click", (e) => {
            if (page === "trial" && e.target.closest(".remove-study-btn"))
                return;
            showStudyDetails(study, page);
        });
        if (page === "trial") {
            const removeBtn = card.querySelector(".remove-study-btn");
            if (removeBtn) {
                removeBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const id = e.target.closest(".remove-study-btn").dataset.id;
                    showPasswordModal(async () => {
                        await authFetch(`/api/studies/${id}`, { method: "DELETE" });
                        fetchAndRenderTrials();
                    });
                });
            }
        }
        return card;
    }

    function renderSearchResults(studies, page) {
        const targetDiv =
            page === "patient" ? patientTrialListDiv : doctorTrialListDiv;
        if (!targetDiv) return;
        targetDiv.innerHTML = "";
        if (studies.length === 0) {
            targetDiv.innerHTML = `<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Nessuno studio trovato.</div>`;
            return;
        }
        studies.forEach((s) =>
            targetDiv.appendChild(createStudyCardElement(s, page)),
        );
    }

    async function fetchAndRenderTrials() {
        if (!doctorTrialListDiv) return;
        const response = await fetch("/api/studies");
        let studies = await response.json();
        const ca = filterClinicalAreaSelect?.value || "";
        const sca = filterSpecificClinicalAreasSelect?.value || "";
        const ts = filterTreatmentSettingSelect?.value || "";
        if (ca) studies = studies.filter((s) => s.clinical_areas.includes(ca));
        if (sca)
            studies = studies.filter((s) =>
                s.specific_clinical_areas.includes(sca),
            );
        if (ts) studies = studies.filter((s) => s.treatment_setting === ts);
        doctorTrialListDiv.innerHTML = "";
        if (studies.length === 0) {
            doctorTrialListDiv.innerHTML = `<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Nessuno studio attivo trovato.</div>`;
            return;
        }
        const bySetting = studies.reduce((acc, s) => {
            acc[s.treatment_setting] = acc[s.treatment_setting] || [];
            acc[s.treatment_setting].push(s);
            return acc;
        }, {});
        for (const setting in bySetting) {
            const section = document.createElement("div");
            section.className = "mb-6";
            section.innerHTML = `<h3 class="text-xl font-bold text-dark-gray mb-4">${setting}</h3>`;
            const container = document.createElement("div");
            container.className = "space-y-4";
            bySetting[setting].forEach((s) =>
                container.appendChild(createStudyCardElement(s, "trial")),
            );
            section.appendChild(container);
            doctorTrialListDiv.appendChild(section);
        }
    }

    function renderCriteriaInModal(study, isPatientPage) {
        if (!criteriaContainer) return;
        criteriaContainer.innerHTML = "";

        const criteri = Array.isArray(study.criteria) ? study.criteria : [];
        const inclusioni = criteri.filter((c) => c.type === "inclusion");
        const esclusioni = criteri.filter((c) => c.type === "exclusion");

        // Crea una griglia a 2 colonne
        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mt-3";
        criteriaContainer.appendChild(grid);

        // Colonna inclusioni
        const incCol = document.createElement("div");
        incCol.className = "space-y-2.5";
        grid.appendChild(incCol);

        // Header inclusioni
        const incHeader = document.createElement("div");
        incHeader.className = "flex items-center gap-2 pb-2 border-b border-emerald-100";
        incHeader.innerHTML = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Inclusione</span>`;
        incCol.appendChild(incHeader);

        // Colonna esclusioni
        const excCol = document.createElement("div");
        excCol.className = "space-y-2.5";
        grid.appendChild(excCol);

        // Header esclusioni
        const excHeader = document.createElement("div");
        excHeader.className = "flex items-center gap-2 pb-2 border-b border-red-100";
        excHeader.innerHTML = `<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Esclusione</span>`;
        excCol.appendChild(excHeader);

        function makeRow(c, kind) {
            const row = document.createElement("div");
            row.className =
                "flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors";

            const left = document.createElement("div");
            left.className = "text-sm text-slate-700 flex items-start";
            
            const icon = kind === "inclusion" 
                ? '<i class="fas fa-check-circle text-emerald-500 mt-0.5 mr-2 flex-shrink-0"></i>'
                : '<i class="fas fa-times-circle text-red-500 mt-0.5 mr-2 flex-shrink-0"></i>';
            
            left.innerHTML = `${icon}<span>${escapeHtml(c.text || "")}</span>`;
            row.appendChild(left);

            // In Trial page: solo testo
            if (!isPatientPage) return row;

            // default: inclusione=SI (true), esclusione=NO (false)
            const defaultValue = kind === "inclusion";

            const right = document.createElement("div");
            right.className = "flex items-center gap-2 flex-shrink-0";

            const switchWrapper = document.createElement("label");
            switchWrapper.className = "criteria-switch";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "criteria-toggle";
            input.checked = defaultValue;
            input.dataset.kind = kind;

            const slider = document.createElement("span");
            slider.className = "criteria-slider";

            switchWrapper.appendChild(input);
            switchWrapper.appendChild(slider);

            right.appendChild(switchWrapper);
            row.appendChild(right);

            return row;
        }

        if (inclusioni.length > 0) {
            inclusioni.forEach((c) => incCol.appendChild(makeRow(c, "inclusion")));
        } else {
            const empty = document.createElement("p");
            empty.className = "text-xs text-slate-400 italic pt-2";
            empty.textContent = "Nessun criterio di inclusione impostato.";
            incCol.appendChild(empty);
        }

        if (esclusioni.length > 0) {
            esclusioni.forEach((c) => excCol.appendChild(makeRow(c, "exclusion")));
        } else {
            const empty = document.createElement("p");
            empty.className = "text-xs text-slate-400 italic pt-2";
            empty.textContent = "Nessun criterio di esclusione impostato.";
            excCol.appendChild(empty);
        }
    }

    function showStudyDetails(study, page) {
        studyDetailModal.dataset.studyId = study.id;
        modalTitle.textContent = study.title;
        const modalSubtitleContainer = document.getElementById("modalSubtitleContainer");
        if (modalSubtitle) {
            modalSubtitle.textContent = study.subtitle || "";
            if (modalSubtitleContainer) {
                if (study.subtitle && study.subtitle.trim()) {
                    modalSubtitleContainer.classList.remove("hidden");
                } else {
                    modalSubtitleContainer.classList.add("hidden");
                }
            }
        }

        // Badge Codice Studio
        if (modalStudyCode) {
            modalStudyCode.textContent = study.study_code || "";
            if (modalStudyCodeContainer) {
                if (study.study_code) {
                    modalStudyCodeContainer.classList.remove("hidden");
                } else {
                    modalStudyCodeContainer.classList.add("hidden");
                }
            }
        }
        // Anche il campo semplice (nella pagina trial)
        const simpleCode = document.getElementById("modalStudyCode");
        if (simpleCode && !modalStudyCodeContainer) simpleCode.textContent = study.study_code || "—";

        if (modalClinicalAreas)
            modalClinicalAreas.textContent = (study.clinical_areas || []).join(", ");
        if (modalSpecificClinicalAreas)
            modalSpecificClinicalAreas.textContent = (
                study.specific_clinical_areas || []
            ).join(", ");
        if (modalTreatmentSetting)
            modalTreatmentSetting.textContent = study.treatment_setting || "";

        if (modalTreatmentLineContainer) {
            if (study.treatment_setting === "Metastatico") {
                modalTreatmentLineContainer.classList.remove("hidden");
                modalTreatmentLine.textContent = `${study.min_treatment_line || "N/A"} - ${study.max_treatment_line || "N/A"}`;
            } else {
                modalTreatmentLineContainer.classList.add("hidden");
            }
        }

        // Bracci dello studio — chip a fianco al setting
        const modalArmsContainer = document.getElementById("modalArmsContainer");
        const modalArmsText = document.getElementById("modalArmsText");
        if (modalArmsText) {
            const arms = Array.isArray(study.arms) ? study.arms : [];
            if (arms.length > 1) {
                if (modalArmsContainer) modalArmsContainer.classList.remove("hidden");
                const armLabels = arms
                    .map(a => a.arm_label ? `${a.arm_code} (${a.arm_label})` : a.arm_code)
                    .filter(Boolean);
                modalArmsText.textContent = `${arms.length} Bracci: ${armLabels.join(" · ")}`;
            } else if (arms.length === 1) {
                if (modalArmsContainer) modalArmsContainer.classList.remove("hidden");
                const a = arms[0];
                const labelStr = a.arm_label ? `: ${a.arm_label}` : "";
                modalArmsText.textContent = `1 Braccio${labelStr}`;
            } else {
                if (modalArmsContainer) modalArmsContainer.classList.remove("hidden");
                modalArmsText.textContent = "1 Braccio";
            }
        }

        // Specifiche Ulteriori — pill viola se lo studio le ha richieste
        {
            const fsContainer = document.getElementById("modalFurtherSpecificsContainer");
            const fsText = document.getElementById("modalFurtherSpecificsText");
            const fs = study.further_specifics;
            if (fsContainer && fsText && fs && typeof fs === "object" && Object.keys(fs).length > 0) {
                const parts = Object.entries(fs).map(([k, v]) => {
                    if (v === true) return k;
                    if (k === "PDL1" || (v && typeof v === "object")) return formatPDL1Value(v);
                    if (typeof v === "number") return `${k}: ${v}`;
                    return k;
                });
                fsText.textContent = parts.join(" · ");
                fsContainer.classList.remove("hidden");
            } else if (fsContainer) {
                fsContainer.classList.add("hidden");
            }
        }

        // Stato dello studio — badge inline nel titolo
        if (modalStudyStatusBadge) {
            const status = study.status;
            if (status === "attivo") {
                modalStudyStatusBadge.textContent = "🟢 Attivo";
                modalStudyStatusBadge.className = "flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800";
            } else if (status === "in_attivazione") {
                modalStudyStatusBadge.textContent = "🟡 In Attivazione";
                modalStudyStatusBadge.className = "flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800";
            } else {
                modalStudyStatusBadge.textContent = "";
                modalStudyStatusBadge.className = "hidden";
            }
        }

        // Note interne
        if (modalInternalNotesContainer && modalInternalNotes) {
            if (study.internal_notes) {
                modalInternalNotes.textContent = study.internal_notes;
                modalInternalNotesContainer.classList.remove("hidden");
            } else {
                modalInternalNotesContainer.classList.add("hidden");
            }
        }

        // Contatti PI
        if (modalPiContactsContainer && modalPiContacts) {
            if (study.pi_contacts) {
                modalPiContacts.textContent = study.pi_contacts;
                modalPiContactsContainer.classList.remove("hidden");
            } else {
                modalPiContactsContainer.classList.add("hidden");
            }
        }

        // reset risultato eleggibilità
        if (eligibilityResultDiv) {
            eligibilityResultDiv.classList.add("hidden");
            eligibilityResultDiv.textContent = "";
            eligibilityResultDiv.classList.remove(
                "text-green-600",
                "text-red-600",
            );
        }

        renderCriteriaInModal(study, page === "patient");
        studyDetailModal.classList.remove("hidden");
        studyDetailModal.style.display = "flex";

        // Carica metadati file per lo studio
        _currentFilesMeta = null;
        ["modalProtocolStatus","modalSchemaStatus"].forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.textContent = "Caricamento...";
        });
        const _extraListReset = document.getElementById("modalExtraFilesList");
        if (_extraListReset) _extraListReset.innerHTML = "";
        loadFilesMeta(study.id);
        wireFileInputs(study.id);
    }

    if (checkEligibilityBtn) {
        checkEligibilityBtn.addEventListener("click", () => {
            const toggles =
                criteriaContainer.querySelectorAll(".criteria-toggle");

            let hasMissingInclusion = false;
            let hasPositiveExclusion = false;

            toggles.forEach((t) => {
                const kind = t.dataset.kind;
                const val = t.checked;

                if (kind === "inclusion" && val === false)
                    hasMissingInclusion = true;
                if (kind === "exclusion" && val === true)
                    hasPositiveExclusion = true;
            });

            const eligible = !(hasMissingInclusion || hasPositiveExclusion);

            eligibilityResultDiv.classList.remove("hidden");
            eligibilityResultDiv.textContent = eligible
                ? "✅ Elegibile"
                : "❌ Non elegibile";
            eligibilityResultDiv.classList.remove(
                "text-green-600",
                "text-red-600",
            );
            eligibilityResultDiv.classList.add(
                eligible ? "text-green-600" : "text-red-600",
            );
        });
    }

    const closeDetailModal = () => {
        if (studyDetailModal) {
            studyDetailModal.classList.add("hidden");
            studyDetailModal.style.display = "none";
            // Se lo studio era stato aperto dalla mappa, la rimostro
            if (window._openedFromMap && studyMapModal) {
                window._openedFromMap = false;
                studyMapModal.classList.remove("hidden");
            }
        }
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeDetailModal);
    }
    const closeModalXBtn = document.getElementById("closeModalXBtn");
    if (closeModalXBtn) {
        closeModalXBtn.addEventListener("click", closeDetailModal);
    }

    if (window.location.pathname === "/trials") {
        fetchAndRenderTrials();
        addCriteriaRow();

        // Gestione ?edit=<studyId>: modalit\u00e0 modifica automatica da redirect
        const urlParams = new URLSearchParams(window.location.search);
        const editStudyId = urlParams.get("edit");
        if (editStudyId) {
            // Rimuove il parametro dall'URL senza ricaricare la pagina
            window.history.replaceState({}, "", "/trials");
            // Attende che fetchAndRenderTrials abbia caricato i dati, poi entra in edit
            setTimeout(() => {
                showPasswordModal(() => enterFormEditMode(editStudyId));
            }, 600);
        }
    }

    // === Pulsante Timeline (MODIFICATO) ===
    document.addEventListener("click", (e) => {
        if (e.target.closest("#openTimelineBtn")) {
            const studyId = studyDetailModal.dataset.studyId;
            if (studyId) {
                window.location.href = `/timeline?study_id=${studyId}`;
            }
        }
    });

    // =====================================================
    // GESTIONE FILE (protocollo, study schema, allegati)
    // Compressione gestita interamente lato server:
    //   - PDF: pdf-lib (object streams)
    //   - Study Schema: invariato
    //   - Extra immagini: sharp qualità 82
    // =====================================================

    // Legge un file come base64 Data URL
    function readFileAsBase64(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ dataUrl: e.target.result, mime: file.type });
            reader.readAsDataURL(file);
        });
    }

    function showFileMsg(el, text, ok) {
        if (!el) return;
        el.classList.remove("hidden", "text-green-700", "text-red-600");
        el.classList.add(ok ? "text-green-700" : "text-red-600");
        el.textContent = text;
    }

    async function loadFilesMeta(studyId) {
        try {
            const res = await fetch(`/api/studies/${studyId}/files-meta`);
            if (!res.ok) return;
            _currentFilesMeta = await res.json();
            renderFilesUI(_currentFilesMeta, studyId);
        } catch (e) {
            console.error("loadFilesMeta error:", e);
        }
    }

    function renderFilesUI(meta, studyId) {
        if (!meta) return;

        // --- Protocollo ---
        const hasProtocol = meta.has_protocol_pdf;
        const protStatus = document.getElementById("modalProtocolStatus");
        const dlProtocol = document.getElementById("modalDownloadProtocol");
        const upProtocolLabel = document.getElementById("modalUploadProtocolLabel");
        const upProtocolFirstLabel = document.getElementById("modalUploadProtocolFirstLabel");
        const delProtocol = document.getElementById("modalDeleteProtocol");

        if (protStatus) protStatus.textContent = hasProtocol ? "✅ Protocollo caricato" : "Nessun file";
        if (dlProtocol) { dlProtocol.classList.toggle("hidden", !hasProtocol); dlProtocol.onclick = () => downloadFile(studyId, "protocol_pdf"); }
        if (upProtocolLabel) upProtocolLabel.classList.toggle("hidden", !hasProtocol);
        if (upProtocolFirstLabel) upProtocolFirstLabel.classList.toggle("hidden", hasProtocol);
        if (delProtocol) { delProtocol.classList.toggle("hidden", !hasProtocol); delProtocol.onclick = () => deleteFile(studyId, "protocol_pdf"); }

        // --- Study Schema ---
        const hasSchema = meta.has_study_schema;
        const schemaStatus = document.getElementById("modalSchemaStatus");
        const viewSchema = document.getElementById("modalViewSchema");
        const dlSchema = document.getElementById("modalDownloadSchema");
        const upSchemaLabel = document.getElementById("modalUploadSchemaLabel");
        const upSchemaFirstLabel = document.getElementById("modalUploadSchemaFirstLabel");
        const delSchema = document.getElementById("modalDeleteSchema");

        if (schemaStatus) schemaStatus.textContent = hasSchema ? "✅ Schema caricato" : "Nessun file";
        if (viewSchema) { viewSchema.classList.toggle("hidden", !hasSchema); viewSchema.onclick = () => openSchemaViewer(studyId, meta.study_schema_mime); }
        if (dlSchema) { dlSchema.classList.toggle("hidden", !hasSchema); dlSchema.onclick = () => downloadFile(studyId, "study_schema"); }
        if (upSchemaLabel) upSchemaLabel.classList.toggle("hidden", !hasSchema);
        if (upSchemaFirstLabel) upSchemaFirstLabel.classList.toggle("hidden", hasSchema);
        if (delSchema) { delSchema.classList.toggle("hidden", !hasSchema); delSchema.onclick = () => deleteFile(studyId, "study_schema"); }

        // --- Extra files ---
        const extraList = document.getElementById("modalExtraFilesList");
        const addExtraLabel = document.getElementById("modalUploadExtraLabel");
        const isTrialPage = !!addExtraLabel; // Se c'è il pulsante per aggiungere file, siamo nella pagina di gestione (Trial)
        if (extraList) {
            extraList.innerHTML = "";
            const files = meta.extra_files_meta || [];
            files.forEach((f) => {
                const row = document.createElement("div");
                row.className = "flex items-center gap-2 text-xs w-full py-1 border-b border-slate-100 last:border-0";
                
                const isViewable = f.mime && f.mime.startsWith("image/");
                const viewBtn = isViewable 
                    ? `<button class="text-blue-600 hover:text-blue-800 p-1" title="Visualizza" data-view-extra="${f.index}"><i class="fas fa-eye"></i></button>`
                    : ``;
                const delBtn = isTrialPage
                    ? `<button class="text-red-400 hover:text-red-600 p-1" title="Elimina" data-del-extra="${f.index}"><i class="fas fa-trash"></i></button>`
                    : ``;

                row.innerHTML = `
                    <span class="flex-grow truncate text-slate-700 font-medium">${escapeHtml(f.name)}</span>
                    <div class="flex items-center gap-1">
                        ${viewBtn}
                        <button class="text-emerald-600 hover:text-emerald-800 p-1" title="Scarica" data-dl-extra="${f.index}"><i class="fas fa-download"></i></button>
                        ${delBtn}
                    </div>
                `;
                if (isViewable) {
                    row.querySelector(`[data-view-extra]`).addEventListener("click", () => openSchemaViewer(studyId, f.mime, `extra_${f.index}`, f.name));
                }
                row.querySelector(`[data-dl-extra]`).addEventListener("click", () => downloadFile(studyId, `extra_${f.index}`));
                if (isTrialPage) {
                    row.querySelector(`[data-del-extra]`).addEventListener("click", () => deleteFile(studyId, "extra_files", f.index));
                }
                extraList.appendChild(row);
            });
            if (addExtraLabel) addExtraLabel.classList.toggle("hidden", files.length >= 4);
        }
    }

    function downloadFile(studyId, field) {
        window.open(`/api/studies/${studyId}/file/${field}`, "_blank");
    }

    async function deleteFile(studyId, field, index) {
        if (!window._editPwd) {
            showPasswordModal(async () => { await deleteFile(studyId, field, index); });
            return;
        }
        const body = { field };
        if (field === "extra_files") { body.action = "remove"; body.index = index; }
        else { body.data = null; body.mime = null; }

        const res = await authFetch(`/api/studies/${studyId}/files`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            _currentFilesMeta = await res.json();
            renderFilesUI(_currentFilesMeta, studyId);
        } else {
            alert("Errore eliminazione file.");
        }
    }

    async function uploadFile(studyId, field, file, msgEl) {
        if (!file) return;
        if (!window._editPwd) {
            showPasswordModal(async () => { await uploadFile(studyId, field, file, msgEl); });
            return;
        }

        showFileMsg(msgEl, "⏳ Caricamento in corso...", true);

        try {
            // Leggi sempre il file raw: la compressione è gestita dal server
            const { dataUrl, mime } = await readFileAsBase64(file);

            const body = { field, data: dataUrl, mime };
            if (field === "extra_files") { body.action = "add"; body.name = file.name; }

            const res = await authFetch(`/api/studies/${studyId}/files`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                _currentFilesMeta = await res.json();
                renderFilesUI(_currentFilesMeta, studyId);
                showFileMsg(msgEl, "✅ Caricato con successo.", true);
            } else {
                const errData = await res.json().catch(() => ({}));
                showFileMsg(msgEl, `❌ ${errData.error || "Errore upload."}`, false);
            }
        } catch (e) {
            console.error("uploadFile error:", e);
            showFileMsg(msgEl, "❌ Errore elaborazione file.", false);
        }
    }

    // --- Viewer Study Schema ---
    const schemaViewerModal = document.getElementById("schemaViewerModal");
    const schemaViewerIframe = document.getElementById("schemaViewerIframe");
    const schemaViewerImg = document.getElementById("schemaViewerImg");
    const schemaViewerClose = document.getElementById("schemaViewerClose");
    const schemaViewerDownload = document.getElementById("schemaViewerDownload");

    let _currentSchemaStudyId = null;
    let _currentSchemaMime = null;
    let _currentSchemaField = "study_schema";

    async function openSchemaViewer(studyId, mime, field = "study_schema", title = "Study Schema") {
        if (!schemaViewerModal) return;
        _currentSchemaStudyId = studyId;
        _currentSchemaMime = mime;
        _currentSchemaField = field;

        schemaViewerIframe.classList.add("hidden");
        schemaViewerImg.classList.add("hidden");

        const modalTitle = document.querySelector("#schemaViewerModal h3");
        if (modalTitle) {
            modalTitle.textContent = title;
        }

        schemaViewerModal.classList.remove("hidden");
        schemaViewerModal.style.display = "flex";

        const url = `/api/studies/${studyId}/file/${field}`;
        if (mime && mime.startsWith("image/")) {
            schemaViewerImg.src = url;
            schemaViewerImg.classList.remove("hidden");
        } else {
            schemaViewerIframe.src = url;
            schemaViewerIframe.classList.remove("hidden");
        }
    }

    if (schemaViewerClose) {
        schemaViewerClose.addEventListener("click", () => {
            schemaViewerModal.classList.add("hidden");
            schemaViewerModal.style.display = "";
            schemaViewerIframe.src = "";
            schemaViewerImg.src = "";
            const modalTitle = document.querySelector("#schemaViewerModal h3");
            if (modalTitle) modalTitle.textContent = "Study Schema";
        });
    }

    if (schemaViewerDownload) {
        schemaViewerDownload.addEventListener("click", () => {
            if (_currentSchemaStudyId) downloadFile(_currentSchemaStudyId, _currentSchemaField || "study_schema");
        });
    }

    // --- Collegamento listener upload inputs ---
    function wireFileInputs(studyId) {
        const inputs = [
            { id: "modalUploadProtocol",      field: "protocol_pdf",  msgId: "modalProtocolUploadMsg" },
            { id: "modalUploadProtocolFirst", field: "protocol_pdf",  msgId: "modalProtocolUploadMsg" },
            { id: "modalUploadSchema",         field: "study_schema",  msgId: "modalSchemaUploadMsg" },
            { id: "modalUploadSchemaFirst",    field: "study_schema",  msgId: "modalSchemaUploadMsg" },
            { id: "modalUploadExtra",          field: "extra_files",   msgId: "modalExtraUploadMsg" },
        ];
        inputs.forEach(({ id, field, msgId }) => {
            const el = document.getElementById(id);
            if (!el) return;
            // Clone to remove old listeners
            const fresh = el.cloneNode(true);
            el.parentNode.replaceChild(fresh, el);
            fresh.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (file) uploadFile(studyId, field, file, document.getElementById(msgId));
                fresh.value = "";
            });
        });
    }

    // --- Hook showStudyDetails per caricare i file ---
    // (integrato direttamente in showStudyDetails sopra)

    // =========================================================
    // MAPPA DEGLI STUDI CLINICI
    // =========================================================
    const openMapBtn = document.getElementById("openMapBtn");
    const studyMapModal = document.getElementById("studyMapModal");
    const closeMapModalBtn = document.getElementById("closeMapModalBtn");
    const mapClinicalArea = document.getElementById("mapClinicalArea");
    const mapSpecificAreaPills = document.getElementById("mapSpecificAreaPills");
    const mapSetting = document.getElementById("mapSetting");
    const mapTitleFontSize = document.getElementById("mapTitleFontSize");
    const mapSubtitleFontSize = document.getElementById("mapSubtitleFontSize");
    const titleSizeVal = document.getElementById("titleSizeVal");
    const subtitleSizeVal = document.getElementById("subtitleSizeVal");
    const studyMapCanvasOuter = document.getElementById("studyMapCanvasOuter");
    const exportMapPdfBtn = document.getElementById("exportMapPdfBtn");

    let _mapAllStudies = [];
    let _selectedMapSpecifics = [];

    // Mappa colori per area clinica (hue fisso per area per dare armonia)
    const areaHues = {
        "Mammella": 340,         // Rosa/Fucsia
        "Polmone": 200,          // Azzurro/Blu
        "Gastro-Intestinale": 25, // Arancio/Marrone
        "Ginecologico": 280,      // Viola/Magente
        "Prostata e Vie Urinarie": 220, // Blu reale
        "Melanoma e Cute": 140,   // Verde foresta
        "Testa-Collo": 45,       // Giallo/Oro
        "Fase 1": 0,             // Rosso
        "Altro": 180             // Ciano
    };

    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
        return [
            Math.round(255 * f(0)),
            Math.round(255 * f(8)),
            Math.round(255 * f(4))
        ];
    }

    function getHarmoniousColor(clinicalArea, specificArea) {
        const specificColors = {
            // Mammella
            "HER2 positive": { border: "#a855f7", text: "#7e22ce" }, // Viola vibrante
            "HER2+": { border: "#a855f7", text: "#7e22ce" },
            "Luminali": { border: "#f59e0b", text: "#b45309" },      // Ambra vivo
            "TNBC": { border: "#ec4899", text: "#be185d" },          // Rosa intenso
            // Polmone
            "NSCLC": { border: "#06b6d4", text: "#0891b2" },         // Ciano
            "SCLC": { border: "#6366f1", text: "#4f46e5" },          // Indaco
            "Epidermoide": { border: "#f97316", text: "#ea580c" },   // Arancio
            // GI
            "Colon-Retto": { border: "#14b8a6", text: "#0d9488" },   // Teal
            "Gastrico": { border: "#10b981", text: "#059669" },      // Smeraldo
            "Pancreas": { border: "#84cc16", text: "#65a30d" },      // Lime
            "Epatocarcinoma": { border: "#ca8a04", text: "#854d0e" } // Giallo
        };

        const match = specificColors[specificArea];
        if (match) return match;

        // Fallback deterministico basato su HSL
        let hash = 0;
        for (let i = 0; i < (specificArea || "").length; i++)
            hash = (hash * 31 + (specificArea || "").charCodeAt(i)) & 0xffff;
        
        const hues = [30, 90, 160, 200, 250, 285, 325];
        const hue = hues[hash % hues.length];
        
        return {
            border: `hsl(${hue}, 75%, 50%)`,
            text: `hsl(${hue}, 85%, 28%)`
        };
    }

    if (openMapBtn) {
        openMapBtn.addEventListener("click", async () => {
            studyMapModal.classList.remove("hidden");
            // Carica tutti gli studi
            try {
                const res = await fetch("/api/studies");
                _mapAllStudies = await res.json();
            } catch (err) {
                console.error("Errore fetch studi per mappa:", err);
                _mapAllStudies = [];
            }
            populateMapSpecificAreaSelect();
            renderStudyMap();
        });
    }

    if (closeMapModalBtn) {
        closeMapModalBtn.addEventListener("click", () => {
            studyMapModal.classList.add("hidden");
        });
    }

    function populateMapSpecificAreaSelect() {
        if (!mapClinicalArea || !mapSpecificAreaPills) return;
        const area = mapClinicalArea.value;
        const specifics = specificClinicalAreasMap[area] || [];
        
        mapSpecificAreaPills.innerHTML = "";
        _selectedMapSpecifics = [...specifics]; // Pre-seleziona tutte di default

        specifics.forEach(spec => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "spec-pill flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all select-none w-full text-left bg-emerald-50/50 border-emerald-500 text-emerald-800 shadow-sm";
            btn.dataset.value = spec;
            btn.innerHTML = `
                <span>${spec}</span>
                <i class="fas fa-check text-emerald-600"></i>
            `;
            
            btn.addEventListener("click", () => {
                const val = btn.dataset.value;
                if (_selectedMapSpecifics.includes(val)) {
                    // Rimuovi
                    _selectedMapSpecifics = _selectedMapSpecifics.filter(x => x !== val);
                    btn.classList.remove("bg-emerald-50/50", "border-emerald-500", "text-emerald-800", "shadow-sm");
                    btn.classList.add("bg-white", "border-slate-200", "text-slate-500");
                    const icon = btn.querySelector("i");
                    if (icon) icon.classList.add("hidden");
                } else {
                    // Aggiungi
                    _selectedMapSpecifics.push(val);
                    btn.classList.remove("bg-white", "border-slate-200", "text-slate-500");
                    btn.classList.add("bg-emerald-50/50", "border-emerald-500", "text-emerald-800", "shadow-sm");
                    const icon = btn.querySelector("i");
                    if (icon) icon.classList.remove("hidden");
                }
                renderStudyMap();
            });

            mapSpecificAreaPills.appendChild(btn);
        });
    }

    if (mapClinicalArea) {
        mapClinicalArea.addEventListener("change", () => {
            populateMapSpecificAreaSelect();
            renderStudyMap();
        });
    }
    if (mapSetting) {
        mapSetting.addEventListener("change", renderStudyMap);
    }

    // Font size controls
    if (mapTitleFontSize) {
        mapTitleFontSize.addEventListener("input", (e) => {
            const val = e.target.value;
            if (titleSizeVal) titleSizeVal.textContent = val + "px";
            if (studyMapCanvasOuter) studyMapCanvasOuter.style.setProperty("--map-title-size", val + "px");
        });
    }
    if (mapSubtitleFontSize) {
        mapSubtitleFontSize.addEventListener("input", (e) => {
            const val = e.target.value;
            if (subtitleSizeVal) subtitleSizeVal.textContent = val + "px";
            if (studyMapCanvasOuter) studyMapCanvasOuter.style.setProperty("--map-subtitle-size", val + "px");
        });
    }

    function renderStudyMap() {
        if (!studyMapCanvasOuter) return;
        studyMapCanvasOuter.innerHTML = "";

        const selectedArea = mapClinicalArea.value;
        const selectedSetting = mapSetting.value;
        
        const selectedSpecifics = _selectedMapSpecifics.filter(Boolean);

        // Colori setting — palette separata dalle card
        const settingMeta = {
            "Metastatico":   { dot: "rgb(220,38,38)",  bg: "rgb(254,242,242)",  border: "rgb(252,165,165)", label: "rgb(153,27,27)"  },
            "Adiuvante":     { dot: "rgb(37,99,235)",  bg: "rgb(239,246,255)",  border: "rgb(147,197,253)", label: "rgb(29,78,216)"  },
            "Neo-adiuvante": { dot: "rgb(5,150,105)",  bg: "rgb(236,253,245)",  border: "rgb(110,231,183)", label: "rgb(4,120,87)"   }
        };

        // 1. Filtra gli studi
        const filtered = _mapAllStudies.filter(study => {
            const hasArea = Array.isArray(study.clinical_areas) && study.clinical_areas.includes(selectedArea);
            if (!hasArea) return false;

            const allSpecifics = specificClinicalAreasMap[selectedArea] || [];
            const hasRestrictedSpecs = selectedSpecifics.length > 0 && selectedSpecifics.length < allSpecifics.length;
            if (hasRestrictedSpecs) {
                const hasSpecific = Array.isArray(study.specific_clinical_areas) &&
                                    study.specific_clinical_areas.some(sa => selectedSpecifics.includes(sa));
                if (!hasSpecific) return false;
            }

            if (selectedSetting) {
                if (study.treatment_setting !== selectedSetting) return false;
            }

            return true;
        });

        // 2. Colonne (Esclude Altro/Non specificato)
        let columns = selectedSpecifics.length > 0
            ? [...selectedSpecifics]
            : [...(specificClinicalAreasMap[selectedArea] || [])];
        columns = columns.filter(c => c && c.toLowerCase() !== "altro" && c.toLowerCase() !== "non specificato");

        // 3. Setting (righe)
        const settings = selectedSetting ? [selectedSetting] : ["Metastatico", "Adiuvante", "Neo-adiuvante"];

        if (columns.length === 0) {
            studyMapCanvasOuter.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#94a3b8;font-size:14px;">Seleziona almeno un'area specifica</div>`;
            return;
        }

        // 4. Contenitore principale (flex column = una riga per setting)
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:flex;flex-direction:column;gap:10px;width:100%;box-sizing:border-box;";

        settings.forEach(set => {
            const sm = settingMeta[set] || { dot: "rgb(148,163,184)", bg: "rgba(248,250,252,0.8)", border: "rgb(203,213,225)", label: "rgb(71,85,105)" };

            // Banda setting
            const band = document.createElement("div");
            band.style.cssText = `
                background: ${sm.bg};
                border: 1.5px solid ${sm.border};
                border-radius: 14px;
                padding: 10px 14px 12px 14px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: 8px;
            `;

            // Header setting
            const bandHdr = document.createElement("div");
            bandHdr.style.cssText = `display:flex;align-items:center;gap:7px;margin-bottom:4px;`;
            bandHdr.innerHTML = `
                <span style="width:10px;height:10px;border-radius:50%;background:${sm.dot};display:inline-block;flex-shrink:0;"></span>
                <span style="font-size:11px;font-weight:800;color:${sm.label};text-transform:uppercase;letter-spacing:0.08em;">${set}</span>
            `;
            band.appendChild(bandHdr);

            // Grid colonne dentro la banda
            const colGrid = document.createElement("div");
            colGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(${columns.length}, minmax(0, 1fr));
                gap: 8px;
                align-items: start;
            `;

            columns.forEach(colName => {
                const colCell = document.createElement("div");
                colCell.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    min-width: 0;
                `;

                // Header colonna (solo prima riga)
                if (set === settings[0]) {
                    // Non mettiamo header qui — lo aggiungiamo fuori dalla banda
                }

                // Filtra studi per questa colonna e setting
                const matches = filtered.filter(study => {
                    if (study.treatment_setting !== set) return false;
                    return Array.isArray(study.specific_clinical_areas) && study.specific_clinical_areas.includes(colName);
                });

                if (matches.length > 0) {
                    matches.forEach(study => {
                        const card = document.createElement("div");
                        const colors = getHarmoniousColor(selectedArea, colName);
                        const isActivation = String(study.status || "").toLowerCase() === "in_attivazione";
                        const borderStyle = isActivation ? "dashed" : "solid";
                        
                        card.style.cssText = `
                            padding: 10px 12px;
                            border-radius: 10px;
                            border: 2px ${borderStyle} ${colors.border};
                            background: #ffffff;
                            color: #1e293b;
                            cursor: pointer;
                            box-sizing: border-box;
                            word-break: break-word;
                            overflow-wrap: break-word;
                            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                            transition: box-shadow 0.15s;
                        `;

                        const titleEl = document.createElement("div");
                        titleEl.className = "map-card-title";
                        titleEl.style.cssText = `font-size:var(--map-title-size);font-weight:700;line-height:1.3;color:#0f172a;`;
                        titleEl.textContent = study.title || "";

                        const subtitleEl = document.createElement("div");
                        subtitleEl.className = "map-card-subtitle";
                        subtitleEl.style.cssText = `font-size:var(--map-subtitle-size);margin-top:4px;line-height:1.35;color:#475569;opacity:0.9;`;
                        subtitleEl.textContent = study.subtitle || "";

                        card.appendChild(titleEl);
                        if (study.subtitle) card.appendChild(subtitleEl);

                        card.addEventListener("mouseenter", () => card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.13)");
                        card.addEventListener("mouseleave", () => card.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)");
                        card.addEventListener("click", () => {
                            // Nascondi la mappa temporaneamente e torna ad essa alla chiusura
                            window._openedFromMap = true;
                            studyMapModal.classList.add("hidden");
                            showStudyDetails(study, "trial");
                        });

                        colCell.appendChild(card);
                    });
                } else {
                    const empty = document.createElement("div");
                    empty.style.cssText = `
                        border: 1.5px dashed rgba(148,163,184,0.35);
                        border-radius: 10px;
                        padding: 10px 6px;
                        text-align: center;
                        font-size: 10px;
                        color: rgba(148,163,184,0.6);
                        font-style: italic;
                        flex: 1;
                    `;
                    empty.textContent = "—";
                    colCell.appendChild(empty);
                }

                colGrid.appendChild(colCell);
            });

            band.appendChild(colGrid);
            wrap.appendChild(band);
        });

        // Riga intestazioni colonne (in cima, fuori dalle bande)
        const hdrRow = document.createElement("div");
        hdrRow.style.cssText = `
            display: grid;
            grid-template-columns: repeat(${columns.length}, minmax(0, 1fr));
            gap: 8px;
            padding: 0 14px;
            box-sizing: border-box;
        `;
        columns.forEach(colName => {
            const hdr = document.createElement("div");
            hdr.className = "map-col-header";
            hdr.style.cssText = `
                background: rgb(51,65,85);
                color: #fff;
                border-radius: 8px;
                padding: 6px 8px;
                font-size: 11px;
                font-weight: 800;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                white-space: normal;
                word-break: break-word;
                line-height: 1.3;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 32px;
                box-sizing: border-box;
            `;
            hdr.textContent = colName;
            hdrRow.appendChild(hdr);
        });

        // Barra superiore con Titolo e Legenda dello Stato
        // Barra titolo + legenda compatta — usa SVG per il tratteggio (html2canvas non renderizza CSS dashed)
        const topBar = document.createElement("div");
        topBar.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 12px;
            box-sizing: border-box;
            background: #ffffff;
            border-radius: 10px;
            margin-bottom: 4px;
        `;

        const mapTitle = document.createElement("div");
        mapTitle.style.cssText = "font-size: 14px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 7px;";
        mapTitle.innerHTML = `<span style="width: 3px; height: 14px; background: #10b981; border-radius: 2px; display: inline-block; flex-shrink:0;"></span> Mappa Studi — ${selectedArea}`;
        topBar.appendChild(mapTitle);

        // Legenda con SVG per tratteggio (compatibile con html2canvas)
        const legendBar = document.createElement("div");
        legendBar.style.cssText = "display: flex; gap: 12px; align-items: center;";
        const svgSolid = `<svg width="22" height="12" style="display:inline-block;vertical-align:middle;"><rect x="1" y="1" width="20" height="10" rx="2" fill="#fff" stroke="#64748b" stroke-width="2"/></svg>`;
        const svgDashed = `<svg width="22" height="12" style="display:inline-block;vertical-align:middle;"><rect x="1" y="1" width="20" height="10" rx="2" fill="#fff" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3,2"/></svg>`;
        legendBar.innerHTML = `
            <div style="display:flex;align-items:center;gap:5px;">${svgSolid}<span style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;">Attivo</span></div>
            <div style="display:flex;align-items:center;gap:5px;">${svgDashed}<span style="font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;">In Attivazione</span></div>
        `;
        topBar.appendChild(legendBar);

        // Stili outer canvas
        studyMapCanvasOuter.style.display = "flex";
        studyMapCanvasOuter.style.flexDirection = "column";
        studyMapCanvasOuter.style.gap = "8px";
        studyMapCanvasOuter.style.padding = "12px";
        studyMapCanvasOuter.style.background = "#f8fafc";
        studyMapCanvasOuter.style.borderRadius = "16px";
        studyMapCanvasOuter.style.minHeight = "";
        studyMapCanvasOuter.style.height = "auto";
        studyMapCanvasOuter.style.overflow = "visible";

        studyMapCanvasOuter.appendChild(topBar);
        studyMapCanvasOuter.appendChild(hdrRow);
        studyMapCanvasOuter.appendChild(wrap);
    }

    // Toggle Sidebar Mappa
    const toggleMapSidebarBtn = document.getElementById("toggleMapSidebarBtn");
    const mapSidebar = document.getElementById("mapSidebar");
    if (toggleMapSidebarBtn && mapSidebar) {
        toggleMapSidebarBtn.addEventListener("click", () => {
            const isHidden = mapSidebar.classList.contains("hidden");
            const icon = document.getElementById("toggleMapSidebarIcon");
            const text = document.getElementById("toggleMapSidebarText");
            if (isHidden) {
                mapSidebar.classList.remove("hidden");
                if (icon) icon.className = "fas fa-bars text-slate-400";
                if (text) text.textContent = "Nascondi Filtri";
                toggleMapSidebarBtn.setAttribute("title", "Nascondi menu filtri");
            } else {
                mapSidebar.classList.add("hidden");
                if (icon) icon.className = "fas fa-sliders-h text-slate-400";
                if (text) text.textContent = "Mostra Filtri";
                toggleMapSidebarBtn.setAttribute("title", "Mostra menu filtri");
            }
        });
    }

    // PDF Export function
    if (exportMapPdfBtn) {
        exportMapPdfBtn.addEventListener("click", async () => {
            if (!studyMapCanvasOuter) return;

            const area = mapClinicalArea.value;
            const filename = `mappa_studi_${area.replace(/\s+/g, '_').toLowerCase()}.pdf`;

            const titleSize = studyMapCanvasOuter.style.getPropertyValue("--map-title-size") || "12px";
            const subtitleSize = studyMapCanvasOuter.style.getPropertyValue("--map-subtitle-size") || "10px";

            // A4 landscape: 297mm × 210mm. A 96dpi = 1122 × 794px (usiamo un po' meno per margini)
            const W = 1090;

            // Wrapper off-screen VISIBILE
            const wrapper = document.createElement("div");
            wrapper.style.cssText = `position:absolute;left:-9999px;top:0;width:${W}px;background:#ffffff;font-family:Inter,Segoe UI,sans-serif;z-index:1;box-sizing:border-box;padding:16px;`;

            // Clona studyMapCanvasOuter copiando il cssText inline esatto
            const inner = studyMapCanvasOuter.cloneNode(true);

            // Copia esattamente gli stili inline dell'elemento live (display:flex, flex-direction:column…)
            inner.style.cssText = studyMapCanvasOuter.style.cssText;
            // Adatta per il PDF
            inner.style.width = "100%";
            inner.style.height = "auto";
            inner.style.minHeight = "";
            inner.style.overflow = "visible";
            inner.style.borderRadius = "12px";

            // Risolvi CSS variables e rimuovi scroll in tutti i discendenti
            const resolveEl = (el) => {
                if (!el || el.nodeType !== 1) return;
                // Rimuovi overflow e max-height da tutti gli elementi
                if (el.style.overflow === "hidden" || el.style.overflow === "auto") el.style.overflow = "visible";
                if (el.style.overflowY) el.style.overflowY = "visible";
                if (el.style.maxHeight) el.style.maxHeight = "none";
                // CSS variables font → valori concreti
                if (el.classList.contains("map-col-header")) {
                    el.style.display = "flex";
                    el.style.alignItems = "center";
                    el.style.justifyContent = "center";
                    el.style.textAlign = "center";
                }
                if (el.classList.contains("map-card-title")) {
                    el.style.fontSize = titleSize;
                    el.style.fontWeight = "700";
                    el.style.lineHeight = "1.3";
                    el.style.display = "block";
                    el.style.webkitLineClamp = "";
                }
                if (el.classList.contains("map-card-subtitle")) {
                    el.style.fontSize = subtitleSize;
                    el.style.opacity = "0.8";
                    el.style.lineHeight = "1.35";
                    el.style.marginTop = "3px";
                    el.style.display = "block";
                    el.style.webkitLineClamp = "";
                }
                Array.from(el.children).forEach(resolveEl);
            };
            resolveEl(inner);

            wrapper.appendChild(inner);
            document.body.appendChild(wrapper);

            // Aspetta rendering completo
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            await new Promise(r => setTimeout(r, 250));

            try {
                // Cattura a dimensioni naturali del wrapper (altezza auto)
                const H = wrapper.getBoundingClientRect().height || 794;

                const canvas = await html2canvas(wrapper, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    width: W,
                    height: Math.ceil(H),
                    scrollX: 0,
                    scrollY: 0
                });

                const imgData = canvas.toDataURL("image/jpeg", 0.95);

                const { jsPDF } = window.jspdf || {};
                if (jsPDF) {
                    // Calcola dimensioni in mm mantenendo le proporzioni
                    const aspectRatio = canvas.height / canvas.width;
                    const pdfW = 297; // A4 landscape larghezza in mm
                    const pdfH = Math.min(pdfW * aspectRatio, 210); // max A4 height
                    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
                    doc.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
                    doc.save(filename);
                } else {
                    console.error("jsPDF non disponibile");
                    alert("Libreria jsPDF non caricata. Controlla la connessione.");
                }
            } catch (err) {
                console.error("Errore esportazione PDF:", err);
                alert("Errore: " + err.message);
            } finally {
                wrapper.remove();
            }
        });
    }
});
