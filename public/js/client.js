// public/js/client.js
// Questo script gestisce tutta la logica di interazione lato client.

document.addEventListener("DOMContentLoaded", () => {
    // Definizione delle aree cliniche per i dropdown dinamici
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
        "Prostata e Vie Urinarie": [
            "Prostata",
            "Rene",
            "Vescica",
            "Altre vie Urinarie",
        ],
        Ginecologico: ["Endometrio", "Ovaio", "Cervice", "Vulva", "Altri"],
        "Melanoma e Cute": ["Melanoma", "SCC", "Basalioma"],
    };

    // --- Riferimenti DOM comuni per le pagine paziente e trial ---
    const studyDetailModal = document.getElementById("studyDetailModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const criteriaContainer = document.getElementById("criteriaContainer");

    // --- Logica per la pagina 'Paziente' ---
    const patientSearchForm = document.getElementById("patientSearchForm");
    const patientClinicalAreaSelect = document.getElementById("clinicalArea");
    const patientTreatmentSettingSelect =
        document.getElementById("treatmentSetting");
    const specificAreaContainer = document.getElementById(
        "specificAreaContainer",
    );
    const specificClinicalAreaSelect = document.getElementById(
        "specificClinicalArea",
    );
    const treatmentLineContainer = document.getElementById(
        "treatmentLineContainer",
    );
    const searchResultsDiv = document.getElementById("searchResults");
    const checkEligibilityBtn = document.getElementById("checkEligibilityBtn");
    const eligibilityResultDiv = document.getElementById("eligibilityResult");

    if (patientClinicalAreaSelect) {
        patientClinicalAreaSelect.addEventListener("change", (e) => {
            updateSpecificAreasDropdown(
                e.target.value,
                specificClinicalAreaSelect,
                specificAreaContainer,
            );
        });

        patientTreatmentSettingSelect.addEventListener("change", (e) => {
            console.log(
                "Patient treatment setting changed to:",
                e.target.value,
            );
            if (e.target.value === "Metastatico") {
                treatmentLineContainer.classList.remove("hidden");
            } else {
                treatmentLineContainer.classList.add("hidden");
            }
        });

        // Controlla lo stato iniziale al caricamento della pagina
        checkInitialPatientTreatmentSetting();

        patientSearchForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(patientSearchForm);
            const data = Object.fromEntries(formData.entries());
            data.patient_treatment_line = parseInt(
                data.patient_treatment_line,
                10,
            );

            searchResultsDiv.innerHTML =
                '<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Ricerca in corso...</div>';

            try {
                const response = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                const studies = await response.json();

                if (studies.length === 0) {
                    searchResultsDiv.innerHTML =
                        '<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Nessuno studio trovato per i criteri selezionati.</div>';
                } else {
                    searchResultsDiv.innerHTML = studies
                        .map(
                            (study) => `
                        <div class="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200" data-study-id="${study.id}">
                            <h3 class="text-lg font-bold text-dark-gray">${study.title}</h3>
                            <p class="text-sm text-gray-600">${study.subtitle}</p>
                        </div>
                    `,
                        )
                        .join("");

                    document
                        .querySelectorAll("#searchResults > div")
                        .forEach((card) => {
                            card.addEventListener("click", () =>
                                showStudyDetails(
                                    card.dataset.studyId,
                                    studies,
                                    "patient",
                                ),
                            );
                        });
                }
            } catch (error) {
                console.error("Errore durante la ricerca:", error);
                searchResultsDiv.innerHTML =
                    '<div class="p-6 text-center text-red-500 bg-white rounded-xl shadow-md">Si è verificato un errore durante la ricerca.</div>';
            }
        });
    }

    // --- Logica per la pagina 'Trial' ---
    const studyForm = document.getElementById("studyForm");
    const studyClinicalAreasSelect =
        document.getElementById("studyClinicalAreas");
    const studySpecificAreaContainer = document.getElementById(
        "studySpecificAreaContainer",
    );
    const studySpecificClinicalAreasSelect = document.getElementById(
        "studySpecificClinicalAreas",
    );
    const studyTreatmentSettingSelect = document.getElementById(
        "studyTreatmentSetting",
    );
    const studyTreatmentLineContainer = document.getElementById(
        "studyTreatmentLineContainer",
    );
    const criteriaListDiv = document.getElementById("criteriaList");
    const addCriteriaBtn = document.getElementById("addCriteriaBtn");
    const trialListDiv = document.getElementById("trialList");

    if (studyClinicalAreasSelect) {
        populateTrialDropdowns();

        studyClinicalAreasSelect.addEventListener("change", () => {
            const selectedAreas = Array.from(
                studyClinicalAreasSelect.selectedOptions,
            ).map((option) => option.value);
            updateSpecificAreasDropdownMultiple(
                selectedAreas,
                studySpecificClinicalAreasSelect,
                studySpecificAreaContainer,
            );
        });

        studyTreatmentSettingSelect.addEventListener("change", (e) => {
            console.log("Trial treatment setting changed to:", e.target.value);
            if (e.target.value === "Metastatico") {
                studyTreatmentLineContainer.classList.remove("hidden");
            } else {
                studyTreatmentLineContainer.classList.add("hidden");
            }
        });

        // Controlla lo stato iniziale al caricamento della pagina
        checkInitialTrialTreatmentSetting();

        addCriteriaBtn.addEventListener("click", () => addCriteriaRow());

        studyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(studyForm);
            const data = {
                title: formData.get("title"),
                subtitle: formData.get("subtitle"),
                clinical_areas: Array.from(
                    studyClinicalAreasSelect.selectedOptions,
                ).map((option) => option.value),
                specific_clinical_areas: Array.from(
                    studySpecificClinicalAreasSelect.selectedOptions,
                ).map((option) => option.value),
                treatment_setting: formData.get("treatment_setting"),
                min_treatment_line:
                    parseInt(formData.get("min_treatment_line"), 10) || null,
                max_treatment_line:
                    parseInt(formData.get("max_treatment_line"), 10) || null,
                criteria: getCriteriaData(),
            };

            const response = await fetch("/api/studies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log("Studio salvato con successo!");
                studyForm.reset();
                studySpecificAreaContainer.classList.add("hidden");
                studyTreatmentLineContainer.classList.add("hidden");
                criteriaListDiv.innerHTML = "";
                addCriteriaRow();
                fetchAndRenderTrials();
            } else {
                console.error("Errore durante il salvataggio dello studio.");
            }
        });

        fetchAndRenderTrials();
        addCriteriaRow();
    }

    // --- Funzioni comuni ---

    function populateTrialDropdowns() {
        const clinicalAreas = [
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
        const treatmentSettings = ["Metastatico", "Adiuvante", "Neo-adiuvante"];

        clinicalAreas.forEach((area) => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            studyClinicalAreasSelect.appendChild(option);
        });

        treatmentSettings.forEach((setting) => {
            const option = document.createElement("option");
            option.value = setting;
            option.textContent = setting;
            studyTreatmentSettingSelect.appendChild(option);
        });
    }

    function getCriteriaData() {
        const criteriaItems =
            criteriaListDiv.querySelectorAll(".criteria-item");
        return Array.from(criteriaItems)
            .map((item) => ({
                text: item.querySelector(".criteria-input").value,
                type: item.querySelector(".criteria-type").value,
            }))
            .filter((c) => c.text);
    }

    function addCriteriaRow(text = "", type = "inclusion") {
        const row = document.createElement("div");
        row.className = "criteria-item flex items-center space-x-2";
        row.innerHTML = `
            <input type="text" value="${text}" class="criteria-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-sage" placeholder="Descrizione del criterio">
            <select class="criteria-type p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-sage w-32">
                <option value="inclusion" ${type === "inclusion" ? "selected" : ""}>Inclusione</option>
                <option value="exclusion" ${type === "exclusion" ? "selected" : ""}>Esclusione</option>
            </select>
            <button type="button" class="remove-criteria-btn text-red-500 hover:text-red-700 transition-colors">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        criteriaListDiv.appendChild(row);
        row.querySelector(".remove-criteria-btn").addEventListener(
            "click",
            (e) => e.target.closest(".criteria-item").remove(),
        );
    }

    async function fetchAndRenderTrials() {
        const response = await fetch("/api/studies");
        const studies = await response.json();

        const studiesBySetting = studies.reduce((acc, study) => {
            const setting = study.treatment_setting;
            if (!acc[setting]) {
                acc[setting] = [];
            }
            acc[setting].push(study);
            return acc;
        }, {});

        trialListDiv.innerHTML = "";
        if (studies.length === 0) {
            trialListDiv.innerHTML =
                '<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Nessuno studio attivo trovato.</div>';
            return;
        }

        for (const setting in studiesBySetting) {
            trialListDiv.innerHTML += `
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-dark-gray mb-4">${setting}</h3>
                    <div class="space-y-4">
                        ${studiesBySetting[setting]
                            .map(
                                (study) => `
                            <div class="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200" data-study-id="${study.id}">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <h4 class="font-bold text-dark-gray">${study.title}</h4>
                                        <p class="text-sm text-gray-600">${study.subtitle}</p>
                                    </div>
                                    <button class="remove-study-btn text-red-500 hover:text-red-700 transition-colors" data-id="${study.id}" onclick="event.stopPropagation();">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        `,
                            )
                            .join("")}
                    </div>
                </div>
            `;
        }

        document
            .querySelectorAll("#trialList > div > div > div")
            .forEach((card) => {
                card.addEventListener("click", () =>
                    showStudyDetails(card.dataset.studyId, studies, "trial"),
                );
            });

        document.querySelectorAll(".remove-study-btn").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const studyId = btn.dataset.id;
                console.log(
                    `Tentativo di rimuovere lo studio con ID: ${studyId}`,
                );
                await fetch(`/api/studies/${studyId}`, { method: "DELETE" });
                fetchAndRenderTrials();
            });
        });
    }

    function showStudyDetails(studyId, studies, page) {
        const study = studies.find((s) => s.id === studyId);
        if (!study) return;

        modalTitle.textContent = study.title;
        modalSubtitle.textContent = study.subtitle;
        criteriaContainer.innerHTML = "";

        const isPatientPage = page === "patient";

        if (isPatientPage) {
            checkEligibilityBtn.classList.remove("hidden");
            eligibilityResultDiv.classList.add("hidden");

            study.criteria.forEach((criterion) => {
                const row = document.createElement("div");
                row.className =
                    "flex items-center justify-between p-2 bg-gray-100 rounded-lg";

                const isPreferredYes = criterion.type === "inclusion";

                row.innerHTML = `
                    <span class="text-sm text-dark-gray">${criterion.text}</span>
                    <div class="flex items-center space-x-2">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer criteria-toggle" data-preferred-type="${criterion.type}" ${isPreferredYes ? "" : "checked"}>
                            <div class="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-light-sage rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sage"></div>
                        </label>
                    </div>
                `;
                criteriaContainer.appendChild(row);
            });

            checkEligibilityBtn.onclick = () => {
                let isEligible = true;
                const toggles =
                    criteriaContainer.querySelectorAll(".criteria-toggle");

                toggles.forEach((toggle) => {
                    const preferredType = toggle.dataset.preferredType;
                    const isChecked = toggle.checked;

                    // Un toggle non selezionato significa "No"
                    // Un toggle selezionato significa "Sì"
                    // Per un criterio di inclusione, "Sì" è preferito (toggle.checked deve essere true)
                    // Per un criterio di esclusione, "No" è preferito (toggle.checked deve essere false)
                    if (
                        (preferredType === "inclusion" && !isChecked) ||
                        (preferredType === "exclusion" && isChecked)
                    ) {
                        isEligible = false;
                    }
                });

                if (isEligible) {
                    eligibilityResultDiv.textContent = `Il paziente è arruolabile per lo studio clinico: ${study.title}`;
                    eligibilityResultDiv.className =
                        "font-bold text-center mt-4 text-sage";
                } else {
                    eligibilityResultDiv.textContent = `Mi dispiace, non è arruolabile per lo studio clinico: ${study.title}`;
                    eligibilityResultDiv.className =
                        "font-bold text-center mt-4 text-red-600";
                }
                eligibilityResultDiv.classList.remove("hidden");
            };
        } else {
            // Pagina Trial: mostra i criteri in sola lettura
            if (checkEligibilityBtn)
                checkEligibilityBtn.classList.add("hidden");
            if (eligibilityResultDiv)
                eligibilityResultDiv.classList.add("hidden");

            study.criteria.forEach((criterion) => {
                const row = document.createElement("div");
                row.className =
                    "flex items-center justify-between p-2 bg-gray-100 rounded-lg";

                row.innerHTML = `
                    <span class="text-sm text-dark-gray">${criterion.text}</span>
                    <span class="text-xs font-semibold text-white px-2 py-1 rounded-full ${criterion.type === "inclusion" ? "bg-sage" : "bg-red-500"}">
                        ${criterion.type === "inclusion" ? "Inclusione" : "Esclusione"}
                    </span>
                `;
                criteriaContainer.appendChild(row);
            });
        }

        studyDetailModal.classList.remove("hidden");
    }

    // Funzione per aggiornare il dropdown delle aree specifiche (per pagina Paziente)
    function updateSpecificAreasDropdown(
        selectedArea,
        selectElement,
        container,
    ) {
        const specificAreas = specificClinicalAreasMap[selectedArea] || [];
        selectElement.innerHTML =
            '<option value="" selected>Qualsiasi</option>';
        if (specificAreas.length > 0) {
            specificAreas.forEach((area) => {
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

    // Funzione per aggiornare il dropdown delle aree specifiche (per pagina Trial)
    function updateSpecificAreasDropdownMultiple(
        selectedAreas,
        selectElement,
        container,
    ) {
        const allSpecificAreas = new Set();
        selectedAreas.forEach((area) => {
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

    // Funzione per controllare lo stato iniziale del setting di trattamento per la pagina Paziente
    function checkInitialPatientTreatmentSetting() {
        const patientTreatmentSettingSelect =
            document.getElementById("treatmentSetting");
        const treatmentLineContainer = document.getElementById(
            "treatmentLineContainer",
        );
        if (patientTreatmentSettingSelect && treatmentLineContainer) {
            if (patientTreatmentSettingSelect.value === "Metastatico") {
                treatmentLineContainer.classList.remove("hidden");
            } else {
                treatmentLineContainer.classList.add("hidden");
            }
        }
    }

    // Funzione per controllare lo stato iniziale del setting di trattamento per la pagina Trial
    function checkInitialTrialTreatmentSetting() {
        const studyTreatmentSettingSelect = document.getElementById(
            "studyTreatmentSetting",
        );
        const studyTreatmentLineContainer = document.getElementById(
            "studyTreatmentLineContainer",
        );
        if (studyTreatmentSettingSelect && studyTreatmentLineContainer) {
            if (studyTreatmentSettingSelect.value === "Metastatico") {
                studyTreatmentLineContainer.classList.remove("hidden");
            } else {
                studyTreatmentLineContainer.classList.add("hidden");
            }
        }
    }
});
