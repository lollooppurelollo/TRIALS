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
    };

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

        studyArmsContainer.classList.remove("hidden");
        armsList.innerHTML = "";

        const defaultCodes = ["A", "B", "C", "D"];

        for (let i = 0; i < count; i++) {
          const code = defaultCodes[i] || `ARM${i+1}`;

          const div = document.createElement("div");
          div.className = "flex space-x-2";

          div.innerHTML = `
            <input type="text"
                   class="arm-code p-2 w-1/4 border border-gray-300 rounded-lg"
                   value="${code}"
                   readonly>

            <input type="text"
                   class="arm-label p-2 w-3/4 border border-gray-300 rounded-lg"
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
        "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center hidden z-50";
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
    // Da qui in giù rimane la logica precedente invariata:
    // gestione dropdown, criteri, form studi, ricerca pazienti
    // =====================================================

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
            Array.from(allSpecificAreas).forEach((area) => {
                const option = document.createElement("option");
                option.value = area;
                option.textContent = area;
                selectElement.appendChild(option);
            });
            container.classList.remove("hidden");
        } else {
            container.classList.add("hidden");
        }
    }

    if (clinicalAreaSelect) {
        clinicalAreaSelect.addEventListener("change", (e) => {
            updateSpecificAreasDropdown(
                e.target.value,
                specificClinicalAreasSelect,
                specificClinicalAreaContainer,
            );
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
        });
    }
    // Rigenera il codice anche quando cambia la Specifica Area Clinica
    if (studySpecificClinicalAreasSelect) {
        studySpecificClinicalAreasSelect.addEventListener("change", () => {
            const selectedAreas = studyClinicalAreasSelect
                ? Array.from(studyClinicalAreasSelect.selectedOptions).map((o) => o.value)
                : [];
            const selectedSpecific = Array.from(studySpecificClinicalAreasSelect.selectedOptions).map((o) => o.value);
            autoGenerateStudyCode(selectedAreas, selectedSpecific);
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
            try {
                const dupRes = await fetch("/api/studies");
                const allStudies = await dupRes.json();
                const isDup = allStudies.some(
                    (s) => s.study_code && s.study_code.trim().toLowerCase() === codeValue.toLowerCase()
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


                const response = await authFetch("/api/studies", {
                    method: "POST",
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
                return (
                    clinicalAreaMatch &&
                    specificClinicalAreaMatch &&
                    treatmentSettingMatch &&
                    treatmentLineMatch
                );
            });
            renderSearchResults(filteredStudies, "patient");
            // Mostra la sezione CT.gov e memorizza i dati del paziente
            window._ctgovPatientData = patientData;
            const ctgovSection = document.getElementById("ctgovSection");
            if (ctgovSection) {
                ctgovSection.classList.remove("hidden");
                // Aggiorna le label dinamiche con i parametri reali del paziente
                const valArea = document.getElementById("ctgovValArea");
                const valSetting = document.getElementById("ctgovValSetting");
                const valSpecific = document.getElementById("ctgovValSpecific");
                
                if (valArea) valArea.textContent = patientData.clinicalAreas || "N/A";
                if (valSetting) valSetting.textContent = patientData.treatmentSetting || "N/A";
                
                const labelSpecific = document.getElementById("ctgovLabelSpecific");
                if (valSpecific) {
                    if (patientData.specificClinicalAreas) {
                        valSpecific.textContent = patientData.specificClinicalAreas;
                        if (labelSpecific) labelSpecific.classList.remove("hidden");
                    } else {
                        valSpecific.textContent = "Nessuno";
                        if (labelSpecific) labelSpecific.classList.add("hidden");
                    }
                }
                
                // Resetta le checkbox a true/attive
                const incArea = document.getElementById("ctgovIncArea");
                const incSetting = document.getElementById("ctgovIncSetting");
                const incSpecific = document.getElementById("ctgovIncSpecific");
                if (incArea) { incArea.checked = true; document.getElementById("ctgovLabelArea")?.classList.add("active"); }
                if (incSetting) { incSetting.checked = true; document.getElementById("ctgovLabelSetting")?.classList.add("active"); }
                if (incSpecific) { incSpecific.checked = true; document.getElementById("ctgovLabelSpecific")?.classList.add("active"); }
            }
            // Reset risultati precedenti
            const ctgovResults = document.getElementById("ctgovResults");
            if (ctgovResults) ctgovResults.innerHTML = "";
        });
    }

    // =========================================================
    //  CLINICALTRIALS.GOV INTEGRATION
    // =========================================================

    // Mappa area clinica italiana → sinonimi inglesi per CT.gov con operatori booleani
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
        1: "first-line 1L",
        2: "second-line 2L",
        3: "third-line 3L",
    };

    // Mappa le aree cliniche specifiche in termini inglesi ed equivalenti clinici (es. recettori ormonali per luminale)
    const CTGOV_SPECIFIC_MAP = {
        "Luminali": '"luminal" OR "HR positive" OR "HR-positive" OR "hormone receptor positive" OR "ER positive" OR "ER-positive" OR "estrogen receptor positive" OR "estrogen-dependent"',
        "TNBC": '"TNBC" OR "triple negative" OR "triple-negative"',
        "HER2 positive": '"HER2 positive" OR "HER2-positive" OR "HER2+" OR "HER2 amplified"',
        "Mesotelioma": '"mesothelioma"',
        "NSCLC": '"NSCLC" OR "non-small cell lung cancer"',
        "SCLC": '"SCLC" OR "small cell lung cancer"',
        "Esofago": '"esophagus" OR "esophageal"',
        "Stomaco": '"gastric" OR "stomach"',
        "Colon": '"colon" OR "colonic" OR "colorectal"',
        "Retto": '"rectum" OR "rectal" OR "colorectal"',
        "Ano": '"anal" OR "anus"',
        "Vie biliari": '"biliary" OR "cholangiocarcinoma" OR "gallbladder"',
        "Pancreas": '"pancreas" OR "pancreatic"',
        "Fegato": '"liver" OR "hepatocellular" OR "HCC"',
        "Endometrio": '"endometrial" OR "endometrium"',
        "Ovaio": '"ovarian" OR "ovary"',
        "Cervice": '"cervical" OR "cervix"',
        "Vulva": '"vulvar" OR "vulva"',
        "Altri": "",
        "Prostata": '"prostate" OR "prostatic"',
        "Rene": '"renal" OR "kidney"',
        "Vescica": '"bladder" OR "urothelial"',
        "Altre vie Urinarie": '"urinary" OR "urothelial"',
        "Melanoma": '"melanoma"',
        "SCC": '"squamous cell skin" OR "cutaneous squamous cell"',
        "Basalioma": '"basal cell skin" OR "basal cell carcinoma"',
    };

    /** Costruisce i parametri query per l'API CT.gov v2 */
    function buildCtgovParams(patientData, countryFilter, statusFilter, studyTypeFilter) {
        const queryParts = [];
        
        // Leggi lo stato delle checkbox di inclusione parametri
        const incArea = document.getElementById("ctgovIncArea")?.checked !== false; // default true
        const incSetting = document.getElementById("ctgovIncSetting")?.checked !== false; // default true
        const incSpecific = document.getElementById("ctgovIncSpecific")?.checked !== false; // default true

        // 1. Area Clinica Principale
        if (incArea) {
            const areaSynonyms = CTGOV_AREA_MAP[patientData.clinicalAreas];
            if (areaSynonyms) {
                queryParts.push(`(${areaSynonyms})`);
            }
        }
        
        // 2. Setting del Trattamento
        if (incSetting) {
            const settingSynonyms = CTGOV_SETTING_MAP[patientData.treatmentSetting];
            if (settingSynonyms) {
                queryParts.push(`(${settingSynonyms})`);
            }
        }
        
        // 3. Sottotipo Specifico
        if (incSpecific && patientData.specificClinicalAreas) {
            const specificSynonyms = CTGOV_SPECIFIC_MAP[patientData.specificClinicalAreas];
            if (specificSynonyms) {
                queryParts.push(`(${specificSynonyms})`);
            } else {
                queryParts.push(`("${patientData.specificClinicalAreas}")`);
            }
        }

        // Filtro tipo studio tramite query syntax (AREA[StudyType]INTERVENTIONAL)
        if (studyTypeFilter === "INTERVENTIONAL") {
            queryParts.push("AREA[StudyType]INTERVENTIONAL");
        }

        const queryTerm = queryParts.join(" AND ") || "cancer"; // fallback per non far fallire la query se vuota

        const params = new URLSearchParams({
            "query.term": queryTerm,
            "pageSize": "15",
            "format": "json",
        });
        if (statusFilter !== "all") params.set("filter.overallStatus", statusFilter);
        if (countryFilter !== "all") params.set("query.locn", countryFilter);
        return params;
    }

    /** Determina quali parametri paziente non sono verificabili nei dati strutturati CT.gov */
    function buildCtgovNote(patientData) {
        const unverifiable = [];
        if (patientData.treatmentLine !== null && patientData.treatmentLine !== undefined)
            unverifiable.push(`linea di trattamento ${patientData.treatmentLine}`);
        if (patientData.specificClinicalAreas)
            unverifiable.push(`sottotipo "${patientData.specificClinicalAreas}"`);
        if (unverifiable.length === 0) return null;
        return `Parametri non verificabili automaticamente: ${unverifiable.join(", ")}. Controllare manualmente i criteri di eleggibilità dello studio.`;
    }

    /** Tronca il testo a maxLen caratteri con ellissi */
    function truncateText(text, maxLen) {
        if (!text || text.length <= maxLen) return text || "";
        return text.substring(0, maxLen).trimEnd() + "…";
    }

    /** Crea una card HTML per un singolo risultato CT.gov */
    function createCtgovCard(study, patientData) {
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

        // Centri — mostra max 4 + eventuale "+N altri"
        let centersHtml = "<span class='text-slate-400 text-xs'>Nessun centro registrato</span>";
        if (locations.length > 0) {
            const shown = locations.slice(0, 4).map(l => {
                const parts = [l.facility, l.city, l.country].filter(Boolean);
                return `<span class="inline-block text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">${escapeHtml(parts.join(", "))}</span>`;
            });
            const extra = locations.length > 4 ? `<span class="text-xs text-slate-400">+${locations.length - 4} altri</span>` : "";
            centersHtml = `<div class="flex flex-wrap gap-1.5 mt-1">${shown.join("") + extra}</div>`;
        }

        // Nota di attenzione per parametri non verificabili
        const noteText = buildCtgovNote(patientData);
        const noteHtml = noteText
            ? `<div class="ctgov-note"><span style="font-size:1rem;">⚠️</span><span>${escapeHtml(noteText)}</span></div>`
            : "";

        const card = document.createElement("div");
        card.className = "ctgov-card";
        card.innerHTML = `
            <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1.5">
                        <span class="ctgov-badge">ClinicalTrials.gov</span>
                        <span class="text-[10px] font-mono text-slate-400">${escapeHtml(nctId)}</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" style="background:#eff6ff;color:${statusColor}">${statusLabel}</span>
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
            ${noteHtml}
        `;
        return card;
    }

    /** Aggiorna dinamicamente i link ai registri esterni (EU CTR) basandosi sulle scelte correnti */
    function updateExternalRegistryLinks() {
        const patientData = window._ctgovPatientData;
        if (!patientData) return;

        const euctrLink = document.getElementById("euctrSearchLink");
        if (!euctrLink) return;

        const queryParts = [];
        const incArea = document.getElementById("ctgovIncArea")?.checked !== false;
        const incSetting = document.getElementById("ctgovIncSetting")?.checked !== false;
        const incSpecific = document.getElementById("ctgovIncSpecific")?.checked !== false;

        if (incArea) {
            const area = CTGOV_AREA_MAP[patientData.clinicalAreas];
            if (area) queryParts.push(`(${area})`);
        }
        if (incSetting) {
            const setting = CTGOV_SETTING_MAP[patientData.treatmentSetting];
            if (setting) queryParts.push(`(${setting})`);
        }
        if (incSpecific && patientData.specificClinicalAreas) {
            const specific = CTGOV_SPECIFIC_MAP[patientData.specificClinicalAreas];
            if (specific) {
                queryParts.push(`(${specific})`);
            } else {
                queryParts.push(`("${patientData.specificClinicalAreas}")`);
            }
        }

        const queryTerm = queryParts.join(" AND ") || "cancer";
        
        // Imposta l'URL del registro europeo filtrato per l'Italia
        euctrLink.href = `https://www.clinicaltrialsregister.eu/ctr-search/search?query=${encodeURIComponent(queryTerm)}&country=it`;
    }

    /** Esegue la ricerca su CT.gov e inietta i risultati nel DOM. Supporta la paginazione 'loadMore'. */
    async function runCtgovSearch(loadMore = false) {
        const patientData = window._ctgovPatientData;
        if (!patientData) return;

        const ctgovResults = document.getElementById("ctgovResults");
        if (!ctgovResults) return;

        const loadMoreContainer = document.getElementById("ctgovLoadMoreContainer");
        const loadMoreBtn = document.getElementById("ctgovLoadMoreBtn");

        // Leggi filtri selezionati
        const countryFilter = document.querySelector("input[name='ctgov_country']:checked")?.value || "Italy";
        const statusFilter  = document.querySelector("input[name='ctgov_status']:checked")?.value  || "RECRUITING";
        const studyTypeFilter = document.querySelector("input[name='ctgov_studytype']:checked")?.value || "INTERVENTIONAL";

        // Aggiorna il link del portale europeo basandosi sulle impostazioni attuali
        updateExternalRegistryLinks();

        let tempSpinner = null;

        if (!loadMore) {
            // Ricerca iniziale
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
            // Carica altri
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
            
            // Se stiamo paginando, aggiungiamo il token della pagina successiva
            if (loadMore && window._ctgovNextPageToken) {
                params.set("pageToken", window._ctgovNextPageToken);
            }

            const res = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const studies = data.studies || [];

            // Rimuovi lo spinner temporaneo in caso di paginazione
            if (tempSpinner && tempSpinner.parentNode) {
                tempSpinner.parentNode.removeChild(tempSpinner);
            }
            if (loadMoreBtn) loadMoreBtn.disabled = false;

            if (!loadMore) {
                ctgovResults.innerHTML = "";
            }

            if (studies.length === 0 && !loadMore) {
                ctgovResults.innerHTML = `
                    <div class="p-6 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                        <i class="fas fa-search-minus text-2xl mb-2 text-slate-300"></i>
                        <p class="text-sm font-medium">Nessuno studio trovato su ClinicalTrials.gov con questi filtri.</p>
                        <p class="text-xs text-slate-400 mt-1">Prova a cambiare i filtri o ad allargare la ricerca deselezionando alcuni parametri.</p>
                    </div>`;
                return;
            }

            // Mostra il numero dei risultati trovati solo sulla prima pagina
            if (!loadMore) {
                const header = document.createElement("p");
                header.className = "text-xs text-slate-500 mb-2";
                header.textContent = `${studies.length}${data.nextPageToken ? '+' : ''} studi trovati su ClinicalTrials.gov`;
                ctgovResults.appendChild(header);
            }

            // Aggiungi le card dei risultati
            studies.forEach(s => ctgovResults.appendChild(createCtgovCard(s, patientData)));

            // Memorizza e gestisci il token per la pagina successiva
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
            
            // Trova e seleziona il radio button interno
            const radio = label.querySelector("input[type='radio']");
            if (radio) {
                radio.checked = true;
                // Riesegui la ricerca per aggiornare con i nuovi filtri
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
        let content = `
            <div>
                <div class="mb-1">${codeBadge}${statusBadge}<h4 class="inline font-bold text-dark-gray ml-1">${safeTitle}</h4></div>
                <p class="text-sm text-gray-600">${safeSubtitle}</p>
            </div>`;
        if (page === "trial") {
            content = `
                <div class="flex justify-between items-center">
                    <div>
                        <div class="mb-1">${codeBadge}${statusBadge}<h4 class="inline font-bold text-dark-gray ml-1">${safeTitle}</h4></div>
                        <p class="text-sm text-gray-600">${safeSubtitle}</p>
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
        modalSubtitle.textContent = study.subtitle;

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

        // Stato dello studio
        if (modalStudyStatus && modalStudyStatusCard && modalStudyStatusIcon) {
            const status = study.status;
            if (status === "attivo") {
                modalStudyStatusCard.classList.remove("hidden");
                modalStudyStatus.textContent = "🟢 Attivo";
                modalStudyStatus.className = "text-sm font-semibold text-emerald-800";
                modalStudyStatusCard.className = "p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 flex items-start gap-3";
                modalStudyStatusIcon.className = "p-2 rounded-lg bg-emerald-100 text-emerald-600";
            } else if (status === "in_attivazione") {
                modalStudyStatusCard.classList.remove("hidden");
                modalStudyStatus.textContent = "🟡 In Attivazione";
                modalStudyStatus.className = "text-sm font-semibold text-amber-800";
                modalStudyStatusCard.className = "p-4 rounded-xl border border-amber-200 bg-amber-50/20 flex items-start gap-3";
                modalStudyStatusIcon.className = "p-2 rounded-lg bg-amber-100 text-amber-600";
            } else {
                modalStudyStatusCard.classList.add("hidden");
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

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            studyDetailModal.classList.add("hidden");
            studyDetailModal.style.display = "none";
        });
    }

    if (window.location.pathname === "/trials") {
        fetchAndRenderTrials();
        addCriteriaRow();
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

    function getHarmoniousColor(clinicalArea, specificArea, setting) {
        const baseHue = areaHues[clinicalArea] !== undefined ? areaHues[clinicalArea] : 180;
        // Aggiungi un offset basato sulla specifica area
        let specOffset = 0;
        if (specificArea) {
            for (let i = 0; i < specificArea.length; i++) {
                specOffset += specificArea.charCodeAt(i);
            }
            specOffset = (specOffset % 5) * 15; // Massimo ±30 gradi
        }
        
        // Aggiungi un offset basato sul setting
        let settingOffset = 0;
        if (setting === "Metastatico") settingOffset = 10;
        else if (setting === "Adiuvante") settingOffset = -10;
        else if (setting === "Neo-adiuvante") settingOffset = 5;

        const hue = (baseHue + specOffset + settingOffset) % 360;
        const rgbBg = hslToRgb(hue, 75, 94);
        const rgbBorder = hslToRgb(hue, 60, 82);
        const rgbText = hslToRgb(hue, 80, 18);

        return {
            bg: `rgb(${rgbBg[0]}, ${rgbBg[1]}, ${rgbBg[2]})`,
            border: `rgb(${rgbBorder[0]}, ${rgbBorder[1]}, ${rgbBorder[2]})`,
            text: `rgb(${rgbText[0]}, ${rgbText[1]}, ${rgbText[2]})`
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
        
        // Ottieni array di specifiche selezionate
        const selectedSpecifics = _selectedMapSpecifics.filter(Boolean);

        // 1. Filtra gli studi
        const filtered = _mapAllStudies.filter(study => {
            // Filtro area clinica
            const hasArea = Array.isArray(study.clinical_areas) && study.clinical_areas.includes(selectedArea);
            if (!hasArea) return false;

            // Filtro specifica area (se valorizzata)
            const allSpecifics = specificClinicalAreasMap[selectedArea] || [];
            const hasRestrictedSpecs = selectedSpecifics.length > 0 && selectedSpecifics.length < allSpecifics.length;
            if (hasRestrictedSpecs) {
                const hasSpecific = Array.isArray(study.specific_clinical_areas) && 
                                    study.specific_clinical_areas.some(sa => selectedSpecifics.includes(sa));
                if (!hasSpecific) return false;
            }

            // Filtro setting (opzionale)
            if (selectedSetting) {
                if (study.treatment_setting !== selectedSetting) return false;
            }

            return true;
        });

        // 2. Determina le colonne (Esclude Altro/Non specificato)
        let columns = [];
        if (selectedSpecifics.length > 0) {
            columns = [...selectedSpecifics];
        } else {
            columns = [...(specificClinicalAreasMap[selectedArea] || [])];
        }

        // 3. Determina i setting (Righe/Sub-sezioni)
        const settings = selectedSetting ? [selectedSetting] : ["Metastatico", "Adiuvante", "Neo-adiuvante"];

        // 4. Costruisci il layout grid
        const grid = document.createElement("div");
        grid.className = "grid gap-4 h-full w-full";
        grid.style.gridTemplateColumns = `repeat(${columns.length}, minmax(0, 1fr))`;
        grid.style.minHeight = "640px";

        columns.forEach(colName => {
            const colDiv = document.createElement("div");
            colDiv.className = "flex flex-col gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-100/80 h-full overflow-hidden";
            
            // Colonna Header
            const colHdr = document.createElement("h4");
            colHdr.className = "text-[11px] font-bold text-center py-2 bg-slate-200/60 rounded-xl text-slate-700 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis shadow-sm";
            colHdr.textContent = colName;
            colDiv.appendChild(colHdr);

            // Sub-sezioni per i Setting
            settings.forEach(set => {
                const setDiv = document.createElement("div");
                setDiv.className = "flex-grow flex flex-col bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm overflow-hidden";
                
                const setDotColor = {
                    "Metastatico": "rgb(239,68,68)",
                    "Adiuvante": "rgb(59,130,246)",
                    "Neo-adiuvante": "rgb(245,158,11)"
                }[set] || "rgb(148,163,184)";

                setDiv.innerHTML = `
                    <span style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                        <span style="width:6px;height:6px;border-radius:50%;display:inline-block;background:${setDotColor};"></span> ${set}
                    </span>
                    <div class="study-rect-container flex flex-col gap-2 overflow-y-auto pr-1 flex-grow" style="max-height: 250px;">
                    </div>
                `;

                const container = setDiv.querySelector(".study-rect-container");

                // Filtra studi per questa colonna e setting
                const matches = filtered.filter(study => {
                    if (study.treatment_setting !== set) return false;
                    return Array.isArray(study.specific_clinical_areas) && study.specific_clinical_areas.includes(colName);
                });

                if (matches.length > 0) {
                    matches.forEach(study => {
                        const card = document.createElement("div");
                        card.className = "p-2.5 rounded-xl border flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md";
                        
                        const colors = getHarmoniousColor(selectedArea, colName, set);
                        card.style.backgroundColor = colors.bg;
                        card.style.borderColor = colors.border;
                        card.style.color = colors.text;

                        const safeTitle = escapeHtml(study.title || "");
                        const safeSubtitle = escapeHtml(study.subtitle || "");

                        card.innerHTML = `
                            <div class="map-card-title font-bold leading-tight line-clamp-2" style="font-size: var(--map-title-size);">${study.study_code ? study.study_code + ' - ' : ''}${safeTitle}</div>
                            <div class="map-card-subtitle mt-1 leading-snug line-clamp-2 opacity-80" style="font-size: var(--map-subtitle-size);">${safeSubtitle}</div>
                        `;

                        card.addEventListener("click", () => {
                            studyMapModal.classList.add("hidden");
                            showStudyDetails(study, "trial");
                        });

                        container.appendChild(card);
                    });
                } else {
                    const empty = document.createElement("div");
                    empty.className = "flex-grow flex items-center justify-center border border-dashed border-slate-200 rounded-xl p-4 text-[10px] text-slate-300 italic";
                    empty.textContent = "Nessuno studio";
                    container.appendChild(empty);
                }

                colDiv.appendChild(setDiv);
            });

            grid.appendChild(colDiv);
        });

        studyMapCanvasOuter.appendChild(grid);
    }

    // PDF Export function
    if (exportMapPdfBtn) {
        exportMapPdfBtn.addEventListener("click", async () => {
            if (!studyMapCanvasOuter) return;

            const area = mapClinicalArea.value;
            const filename = `mappa_studi_${area.replace(/\s+/g, '_').toLowerCase()}.pdf`;

            const titleSize = studyMapCanvasOuter.style.getPropertyValue("--map-title-size") || "12px";
            const subtitleSize = studyMapCanvasOuter.style.getPropertyValue("--map-subtitle-size") || "10px";

            // Dimensioni A4 landscape a 96dpi
            const W = 1122;
            const H = 794;

            // Wrapper off-screen VISIBILE (non opacity:0, non z-index negativo)
            const wrapper = document.createElement("div");
            wrapper.style.cssText = [
                "position: absolute",
                `left: ${-W - 100}px`,
                "top: 0",
                `width: ${W}px`,
                `height: ${H}px`,
                "background: #ffffff",
                "padding: 24px",
                "box-sizing: border-box",
                "overflow: hidden",
                "font-family: Inter, Segoe UI, sans-serif",
                "z-index: 1"
            ].join("; ");

            // Clona il contenuto della mappa
            const inner = studyMapCanvasOuter.cloneNode(true);

            // Copia gli stili inline già presenti (gridTemplateColumns ecc.)
            inner.style.width = "100%";
            inner.style.height = "100%";
            inner.style.display = "grid";
            inner.style.boxSizing = "border-box";
            inner.style.overflow = "hidden";
            inner.style.gap = studyMapCanvasOuter.style.gap || "16px";
            inner.style.gridTemplateColumns = studyMapCanvasOuter.querySelector("div")
                ? studyMapCanvasOuter.querySelector("div").style.gridTemplateColumns || ""
                : "";

            // Risolvi CSS variables e rimuovi scroll nel clone
            const resolveEl = (el) => {
                if (!el || el.nodeType !== 1) return;
                if (el.classList.contains("study-rect-container")) {
                    el.style.maxHeight = "none";
                    el.style.overflowY = "visible";
                }
                if (el.classList.contains("map-card-title")) {
                    el.style.fontSize = titleSize;
                    el.style.fontWeight = "700";
                    el.style.lineHeight = "1.3";
                    el.style.display = "block";
                }
                if (el.classList.contains("map-card-subtitle")) {
                    el.style.fontSize = subtitleSize;
                    el.style.opacity = "0.8";
                    el.style.lineHeight = "1.4";
                    el.style.marginTop = "4px";
                    el.style.display = "block";
                }
                // Rimuovi overflow hidden sulle colonne in modo che tutto sia visibile
                el.style.overflow = el.style.overflow === "hidden" ? "visible" : el.style.overflow;
                Array.from(el.children).forEach(resolveEl);
            };
            resolveEl(inner);

            wrapper.appendChild(inner);
            document.body.appendChild(wrapper);

            // Aspetta che il browser abbia renderizzato
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            await new Promise(r => setTimeout(r, 200));

            try {
                const canvas = await html2canvas(wrapper, {
                    scale: 1.5,
                    useCORS: true,
                    allowTaint: true,
                    logging: true,
                    backgroundColor: "#ffffff",
                    width: W,
                    height: H,
                    scrollX: 0,
                    scrollY: 0,
                    x: 0,
                    y: 0
                });

                const imgData = canvas.toDataURL("image/jpeg", 0.95);

                const { jsPDF } = window.jspdf || {};
                if (jsPDF) {
                    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
                    doc.addImage(imgData, "JPEG", 0, 0, 297, 210);
                    doc.save(filename);
                } else {
                    console.error("jsPDF non disponibile");
                    alert("Libreria jsPDF non caricata. Controlla la connessione.");
                }
            } catch (err) {
                console.error("Errore esportazione PDF:", err);
                alert("Errore durante l'esportazione: " + err.message);
            } finally {
                wrapper.remove();
            }
        });
    }

});
