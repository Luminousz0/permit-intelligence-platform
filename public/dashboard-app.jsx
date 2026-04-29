const { useState, useEffect } = window.React;

function DashboardApp() {
  const [lang, setLang] = useState(localStorage.getItem('pi_lang') || 'nl');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pi_token') || '');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedAppFull, setSelectedAppFull] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const t = window.COPY[lang];

  // Check auth on mount
  useEffect(() => {
    if (!token) return;

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('pi_token');
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };
    checkAuth();
  }, [token]);

  // Fetch applications when user changes
  useEffect(() => {
    if (!user || !token) return;

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error('Fetch applications failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user, token]);

  const fetchApplicationFull = async (id) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedAppFull(data);
      }
    } catch (err) {
      console.error('Fetch application details failed:', err);
    }
  };

  const handleAddApplication = async (formData) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newApp = await res.json();
        setApplications([{ ...formData, id: newApp.id, status: newApp.status, completed_milestones: 0, created_at: new Date().toISOString() }, ...applications]);
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Add application failed:', err);
    }
  };

  const handleUpdateApplication = async (id, updates) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        // Refresh the full app data
        await fetchApplicationFull(id);
        // Update in list
        const updated = applications.map(a => a.id === id ? { ...a, ...updates } : a);
        setApplications(updated);
      }
    } catch (err) {
      console.error('Update application failed:', err);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!confirm(t.dashboard.confirmDelete)) return;
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setApplications(applications.filter(a => a.id !== id));
        setSelectedApp(null);
        setSelectedAppFull(null);
      }
    } catch (err) {
      console.error('Delete application failed:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('pi_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        alert('Auth failed');
      }
    } catch (err) {
      console.error('Auth failed:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pi_token');
    setToken('');
    setUser(null);
    setApplications([]);
  };

  const handleCardClick = (app) => {
    setSelectedApp(app.id);
    fetchApplicationFull(app.id);
  };

  // Calculate stats
  const stats = {
    total: applications.length,
    active: applications.filter(a => a.status !== 'draft' && a.status !== 'besluit').length,
    decisions: applications.filter(a => a.status === 'besluit').length,
    avgWeeks: applications.reduce((sum, a) => sum + (a.timeline_weeks || 0), 0) / Math.max(applications.length, 1)
  };

  // Status badge class
  const statusClass = (status) => {
    if (status === 'draft') return 'is-draft';
    if (status === 'submitted') return 'is-submitted';
    if (['volledigheidscheck', 'regeltoetsing'].includes(status)) return 'is-check';
    if (status === 'proceduretrack') return 'is-procedure';
    if (status === 'besluit') return 'is-besluit';
    return 'is-draft';
  };

  const daysAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? 'vandaag' : days === 1 ? '1 dag' : `${days} ${t.dashboard.daysLabel}`;
  };

  return (
    <div className="dash-container" data-aesthetic="hybrid">
      <window.SubNav
        lang={lang}
        setLang={(newLang) => {
          setLang(newLang);
          localStorage.setItem('pi_lang', newLang);
        }}
        current="dashboard.html"
        accent={{ bg: "oklch(0.68 0.16 50)", fg: "#fff" }}
        demoLabel={t.nav.demo}
        tryLabel={t.nav.tryTool}
      />

      <main className="container">
        {!user ? (
          <UnauthState t={t} setShowAuthModal={setShowAuthModal} setAuthMode={setAuthMode} />
        ) : (
          <DashboardShell
            t={t}
            lang={lang}
            applications={applications}
            stats={stats}
            loading={loading}
            selectedApp={selectedApp}
            selectedAppFull={selectedAppFull}
            setShowAddModal={setShowAddModal}
            handleCardClick={handleCardClick}
            statusClass={statusClass}
            daysAgo={daysAgo}
            handleUpdateApplication={handleUpdateApplication}
            handleDeleteApplication={handleDeleteApplication}
            onCloseDetail={() => {
              setSelectedApp(null);
              setSelectedAppFull(null);
            }}
            token={token}
          />
        )}

        {showAddModal && (
          <AddApplicationModal
            t={t}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddApplication}
          />
        )}

        {showAuthModal && (
          <AuthModal
            t={t}
            authMode={authMode}
            setAuthMode={setAuthMode}
            authEmail={authEmail}
            setAuthEmail={setAuthEmail}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            onSubmit={handleAuth}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </main>

      <window.SubFooter t={t} />
    </div>
  );
}

