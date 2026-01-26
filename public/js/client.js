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
    const doctorTrialListDiv = document.querySelector(
        "#trialListSection #trialList",
    );

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

    function showPasswordModal(callback) {
        passwordCallback = callback;
        passwordInput.value = "";
        passwordError.classList.add("hidden");
        passwordModal.classList.remove("hidden");
    }
    cancelPasswordBtn.addEventListener("click", () =>
        passwordModal.classList.add("hidden"),
    );
    confirmPasswordBtn.addEventListener("click", () => {
        if (passwordInput.value === "TRIAL") {
            passwordModal.classList.add("hidden");
            if (passwordCallback) passwordCallback();
        } else {
            passwordError.classList.remove("hidden");
        }
    });

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
            const selectedOptions = Array.from(e.target.selectedOptions).map(
                (o) => o.value,
            );
            updateSpecificAreasDropdown(
                selectedOptions,
                studySpecificClinicalAreasSelect,
                studySpecificClinicalAreaContainer,
            );
        });
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

    if (studyForm) {
        studyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            showPasswordModal(async () => {
                const criteriaItems =
                    document.querySelectorAll(".criteria-item");
                const criteria = Array.from(criteriaItems).map((item) => ({
                    text: item.querySelector(".criteria-input").value,
                    type:
                        item
                            .querySelector(".type-toggle-btn")
                            .textContent.trim() === "Esclusione"
                            ? "exclusion"
                            : "inclusion",
                }));
                const selectedClinicalAreas = Array.from(
                    studyClinicalAreasSelect.selectedOptions,
                ).map((o) => o.value);
                const selectedSpecificClinicalAreas = Array.from(
                    studySpecificClinicalAreasSelect.selectedOptions,
                ).map((o) => o.value);
                const newStudy = {
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
                    criteria,
                };
                await fetch("/api/studies", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newStudy),
                });
                studyForm.reset();
                studySpecificClinicalAreaContainer.classList.add("hidden");
                studyTreatmentLineContainer.classList.add("hidden");
                criteriaListDiv.innerHTML = "";
                addCriteriaRow();
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
        });
    }

    function createStudyCardElement(study, page) {
        const card = document.createElement("div");
        card.className =
            "bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200";
        card.dataset.studyId = study.id;
        let content = `
            <div>
                <h4 class="font-bold text-dark-gray">${study.title}</h4>
                <p class="text-sm text-gray-600">${study.subtitle}</p>
            </div>`;
        if (page === "trial") {
            content = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-bold text-dark-gray">${study.title}</h4>
                        <p class="text-sm text-gray-600">${study.subtitle}</p>
                    </div>
                    <button class="remove-study-btn text-red-400 hover:text-red-600 transition-colors" data-id="${study.id}"><i class="fas fa-trash-alt"></i></button>
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
                        await fetch(`/api/studies/${id}`, { method: "DELETE" });
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

        function makeRow(c, kind) {
            const row = document.createElement("div");
            row.className =
                "flex items-center justify-between gap-3 p-2 rounded-lg border border-gray-100";

            const left = document.createElement("div");
            left.className = "text-sm text-dark-gray";
            left.textContent = c.text || "";

            row.appendChild(left);

            // In Trial page: solo testo
            if (!isPatientPage) return row;

            // default: inclusione=SI (true), esclusione=NO (false)
            const defaultValue = kind === "inclusion";

            const right = document.createElement("div");
            right.className = "flex items-center gap-2";

            const labelNo = document.createElement("span");
            labelNo.className = "text-xs text-gray-500";
            labelNo.textContent = "No";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.className = "criteria-toggle";
            input.checked = defaultValue;
            input.dataset.kind = kind;

            const labelSi = document.createElement("span");
            labelSi.className = "text-xs text-gray-500";
            labelSi.textContent = "Sì";

            right.appendChild(labelNo);
            right.appendChild(input);
            right.appendChild(labelSi);
            row.appendChild(right);

            return row;
        }

        if (inclusioni.length > 0) {
            const h = document.createElement("h5");
            h.className = "text-md font-bold mt-4 mb-2 text-dark-gray";
            h.textContent = "Criteri di Inclusione";
            criteriaContainer.appendChild(h);

            inclusioni.forEach((c) =>
                criteriaContainer.appendChild(makeRow(c, "inclusion")),
            );
        }

        if (esclusioni.length > 0) {
            const h = document.createElement("h5");
            h.className = "text-md font-bold mt-4 mb-2 text-dark-gray";
            h.textContent = "Criteri di Esclusione";
            criteriaContainer.appendChild(h);

            esclusioni.forEach((c) =>
                criteriaContainer.appendChild(makeRow(c, "exclusion")),
            );
        }
    }

    function showStudyDetails(study, page) {
        studyDetailModal.dataset.studyId = study.id;
        modalTitle.textContent = study.title;
        modalSubtitle.textContent = study.subtitle;

        if (modalClinicalAreas)
            modalClinicalAreas.textContent = (study.clinical_areas || []).join(
                ", ",
            );
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
});
