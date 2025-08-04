// public/js/client.js
// Questo script gestisce tutta la logica di interazione lato client.

document.addEventListener('DOMContentLoaded', () => {
    // Definizione delle aree cliniche per i dropdown dinamici
    const specificClinicalAreasMap = {
        "Mammella": ["HER2 positive", "Luminali", "TNBC"],
        "Polmone": ["NSCLC", "SCLC", "Mesotelioma"],
        "Gastro-Intestinale": ["Esofago", "Stomaco", "Colon", "Retto", "Ano", "Vie biliari", "Pancreas", "Fegato"],
        "Prostata e Vie Urinarie": ["Prostata", "Rene", "Vescica", "Altre vie Urinarie"],
        "Ginecologico": ["Endometrio", "Ovaio", "Cervice", "Vulva", "Altri"],
        "Melanoma e Cute": ["Melanoma", "SCC", "Basalioma"]
    };

    // Funzioni per la gestione dei modal
    window.showModal = (id) => {
        document.getElementById(id).classList.remove('hidden');
    };

    window.closeModal = (id) => {
        document.getElementById(id).classList.add('hidden');
    };

    function showGenericModal(content, type = 'alert', onConfirm = () => {}, onCancel = () => {}) {
        const modal = document.getElementById('genericModal');
        const modalContent = document.getElementById('genericModalContent');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const okBtn = document.getElementById('okBtn');

        modalContent.innerHTML = content;

        confirmBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
        okBtn.classList.add('hidden');

        confirmBtn.onclick = () => { onConfirm(); closeModal('genericModal'); };
        cancelBtn.onclick = () => { onCancel(); closeModal('genericModal'); };
        okBtn.onclick = () => { closeModal('genericModal'); };

        if (type === 'confirm') {
            confirmBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
        } else {
            okBtn.classList.remove('hidden');
        }

        showModal('genericModal');
    }

    // --- Logica per la pagina 'Paziente' ---
    const patientSearchForm = document.getElementById('patientSearchForm');
    const patientClinicalAreaSelect = document.getElementById('clinicalArea');
    const patientTreatmentSettingSelect = document.getElementById('treatmentSetting');
    const specificAreaContainer = document.getElementById('specificAreaContainer');
    const specificClinicalAreaSelect = document.getElementById('specificClinicalArea');
    const treatmentLineContainer = document.getElementById('treatmentLineContainer');
    const searchResultsDiv = document.getElementById('searchResults');
    const studyDetailModal = document.getElementById('studyDetailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const criteriaContainer = document.getElementById('criteriaContainer');
    const checkEligibilityBtn = document.getElementById('checkEligibilityBtn');
    const eligibilityResultDiv = document.getElementById('eligibilityResult');

    if (patientClinicalAreaSelect) {
        patientClinicalAreaSelect.addEventListener('change', (e) => {
            updateSpecificAreasDropdown(e.target.value, specificClinicalAreaSelect, specificAreaContainer);
        });

        patientTreatmentSettingSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Metastatico') {
                treatmentLineContainer.classList.remove('hidden');
            } else {
                treatmentLineContainer.classList.add('hidden');
            }
        });

        patientSearchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(patientSearchForm);
            const data = Object.fromEntries(formData.entries());

            // Converte in numero la linea di trattamento
            data.patient_treatment_line = data.patient_treatment_line ? parseInt(data.patient_treatment_line, 10) : null;

            searchResultsDiv.innerHTML = '<div class="text-center text-gray-500 p-4">Ricerca in corso...</div>';

            try {
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error('Errore nella ricerca.');
                }
                const studies = await response.json();

                if (studies.length === 0) {
                    searchResultsDiv.innerHTML = '<div class="bg-white p-6 rounded-2xl shadow-md text-center text-gray-500">Nessuno studio trovato per i criteri selezionati.</div>';
                } else {
                    searchResultsDiv.innerHTML = studies.map(study => `
                        <div class="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200" data-study-id="${study.id}">
                            <h3 class="text-lg font-semibold text-green-800">${study.title}</h3>
                            <p class="text-gray-500">${study.subtitle}</p>
                        </div>
                    `).join('');

                    document.querySelectorAll('.study-card').forEach(card => {
                        card.addEventListener('click', () => showStudyDetails(card.dataset.studyId, studies));
                    });
                }

            } catch (error) {
                console.error('Errore durante la ricerca:', error);
                searchResultsDiv.innerHTML = '<div class="bg-white p-6 rounded-2xl shadow-md text-center text-red-500">Si è verificato un errore durante la ricerca.</div>';
            }
        });
    }

    // --- Logica per la pagina 'Trial' ---
    const studyForm = document.getElementById('studyForm');
    const studyIdInput = document.getElementById('studyId');
    const studyTitleInput = document.getElementById('studyTitle');
    const studySubtitleInput = document.getElementById('studySubtitle');
    const studyClinicalAreasSelect = document.getElementById('studyClinicalAreas');
    const studySpecificAreaContainer = document.getElementById('studySpecificAreaContainer');
    const studySpecificClinicalAreasSelect = document.getElementById('studySpecificClinicalAreas');
    const studyTreatmentSettingSelect = document.getElementById('studyTreatmentSetting');
    const studyTreatmentLineContainer = document.getElementById('studyTreatmentLineContainer');
    const minTreatmentLineInput = document.getElementById('minTreatmentLine');
    const maxTreatmentLineInput = document.getElementById('maxTreatmentLine');
    const criteriaListDiv = document.getElementById('criteriaList');
    const addCriteriaBtn = document.getElementById('addCriteriaBtn');
    const trialListDiv = document.getElementById('trialList');

    if (studyClinicalAreasSelect) {
        studyClinicalAreasSelect.addEventListener('change', () => {
            const selectedAreas = Array.from(studyClinicalAreasSelect.selectedOptions).map(option => option.value);
            updateSpecificAreasDropdownMultiple(selectedAreas, studySpecificClinicalAreasSelect, studySpecificAreaContainer);
        });

        studyTreatmentSettingSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Metastatico') {
                studyTreatmentLineContainer.classList.remove('hidden');
            } else {
                studyTreatmentLineContainer.classList.add('hidden');
            }
        });

        addCriteriaBtn.addEventListener('click', addCriteriaRow);

        studyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(studyForm);
            const studyId = formData.get('studyId');
            const data = {
                id: studyId,
                title: formData.get('title'),
                subtitle: formData.get('subtitle'),
                clinical_areas: Array.from(studyClinicalAreasSelect.selectedOptions).map(option => option.value),
                specific_clinical_areas: Array.from(studySpecificClinicalAreasSelect.selectedOptions).map(option => option.value),
                treatment_setting: formData.get('treatment_setting'),
                min_treatment_line: formData.get('min_treatment_line') ? parseInt(formData.get('min_treatment_line'), 10) : null,
                max_treatment_line: formData.get('max_treatment_line') ? parseInt(formData.get('max_treatment_line'), 10) : null,
                criteria: getCriteriaData()
            };

            const method = studyId ? 'PUT' : 'POST';
            const url = studyId ? `/api/studies/${studyId}` : '/api/studies';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showGenericModal(`<p class="text-center">Studio salvato con successo!</p>`, 'alert');
                    resetStudyForm();
                    fetchAndRenderTrials();
                } else {
                    const error = await response.json();
                    showGenericModal(`<p class="text-center text-red-500">Errore durante il salvataggio dello studio: ${error.message}</p>`, 'alert');
                }

            } catch (error) {
                console.error('Errore durante il salvataggio:', error);
                showGenericModal(`<p class="text-center text-red-500">Si è verificato un errore di rete.</p>`, 'alert');
            }
        });

        fetchAndRenderTrials();
    }

    // --- Funzioni comuni ---
    function getCriteriaData() {
        const criteriaItems = criteriaListDiv.querySelectorAll('.criteria-item');
        return Array.from(criteriaItems).map(item => ({
            text: item.querySelector('.criteria-input').value,
            prefers: item.querySelector('.criteria-type').value
        }));
    }

    function addCriteriaRow(text = '', prefers = 'inclusion') {
        const row = document.createElement('div');
        row.className = 'flex items-center space-x-2 criteria-item';
        row.innerHTML = `
            <input type="text" class="criteria-input w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Inserisci un criterio" value="${text}">
            <select class="criteria-type p-3 border border-gray-300 rounded-lg w-32">
                <option value="inclusion" ${prefers === 'inclusion' ? 'selected' : ''}>Inclusione</option>
                <option value="exclusion" ${prefers === 'exclusion' ? 'selected' : ''}>Esclusione</option>
            </select>
            <button type="button" class="remove-criteria-btn text-red-500 hover:text-red-700 text-xl">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        criteriaListDiv.appendChild(row);
        row.querySelector('.remove-criteria-btn').addEventListener('click', (e) => e.target.closest('.criteria-item').remove());
    }

    function resetStudyForm() {
        studyForm.reset();
        studyIdInput.value = '';
        studySpecificAreaContainer.classList.add('hidden');
        studyTreatmentLineContainer.classList.add('hidden');
        criteriaListDiv.innerHTML = '';
        addCriteriaRow();
    }

    async function fetchAndRenderTrials() {
        try {
            const response = await fetch('/api/studies');
            if (!response.ok) {
                throw new Error('Impossibile caricare gli studi.');
            }
            const studies = await response.json();

            // Raggruppa gli studi per Setting di Trattamento
            const studiesBySetting = studies.reduce((acc, study) => {
                const setting = study.treatment_setting;
                if (!acc[setting]) {
                    acc[setting] = [];
                }
                acc[setting].push(study);
                return acc;
            }, {});

            trialListDiv.innerHTML = '';
            if (studies.length === 0) {
                trialListDiv.innerHTML = '<p class="text-center text-gray-500">Nessuno studio attivo trovato.</p>';
                return;
            }

            for (const setting in studiesBySetting) {
                trialListDiv.innerHTML += `
                    <div class="mb-6">
                        <h3 class="text-lg font-bold mb-2">${setting}</h3>
                        <div class="space-y-4">
                            ${studiesBySetting[setting].map(study => `
                                <div class="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow duration-200 relative study-card" data-study-id="${study.id}">
                                    <h4 class="font-semibold text-green-800">${study.title}</h4>
                                    <p class="text-gray-500">${study.subtitle}</p>
                                    <div class="absolute top-4 right-4">
                                        <button class="remove-study-btn text-red-500 hover:text-red-700 text-xl" data-id="${study.id}" onclick="event.stopPropagation()">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            document.querySelectorAll('.remove-study-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const studyId = btn.dataset.id;
                    showGenericModal(
                        '<p>Sei sicuro di voler rimuovere questo studio?</p>', 
                        'confirm', 
                        async () => {
                            try {
                                await fetch(`/api/studies/${studyId}`, { method: 'DELETE' });
                                showGenericModal('<p>Studio rimosso con successo.</p>', 'alert');
                                fetchAndRenderTrials();
                            } catch (error) {
                                console.error('Errore durante la rimozione:', error);
                                showGenericModal('<p class="text-center text-red-500">Errore durante la rimozione dello studio.</p>', 'alert');
                            }
                        }
                    );
                });
            });

            document.querySelectorAll('.study-card').forEach(card => {
                card.addEventListener('click', (e) => {
                     const studyId = card.dataset.studyId;
                     const study = studies.find(s => s.id === studyId);
                     showStudyDetails(studyId, [study]);
                }
            });
        } catch (error) {
            console.error('Errore durante il caricamento degli studi:', error);
            trialListDiv.innerHTML = `<p class="text-center text-red-500">Errore durante il caricamento degli studi.</p>`;
        }
    }

    function showStudyDetails(studyId, studies) {
        const study = studies.find(s => s.id === studyId);
        if (!study) return;

        modalTitle.textContent = study.title;
        modalSubtitle.textContent = study.subtitle;
        eligibilityResultDiv.textContent = '';
        criteriaContainer.innerHTML = '';

        study.criteria.forEach(criterion => {
            const row = document.createElement('div');
            row.className = 'flex items-center justify-between mb-2';
            row.innerHTML = `
                <span>${criterion.text}</span>
                <label class="toggle-switch-container">
                    <span class="text-sm">No</span>
                    <span class="toggle-switch">
                        <input type="checkbox" class="criteria-toggle" data-preferred="${criterion.prefers}">
                        <span class="slider"></span>
                    </span>
                    <span class="text-sm">Sì</span>
                </label>
            `;
            const toggleInput = row.querySelector('.criteria-toggle');
            if (criterion.prefers === 'inclusion') {
                toggleInput.checked = true;
            }
            criteriaContainer.appendChild(row);
        });

        showModal('studyDetailModal');

        checkEligibilityBtn.onclick = () => {
            let isEligible = true;
            const toggles = criteriaContainer.querySelectorAll('.criteria-toggle');
            toggles.forEach(toggle => {
                const preferred = toggle.dataset.preferred;
                const currentValue = toggle.checked ? 'inclusion' : 'exclusion';
                if (currentValue !== preferred) {
                    isEligible = false;
                }
            });

            if (isEligible) {
                eligibilityResultDiv.textContent = 'Paziente eleggibile per lo studio!';
                eligibilityResultDiv.style.color = 'var(--dark-green)';
            } else {
                eligibilityResultDiv.textContent = 'Paziente al momento non eleggibile per lo studio.';
                eligibilityResultDiv.style.color = '#D32F2F';
            }
        };
    }

    // Funzione per aggiornare il dropdown delle aree specifiche (per pagina Paziente)
    function updateSpecificAreasDropdown(selectedArea, selectElement, container) {
        const specificAreas = specificClinicalAreasMap[selectedArea] || [];
        selectElement.innerHTML = '<option value="" selected>Qualsiasi</option>';
        if (specificAreas.length > 0) {
            specificAreas.forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                option.textContent = area;
                selectElement.appendChild(option);
            });
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    }

    // Funzione per aggiornare il dropdown delle aree specifiche (per pagina Trial)
    function updateSpecificAreasDropdownMultiple(selectedAreas, selectElement, container) {
        const allSpecificAreas = new Set();
        selectedAreas.forEach(area => {
            const specificAreas = specificClinicalAreasMap[area];
            if (specificAreas) {
                specificAreas.forEach(sa => allSpecificAreas.add(sa));
            }
        });

        selectElement.innerHTML = '';
        if (allSpecificAreas.size > 0) {
            Array.from(allSpecificAreas).forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                option.textContent = area;
                selectElement.appendChild(option);
            });
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    }
});