function UnauthState({ t, setShowAuthModal, setAuthMode }) {
  return (
    <section className="dash-unauth">
      <h2 className="dash-unauth-title">{t.dashboard.unauthTitle}</h2>
      <p className="dash-unauth-sub">{t.dashboard.unauthSub}</p>
      <div className="dash-unauth-actions">
        <button
          type="button"
          className="btn-login"
          onClick={() => {
            setAuthMode('login');
            setShowAuthModal(true);
          }}
        >
          {t.dashboard.loginBtn}
        </button>
        <button
          type="button"
          className="btn-register"
          onClick={() => {
            setAuthMode('register');
            setShowAuthModal(true);
          }}
        >
          {t.dashboard.registerBtn}
        </button>
      </div>
    </section>
  );
}

function DashboardShell({
  t, lang, applications, stats, loading, selectedApp, selectedAppFull,
  setShowAddModal, handleCardClick, statusClass, daysAgo,
  handleUpdateApplication, handleDeleteApplication, onCloseDetail, token
}) {
  return (
    <>
      <window.PageHeader
        eyebrow={t.dashboard.eyebrow}
        title={t.dashboard.title}
        sub={t.dashboard.sub}
      />

      <section style={{ paddingBottom: '48px' }}>
        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-value">{stats.total}</div>
            <p className="dash-stat-label">{t.dashboard.statsTotal}</p>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">{stats.active}</div>
            <p className="dash-stat-label">{t.dashboard.statsActive}</p>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">{stats.decisions}</div>
            <p className="dash-stat-label">{t.dashboard.statsDecisions}</p>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">{stats.avgWeeks.toFixed(1)}</div>
            <p className="dash-stat-label">{t.dashboard.statsAvgTimeline} <br/> {t.dashboard.statsWeeksSuffix}</p>
          </div>
        </div>

        <div className="dash-section-head">
          <h2>{lang === 'nl' ? 'Aanvragen' : 'Applications'}</h2>
          <button className="dash-add-btn" onClick={() => setShowAddModal(true)}>
            + {t.dashboard.addBtn}
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="app-empty">
            <h3 className="app-empty-title">{t.dashboard.emptyTitle}</h3>
            <p className="app-empty-sub">{t.dashboard.emptySub}</p>
          </div>
        ) : (
          <ul className="app-list">
            {applications.map(app => (
              <li key={app.id}>
                <div
                  className="app-card"
                  onClick={() => handleCardClick(app)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="app-card-row">
                    <h3 className="app-card-name">{app.project_name}</h3>
                    <span className={`status-badge ${statusClass(app.status)}`}>
                      {t.dashboard.statusLabels[app.status] || app.status}
                    </span>
                  </div>
                  <p className="app-card-meta">
                    {app.municipality}{app.address ? ` · ${app.address}` : ''}
                  </p>
                  {app.case_number && (
                    <p className="app-card-meta" style={{ fontSize: '12px', color: 'var(--mute)' }}>
                      Zaaknummer: {app.case_number}
                    </p>
                  )}
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div className="milestone-bar">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`milestone-segment ${i < (app.completed_milestones || 0) ? 'is-done' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="app-card-days">{daysAgo(app.created_at)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedApp && selectedAppFull && (
        <ApplicationDetailPanel
          app={selectedAppFull}
          t={t}
          lang={lang}
          statusClass={statusClass}
          onClose={onCloseDetail}
          onUpdate={handleUpdateApplication}
          onDelete={handleDeleteApplication}
          token={token}
        />
      )}
    </>
  );
}

function ApplicationDetailPanel({ app, t, lang, statusClass, onClose, onUpdate, onDelete, token }) {
  const [editNotes, setEditNotes] = useState(app.notes || '');
  const [editStatus, setEditStatus] = useState(app.status);

  return (
    <>
      <div className="app-detail-overlay" onClick={onClose} />
      <div className="app-detail-panel">
        <div className="app-detail-header">
          <div>
            <h2 className="app-detail-title">{app.project_name}</h2>
            <p className="app-detail-muni">{app.municipality}</p>
          </div>
          <button className="app-detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="app-detail-content">
          <div className="app-detail-section">
            <h3>Status</h3>
            <div style={{ marginBottom: '16px' }}>
              <span className={`status-badge ${statusClass(app.status)}`}>
                {t.dashboard.statusLabels[app.status] || app.status}
              </span>
            </div>
          </div>

          {app.address && (
            <div className="app-detail-section">
              <h3>Locatie</h3>
              <div className="app-detail-field">
                <span className="app-detail-value">{app.address}</span>
              </div>
            </div>
          )}

          {app.case_number && (
            <div className="app-detail-section">
              <h3>Zaaknummer</h3>
              <div className="app-detail-field">
                <span className="app-detail-value">{app.case_number}</span>
              </div>
            </div>
          )}

          <div className="app-detail-section">
            <h3>Mijlpalen</h3>
            <ul className="milestone-timeline">
              {(app.milestones || []).map((m) => (
                <li key={m.id} className="milestone-item">
                  <button
                    className={`milestone-dot ${m.completed_at ? 'is-done' : ''}`}
                    onClick={() => {
                      if (!m.completed_at) {
                        onUpdate(app.id, { completeMilestoneStage: m.stage });
                      }
                    }}
                    title={m.completed_at ? 'Voltooid' : 'Markeer als voltooid'}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="milestone-label">
                      {t.dashboard.milestoneStages.find(s => s.key === m.stage_key)?.label || m.stage_key}
                    </div>
                    {m.completed_at && (
                      <div className="milestone-date">
                        {new Date(m.completed_at).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US')}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="app-detail-section">
            <h3>Notities</h3>
            <textarea
              className="notes-textarea"
              placeholder={t.dashboard.notesPlaceholder}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="app-detail-actions">
          <button
            className="btn-save-notes"
            onClick={() => onUpdate(app.id, { notes: editNotes })}
          >
            {t.dashboard.saveNotes}
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(app.id)}
          >
            {t.dashboard.deleteBtn}
          </button>
        </div>
      </div>
    </>
  );
}

function AddApplicationModal({ t, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    projectName: '',
    municipality: '',
    address: '',
    projectType: '',
    caseNumber: '',
    timelineWeeks: '',
    housingUnits: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box" style={{ maxWidth: '500px', margin: '50px auto' }}>
        <div style={{ padding: '32px' }}>
          <h2 className="modal-title">{t.dashboard.addTitle}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t.dashboard.fieldProjectName}</label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.dashboard.fieldMunicipality}</label>
              <input
                type="text"
                required
                value={formData.municipality}
                onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.dashboard.fieldAddress}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.dashboard.fieldProjectType}</label>
              <input
                type="text"
                required
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.dashboard.fieldCaseNumber}</label>
              <input
                type="text"
                placeholder={t.dashboard.fieldCaseNumberPlaceholder}
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.dashboard.fieldTimeline}</label>
              <input
                type="number"
                value={formData.timelineWeeks}
                onChange={(e) => setFormData({ ...formData, timelineWeeks: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.dashboard.fieldUnits}</label>
              <input
                type="number"
                value={formData.housingUnits}
                onChange={(e) => setFormData({ ...formData, housingUnits: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.dashboard.fieldNotes}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ minHeight: '100px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid var(--hairline)',
                  borderRadius: '6px',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {t.dashboard.cancelBtn}
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {t.dashboard.submitBtn}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function AuthModal({ t, authMode, setAuthMode, authEmail, setAuthEmail, authPassword, setAuthPassword, onSubmit, onClose }) {
  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div style={{ padding: '32px' }}>
          <h2 className="modal-title">
            {authMode === 'login' ? t.dashboard.loginBtn : t.dashboard.registerBtn}
          </h2>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--ink)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                marginBottom: '12px'
              }}
            >
              {authMode === 'login' ? t.dashboard.loginBtn : t.dashboard.registerBtn}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'var(--ink-soft)',
                border: '1px solid var(--hairline)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {authMode === 'login'
                ? t.dashboard.registerBtn
                : t.dashboard.loginBtn}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

window.DashboardApp = DashboardApp;

ReactDOM.createRoot(document.getElementById("root")).render(<DashboardApp />);
