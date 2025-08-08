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
            "Alte vie Urinarie",
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
    const modalButtonsDiv = document.getElementById("modalButtons"); // Nuovo selettore

    // ----- Selettori per il Modale Password -----
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

    // Funzione per mostrare il modale della password
    function showPasswordModal(callback) {
        passwordCallback = callback;
        passwordInput.value = "";
        passwordError.classList.add("hidden");
        passwordModal.classList.remove("hidden");
    }

    // Listener per i bottoni del modale password
    cancelPasswordBtn.addEventListener("click", () =>
        passwordModal.classList.add("hidden"),
    );
    confirmPasswordBtn.addEventListener("click", () => {
        if (passwordInput.value === "TRIAL") {
            passwordModal.classList.add("hidden");
            if (passwordCallback) {
                passwordCallback();
            }
        } else {
            passwordError.classList.remove("hidden");
        }
    });

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

    // Gestione dei dropdown per la pagina Paziente
    if (clinicalAreaSelect) {
        clinicalAreaSelect.addEventListener("change", (e) => {
            updateSpecificAreasDropdown(
                e.target.value,
                specificClinicalAreasSelect,
                specificClinicalAreaContainer,
            );
        });
    }

    // Gestione dei dropdown per la pagina Trial
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

    // Gestione dei filtri per la pagina Trial
    const handleTrialFilterChange = () => {
        if (window.location.pathname === "/trials") {
            fetchAndRenderTrials();
        }
    };
    if (filterClinicalAreaSelect) {
        filterClinicalAreaSelect.addEventListener("change", () => {
            updateSpecificAreasDropdown(
                filterClinicalAreaSelect.value,
                filterSpecificClinicalAreasSelect,
                filterSpecificClinicalAreaContainer,
            );
            handleTrialFilterChange();
        });
    }
    if (filterSpecificClinicalAreasSelect) {
        filterSpecificClinicalAreasSelect.addEventListener(
            "change",
            handleTrialFilterChange,
        );
    }
    if (filterTreatmentSettingSelect) {
        filterTreatmentSettingSelect.addEventListener(
            "change",
            handleTrialFilterChange,
        );
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
                <button type="button" class="remove-criteria-btn text-red-400 hover:text-red-600 transition-colors">
                    <i class="fas fa-trash-alt"></i>
                </button>
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

    // Aggiungi un listener solo se il pulsante esiste (pagina Trial)
    if (addCriteriaBtn) {
        addCriteriaBtn.addEventListener("click", () => addCriteriaRow());
    }

    // Gestione del form per l'aggiunta di un nuovo studio (pagina Trial)
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

    // Helper per creare una card di studio
    function createStudyCardElement(study, page) {
        const card = document.createElement("div");
        card.className =
            "bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200";
        card.dataset.studyId = study.id;

        let cardContent = `
            <div>
                <h4 class="font-bold text-dark-gray">${study.title}</h4>
                <p class="text-sm text-gray-600">${study.subtitle}</p>
            </div>
        `;

        if (page === "trial") {
            cardContent = `
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-bold text-dark-gray">${study.title}</h4>
                        <p class="text-sm text-gray-600">${study.subtitle}</p>
                    </div>
                    <button class="remove-study-btn text-red-400 hover:text-red-600 transition-colors" data-id="${study.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }

        card.innerHTML = cardContent;

        // Aggiungo il listener per aprire il modale
        card.addEventListener("click", (event) => {
            // Evita di aprire il modale se il click è sul pulsante di rimozione
            if (page === "trial" && event.target.closest(".remove-study-btn")) {
                return;
            }
            showStudyDetails(study, page);
        });

        // Aggiungo il listener per il pulsante di rimozione, solo se esiste
        if (page === "trial") {
            const removeBtn = card.querySelector(".remove-study-btn");
            if (removeBtn) {
                removeBtn.addEventListener("click", async (e) => {
                    e.stopPropagation(); // Previene che l'evento raggiunga la card
                    const studyId =
                        e.target.closest(".remove-study-btn").dataset.id;
                    showPasswordModal(async () => {
                        await fetch(`/api/studies/${studyId}`, {
                            method: "DELETE",
                        });
                        fetchAndRenderTrials();
                    });
                });
            }
        }
        return card;
    }

    // Renderizza i risultati della ricerca (per la pagina Paziente)
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
            const card = createStudyCardElement(study, page);
            targetDiv.appendChild(card);
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

        if (!doctorTrialListDiv) return;
        doctorTrialListDiv.innerHTML = "";
        if (studies.length === 0) {
            doctorTrialListDiv.innerHTML =
                '<div class="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">Nessuno studio attivo trovato.</div>';
            return;
        }

        // Raggruppa gli studi per setting di trattamento
        const studiesBySetting = studies.reduce((acc, study) => {
            const setting = study.treatment_setting;
            acc[setting] = acc[setting] || [];
            acc[setting].push(study);
            return acc;
        }, {});

        // Renderizza gli studi raggruppati
        for (const setting in studiesBySetting) {
            const settingSection = document.createElement("div");
            settingSection.className = "mb-6";
            settingSection.innerHTML = `<h3 class="text-xl font-bold text-dark-gray mb-4">${setting}</h3>`;

            const cardsContainer = document.createElement("div");
            cardsContainer.className = "space-y-4";

            studiesBySetting[setting].forEach((study) => {
                const card = createStudyCardElement(study, "trial");
                cardsContainer.appendChild(card);
            });

            settingSection.appendChild(cardsContainer);
            doctorTrialListDiv.appendChild(settingSection);
        }
    }

    // Renderizza i criteri nel modale
    function renderCriteriaInModal(study, isPatientPage) {
        criteriaContainer.innerHTML = "";

        // Ordina i criteri per inclusione ed esclusione
        const inclusionCriteria = study.criteria.filter(
            (c) => c.type === "inclusion",
        );
        const exclusionCriteria = study.criteria.filter(
            (c) => c.type === "exclusion",
        );

        // Aggiungi un'intestazione per i criteri di inclusione se ce ne sono
        if (inclusionCriteria.length > 0) {
            const heading = document.createElement("h5");
            heading.className = "text-md font-bold mt-4 mb-2 text-dark-gray";
            heading.textContent = "Criteri di Inclusione";
            criteriaContainer.appendChild(heading);
        }

        // Renderizza i criteri di inclusione
        inclusionCriteria.forEach((criterion, index) => {
            const row = document.createElement("div");
            row.className = "flex items-center justify-between p-2 rounded-lg";
            let labelText;
            if (isPatientPage) {
                labelText = `
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-semibold text-gray-500 w-8 text-right">No</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer criteria-toggle" data-index="${index}" data-preferred-type="${criterion.type}" checked>
                            <div class="w-9 h-5 bg-sage peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sage rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                        <span class="text-xs font-semibold text-gray-500 w-8">Sì</span>
                    </div>
                `;
            } else {
                labelText = `
                    <span class="text-xs font-semibold text-white px-2 py-1 rounded-full bg-sage">
                        Inclusione
                    </span>
                `;
            }
            row.innerHTML = `<span class="text-sm text-dark-gray">${criterion.text}</span>${labelText}`;
            criteriaContainer.appendChild(row);
        });

        // Aggiungi un'intestazione per i criteri di esclusione se ce ne sono
        if (exclusionCriteria.length > 0) {
            const heading = document.createElement("h5");
            heading.className = "text-md font-bold mt-4 mb-2 text-dark-gray";
            heading.textContent = "Criteri di Esclusione";
            criteriaContainer.appendChild(heading);
        }

        // Renderizza i criteri di esclusione
        exclusionCriteria.forEach((criterion, index) => {
            const row = document.createElement("div");
            row.className = "flex items-center justify-between p-2 rounded-lg";
            let labelText;
            if (isPatientPage) {
                labelText = `
                    <div class="flex items-center space-x-2">
                        <span class="text-xs font-semibold text-gray-500 w-8 text-right">No</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="sr-only peer criteria-toggle" data-index="${index}" data-preferred-type="${criterion.type}">
                            <div class="w-9 h-5 bg-red-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-sage rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                        <span class="text-xs font-semibold text-gray-500 w-8">Sì</span>
                    </div>
                `;
            } else {
                labelText = `
                    <span class="text-xs font-semibold text-white px-2 py-1 rounded-full bg-red-400">
                        Esclusione
                    </span>
                `;
            }
            row.innerHTML = `<span class="text-sm text-dark-gray">${criterion.text}</span>${labelText}`;
            criteriaContainer.appendChild(row);
        });
    }

    // Mostra i dettagli di uno studio in un modale
    function showStudyDetails(study, page) {
        if (!studyDetailModal || !study) {
            return;
        }

        modalTitle.textContent = study.title;
        modalSubtitle.textContent = study.subtitle;

        // Aggiunto controllo per evitare l'errore se l'elemento non esiste
        if (eligibilityResultDiv) {
            eligibilityResultDiv.classList.add("hidden");
            eligibilityResultDiv.innerHTML = "";
        }

        const isPatientPage = page === "patient";

        // Gestisce la visibilità dei pulsanti nel modale
        if (checkEligibilityBtn) {
            checkEligibilityBtn.style.display = isPatientPage
                ? "block"
                : "none";
        }

        // Popola i dettagli dello studio per entrambe le pagine
        if (modalClinicalAreas)
            modalClinicalAreas.textContent = study.clinical_areas.join(", ");
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

        // Renderizza i criteri nel modale
        renderCriteriaInModal(study, isPatientPage);

        // Gestione del pulsante di eleggibilità per la pagina Paziente
        if (isPatientPage && checkEligibilityBtn) {
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

                if (eligibilityResultDiv) {
                    eligibilityResultDiv.classList.remove("hidden");
                    if (isEligible) {
                        eligibilityResultDiv.innerHTML = `
                            <div class="p-3 rounded-lg bg-sage">
                                <p class="font-bold text-center text-white">Paziente eleggibile per lo studio: ${study.title}</p>
                            </div>
                        `;
                    } else {
                        eligibilityResultDiv.innerHTML = `
                            <div class="p-3 rounded-lg bg-red-400">
                                <p class="font-bold text-center text-white">Paziente NON eleggibile per lo studio: ${study.title}</p>
                            </div>
                        `;
                    }
                }
            };
        }

        // Rende il modale visibile
        studyDetailModal.classList.remove("hidden");
        studyDetailModal.style.display = "flex";
    }

    // Aggiungo il listener per il pulsante "Chiudi" del modale, che ora è sempre presente
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            studyDetailModal.classList.add("hidden");
            studyDetailModal.style.display = "none";
        });
    }

    // Inizializzazione: se siamo sulla pagina dei trial, carichiamo gli studi
    if (window.location.pathname === "/trials") {
        fetchAndRenderTrials();
        addCriteriaRow();
    }
});
