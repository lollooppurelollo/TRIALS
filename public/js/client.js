document.addEventListener("DOMContentLoaded", () => {
    // Definizione delle aree cliniche per la logica di dipendenza
    const clinicalAreaMappings = {
        Mammella: ["ER+", "HER2+", "Triplo Negativo"],
        Polmone: ["SCLC", "NSCLC"],
        "Gastro-Intestinale": [
            "Colon-Retto",
            "Esofago-Stomaco",
            "Pancreas",
            "Fegato",
        ],
        Ginecologico: ["Ovaio", "Endometrio", "Cervice"],
        "Prostata e Vie Urinarie": ["Prostata", "Vescica", "Rene"],
        "Melanoma e Cute": ["Melanoma"],
        "Testa-Collo": ["Testa-Collo"],
        Altro: ["Generico"],
    };

    // Funzioni helper
    const showElement = (element) => element.classList.remove("hidden");
    const hideElement = (element) => element.classList.add("hidden");
    const getSelectedOptions = (selectElement) =>
        Array.from(selectElement.selectedOptions).map((option) => option.value);

    // Gestione degli studi (per la pagina del medico)
    const setupStudyForm = () => {
        const studyForm = document.getElementById("studyForm");
        const studyClinicalAreasSelect =
            document.getElementById("studyClinicalAreas");
        const studySpecificAreaContainer = document.getElementById(
            "studySpecificClinicalAreaContainer",
        );
        const studySpecificAreaSelect = document.getElementById(
            "studySpecificClinicalAreas",
        );
        const studyTreatmentSettingSelect = document.getElementById(
            "studyTreatmentSetting",
        );
        const studyTreatmentLineContainer = document.getElementById(
            "studyTreatmentLineContainer",
        );
        const addCriteriaBtn = document.getElementById("addCriteriaBtn");
        const criteriaList = document.getElementById("criteriaList");

        let criteriaCounter = 0;

        const populateSpecificAreas = (selectedAreas) => {
            studySpecificAreaSelect.innerHTML = "";
            let hasSpecificAreas = false;
            selectedAreas.forEach((area) => {
                if (
                    clinicalAreaMappings[area] &&
                    clinicalAreaMappings[area].length > 0
                ) {
                    hasSpecificAreas = true;
                    clinicalAreaMappings[area].forEach((specificArea) => {
                        const option = document.createElement("option");
                        option.value = specificArea;
                        option.textContent = specificArea;
                        studySpecificAreaSelect.appendChild(option);
                    });
                }
            });

            if (hasSpecificAreas) {
                showElement(studySpecificAreaContainer);
            } else {
                hideElement(studySpecificAreaContainer);
            }
        };

        const toggleTreatmentLine = (setting) => {
            if (setting === "Metastatico") {
                showElement(studyTreatmentLineContainer);
            } else {
                hideElement(studyTreatmentLineContainer);
            }
        };

        const addCriteriaItem = () => {
            criteriaCounter++;
            const newCriteria = document.createElement("div");
            newCriteria.classList.add(
                "criteria-item",
                "flex",
                "items-center",
                "space-x-2",
            );
            newCriteria.innerHTML = `
                <input type="text" name="criteriaText-${criteriaCounter}" placeholder="Descrizione del criterio" class="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-sage" required>
                <div class="relative inline-block w-16 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="criteriaType-${criteriaCounter}" id="criteriaType-${criteriaCounter}" class="criteria-type-toggle criteria-toggle absolute block w-8 h-8 rounded-full bg-white border-4 appearance-none cursor-pointer peer transition-transform duration-200 ease-in-out">
                    <label for="criteriaType-${criteriaCounter}" class="block overflow-hidden h-8 rounded-full bg-red-500 peer-checked:bg-sage cursor-pointer"></label>
                </div>
                <div class="text-xs font-bold text-gray-500">
                    <span class="type-text-label type-label-red">Esclusione</span>
                    <span class="type-text-label type-label-green hidden">Inclusione</span>
                </div>
                <button type="button" class="remove-criteria-btn text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            criteriaList.appendChild(newCriteria);

            // Aggiungi un event listener per il toggle
            const toggle = newCriteria.querySelector(
                `#criteriaType-${criteriaCounter}`,
            );
            toggle.addEventListener("change", (e) => {
                const labelRed = newCriteria.querySelector(".type-label-red");
                const labelGreen =
                    newCriteria.querySelector(".type-label-green");
                if (e.target.checked) {
                    showElement(labelGreen);
                    hideElement(labelRed);
                } else {
                    showElement(labelRed);
                    hideElement(labelGreen);
                }
            });

            // Aggiungi un event listener per la rimozione
            newCriteria
                .querySelector(".remove-criteria-btn")
                .addEventListener("click", () => {
                    newCriteria.remove();
                });
        };

        if (studyForm) {
            studyClinicalAreasSelect.addEventListener("change", () => {
                const selected = getSelectedOptions(studyClinicalAreasSelect);
                populateSpecificAreas(selected);
            });

            studyTreatmentSettingSelect.addEventListener("change", (e) => {
                toggleTreatmentLine(e.target.value);
            });

            addCriteriaBtn.addEventListener("click", addCriteriaItem);

            studyForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const title = document.getElementById("studyTitle").value;
                const subtitle = document.getElementById("studySubtitle").value;
                const clinical_areas = getSelectedOptions(
                    studyClinicalAreasSelect,
                );
                const specific_clinical_areas = getSelectedOptions(
                    studySpecificAreaSelect,
                );
                const treatment_setting = studyTreatmentSettingSelect.value;
                const min_treatment_line =
                    document.getElementById("minTreatmentLine").value || null;
                const max_treatment_line =
                    document.getElementById("maxTreatmentLine").value || null;
                const criteria = [];
                document.querySelectorAll(".criteria-item").forEach((item) => {
                    const text = item.querySelector('input[type="text"]').value;
                    const type = item.querySelector('input[type="checkbox"]')
                        .checked
                        ? "inclusion"
                        : "exclusion";
                    if (text) {
                        criteria.push({ text, type });
                    }
                });

                try {
                    const response = await fetch("/api/studies", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title,
                            subtitle,
                            clinical_areas,
                            specific_clinical_areas,
                            treatment_setting,
                            min_treatment_line,
                            max_treatment_line,
                            criteria,
                        }),
                    });
                    if (response.ok) {
                        alert("Studio salvato con successo!");
                        studyForm.reset();
                        populateSpecificAreas([]); // Resetta l'area specifica
                        hideElement(studySpecificAreaContainer);
                        hideElement(studyTreatmentLineContainer);
                        criteriaList.innerHTML = "";
                        loadStudies(); // Ricarica la lista degli studi
                    } else {
                        const errorData = await response.json();
                        console.error(
                            "Errore durante il salvataggio:",
                            errorData,
                        );
                        alert("Errore durante il salvataggio dello studio.");
                    }
                } catch (error) {
                    console.error("Errore di rete:", error);
                    alert(
                        "Errore di rete durante il salvataggio dello studio.",
                    );
                }
            });

            // Logica di caricamento e visualizzazione
            const trialListSection =
                document.getElementById("trialListSection");
            const trialFilterForm = document.getElementById("trialFilterForm");
            const filterClinicalArea =
                document.getElementById("filterClinicalArea");
            const filterSpecificClinicalAreaContainer = document.getElementById(
                "filterSpecificClinicalAreaContainer",
            );
            const filterSpecificClinicalAreas = document.getElementById(
                "filterSpecificClinicalAreas",
            );
            const filterTreatmentSetting = document.getElementById(
                "filterTreatmentSetting",
            );
            const trialListDiv = trialListSection
                ? trialListSection.querySelector("#trialList")
                : null;
            let allStudies = [];

            const renderStudies = (studies) => {
                if (!trialListDiv) return;
                trialListDiv.innerHTML = "";
                if (studies.length === 0) {
                    trialListDiv.innerHTML =
                        '<p class="text-gray-500">Nessuno studio trovato.</p>';
                    return;
                }
                studies.forEach((study) => {
                    const studyCard = document.createElement("div");
                    studyCard.classList.add(
                        "bg-white",
                        "p-6",
                        "rounded-xl",
                        "shadow-md",
                        "border",
                        "border-gray-200",
                    );
                    studyCard.innerHTML = `
                        <h3 class="text-lg font-bold text-dark-sage">${study.title}</h3>
                        <p class="text-sm text-gray-500">${study.subtitle}</p>
                        <div class="mt-4 flex flex-wrap gap-2">
                            ${study.clinical_areas.map((area) => `<span class="bg-light-sage text-dark-sage text-xs font-medium px-2.5 py-0.5 rounded-full">${area}</span>`).join("")}
                        </div>
                        <div class="mt-4 flex justify-between items-center">
                            <button class="view-details-btn bg-gray-200 text-dark-gray text-sm px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors" data-id="${study.id}">
                                Dettagli
                            </button>
                            <button class="delete-study-btn text-red-500 hover:text-red-700 transition-colors" data-id="${study.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    trialListDiv.appendChild(studyCard);
                });
            };

            const loadStudies = async () => {
                try {
                    const response = await fetch("/api/studies");
                    if (response.ok) {
                        allStudies = await response.json();
                        renderStudies(allStudies);
                    } else {
                        throw new Error("Errore nel caricamento degli studi");
                    }
                } catch (error) {
                    console.error(error);
                    if (trialListDiv) {
                        trialListDiv.innerHTML = `<p class="text-red-500">Errore: ${error.message}</p>`;
                    }
                }
            };

            const filterAndRenderStudies = () => {
                const selectedClinicalArea = filterClinicalArea.value;
                const selectedSpecificArea = filterSpecificClinicalAreas.value;
                const selectedTreatmentSetting = filterTreatmentSetting.value;

                const filteredStudies = allStudies.filter((study) => {
                    const clinicalAreaMatch =
                        !selectedClinicalArea ||
                        study.clinical_areas.includes(selectedClinicalArea);
                    const specificAreaMatch =
                        !selectedSpecificArea ||
                        (study.specific_clinical_areas &&
                            study.specific_clinical_areas.includes(
                                selectedSpecificArea,
                            ));
                    const treatmentSettingMatch =
                        !selectedTreatmentSetting ||
                        study.treatment_setting === selectedTreatmentSetting;
                    return (
                        clinicalAreaMatch &&
                        specificAreaMatch &&
                        treatmentSettingMatch
                    );
                });
                renderStudies(filteredStudies);
            };

            if (trialFilterForm) {
                filterClinicalArea.addEventListener("change", (e) => {
                    const selectedArea = e.target.value;
                    const specificAreas = clinicalAreaMappings[selectedArea];
                    filterSpecificClinicalAreas.innerHTML =
                        '<option value="">Tutte le Specifiche</option>';
                    if (specificAreas && specificAreas.length > 0) {
                        showElement(filterSpecificClinicalAreaContainer);
                        specificAreas.forEach((area) => {
                            const option = document.createElement("option");
                            option.value = area;
                            option.textContent = area;
                            filterSpecificClinicalAreas.appendChild(option);
                        });
                    } else {
                        hideElement(filterSpecificClinicalAreaContainer);
                    }
                    filterAndRenderStudies();
                });

                filterSpecificClinicalAreas.addEventListener(
                    "change",
                    filterAndRenderStudies,
                );
                filterTreatmentSetting.addEventListener(
                    "change",
                    filterAndRenderStudies,
                );
            }

            if (trialListDiv) {
                trialListDiv.addEventListener("click", async (e) => {
                    if (e.target.closest(".delete-study-btn")) {
                        const btn = e.target.closest(".delete-study-btn");
                        const id = btn.dataset.id;
                        if (
                            confirm(
                                "Sei sicuro di voler eliminare questo studio?",
                            )
                        ) {
                            try {
                                const response = await fetch(
                                    `/api/studies/${id}`,
                                    { method: "DELETE" },
                                );
                                if (response.ok) {
                                    alert("Studio eliminato con successo!");
                                    loadStudies();
                                } else {
                                    throw new Error(
                                        "Errore durante l'eliminazione",
                                    );
                                }
                            } catch (error) {
                                console.error(error);
                                alert(
                                    "Errore durante l'eliminazione dello studio.",
                                );
                            }
                        }
                    } else if (e.target.closest(".view-details-btn")) {
                        const btn = e.target.closest(".view-details-btn");
                        const id = btn.dataset.id;
                        const study = allStudies.find((s) => s.id == id);
                        if (study) {
                            showStudyDetails(study, false); // Passa false per non mostrare il check eleggibilità
                        }
                    }
                });
            }

            if (trialListDiv) {
                loadStudies();
            }
        }
    };

    // Logica per la pagina del paziente
    const setupPatientForm = () => {
        const searchForm = document.getElementById("searchForm");
        const clinicalAreaSelect = document.getElementById("clinicalArea");
        const specificClinicalAreaContainer = document.getElementById(
            "specificClinicalAreaContainer",
        );
        const specificClinicalAreasSelect = document.getElementById(
            "specificClinicalAreas",
        );
        const treatmentSettingSelect =
            document.getElementById("treatmentSetting");
        const treatmentLineContainer = document.getElementById(
            "treatmentLineContainer",
        );
        const patientTreatmentLineInput = document.getElementById(
            "patientTreatmentLine",
        );
        const trialListDiv = document.getElementById("trialList");
        let allStudies = [];

        const populateSpecificAreas = (selectedArea) => {
            specificClinicalAreasSelect.innerHTML =
                '<option value="" disabled selected>Seleziona un\'area specifica (opzionale)</option>';
            const specificAreas = clinicalAreaMappings[selectedArea];
            if (specificAreas && specificAreas.length > 0) {
                showElement(specificClinicalAreaContainer);
                specificAreas.forEach((area) => {
                    const option = document.createElement("option");
                    option.value = area;
                    option.textContent = area;
                    specificClinicalAreasSelect.appendChild(option);
                });
            } else {
                hideElement(specificClinicalAreaContainer);
            }
        };

        const toggleTreatmentLine = (setting) => {
            if (setting === "Metastatico") {
                showElement(treatmentLineContainer);
            } else {
                hideElement(treatmentLineContainer);
            }
        };

        const renderStudies = (studies) => {
            if (!trialListDiv) return;
            trialListDiv.innerHTML = "";
            if (studies.length === 0) {
                trialListDiv.innerHTML =
                    '<p class="text-gray-500">Nessuno studio compatibile trovato.</p>';
                return;
            }
            studies.forEach((study) => {
                const studyCard = document.createElement("div");
                studyCard.classList.add(
                    "bg-white",
                    "p-6",
                    "rounded-xl",
                    "shadow-md",
                    "border",
                    "border-gray-200",
                );
                studyCard.innerHTML = `
                    <h3 class="text-lg font-bold text-dark-sage">${study.title}</h3>
                    <p class="text-sm text-gray-500">${study.subtitle}</p>
                    <div class="mt-4 flex flex-wrap gap-2">
                        ${study.clinical_areas.map((area) => `<span class="bg-light-sage text-dark-sage text-xs font-medium px-2.5 py-0.5 rounded-full">${area}</span>`).join("")}
                    </div>
                    <div class="mt-4">
                        <button class="view-details-btn bg-sage text-white text-sm px-3 py-1 rounded-lg hover:bg-dark-sage transition-colors" data-id="${study.id}">
                            Controlla eleggibilità
                        </button>
                    </div>
                `;
                trialListDiv.appendChild(studyCard);
            });
        };

        const loadStudies = async () => {
            try {
                const response = await fetch("/api/studies");
                if (response.ok) {
                    allStudies = await response.json();
                } else {
                    throw new Error("Errore nel caricamento degli studi");
                }
            } catch (error) {
                console.error(error);
                if (trialListDiv) {
                    trialListDiv.innerHTML = `<p class="text-red-500">Errore: ${error.message}</p>`;
                }
            }
        };

        if (searchForm) {
            clinicalAreaSelect.addEventListener("change", (e) =>
                populateSpecificAreas(e.target.value),
            );
            treatmentSettingSelect.addEventListener("change", (e) =>
                toggleTreatmentLine(e.target.value),
            );

            searchForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const selectedClinicalArea = clinicalAreaSelect.value;
                const selectedSpecificArea = specificClinicalAreasSelect.value;
                const selectedTreatmentSetting = treatmentSettingSelect.value;
                const patientTreatmentLine = parseInt(
                    patientTreatmentLineInput.value,
                    10,
                );

                const filteredStudies = allStudies.filter((study) => {
                    const clinicalAreaMatch =
                        study.clinical_areas.includes(selectedClinicalArea);
                    const specificAreaMatch =
                        !selectedSpecificArea ||
                        (study.specific_clinical_areas &&
                            study.specific_clinical_areas.includes(
                                selectedSpecificArea,
                            ));
                    const treatmentSettingMatch =
                        study.treatment_setting === selectedTreatmentSetting;
                    const treatmentLineMatch =
                        !study.min_treatment_line ||
                        (patientTreatmentLine >= study.min_treatment_line &&
                            patientTreatmentLine <= study.max_treatment_line);

                    return (
                        clinicalAreaMatch &&
                        specificAreaMatch &&
                        treatmentSettingMatch &&
                        treatmentLineMatch
                    );
                });
                renderStudies(filteredStudies);
            });

            trialListDiv.addEventListener("click", (e) => {
                if (e.target.closest(".view-details-btn")) {
                    const btn = e.target.closest(".view-details-btn");
                    const id = btn.dataset.id;
                    const study = allStudies.find((s) => s.id == id);
                    if (study) {
                        showStudyDetails(study, true); // Passa true per mostrare il check eleggibilità
                    }
                }
            });
            loadStudies();
        }
    };

    // Gestione del modale condiviso
    const studyDetailModal = document.getElementById("studyDetailModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const criteriaContainer = document.getElementById("criteriaContainer");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const eligibilityResultDiv = document.getElementById(
        "eligibilityResultDiv",
    );
    const patientEligibilityCheckContainer = document.getElementById(
        "patientEligibilityCheckContainer",
    );
    const patientEligibilityToggles = document.getElementById(
        "patientEligibilityToggles",
    );
    const checkEligibilityBtn = document.getElementById("checkEligibilityBtn");

    const showStudyDetails = (study, isPatientView) => {
        if (!studyDetailModal) return;
        modalTitle.textContent = study.title;
        modalSubtitle.textContent = study.subtitle;
        criteriaContainer.innerHTML = "";
        eligibilityResultDiv.innerHTML = "";
        hideElement(eligibilityResultDiv);

        if (isPatientView) {
            showElement(patientEligibilityCheckContainer);
            showElement(checkEligibilityBtn);
            patientEligibilityToggles.innerHTML = "";
            study.criteria.forEach((criteriaItem, index) => {
                const criteriaDiv = document.createElement("div");
                criteriaDiv.classList.add(
                    "flex",
                    "items-center",
                    "space-x-4",
                    "p-2",
                    "bg-gray-100",
                    "rounded-lg",
                    "text-sm",
                );
                criteriaDiv.innerHTML = `
                    <span class="flex-grow">${criteriaItem.text}</span>
                    <div class="flex items-center space-x-2">
                        <label for="patient-criteria-toggle-${index}" class="text-xs font-bold text-gray-500">NO</label>
                        <input type="checkbox" id="patient-criteria-toggle-${index}" data-type="${criteriaItem.type}" class="criteria-toggle relative block w-10 h-6 rounded-full bg-red-500 peer appearance-none cursor-pointer">
                        <label for="patient-criteria-toggle-${index}" class="text-xs font-bold text-gray-500">SÌ</label>
                    </div>
                `;
                patientEligibilityToggles.appendChild(criteriaDiv);
                // Aggiungi listener per il cambio di colore
                const toggle = criteriaDiv.querySelector(
                    `#patient-criteria-toggle-${index}`,
                );
                toggle.addEventListener("change", (e) => {
                    const labelDiv = e.target.closest("div");
                    if (e.target.checked) {
                        labelDiv.classList.remove("bg-red-500");
                        labelDiv.classList.add("bg-sage");
                    } else {
                        labelDiv.classList.remove("bg-sage");
                        labelDiv.classList.add("bg-red-500");
                    }
                });
            });
        } else {
            hideElement(patientEligibilityCheckContainer);
            hideElement(checkEligibilityBtn);
            study.criteria.forEach((criteriaItem) => {
                const criteriaDiv = document.createElement("div");
                criteriaDiv.classList.add(
                    "flex",
                    "items-center",
                    "space-x-2",
                    "text-sm",
                );
                const iconClass =
                    criteriaItem.type === "inclusion"
                        ? "fa-check-circle text-sage"
                        : "fa-times-circle text-red-500";
                criteriaDiv.innerHTML = `<i class="fas ${iconClass}"></i><span>${criteriaItem.text} (${criteriaItem.type === "inclusion" ? "Inclusione" : "Esclusione"})</span>`;
                criteriaContainer.appendChild(criteriaDiv);
            });
        }
        showElement(studyDetailModal);

        // Aggiungi listener al bottone "Controlla eleggibilità" solo se siamo nella vista paziente
        if (isPatientView) {
            checkEligibilityBtn.onclick = () => checkEligibility(study);
        }
    };

    closeModalBtn.addEventListener("click", () => {
        hideElement(studyDetailModal);
    });
    studyDetailModal.addEventListener("click", (e) => {
        if (e.target === studyDetailModal) {
            hideElement(studyDetailModal);
        }
    });

    const checkEligibility = (study) => {
        const patientCriteriaToggles = document.querySelectorAll(
            '#patientEligibilityToggles input[type="checkbox"]',
        );
        let isEligible = true;
        let reasons = [];

        patientCriteriaToggles.forEach((toggle, index) => {
            const isToggledOn = toggle.checked;
            const requiredType = toggle.dataset.type;
            const criteriaText = study.criteria[index].text;

            if (requiredType === "inclusion" && !isToggledOn) {
                isEligible = false;
                reasons.push(
                    `Criterio di inclusione non soddisfatto: "${criteriaText}"`,
                );
            } else if (requiredType === "exclusion" && isToggledOn) {
                isEligible = false;
                reasons.push(
                    `Criterio di esclusione non soddisfatto: "${criteriaText}"`,
                );
            }
        });

        // Controlla la linea di trattamento del paziente
        const patientTreatmentLine = parseInt(
            document.getElementById("patientTreatmentLine").value,
            10,
        );
        if (study.treatment_setting === "Metastatico") {
            const minLine = parseInt(study.min_treatment_line, 10);
            const maxLine = parseInt(study.max_treatment_line, 10);
            if (!isNaN(patientTreatmentLine)) {
                if (
                    patientTreatmentLine < minLine ||
                    patientTreatmentLine > maxLine
                ) {
                    isEligible = false;
                    reasons.push(
                        `Linea di trattamento non compatibile. Richiesta: da ${minLine} a ${maxLine}, fornita: ${patientTreatmentLine}`,
                    );
                }
            } else {
                isEligible = false;
                reasons.push("Linea di trattamento non fornita.");
            }
        }

        eligibilityResultDiv.innerHTML = "";
        if (isEligible) {
            eligibilityResultDiv.classList.add("eligible");
            eligibilityResultDiv.classList.remove("not-eligible");
            eligibilityResultDiv.innerHTML = `
                <div class="eligibility-result-box eligible">
                    <p>Paziente eleggibile per lo studio:</p>
                    <p class="font-normal text-sm">${study.title}</p>
                </div>
            `;
        } else {
            eligibilityResultDiv.classList.add("not-eligible");
            eligibilityResultDiv.classList.remove("eligible");
            eligibilityResultDiv.innerHTML = `
                <div class="eligibility-result-box not-eligible">
                    <p>Paziente NON eleggibile per lo studio:</p>
                    <p class="font-normal text-sm">${study.title}</p>
                </div>
            `;
        }
        showElement(eligibilityResultDiv);
    };

    // Chiamate per l'inizializzazione basata sulla pagina
    if (window.location.pathname === "/") {
        setupPatientForm();
    } else if (window.location.pathname === "/trials") {
        setupStudyForm();
    }
});
