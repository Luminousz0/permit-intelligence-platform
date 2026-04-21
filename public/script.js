const form = document.getElementById('analyze-form');
const results = document.getElementById('results');
const errorDiv = document.getElementById('error');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.querySelector('.btn-text');
const spinner = document.querySelector('.spinner');

let currentTemplate = null;
let currentProjectName = 'participatieverslag';

// --- Address Autocomplete ---
const addressInput = document.getElementById('address');
const datalist = document.createElement('datalist');
datalist.id = 'address-suggestions';
addressInput.setAttribute('list', 'address-suggestions');
addressInput.parentNode.appendChild(datalist);

let debounceTimer;
addressInput.addEventListener('input', function(e) {
  clearTimeout(debounceTimer);
  const query = e.target.value;

  // Don't search for very short queries
  if (query.length < 3) {
    datalist.innerHTML = '';
    return;
  }

  debounceTimer = setTimeout(async () => {
    try {
      const response = await fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(query)}&rows=5`);
      const data = await response.json();
      
      // Clear old suggestions
      datalist.innerHTML = '';
      
      // Populate new suggestions
      if (data.response && data.response.docs) {
        data.response.docs.forEach(doc => {
          const option = document.createElement('option');
          option.value = doc.weergavenaam;
          datalist.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    }
  }, 300); // Delay to avoid excessive API calls
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  submitBtn.disabled = true;
  results.classList.add('hidden');
  errorDiv.classList.add('hidden');
  
  const werkzaamheid = document.getElementById('werkzaamheid').value;
  if (!werkzaamheid) {
    errorDiv.textContent = 'Please select an activity type';
    errorDiv.classList.remove('hidden');
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    submitBtn.disabled = false;
    return;
  }
  
  const formData = {
    address: document.getElementById('address').value,
    werkzaamheid: werkzaamheid,
    housing_units: parseInt(document.getElementById('housingUnits').value) || undefined
  };
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to analyze project');
    }
    
    const data = await response.json();
    
    if (data.verslag_template) {
      currentTemplate = data.verslag_template;
      currentProjectName = data.address.split(',')[0].replace(/\s+/g, '-').toLowerCase();
    }
    
    displayResults(data);
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove('hidden');
  } finally {
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    submitBtn.disabled = false;
  }
});

function displayResults(data) {
  // Location
  document.getElementById('address-result').innerHTML = `
    <div class="address-display">
      <div class="address-main">${data.address.split(',')[0]}</div>
      <div class="address-sub">${data.address}</div>
      <div style="margin-top: 0.75rem;">
        <span class="badge badge-info">${data.municipality}</span>
      </div>
    </div>
  `;
  
  // Permit Status
  const permit = data.permit;
  let permitHtml = '';
  
  if (permit.questions_needed) {
    permitHtml = `
      <div class="permit-status-large">
        <div class="status-icon" style="background: #fef3c7;">⚠️</div>
        <div>
          <div class="status-text" style="color: #92400e;">Additional Information Required</div>
          <div style="color: var(--gray-600); font-size: 0.9rem; margin-top: 0.25rem;">
            ${permit.description}
          </div>
        </div>
      </div>
      <div class="warning-box">
        <strong>What this means</strong>
        The Omgevingsloket needs more details about your project in ${data.municipality} 
        before determining permit requirements. This is normal for your activity type.
      </div>
    `;
  } else if (permit.requires_permit) {
    permitHtml = `
      <div class="permit-status-large">
        <div class="status-icon" style="background: #fee2e2;">📋</div>
        <div>
          <div class="status-text" style="color: #991b1b;">Permit Required</div>
          <div style="color: var(--gray-600); font-size: 0.9rem; margin-top: 0.25rem;">
            ${permit.description || 'Omgevingsvergunning nodig'}
          </div>
        </div>
      </div>
    `;
  } else {
    permitHtml = `
      <div class="permit-status-large">
        <div class="status-icon" style="background: #d1fae5;">✅</div>
        <div>
          <div class="status-text" style="color: #065f46;">No Permit Required</div>
          <div style="color: var(--gray-600); font-size: 0.9rem; margin-top: 0.25rem;">
            ${permit.description || 'Geen vergunning of melding nodig'}
          </div>
        </div>
      </div>
    `;
  }
  
  document.getElementById('permit-result').innerHTML = permitHtml;
  
  // Participation
  const part = data.participation;
  let partHtml = `
    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
      <div>
        <span class="badge ${part.required === true ? 'badge-success' : part.required === false ? 'badge-danger' : 'badge-warning'}">
          ${part.required === true ? 'Verplicht' : part.required === false ? 'Niet verplicht' : 'Per geval beoordelen'}
        </span>
      </div>
      <div style="color: var(--gray-600);">
        <strong>Beleid:</strong> ${part.architecture.replace(/_/g, ' ')}
      </div>
    </div>
  `;
  
  if (part.required === 'unknown' || part.architecture === 'case_by_case') {
    partHtml += `
      <div class="warning-box">
        <strong>⚠️ ${data.municipality} heeft geen vaste participatieregels</strong>
        ${data.municipality} beoordeelt participatie per aanvraag. 
        Neem vooraf contact op met de gemeente om vertraging te voorkomen.
      </div>
    `;
  }
  
  if (part.documents_required && part.documents_required.length > 0) {
    partHtml += `
      <div style="margin-top: 1rem;">
        <strong>Vereiste documenten:</strong>
        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
          ${part.documents_required.map(doc => 
            `<span class="badge badge-info">${doc}</span>`
          ).join('')}
        </div>
      </div>
    `;
  }
  
  document.getElementById('participation-result').innerHTML = partHtml;
  
  // Next Steps
  const steps = data.participation.next_steps || [];
  let stepsHtml = '<ul class="steps-list">';
  
  steps.slice(0, 5).forEach(step => {
    stepsHtml += `
      <li class="step-item">
        <span class="step-marker">→</span>
        <span class="step-content">${step}</span>
      </li>
    `;
  });
  
  if (data.verslag_template) {
    stepsHtml += `
      <li class="step-item" style="border-bottom: none; padding-top: 1.5rem;">
        <span class="step-marker">📄</span>
        <span class="step-content">
          <button onclick="downloadTemplate()" class="btn btn-success" style="width: auto; padding: 0.75rem 1.5rem;">
            📥 Download als Word Document
          </button>
          <div style="margin-top: 0.5rem; color: var(--gray-500); font-size: 0.85rem;">
            .doc bestand — direct te openen in Microsoft Word
          </div>
        </span>
      </li>
    `;
  }
  
  stepsHtml += '</ul>';
  
  document.getElementById('next-steps-result').innerHTML = stepsHtml;
  
  results.classList.remove('hidden');
}

function downloadTemplate() {
  if (!currentTemplate) return;
  
  // Create a Blob with HTML content and .doc extension
  // Word can open HTML files with .doc extension
  const blob = new Blob([currentTemplate], { 
    type: 'application/msword' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentProjectName}-participatieverslag.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.downloadTemplate = downloadTemplate;
