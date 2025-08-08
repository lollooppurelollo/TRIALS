document.addEventListener("DOMContentLoaded", () => {
    // Definizione delle aree cliniche e delle sottoaree
    const clinicalAreas = {
        Mammella: [
            "Carcinoma mammario triplo negativo",
            "Carcinoma mammario HER2+",
            "Carcinoma mammario ER/PR+",
        ],
        Polmone: [
            "Carcinoma a piccole cellule",
            "Carcinoma non a piccole cellule - Adenocarcinoma",
            "Carcinoma non a piccole cellule - Squamoso",
        ],
        "Gastro-Intestinale": [
            "Colon-retto",
            "Esofago-stomaco",
            "Pancreas",
            "Vie biliari",
        ],
        Ginecologico: ["Ovaio", "Endometrio", "Cervice"],
        "Prostata e Vie Urinarie": ["Prostata", "Rene", "Vescica"],
        "Melanoma e Cute": ["Melanoma", "Carcinoma squamoso della cute"],
        "Testa-Collo": ["Oro-faringe", "Laringe", "Cavo orale"],
        "Fase 1": [],
        Altro: [],
    };

    // Funzione per popolare le select delle aree cliniche specifiche
    const populateSpecificAreas = (
        mainSelectId,
        specificSelectId,
        containerId,
        multiple = false,
    ) => {
        const mainSelect = document.getElementById(mainSelectId);
        const specificSelect = document.getElementById(specificSelectId);
        const container = document.getElementById(containerId);

        if (!mainSelect || !specificSelect || !container) {
            return;
        }

        specificSelect.innerHTML = multiple
            ? ""
            : '<option value="">Tutte le Specifiche</option>';

        const populateOptions = (selectedAreas) => {
            const allSpecificAreas = selectedAreas.flatMap(
                (area) => clinicalAreas[area] || [],
            );
            const uniqueSpecificAreas = [...new Set(allSpecificAreas)];
            uniqueSpecificAreas.forEach((area) => {
                const option = document.createElement("option");
                option.value = area;
                option.textContent = area;
                specificSelect.appendChild(option);
            });
            container.classList.toggle(
                "hidden",
                uniqueSpecificAreas.length === 0,
            );
        };

        if (multiple) {
            mainSelect.addEventListener("change", () => {
                const selectedAreas = Array.from(
                    mainSelect.selectedOptions,
                ).map((option) => option.value);
                specificSelect.innerHTML = "";
                populateOptions(selectedAreas);
            });
        } else {
            mainSelect.addEventListener("change", () => {
                const selectedArea = mainSelect.value;
                specificSelect.innerHTML =
                    '<option value="">Seleziona un\'area specifica (opzionale)</option>';
                const specificOptions = clinicalAreas[selectedArea] || [];
                specificOptions.forEach((area) => {
                    const option = document.createElement("option");
                    option.value = area;
                    option.textContent = area;
                    specificSelect.appendChild(option);
                });
                container.classList.toggle(
                    "hidden",
                    specificOptions.length === 0,
                );
            });
        }
    };

    // Funzione per popolare la select delle aree specifiche per i filtri
    const populateFilterSpecificAreas = () => {
        const mainSelect = document.getElementById("filterClinicalArea");
        const specificSelect = document.getElementById(
            "filterSpecificClinicalAreas",
        );
        const container = document.getElementById(
            "filterSpecificClinicalAreaContainer",
        );

        if (!mainSelect || !specificSelect || !container) {
            return;
        }

        specificSelect.innerHTML =
            '<option value="">Tutte le Specifiche</option>';
        const selectedArea = mainSelect.value;
        const specificOptions = clinicalAreas[selectedArea] || [];
        specificOptions.forEach((area) => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            specificSelect.appendChild(option);
        });
        container.classList.toggle("hidden", specificOptions.length === 0);
    };

    // === Logica della Pagina Paziente (patient.ejs) ===
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
    const trialListDiv = document.getElementById("trialList");
    const studyDetailModal = document.getElementById("studyDetailModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const criteriaContainer = document.getElementById("criteriaContainer");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const checkEligibilityBtn = document.getElementById("checkEligibilityBtn");
    const eligibilityResultDiv = document.getElementById(
        "eligibilityResultDiv",
    );

    if (clinicalAreaSelect) {
        populateSpecificAreas(
            "clinicalArea",
            "specificClinicalAreas",
            "specificClinicalAreaContainer",
        );
    }

    // Mostra/nasconde il campo linea di trattamento in base al setting
    if (treatmentSettingSelect) {
        treatmentSettingSelect.addEventListener("change", () => {
            if (treatmentSettingSelect.value === "Metastatico") {
                treatmentLineContainer.classList.remove("hidden");
                patientTreatmentLineInput.setAttribute("required", true);
            } else {
                treatmentLineContainer.classList.add("hidden");
                patientTreatmentLineInput.removeAttribute("required");
            }
        });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const clinicalArea = clinicalAreaSelect.value;
            const specificClinicalArea = specificClinicalAreasSelect.value;
            const treatmentSetting = treatmentSettingSelect.value;
            const patientTreatmentLine = patientTreatmentLineInput.value
                ? parseInt(patientTreatmentLineInput.value)
                : null;

            try {
                const response = await fetch("/api/studies");
                if (!response.ok)
                    throw new Error("Errore nel recupero degli studi");
                const studies = await response.json();

                const filteredStudies = studies.filter((study) => {
                    const isAreaMatch =
                        study.clinical_areas.includes(clinicalArea) ||
                        clinicalArea === "";
                    const isSpecificAreaMatch =
                        !specificClinicalArea ||
                        study.specific_clinical_areas.includes(
                            specificClinicalArea,
                        );
                    const isSettingMatch =
                        study.treatment_setting === treatmentSetting;
                    const isTreatmentLineMatch =
                        treatmentSetting !== "Metastatico" ||
                        (patientTreatmentLine >= study.min_treatment_line &&
                            patientTreatmentLine <= study.max_treatment_line);

                    return (
                        isAreaMatch &&
                        isSpecificAreaMatch &&
                        isSettingMatch &&
                        isTreatmentLineMatch
                    );
                });

                renderTrials(filteredStudies, "patient");
            } catch (error) {
                console.error("Errore durante la ricerca:", error);
            }
        });
    }

    // === Logica della Pagina Medico (trial.ejs) ===
    const studyForm = document.getElementById("studyForm");
    const addCriteriaBtn = document.getElementById("addCriteriaBtn");
    const criteriaList = document.getElementById("criteriaList");
    const studyTreatmentSettingSelect = document.getElementById(
        "studyTreatmentSetting",
    );
    const studyTreatmentLineContainer = document.getElementById(
        "studyTreatmentLineContainer",
    );
    const trialFilterForm = document.getElementById("trialFilterForm");
    const filterClinicalAreaSelect =
        document.getElementById("filterClinicalArea");
    const filterSpecificClinicalAreasSelect = document.getElementById(
        "filterSpecificClinicalAreas",
    );
    const filterTreatmentSettingSelect = document.getElementById(
        "filterTreatmentSetting",
    );
    const trialListSection = document.getElementById("trialListSection");

    let criteriaCounter = 0;

    if (filterClinicalAreaSelect) {
        filterClinicalAreaSelect.addEventListener("change", () => {
            populateFilterSpecificAreas();
            loadAndRenderTrials();
        });
    }

    if (filterSpecificClinicalAreasSelect) {
        filterSpecificClinicalAreasSelect.addEventListener("change", () => {
            loadAndRenderTrials();
        });
    }

    if (filterTreatmentSettingSelect) {
        filterTreatmentSettingSelect.addEventListener("change", () => {
            loadAndRenderTrials();
        });
    }

    if (studyTreatmentSettingSelect) {
        studyTreatmentSettingSelect.addEventListener("change", () => {
            if (studyTreatmentSettingSelect.value === "Metastatico") {
                studyTreatmentLineContainer.classList.remove("hidden");
            } else {
                studyTreatmentLineContainer.classList.add("hidden");
            }
        });
    }

    if (addCriteriaBtn) {
        addCriteriaBtn.addEventListener("click", () => {
            const criteriaDiv = document.createElement("div");
            criteriaDiv.className = "flex items-center space-x-2 criteria-item";
            criteriaDiv.innerHTML = `
                <input type="text" id="criteria-text-${criteriaCounter}" class="p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-sage" placeholder="Descrizione del criterio" required>
                <select id="criteria-type-${criteriaCounter}" class="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-sage">
                    <option value="inclusion">Inclusione</option>
                    <option value="exclusion">Esclusione</option>
                </select>
                <button type="button" class="remove-criteria-btn text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            criteriaList.appendChild(criteriaDiv);

            criteriaDiv
                .querySelector(".remove-criteria-btn")
                .addEventListener("click", () => {
                    criteriaDiv.remove();
                });
            criteriaCounter++;
        });
    }

    if (studyForm) {
        populateSpecificAreas(
            "studyClinicalAreas",
            "studySpecificClinicalAreas",
            "studySpecificClinicalAreaContainer",
            true,
        );
        studyForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const title = document.getElementById("studyTitle").value;
            const subtitle = document.getElementById("studySubtitle").value;
            const studyClinicalAreas = Array.from(
                document.getElementById("studyClinicalAreas").selectedOptions,
            ).map((option) => option.value);
            const studySpecificClinicalAreas = Array.from(
                document.getElementById("studySpecificClinicalAreas")
                    .selectedOptions,
            ).map((option) => option.value);
            const treatmentSetting = studyTreatmentSettingSelect.value;
            const minTreatmentLine = document.getElementById("minTreatmentLine")
                .value
                ? parseInt(document.getElementById("minTreatmentLine").value)
                : null;
            const maxTreatmentLine = document.getElementById("maxTreatmentLine")
                .value
                ? parseInt(document.getElementById("maxTreatmentLine").value)
                : null;

            const criteria = [];
            document.querySelectorAll(".criteria-item").forEach((item) => {
                const text = item.querySelector("input[type='text']").value;
                const type = item.querySelector("select").value;
                if (text) {
                    criteria.push({ text, type });
                }
            });

            const newStudy = {
                title,
                subtitle,
                treatment_setting: treatmentSetting,
                min_treatment_line: minTreatmentLine,
                max_treatment_line: maxTreatmentLine,
                clinical_areas: studyClinicalAreas,
                specific_clinical_areas: studySpecificClinicalAreas,
                criteria,
            };

            try {
                const response = await fetch("/api/studies", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newStudy),
                });

                if (!response.ok)
                    throw new Error("Errore nel salvataggio dello studio");
                alert("Studio salvato con successo!");
                studyForm.reset();
                criteriaList.innerHTML = "";
                studyTreatmentLineContainer.classList.add("hidden");
                loadAndRenderTrials();
            } catch (error) {
                console.error("Errore:", error);
                alert("Si è verificato un errore durante il salvataggio.");
            }
        });

        // Carica e renderizza gli studi all'avvio
        loadAndRenderTrials();
    }

    // === Funzioni Comuni a entrambe le pagine ===
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

    // Funzione per renderizzare la lista dei trial
    function renderTrials(studies, page) {
        if (!trialListDiv) return;

        trialListDiv.innerHTML = "";
        if (studies.length === 0) {
            trialListDiv.innerHTML =
                '<p class="text-gray-500">Nessuno studio trovato.</p>';
            return;
        }
        studies.forEach((study) => {
            const trialCard = document.createElement("div");
            trialCard.className =
                "bg-white p-6 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg transition-shadow duration-300";
            trialCard.innerHTML = `
                <div>
                    <h3 class="text-lg font-bold text-dark-sage">${study.title}</h3>
                    <p class="text-gray-600">${study.subtitle || "Nessuna descrizione"}</p>
                </div>
                <div class="flex space-x-2">
                    <button data-study-id="${study.id}" class="view-details-btn bg-sage text-white px-4 py-2 rounded-lg hover:bg-dark-sage transition-colors">
                        Dettagli
                    </button>
                    ${
                        page === "trial"
                            ? `<button data-study-id="${study.id}" class="delete-btn bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Elimina
                        </button>`
                            : ""
                    }
                </div>
            `;
            trialListDiv.appendChild(trialCard);
        });

        // Aggiungi listener per i pulsanti "Dettagli"
        document.querySelectorAll(".view-details-btn").forEach((button) => {
            button.addEventListener("click", (e) => {
                const studyId = e.target.dataset.studyId;
                const study = studies.find((s) => s.id === studyId);
                showStudyDetails(study, page);
            });
        });

        // Aggiungi listener per i pulsanti "Elimina"
        if (page === "trial") {
            document.querySelectorAll(".delete-btn").forEach((button) => {
                button.addEventListener("click", async (e) => {
                    const studyId = e.target.dataset.studyId;
                    if (
                        confirm("Sei sicuro di voler eliminare questo studio?")
                    ) {
                        try {
                            const response = await fetch(
                                `/api/studies/${studyId}`,
                                {
                                    method: "DELETE",
                                },
                            );
                            if (!response.ok)
                                throw new Error(
                                    "Errore durante l'eliminazione",
                                );
                            alert("Studio eliminato con successo.");
                            loadAndRenderTrials();
                        } catch (error) {
                            console.error("Errore:", error);
                            alert(
                                "Si è verificato un errore durante l'eliminazione.",
                            );
                        }
                    }
                });
            });
        }
    }

    function renderCriteriaInModal(study, isPatientPage) {
        if (!criteriaContainer) return;

        criteriaContainer.innerHTML = "";
        study.criteria.forEach((criterion) => {
            const criterionDiv = document.createElement("div");
            criterionDiv.className =
                "flex items-center space-x-2 bg-gray-100 p-3 rounded-lg";

            const criterionText = document.createElement("span");
            criterionText.className = "flex-1 text-sm text-dark-gray";
            criterionText.textContent = criterion.text;

            criterionDiv.appendChild(criterionText);

            if (isPatientPage) {
                const toggleWrapper = document.createElement("div");
                toggleWrapper.className =
                    "relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in";

                const toggleInput = document.createElement("input");
                toggleInput.type = "checkbox";
                toggleInput.className =
                    "criteria-toggle peer absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer focus:outline-none";
                toggleInput.dataset.preferredType = criterion.type; // Aggiunto data attribute per il tipo
                toggleInput.checked = criterion.type === "inclusion"; // Imposta il valore iniziale del toggle

                const toggleLabel = document.createElement("div");
                toggleLabel.className =
                    "criteria-toggle-label block overflow-hidden h-5 rounded-full bg-red-400 cursor-pointer peer-checked:bg-sage";

                toggleWrapper.appendChild(toggleInput);
                toggleWrapper.appendChild(toggleLabel);

                const labelDiv = document.createElement("div");
                labelDiv.className = "text-sm text-dark-gray";
                const labelInclusion = document.createElement("span");
                labelInclusion.className = "inline-block peer-checked:hidden";
                labelInclusion.textContent = "NO";
                const labelExclusion = document.createElement("span");
                labelExclusion.className = "hidden peer-checked:inline-block";
                labelExclusion.textContent = "SI";
                labelDiv.appendChild(labelInclusion);
                labelDiv.appendChild(labelExclusion);

                criterionDiv.appendChild(toggleWrapper);
                criterionDiv.appendChild(labelDiv);
            } else {
                const typeText = document.createElement("span");
                typeText.className = `text-xs font-bold px-2 py-1 rounded-full text-white ${
                    criterion.type === "inclusion" ? "bg-sage" : "bg-red-500"
                }`;
                typeText.textContent =
                    criterion.type === "inclusion"
                        ? "INCLUSIONE"
                        : "ESCLUSIONE";
                criterionDiv.appendChild(typeText);
            }

            criteriaContainer.appendChild(criterionDiv);
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
            eligibilityResultDiv.textContent = "";
        }

        const isPatientPage = page === "patient";
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
                const toggles =
                    criteriaContainer.querySelectorAll(".criteria-toggle");
                let isEligible = true;

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
                        eligibilityResultDiv.textContent = `Paziente eleggibile per lo studio: ${study.title}`;
                        eligibilityResultDiv.className =
                            "font-bold text-center mt-4 text-dark-gray bg-sage p-3 rounded-lg";
                    } else {
                        eligibilityResultDiv.textContent = `Paziente NON eleggibile per lo studio: ${study.title}`;
                        eligibilityResultDiv.className =
                            "font-bold text-center mt-4 text-dark-gray bg-red-400 p-3 rounded-lg";
                    }
                }
            };
        }

        // Rende il modale visibile
        studyDetailModal.classList.remove("hidden");
        studyDetailModal.style.display = "flex";
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
            if (studyDetailModal) {
                studyDetailModal.classList.add("hidden");
                studyDetailModal.style.display = "none";
            }
        });
    }

    // Carica e renderizza gli studi (per la pagina trial)
    async function loadAndRenderTrials() {
        if (trialListSection) {
            try {
                const response = await fetch("/api/studies");
                if (!response.ok)
                    throw new Error("Errore nel recupero degli studi");
                const studies = await response.json();

                // Applica filtri
                const filterClinicalArea = filterClinicalAreaSelect.value;
                const filterSpecificClinicalArea =
                    filterSpecificClinicalAreasSelect.value;
                const filterTreatmentSetting =
                    filterTreatmentSettingSelect.value;

                const filteredStudies = studies.filter((study) => {
                    const areaMatch =
                        !filterClinicalArea ||
                        study.clinical_areas.includes(filterClinicalArea);
                    const specificAreaMatch =
                        !filterSpecificClinicalArea ||
                        study.specific_clinical_areas.includes(
                            filterSpecificClinicalArea,
                        );
                    const settingMatch =
                        !filterTreatmentSetting ||
                        study.treatment_setting === filterTreatmentSetting;

                    return areaMatch && specificAreaMatch && settingMatch;
                });

                renderTrials(filteredStudies, "trial");
            } catch (error) {
                console.error("Errore nel caricamento degli studi:", error);
            }
        }
    }
});
