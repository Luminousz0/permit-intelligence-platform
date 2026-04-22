document.addEventListener('DOMContentLoaded', function() {

  // ============================================================
  // GLOBAL VARIABLES
  // ============================================================
  let currentLanguage = 'en';
  const translations = { en: {}, nl: {} };
  let allActivities = [], filteredActivities = [], selectedIndex = -1;
  let currentTemplate = '', pendingQuestions = [], currentIdx = 0, answers = [], pendingReq = null, questionRound = 0;
  let lastAnalysisData = null;
  let isLoginMode = true;

  // DOM Elements
  const activitySearch = document.getElementById('activity-search');
  const activityDropdown = document.getElementById('activity-dropdown');
  const werkzaamheidInput = document.getElementById('werkzaamheid');
  const activityCount = document.getElementById('activity-count');
  const addressInput = document.getElementById('address');
  const addressList = document.getElementById('address-list');
  const form = document.getElementById('analyze-form');
  const resultsDiv = document.getElementById('results');
  const errDiv = document.getElementById('error');
  const submitBtn = document.getElementById('submit-btn');
  const modal = document.getElementById('question-modal');
  const qText = document.getElementById('question-text');
  const qInput = document.getElementById('question-input');
  const nextBtn = document.getElementById('question-next');
  const cancelBtn = document.getElementById('question-cancel');
  const caseTrackerCard = document.getElementById('case-tracker-card');
  const downloadBtn = document.getElementById('download-btn');
  const emailReportBtn = document.getElementById('email-report-btn');
  const reportEmailInput = document.getElementById('report-email');
  const showAuthBtn = document.getElementById('show-auth-btn');
  const authModal = document.getElementById('auth-modal');
  const authForm = document.getElementById('auth-form');
  const authTitle = document.getElementById('auth-title');
  const authSubmit = document.getElementById('auth-submit');
  const toggleAuthMode = document.getElementById('toggle-auth-mode');
  const authClose = document.getElementById('auth-close');

  // Label selectors for translation
  const LABEL_SELECTORS = {
    address: 'label[for="address"]',
    activity: 'label[for="activity-search"]',
    units: 'label[for="housingUnits"]',
    caseNumber: 'label[for="standalone-case-number"]'
  };

  // ============================================================
  // LANGUAGE TEXTS
  // ============================================================
  const TEXTS = {
    en: {
      location: 'Location', permit_status: 'Permit Status', timeline: 'Timeline Prediction',
      participation: 'Participation', next_steps: 'Next Steps', download: 'Download Word Template',
      email_report: 'Email Report', additional_info: 'Additional Information', question: 'Question',
      of: 'of', yes: 'Yes', no: 'No', enter_answer: 'Enter your answer', submit_answers: 'Submit Answers',
      next_question: 'Next Question', permit_required: 'Permit Required', no_permit: 'No Permit Required',
      additional_review: 'Additional Review Needed', more_info_needed: 'The Omgevingsloket requires more information.',
      required: 'Required', not_required: 'Not Required', case_by_case: 'Case by Case', status: 'Status',
      policy_type: 'Policy Type', documents: 'Documents', evaluates_case_by_case: 'evaluates participation on a case-by-case basis.',
      contact_municipality: 'Contact the municipality before submitting.', search_overheid: 'Search on overheid.nl',
      view_area: 'View in your area', enter_case: 'Enter a case number', searching: 'Searching...',
      expected_decision: 'Expected decision', submitted: 'Submitted', in_treatment: 'In Treatment', decision: 'Decision',
      analyze: 'Analyze Project', track: 'Track Application', address: 'Project Address', activity: 'Activity Type',
      units: 'Units (optional)', login: 'Login', signup: 'Sign Up', email: 'Email', password: 'Password', cancel: 'Cancel',
      case_number: 'Omgevingsloket Case Number', need_account: 'Need an account? Sign up', already_have_account: 'Already have an account? Login',
      weeks: 'weeks', range: 'Range', high_confidence: 'High confidence', medium_confidence: 'Medium confidence',
      limited_data: 'Limited data', based_on: 'Based on', cases: 'cases', recommendations: 'Recommendations'
    },
    nl: {
      location: 'Locatie', permit_status: 'Vergunningstatus', timeline: 'Tijdlijn Voorspelling',
      participation: 'Participatie', next_steps: 'Volgende Stappen', download: 'Word Template Downloaden',
      email_report: 'E-mail Rapport', additional_info: 'Extra Informatie', question: 'Vraag',
      of: 'van', yes: 'Ja', no: 'Nee', enter_answer: 'Voer uw antwoord in', submit_answers: 'Antwoorden Versturen',
      next_question: 'Volgende Vraag', permit_required: 'Vergunning Vereist', no_permit: 'Geen Vergunning Nodig',
      additional_review: 'Extra Beoordeling Nodig', more_info_needed: 'Het Omgevingsloket heeft meer informatie nodig.',
      required: 'Verplicht', not_required: 'Niet Verplicht', case_by_case: 'Per Geval', status: 'Status',
      policy_type: 'Beleidstype', documents: 'Documenten', evaluates_case_by_case: 'beoordeelt participatie per geval.',
      contact_municipality: 'Neem contact op met de gemeente voordat u indient.', search_overheid: 'Zoek op overheid.nl',
      view_area: 'Bekijk in uw buurt', enter_case: 'Voer een zaaknummer in', searching: 'Zoeken...',
      expected_decision: 'Verwachte beslissing', submitted: 'Ingediend', in_treatment: 'In Behandeling', decision: 'Besluit',
      analyze: 'Project Analyseren', track: 'Aanvraag Volgen', address: 'Projectadres', activity: 'Type Activiteit',
      units: 'Aantal Eenheden (optioneel)', login: 'Inloggen', signup: 'Registreren', email: 'E-mail', password: 'Wachtwoord', cancel: 'Annuleren',
      case_number: 'Omgevingsloket Zaaknummer', need_account: 'Nog geen account? Registreren', already_have_account: 'Al een account? Inloggen',
      weeks: 'weken', range: 'Bereik', high_confidence: 'Hoge betrouwbaarheid', medium_confidence: 'Gemiddelde betrouwbaarheid',
      limited_data: 'Beperkte data', based_on: 'Gebaseerd op', cases: 'zaken', recommendations: 'Aanbevelingen'
    }
  };
  function t(key) { return TEXTS[currentLanguage]?.[key] || TEXTS.en[key] || key; }

  // ============================================================
  // TRANSLATION HELPERS
  // ============================================================
  function translateHeaders() {
    try {
      const headers = document.querySelectorAll('.result-card h3');
      if (headers.length >= 5) {
        if (headers[0]) headers[0].textContent = t('location');
        if (headers[1]) headers[1].textContent = t('permit_status');
        if (headers[2]) headers[2].textContent = t('timeline');
        if (headers[3]) headers[3].textContent = t('participation');
        if (headers[4]) headers[4].textContent = t('next_steps');
      }
    } catch(e) {}
    try { if (downloadBtn) downloadBtn.textContent = t('download'); } catch(e) {}
    try { if (emailReportBtn) emailReportBtn.textContent = t('email_report'); } catch(e) {}
    try { if (reportEmailInput) reportEmailInput.placeholder = currentLanguage === 'nl' ? 'Uw e-mailadres' : 'Your email'; } catch(e) {}
    try { document.querySelector('[data-tab="analyze"]').textContent = t('analyze'); } catch(e) {}
    try { document.querySelector('[data-tab="track"]').textContent = t('track'); } catch(e) {}
    try { document.querySelector(LABEL_SELECTORS.address).textContent = t('address'); } catch(e) {}
    try { document.querySelector(LABEL_SELECTORS.activity).textContent = t('activity'); } catch(e) {}
    try { document.querySelector(LABEL_SELECTORS.units).textContent = t('units'); } catch(e) {}
    try { document.querySelector(LABEL_SELECTORS.caseNumber).textContent = t('case_number'); } catch(e) {}
    try { if (showAuthBtn) showAuthBtn.textContent = t('login'); } catch(e) {}
    try { if (authTitle) authTitle.textContent = isLoginMode ? t('login') : t('signup'); } catch(e) {}
    try { if (authSubmit) authSubmit.textContent = isLoginMode ? t('login') : t('signup'); } catch(e) {}
    try { document.getElementById('standalone-track-btn').textContent = t('track'); } catch(e) {}
  }

  // ============================================================
  // ACTIVITIES LOADING
  // ============================================================
  async function loadActivities() {
    try {
      const res = await fetch('/api/werkzaamheden');
      allActivities = await res.json();
      filteredActivities = allActivities;
      activityCount.textContent = allActivities.length;
      window.allActivities = allActivities;
    } catch (err) { console.error(err); }
  }
  function renderDropdown() {
    if (filteredActivities.length === 0) {
      activityDropdown.innerHTML = '<div class="no-results">No matching activities</div>';
      return activityDropdown.classList.add('show');
    }
    const html = filteredActivities.slice(0, 50).map((a, i) => `<div class="dropdown-item ${i===selectedIndex?'selected':''}" data-value="${a}">${a}</div>`).join('');
    activityDropdown.innerHTML = html;
    activityDropdown.classList.add('show');
    document.querySelectorAll('.dropdown-item').forEach(item => item.addEventListener('click', function(){
      activitySearch.value = this.dataset.value;
      werkzaamheidInput.value = this.dataset.value;
      activityDropdown.classList.remove('show');
    }));
  }
  activitySearch.addEventListener('input', function(){
    filteredActivities = allActivities.filter(a => a.toLowerCase().includes(this.value.toLowerCase()));
    selectedIndex = -1;
    renderDropdown();
  });
  activitySearch.addEventListener('focus', ()=> { if(allActivities.length) renderDropdown(); });
  activitySearch.addEventListener('keydown', e => {
    const items = document.querySelectorAll('.dropdown-item');
    if(!items.length) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); selectedIndex = Math.min(selectedIndex+1, items.length-1); renderDropdown(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); selectedIndex = Math.max(selectedIndex-1, -1); renderDropdown(); }
    else if(e.key==='Enter'){ e.preventDefault(); if(selectedIndex>=0){ const v=items[selectedIndex].dataset.value; activitySearch.value=v; werkzaamheidInput.value=v; activityDropdown.classList.remove('show'); } }
    else if(e.key==='Escape') activityDropdown.classList.remove('show');
  });
  document.addEventListener('click', e => { if(!activitySearch.contains(e.target) && !activityDropdown.contains(e.target)) activityDropdown.classList.remove('show'); });

  // ============================================================
  // ADDRESS AUTOCOMPLETE
  // ============================================================
  let addrTimer;
  addressInput.addEventListener('input', function(){
    clearTimeout(addrTimer);
    const q = this.value;
    if(q.length<3) return;
    addrTimer = setTimeout(async ()=>{
      const res = await fetch(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(q)}&rows=5`);
      const data = await res.json();
      addressList.innerHTML = '';
      data.response?.docs?.forEach(d => { const o = document.createElement('option'); o.value = d.weergavenaam; addressList.appendChild(o); });
    }, 300);
  });

  // ============================================================
  // QUESTION MODAL
  // ============================================================
  function showModal(questions, reqData) {
    questionRound++;
    pendingQuestions = questions; currentIdx = 0; answers = []; pendingReq = reqData;
    displayQuestion();
    modal.style.display = 'flex';
  }
  function displayQuestion() {
    const q = pendingQuestions[currentIdx];
    qText.innerHTML = `<strong>${t('question')} ${currentIdx+1} ${t('of')} ${pendingQuestions.length}</strong><br><br>${q.text}`;
    let html = '';
    if(q.answerType==='boolean') html = `<select id="q-input"><option value="ja">${t('yes')}</option><option value="nee">${t('no')}</option></select>`;
    else if(q.answerType==='numeriek') html = `<input type="number" id="q-input" value="0">`;
    else if(q.options) { html = `<select id="q-input">${q.options.map(o=>`<option value="${o.id}">${o.label}</option>`).join('')}</select>`; }
    else html = `<input type="text" id="q-input" placeholder="${t('enter_answer')}">`;
    qInput.innerHTML = html;
    nextBtn.textContent = currentIdx === pendingQuestions.length-1 ? t('submit_answers') : t('next_question');
  }
  nextBtn.onclick = async () => {
    const inp = document.getElementById('q-input');
    answers.push({ id: pendingQuestions[currentIdx].id, answer: inp.value, answerType: pendingQuestions[currentIdx].answerType });
    if(currentIdx < pendingQuestions.length-1) { currentIdx++; displayQuestion(); }
    else {
      modal.style.display = 'none'; pendingReq.answers = answers;
      submitBtn.disabled = true; submitBtn.textContent = '...';
      try {
        const res = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(pendingReq) });
        const data = await res.json();
        if(data.permit.questions_needed) showModal(data.permit.questions, pendingReq);
        else { questionRound=0; displayResults(data); submitBtn.disabled=false; submitBtn.textContent=t('analyze'); }
      } catch(err) { errDiv.textContent=err.message; errDiv.style.display='block'; submitBtn.disabled=false; }
    }
  };
  cancelBtn.onclick = ()=>{ modal.style.display='none'; submitBtn.disabled=false; submitBtn.textContent=t('analyze'); };

  // ============================================================
  // FORM SUBMIT
  // ============================================================
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if(!werkzaamheidInput.value) { errDiv.textContent='Select an activity'; errDiv.style.display='block'; return; }
    submitBtn.disabled=true; submitBtn.textContent='...'; resultsDiv.style.display='none'; errDiv.style.display='none';
    const req = { address: addressInput.value, werkzaamheid: werkzaamheidInput.value, housing_units: parseInt(document.getElementById('housingUnits').value)||undefined };
    try {
      const res = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(req) });
      const data = await res.json();
      if(data.permit.questions_needed) showModal(data.permit.questions, req);
      else { displayResults(data); submitBtn.disabled=false; submitBtn.textContent=t('analyze'); }
    } catch(err) { errDiv.textContent=err.message; errDiv.style.display='block'; submitBtn.disabled=false; }
  });

  // ============================================================
  // TIMELINE PREDICTION
  // ============================================================
  async function loadTimelinePrediction(municipality, projectType, housingUnits) {
    const el = document.getElementById('timeline-result');
    if(!el) return;
    el.innerHTML = '<p>Calculating...</p>';
    try {
      const res = await fetch('/api/predict-timeline', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({municipality, projectType, housingUnits}) });
      const d = await res.json();
      const conf = document.getElementById('timeline-confidence');
      if(conf) conf.className = `status-indicator ${d.confidence==='high'?'success':(d.confidence==='medium'?'info':'warning')}`;
      el.innerHTML = `
        <div style="margin-bottom:1.5rem">
          <div style="display:flex; align-items:baseline; gap:1rem"><span style="font-size:2rem; font-weight:450">${d.predictedWeeks.average} ${t('weeks')}</span><span style="color:var(--text-tertiary)">${t('range')}: ${d.predictedWeeks.minimum}–${d.predictedWeeks.maximum}</span></div>
          <span class="architecture-badge">${d.confidence==='high'?t('high_confidence'):(d.confidence==='medium'?t('medium_confidence'):t('limited_data'))}</span>
          <span class="municipality-tag" style="margin-left:0.5rem">${t('based_on')} ${d.basedOnCases} ${t('cases')}</span>
        </div>
        <div class="steps-list">${d.breakdown.map(s=>`<div class="step-item"><span class="step-marker">${s.typicalWeeks}w</span><span class="step-content"><strong>${s.stage}</strong><br><span style="font-size:0.85rem; color:var(--text-tertiary)">${s.description}</span></span></div>`).join('')}</div>
        <div class="notice-box"><p><strong>${t('recommendations')}</strong></p><ul>${d.recommendations.map(r=>`<li>${r}</li>`).join('')}</ul></div>
      `;
    } catch(err) { el.innerHTML = `<p style="color:#c00">${err.message}</p>`; }
  }

  // ============================================================
  // DISPLAY RESULTS
  // ============================================================
  function displayResults(data) {
    lastAnalysisData = data;
    document.getElementById('address-result').innerHTML = `<div class="address-primary">${data.address.split(',')[0]}</div><div class="address-secondary">${data.address}</div><span class="municipality-tag">${data.municipality}</span>`;
    const p = data.permit;
    let permitHtml, statusClass, decisionText;
    if(p.questions_needed) {
      statusClass='review'; decisionText=t('additional_review');
      permitHtml = `<div class="permit-decision"><div class="decision-primary ${statusClass}">${decisionText}</div><div class="decision-secondary">${t('more_info_needed')}</div></div>`;
    } else if(p.requires_permit) {
      statusClass='required'; decisionText=t('permit_required');
      permitHtml = `<div class="permit-decision"><div class="decision-primary ${statusClass}">${decisionText}</div><div class="decision-secondary">${p.description || (currentLanguage==='nl'?'Omgevingsvergunning vereist':'Permit required')}</div></div>`;
    } else {
      statusClass='approved'; decisionText=t('no_permit');
      permitHtml = `<div class="permit-decision"><div class="decision-primary ${statusClass}">${decisionText}</div><div class="decision-secondary">${p.description || (currentLanguage==='nl'?'Geen vergunning nodig':'No permit required')}</div></div>`;
    }
    document.getElementById('permit-result').innerHTML = permitHtml;
    const part = data.participation;
    let reqDisplay, reqClass;
    if(part.required===true) { reqDisplay=t('required'); reqClass='required'; }
    else if(part.required===false) { reqDisplay=t('not_required'); reqClass='approved'; }
    else { reqDisplay=t('case_by_case'); reqClass='review'; }
    let partHtml = `<div class="participation-detail">
      <div class="detail-row"><span class="detail-label">${t('status')}</span><span class="detail-value"><span class="decision-primary ${reqClass}" style="font-size:1rem">${reqDisplay}</span></span></div>
      <div class="detail-row"><span class="detail-label">${t('policy_type')}</span><span class="detail-value"><span class="architecture-badge">${part.architecture.replace(/_/g,' ')}</span></span></div>`;
    if(part.documents_required?.length) partHtml += `<div class="detail-row"><span class="detail-label">${t('documents')}</span><span class="detail-value">${part.documents_required.map(d=>`<span class="document-tag">${d}</span>`).join('')}</span></div>`;
    partHtml += '</div>';
    if(part.required==='unknown' || part.architecture==='case_by_case') partHtml += `<div class="notice-box"><p><strong>${data.municipality} ${t('evaluates_case_by_case')}</strong><br>${t('contact_municipality')}</p></div>`;
    document.getElementById('participation-result').innerHTML = partHtml;
    document.getElementById('next-steps-result').innerHTML = '<ul class="steps-list">' + (part.next_steps||[]).slice(0,4).map(s=>`<li class="step-item"><span class="step-marker">—</span><span class="step-content">${s}</span></li>`).join('') + '</ul>';
    currentTemplate = data.verslag_template;
    resultsDiv.style.display = 'block';
    if(caseTrackerCard) caseTrackerCard.style.display = 'block';
    const pt = werkzaamheidInput.value;
    const hu = parseInt(document.getElementById('housingUnits').value)||undefined;
    let mt = 'other';
    if(pt.toLowerCase().includes('woning')) mt='housing_new';
    else if(pt.toLowerCase().includes('zonne')||pt.toLowerCase().includes('wind')) mt='renewable_energy';
    loadTimelinePrediction(data.municipality, mt, hu);
    translateHeaders();
    // Setup results tracker after display
    setTimeout(() => {
      const input = document.getElementById('case-number-input');
      const btn = document.getElementById('track-case-btn');
      const result = document.getElementById('case-tracker-result');
      const indicator = document.getElementById('case-status-indicator');
      if (btn && input && result) {
        btn.onclick = async () => {
          const caseNumber = input.value.trim();
          if (!caseNumber) { result.innerHTML = `<p>${t('enter_case')}</p>`; return; }
          result.innerHTML = `<p>${t('searching')}</p>`;
          try {
            const res = await fetch('/api/track-case', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({caseNumber}) });
            const data = await res.json();
            result.innerHTML = renderTracker(data);
            if (indicator) indicator.className = `status-indicator ${data.progress===100?'success':(data.progress>=50?'info':'warning')}`;
          } catch(e) { result.innerHTML = `<p style="color:#c00">${e.message}</p>`; }
        };
      }
    }, 100);
  }

  // ============================================================
  // ENHANCED TRACKER
  // ============================================================
  function renderTracker(status) {
    const progress = status.progress || 10;
    const color = progress===100 ? '#0d7c0d' : (progress>=50 ? '#06c' : '#b85c00');
    return `
      <div style="margin-bottom:1.5rem">
        <div style="display:flex; align-items:center; justify-content:space-between"><span style="font-size:1.1rem; font-weight:500">${status.caseNumber}</span><span style="color:${color}; font-weight:500">${status.statusLabel}</span></div>
        <div style="background:var(--border-light); height:6px; border-radius:3px; margin:1.5rem 0"><div style="background:${color}; width:${progress}%; height:6px; border-radius:3px"></div></div>
        <div style="display:flex; justify-content:space-between; margin:1rem 0 1.5rem">
          <div style="text-align:center; flex:1"><div style="width:12px;height:12px;background:${progress>=20?color:'var(--border-medium)'};border-radius:50%;margin:0 auto 0.5rem;"></div><span style="font-size:0.75rem;color:var(--text-tertiary);">${t('submitted')}</span></div>
          <div style="text-align:center; flex:1"><div style="width:12px;height:12px;background:${progress>=50?color:'var(--border-medium)'};border-radius:50%;margin:0 auto 0.5rem;"></div><span style="font-size:0.75rem;color:var(--text-tertiary);">${t('in_treatment')}</span></div>
          <div style="text-align:center; flex:1"><div style="width:12px;height:12px;background:${progress>=100?color:'var(--border-medium)'};border-radius:50%;margin:0 auto 0.5rem;"></div><span style="font-size:0.75rem;color:var(--text-tertiary);">${t('decision')}</span></div>
        </div>
      </div>
      ${status.expectedDecisionDate ? `<div class="notice-box" style="margin-bottom:1.5rem"><p><strong>${t('expected_decision')}:</strong> ${status.expectedDecisionDate}</p></div>` : ''}
      <div style="display:flex; gap:1rem; flex-wrap:wrap">
        <a href="${status.searchUrl}" target="_blank" class="btn" style="flex:1; text-align:center; text-decoration:none; padding:0.75rem">${t('search_overheid')} →</a>
        <a href="${status.directUrl}" target="_blank" class="btn btn-success" style="flex:1; text-align:center; text-decoration:none; padding:0.75rem">${t('view_area')} →</a>
      </div>
    `;
  }

  // Standalone tracker (Track tab)
  setTimeout(() => {
    const input = document.getElementById('standalone-case-number');
    const btn = document.getElementById('standalone-track-btn');
    const result = document.getElementById('standalone-tracker-result');
    if (btn && input && result) {
      btn.onclick = async () => {
        const caseNumber = input.value.trim();
        if (!caseNumber) { result.innerHTML = `<p>${t('enter_case')}</p>`; result.style.display = 'block'; return; }
        result.innerHTML = `<p>${t('searching')}</p>`; result.style.display = 'block';
        try {
          const res = await fetch('/api/track-case', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({caseNumber}) });
          const data = await res.json();
          result.innerHTML = `<div class="result-card" style="margin-top:0;">${renderTracker(data)}</div>`;
        } catch(e) { result.innerHTML = `<p style="color:#c00">${e.message}</p>`; }
      };
    }
  }, 300);

  // ============================================================
  // TABS
  // ============================================================
  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', ()=>{
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
    if(tab==='track') resultsDiv.style.display='none';
  }));

  // ============================================================
  // DOWNLOAD & EMAIL
  // ============================================================
  downloadBtn.onclick = ()=>{
    if(!currentTemplate) return;
    const blob = new Blob([currentTemplate], {type:'application/msword'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='participatieverslag.doc'; a.click();
  };
  emailReportBtn.onclick = async ()=>{
    const email = reportEmailInput.value;
    if(!email) return alert('Enter email');
    try {
      const res = await fetch('/api/email-report', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email, reportHtml: resultsDiv.innerHTML, subject:'Permit Intelligence Report'}) });
      const d = await res.json();
      alert(`Report sent! Preview: ${d.previewUrl}`);
    } catch(err) { alert('Error sending report'); }
  };

  // ============================================================
  // AUTH
  // ============================================================
  function showAuthModal() { authModal.style.display='flex'; }
  function hideAuthModal() { authModal.style.display='none'; }
  if(showAuthBtn) showAuthBtn.onclick = showAuthModal;
  if(authClose) authClose.onclick = hideAuthModal;
  if(toggleAuthMode) toggleAuthMode.onclick = (e)=>{
    e.preventDefault(); isLoginMode=!isLoginMode;
    authTitle.textContent = isLoginMode ? t('login') : t('signup');
    authSubmit.textContent = isLoginMode ? t('login') : t('signup');
    toggleAuthMode.textContent = isLoginMode ? t('need_account') : t('already_have_account');
  };
  if(authForm) authForm.onsubmit = async (e)=>{
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const ep = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(ep, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
    const d = await res.json();
    if(res.ok) { if(d.token) { localStorage.setItem('authToken', d.token); localStorage.setItem('userEmail', email); } hideAuthModal(); }
    else alert(d.error);
  };

  // ============================================================
  // LANGUAGE SWITCHER
  // ============================================================
  async function loadLanguage(lang) {
    try { const r = await fetch(`/locales/${lang}.json`); translations[lang] = await r.json(); } catch(e){}
  }
  async function initLanguage() {
    await loadLanguage('en'); await loadLanguage('nl');
    const browser = navigator.language.startsWith('nl') ? 'nl' : 'en';
    applyLanguage(browser);
  }
  function applyLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active', b.dataset.lang===lang));
    translateHeaders();
    if(modal.style.display==='flex' && pendingQuestions.length) displayQuestion();
    if(resultsDiv.style.display==='block' && lastAnalysisData) displayResults(lastAnalysisData);
  }
  document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click', ()=>applyLanguage(b.dataset.lang)));

  // ============================================================
  // START
  // ============================================================
  loadActivities();
  initLanguage();
});
