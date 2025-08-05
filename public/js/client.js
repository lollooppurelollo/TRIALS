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
    const searchResultsDiv = document.getElementById("searchResults");
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
    const trialListSection = document.getElementById("trialListSection");
    const doctorTrialListDiv = document.querySelector(
        "#trialListSection #trialList",
    );

    // Filtri per la pagina Trial
    const trialFilterForm = document.getElementById("trialFilterForm");
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

    // Funzione per aggiornare il dropdown delle aree specifiche
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
            updateSpecificAreasDropdown(
                selectedOptions,
                studySpecificClinicalAreasSelect,
                studySpecificClinicalAreaContainer,
            );
        });
    }

    // Gestione del filtro area clinica per la pagina Trial
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
        filterSpecificClinicalAreasSelect.addEventListener("change", () => {
            fetchAndRenderTrials();
        });
    }

    if (filterTreatmentSettingSelect) {
        filterTreatmentSettingSelect.addEventListener("change", () => {
            fetchAndRenderTrials();
        });
    }

    // Gestione del setting di trattamento per la pagina Paziente
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

    // Gestione del setting di trattamento per la pagina Trial
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

    // Aggiungi un nuovo criterio al modulo (pagina Trial)
    function addCriteriaRow(text = "", type = "inclusion") {
        const row = document.createElement("div");
        row.className = "criteria-item flex items-center space-x-2";
        row.innerHTML = `
            <input type="text" value="${text}" class="criteria-input w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-sage" placeholder="Descrizione del criterio" required>
            <div class="flex items-center space-x-2">
                <span class="text-xs font-semibold text-gray-500 w-16 text-right">Inclusione</span>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer criteria-toggle" data-preferred-type="inclusion" ${type === "exclusion" ? "checked" : ""}>
                    <div class="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-light-sage rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sage"></div>
                </label>
                <span class="text-xs font-semibold text-gray-500 w-16">Esclusione</span>
            </div>
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

    // Gestione del form per l'aggiunta di un nuovo studio (pagina Trial)
    if (studyForm) {
        studyForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const criteriaItems = document.querySelectorAll(".criteria-item");
            const criteria = Array.from(criteriaItems).map((item) => {
                return {
                    text: item.querySelector(".criteria-input").value,
                    type: item.querySelector(".criteria-toggle").checked
                        ? "exclusion"
                        : "inclusion",
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
                min_treatment_line:
                    studyTreatmentSettingSelect.value === "Metastatico"
                        ? parseInt(minTreatmentLineInput.value)
                        : null,
                max_treatment_line:
                    studyTreatmentSettingSelect.value === "Metastatico"
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
            studySpecificClinicalAreaContainer.classList.add("hidden");
            studyTreatmentLineContainer.classList.add("hidden");
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

    // Renderizza i risultati della ricerca
    function renderSearchResults(studies, page) {
        const targetDiv =
            page === "patient" ? patientTrialListDiv : doctorTrialListDiv;
        if (!targetDiv) return;
        targetDiv.innerHTML = "";
        if (studies.length === 0) {
            targetDiv.innerHTML =
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
            targetDiv.appendChild(card);
            card.addEventListener("click", () => showStudyDetails(study, page));
        });
    }

    // Fetch e renderizza i trial (per la pagina Trial)
    async function fetchAndRenderTrials() {
        const response = await fetch("/api/studies");
        let studies = await response.json();

        // Applicazione dei filtri
        const filterClinicalArea = filterClinicalAreaSelect?.value || "";
        const filterSpecificClinicalArea =
            filterSpecificClinicalAreasSelect?.value || "";
        const filterTreatmentSetting =
            filterTreatmentSettingSelect?.value || "";

        if (filterClinicalArea !== "") {
            studies = studies.filter((study) =>
                study.clinical_areas.includes(filterClinicalArea),
            );
        }

        if (filterSpecificClinicalArea !== "") {
            studies = studies.filter((study) =>
                study.specific_clinical_areas.includes(
                    filterSpecificClinicalArea,
                ),
            );
        }

        if (filterTreatmentSetting !== "") {
            studies = studies.filter(
                (study) => study.treatment_setting === filterTreatmentSetting,
            );
        }

        if (doctorTrialListDiv) {
            doctorTrialListDiv.innerHTML = "";
            if (studies.length === 0) {
                doctorTrialListDiv.innerHTML =
                    '<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Nessuno studio attivo trovato.</div>';
                return;
            }

            const studiesBySetting = studies.reduce((acc, study) => {
                const setting = study.treatment_setting;
                if (!acc[setting]) {
                    acc[setting] = [];
                }
                acc[setting].push(study);
                return acc;
            }, {});

            for (const setting in studiesBySetting) {
                const settingSection = document.createElement("div");
                settingSection.className = "mb-6";
                settingSection.innerHTML = `<h3 class="text-xl font-bold text-dark-gray mb-4">${setting}</h3>`;

                const cardsContainer = document.createElement("div");
                cardsContainer.className = "space-y-4";

                const studiesInSetting = studiesBySetting[setting];
                studiesInSetting.forEach((study) => {
                    const card = document.createElement("div");
                    card.className =
                        "bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200";
                    card.dataset.studyId = study.id;
                    card.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <h4 class="font-bold text-dark-gray">${study.title}</h4>
                                <p class="text-sm text-gray-600">${study.subtitle}</p>
                            </div>
                            <button class="remove-study-btn text-red-500 hover:text-red-700 transition-colors" data-id="${study.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    // Attacca il listener per mostrare il modale a ogni card
                    card.addEventListener("click", () =>
                        showStudyDetails(study, "trial"),
                    );

                    // Assicurati che il bottone di rimozione non attivi il click sulla card
                    card.querySelector(".remove-study-btn").addEventListener(
                        "click",
                        async (e) => {
                            e.stopPropagation();
                            await fetch(`/api/studies/${study.id}`, {
                                method: "DELETE",
                            });
                            fetchAndRenderTrials();
                        },
                    );

                    cardsContainer.appendChild(card);
                });

                settingSection.appendChild(cardsContainer);
                doctorTrialListDiv.appendChild(settingSection);
            }
        }
    }

    // Mostra i dettagli di uno studio in un modale
    function showStudyDetails(study, page) {
        console.log("showStudyDetails chiamata per lo studio:", study);

        if (!studyDetailModal) {
            console.error(
                "Errore: Elemento modale non trovato. Controlla che l'ID 'studyDetailModal' sia corretto nell'HTML.",
            );
            return;
        }

        if (!study) {
            console.error("Errore: L'oggetto 'study' è mancante o nullo.");
            return;
        }

        console.log("Elemento modale trovato:", studyDetailModal);

        modalTitle.textContent = study.title;
        modalSubtitle.textContent = study.subtitle;
        criteriaContainer.innerHTML = "";
        eligibilityResultDiv.classList.add("hidden");
        eligibilityResultDiv.textContent = "";

        const isPatientPage = page === "patient";
        checkEligibilityBtn.style.display = isPatientPage ? "block" : "none";

        // Popola i dettagli dello studio solo sulla pagina "trials"
        if (page === "trial") {
            if (modalClinicalAreas)
                modalClinicalAreas.textContent =
                    study.clinical_areas.join(", ");
            if (modalSpecificClinicalAreas)
                modalSpecificClinicalAreas.textContent =
                    study.specific_clinical_areas.join(", ");
            if (modalTreatmentSetting)
                modalTreatmentSetting.textContent = study.treatment_setting;

            if (modalTreatmentLineContainer) {
                if (study.treatment_setting === "Metastatico") {
                    modalTreatmentLineContainer.classList.remove("hidden");
                    if (modalTreatmentLine)
                        modalTreatmentLine.textContent = `${study.min_treatment_line || "N/A"} - ${study.max_treatment_line || "N/A"}`;
                } else {
                    modalTreatmentLineContainer.classList.add("hidden");
                }
            }
        }

        study.criteria.forEach((criterion, index) => {
            const row = document.createElement("div");
            row.className = "flex items-center justify-between p-2 rounded-lg";
            const isPreselectedYes = criterion.type === "inclusion";

            let labelText;
            if (isPatientPage) {
                labelText = `
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-semibold text-gray-500 w-8 text-right">No</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer criteria-toggle" data-index="${index}" data-preferred-type="${criterion.type}" ${isPreselectedYes ? "checked" : ""}>
                            <div class="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-light-sage rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sage"></div>
                        </label>
                        <span class="text-xs font-semibold text-gray-500 w-8">Sì</span>
                            </div>
                        `;
            } else {
                labelText = `
                    <span class="text-xs font-semibold text-white px-2 py-1 rounded-full ${isPreselectedYes ? "bg-sage" : "bg-red-500"}">
                        ${isPreselectedYes ? "Inclusione" : "Esclusione"}
                    </span>
                `;
            }

            row.innerHTML = `
                <span class="text-sm text-dark-gray">${criterion.text}</span>
                ${labelText}
            `;
            criteriaContainer.appendChild(row);
        });

        if (isPatientPage) {
            checkEligibilityBtn.onclick = () => {
                let isEligible = true;
                const toggles =
                    criteriaContainer.querySelectorAll(".criteria-toggle");

                toggles.forEach((toggle) => {
                    const preferredType = toggle.dataset.preferredType;
                    const isChecked = toggle.checked;

                    // Condizione per non idoneità
                    if (
                        (preferredType === "inclusion" && !isChecked) ||
                        (preferredType === "exclusion" && isChecked)
                    ) {
                        isEligible = false;
                    }
                });

                eligibilityResultDiv.classList.remove("hidden");
                if (isEligible) {
                    eligibilityResultDiv.textContent = `Paziente eleggibile per lo studio: ${study.title}`;
                    eligibilityResultDiv.className =
                        "font-bold text-center mt-4 text-dark-gray bg-sage p-3 rounded-lg";
                } else {
                    eligibilityResultDiv.textContent = `Paziente non eleggibile per lo studio: ${study.title}`;
                    eligibilityResultDiv.className =
                        "font-bold text-center mt-4 text-dark-gray bg-red-300 p-3 rounded-lg";
                }
            };
        }

        // Rimuove la classe 'hidden' e rende il modale visibile
        studyDetailModal.classList.remove("hidden");
        // Imposta esplicitamente lo stile per assicurarsi che il modale venga visualizzato
        studyDetailModal.style.display = "flex";
        console.log("Modale reso visibile per lo studio:", study.title);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            studyDetailModal.classList.add("hidden");
            // Imposta esplicitamente lo stile per assicurarsi che il modale venga nascosto
            studyDetailModal.style.display = "none";
        });
    }

    // Inizializzazione: se siamo sulla pagina dei trial, carichiamo gli studi
    if (window.location.pathname === "/trials") {
        fetchAndRenderTrials();
        // Aggiungi un criterio iniziale al caricamento della pagina per la pagina Trial
        addCriteriaRow();
    }
});
