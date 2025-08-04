document.addEventListener("DOMContentLoaded", () => {
    // Definizione dei selettori DOM
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
    const treatmentLineInput = document.getElementById("treatmentLine");

    const trialListDiv = document.getElementById("trialList");
    const studyDetailModal = document.getElementById("studyDetailModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const criteriaContainer = document.getElementById("criteriaContainer");
    const checkEligibilityBtn = document.getElementById("checkEligibilityBtn");
    const eligibilityResultDiv = document.getElementById(
        "eligibilityResultDiv",
    );
    const closeModalBtn = document.getElementById("closeModalBtn");

    // Mappa delle aree cliniche specifiche
    const specificClinicalAreasMap = {
        Oncologia: ["Melanoma", "Carcinoma polmonare", "Leucemia"],
        Cardiologia: ["Aritmie", "Scompenso cardiaco"],
        Immunologia: ["Artrite reumatoide", "Lupus"],
    };

    // Aggiungi un nuovo criterio al modulo
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

    // Aggiungi un listener solo se il pulsante esiste (pagina Trial)
    if (addCriteriaBtn) {
        addCriteriaBtn.addEventListener("click", () => addCriteriaRow());
    }

    // Gestione del menu a tendina dell'area clinica per la pagina Paziente
    if (clinicalAreaSelect) {
        clinicalAreaSelect.addEventListener("change", (e) => {
            updateSpecificAreasDropdown(
                e.target.value,
                specificClinicalAreasSelect,
                specificClinicalAreaContainer,
            );
        });
    }

    // Gestione del menu a tendina dell'area clinica per la pagina Trial
    if (studyClinicalAreasSelect) {
        studyClinicalAreasSelect.addEventListener("change", (e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map(
                (option) => option.value,
            );
            updateSpecificAreasDropdownMultiple(
                selectedOptions,
                studySpecificClinicalAreasSelect,
                studySpecificClinicalAreaContainer,
            );
        });
    }

    // Gestione del setting di trattamento per la pagina Paziente
    if (treatmentSettingSelect) {
        treatmentSettingSelect.addEventListener("change", (e) => {
            if (e.target.value === "Metastatico") {
                treatmentLineContainer.classList.remove("hidden");
            } else {
                treatmentLineContainer.classList.add("hidden");
            }
        });
        checkInitialPatientTreatmentSetting();
    }

    // Gestione del setting di trattamento per la pagina Trial
    if (studyTreatmentSettingSelect) {
        studyTreatmentSettingSelect.addEventListener("change", (e) => {
            if (e.target.value === "Metastatico") {
                studyTreatmentLineContainer.classList.remove("hidden");
            } else {
                studyTreatmentLineContainer.classList.add("hidden");
            }
        });
        checkInitialTrialTreatmentSetting();
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
        if (treatmentSettingSelect && treatmentLineContainer) {
            if (treatmentSettingSelect.value === "Metastatico") {
                treatmentLineContainer.classList.remove("hidden");
            } else {
                treatmentLineContainer.classList.add("hidden");
            }
        }
    }

    // Funzione per controllare lo stato iniziale del setting di trattamento per la pagina Trial
    function checkInitialTrialTreatmentSetting() {
        if (studyTreatmentSettingSelect && studyTreatmentLineContainer) {
            if (studyTreatmentSettingSelect.value === "Metastatico") {
                studyTreatmentLineContainer.classList.remove("hidden");
            } else {
                studyTreatmentLineContainer.classList.add("hidden");
            }
        }
    }

    // Gestione del form per l'aggiunta di un nuovo studio (pagina Trial)
    if (studyForm) {
        studyForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const criteriaItems = document.querySelectorAll(".criteria-item");
            const criteria = Array.from(criteriaItems).map((item) => {
                return {
                    text: item.querySelector(".criteria-input").value,
                    type: item.querySelector(".criteria-type").value,
                };
            });

            const selectedClinicalAreas = Array.from(
                studyClinicalAreasSelect.selectedOptions,
            ).map((option) => option.value);
            const selectedSpecificClinicalAreas = Array.from(
                studySpecificClinicalAreasSelect.selectedOptions,
            ).map((option) => option.value);

            const newStudy = {
                title: studyTitleInput.value,
                subtitle: studySubtitleInput.value,
                clinical_areas: selectedClinicalAreas,
                specific_clinical_areas: selectedSpecificClinicalAreas,
                treatment_setting: studyTreatmentSettingSelect.value,
                min_treatment_line: minTreatmentLineInput.value
                    ? parseInt(minTreatmentLineInput.value)
                    : null,
                max_treatment_line: maxTreatmentLineInput.value
                    ? parseInt(maxTreatmentLineInput.value)
                    : null,
                criteria: criteria,
            };

            await fetch("/api/studies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStudy),
            });

            studyForm.reset();
            criteriaListDiv.innerHTML = "";
            addCriteriaRow();
            fetchAndRenderTrials();
        });
    }

    // Gestione del form di ricerca per il paziente (pagina Paziente)
    if (searchForm) {
        searchForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const patientData = {
                age: parseInt(document.getElementById("age").value),
                gender: document.getElementById("gender").value,
                clinicalAreas: document.getElementById("clinicalArea").value,
                specificClinicalAreas: document.getElementById(
                    "specificClinicalAreas",
                ).value,
                treatmentSetting:
                    document.getElementById("treatmentSetting").value,
                treatmentLine: document.getElementById("treatmentLine").value
                    ? parseInt(document.getElementById("treatmentLine").value)
                    : null,
            };

            const response = await fetch("/api/studies");
            const studies = await response.json();

            const filteredStudies = studies.filter((study) => {
                const clinicalAreaMatch = study.clinical_areas.includes(
                    patientData.clinicalAreas,
                );
                const specificClinicalAreaMatch =
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
                    const minLine = study.min_treatment_line || 1; // Default a 1 se non specificato
                    const maxLine = study.max_treatment_line || 10; // Default a 10 se non specificato
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

            renderSearchResults(filteredStudies);
        });
    }

    // Renderizza i risultati della ricerca
    function renderSearchResults(studies) {
        if (!trialListDiv) return;
        trialListDiv.innerHTML = "";
        if (studies.length === 0) {
            trialListDiv.innerHTML =
                '<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Nessuno studio compatibile trovato.</div>';
            return;
        }

        studies.forEach((study) => {
            const card = document.createElement("div");
            card.className =
                "bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200";
            card.dataset.studyId = study.id;
            card.innerHTML = `
                 <div>
                     <h4 class="font-bold text-dark-gray">${study.title}</h4>
                     <p class="text-sm text-gray-600">${study.subtitle}</p>
                 </div>
             `;
            trialListDiv.appendChild(card);
            card.addEventListener("click", () =>
                showStudyDetails(card.dataset.studyId, studies, "patient"),
            );
        });
    }

    // Fetch e renderizza i trial (per la pagina Trial)
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

        if (trialListDiv) {
            trialListDiv.innerHTML = "";
            if (studies.length === 0) {
                trialListDiv.innerHTML =
                    '<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Nessuno studio attivo trovato.</div>';
                return;
            }

            for (const setting in studiesBySetting) {
                const studiesInSetting = studiesBySetting[setting];
                trialListDiv.innerHTML += `
                    <div class="mb-6">
                        <h3 class="text-xl font-bold text-dark-gray mb-4">${setting}</h3>
                        <div class="space-y-4">
                            ${studiesInSetting
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

            document.querySelectorAll(".remove-study-btn").forEach((btn) => {
                btn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const studyId = btn.dataset.id;
                    await fetch(`/api/studies/${studyId}`, {
                        method: "DELETE",
                    });
                    fetchAndRenderTrials();
                });
            });

            document
                .querySelectorAll(
                    "#trialListSection #trialList > div > div > div",
                )
                .forEach((card) => {
                    card.addEventListener("click", () =>
                        showStudyDetails(
                            card.dataset.studyId,
                            studies,
                            "trial",
                        ),
                    );
                });
        }
    }

    // Mostra i dettagli di uno studio in un modale
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

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            studyDetailModal.classList.add("hidden");
        });
    }

    // Inizializzazione: se siamo sulla pagina dei trial, carichiamo gli studi
    if (window.location.pathname === "/trials") {
        fetchAndRenderTrials();
        addCriteriaRow();
    }
});
