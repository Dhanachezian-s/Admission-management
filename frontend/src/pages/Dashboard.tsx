import { useEffect, useState } from 'react'
import { api } from '../lib/api'

interface Institution { id: number; name: string }
interface Campus { id: number; name: string; institution?: Institution }
interface Department { id: number; name: string; campus?: Campus }

interface GlobalStats {
  totalIntake: number
  totalAdmitted: number
  confirmed: number
  allocated: number
  pendingDocs: number
  feePending: number
  totalApplicants: number
  programSummaries: Array<{
    id: number
    name: string
    code: string
    intake: number
    admitted: number
    confirmed: number
    allocated: number
    pendingDocs: number
    feePending: number
    remaining: number
    department?: Department
  }>
  applicantsPendingDocs: Array<{ id: number; firstName: string; lastName: string; phone: string; email: string }>
  applicantsPendingFee: Array<{ id: number; firstName: string; lastName: string; phone: string; email: string }>
  globalQuotaSummary: Array<{ quotaType: string; total: number; filled: number; remaining: number }>
}

interface Program {
  id: string;
  name: string;
  code: string;
  department?: Department;
}
interface ProgramSummary {
  programName: string
  totalIntake: number
  admitted: number
  remainingSeats: number
  quotaSummary: Array<{ quotaType: string; total: number; filled: number; remaining: number }>
  pendingDocumentsApplicants: number
  feePendingApplicants: number
}

const quotaColor: Record<string, string> = {
  KCET: 'info',
  COMEDK: 'accent',
  Management: 'warning',
}

export default function Dashboard() {
  const [global, setGlobal] = useState<GlobalStats | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProg, setSelectedProg] = useState('')
  const [progSummary, setProgSummary] = useState<ProgramSummary | null>(null)
  const [error, setError] = useState('')

  // Filter states for Global Table
  const [tableInst, setTableInst] = useState('')
  const [tableCamp, setTableCamp] = useState('')
  const [tableSearch, setTableSearch] = useState('')

  // Filter states for Drill-down
  const [drillInst, setDrillInst] = useState('')
  const [drillCamp, setDrillCamp] = useState('')

  useEffect(() => {
    Promise.all([
      api<GlobalStats>('/dashboard/global'),
      api<Program[]>('/masters/programs'),
    ]).then(([g, p]) => {
      setGlobal(g)
      setPrograms(p)
    }).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!selectedProg) { setProgSummary(null); return }
    api<ProgramSummary>(`/dashboard/summary/${selectedProg}`)
      .then(setProgSummary)
      .catch((e) => setError(e.message))
  }, [selectedProg])

  // Calculate derived stats for the top cards based on table filters
  const tableFilteredSummaries = global?.programSummaries.filter(p => {
    if (tableInst && String(p.department?.campus?.institution?.id) !== tableInst) return false;
    if (tableCamp && String(p.department?.campus?.id) !== tableCamp) return false;
    if (tableSearch && !p.name.toLowerCase().includes(tableSearch.toLowerCase()) && !p.code.toLowerCase().includes(tableSearch.toLowerCase())) return false;
    return true;
  }) || [];

  const stats = {
    intake: tableFilteredSummaries.reduce((s, p) => s + p.intake, 0),
    admitted: tableFilteredSummaries.reduce((s, p) => s + p.admitted, 0),
    confirmed: tableFilteredSummaries.reduce((s, p) => s + p.confirmed, 0),
    allocated: tableFilteredSummaries.reduce((s, p) => s + p.allocated, 0),
    pendingDocs: tableFilteredSummaries.reduce((s, p) => s + p.pendingDocs, 0),
    feePending: tableFilteredSummaries.reduce((s, p) => s + p.feePending, 0),
  };

  const tableInstitutions = Array.from(new Map((global?.programSummaries || []).filter(p => p.department?.campus?.institution).map(p => [p.department!.campus!.institution!.id, p.department!.campus!.institution!])).values());
  const tableCampuses = Array.from(new Map((global?.programSummaries || []).filter(p => (!tableInst || String(p.department?.campus?.institution?.id) === tableInst) && p.department?.campus).map(p => [p.department!.campus!.id, p.department!.campus!])).values());

  const fillPct = stats.intake > 0 ? Math.round((stats.admitted / stats.intake) * 100) : 0;

  return (
    <div>
      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      {/* Global Stats */}
      {global && (
        <>
          <div className="stat-grid">
            <div className="stat-card accent">
              <div className="stat-icon">🏫</div>
              <div className="stat-value">{stats.intake}</div>
              <div className="stat-label">Total Intake</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.admitted}</div>
              <div className="stat-label">Total Admitted</div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">🪑</div>
              <div className="stat-value">{stats.confirmed}</div>
              <div className="stat-label">Confirmed</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{stats.allocated}</div>
              <div className="stat-label">Allocated (Pending)</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-icon">📋</div>
              <div className="stat-value">{stats.pendingDocs}</div>
              <div className="stat-label">Pending Docs</div>
            </div>
            <div className="stat-card warning" style={{ borderColor: 'rgba(245, 158, 11, 0.5)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))' }}>
              <div className="stat-icon">💰</div>
              <div className="stat-value">{stats.feePending}</div>
              <div className="stat-label">Fee Pending</div>
            </div>
          </div>

          {/* Overall Fill Rate */}
          <div className="card mb-4" style={{ marginBottom: 20 }}>
            <div className="card-title">📈 Overall Fill Rate</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{stats.admitted} admitted of {stats.intake} total seats</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{fillPct}%</span>
            </div>
            <div className="progress">
              <div
                className="progress-bar accent"
                style={{ width: `${fillPct}%` }}
              />
            </div>
            {global.globalQuotaSummary?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16, color: 'var(--text-secondary)' }}>
                  📊 GLOBAL QUOTA-WISE BREAKDOWN
                </div>
                <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {global.globalQuotaSummary.map((q) => {
                    const pct = Math.round((q.filled / (q.total || 1)) * 100)
                    const colorClass = quotaColor[q.quotaType] || 'accent'
                    return (
                      <div key={q.quotaType} className="quota-row" style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8 }}>
                        <div className="quota-header">
                          <span className="quota-label">
                            <span className={`badge badge-${colorClass}`}>{q.quotaType}</span>
                          </span>
                          <span className="quota-count">{q.filled} / {q.total} &nbsp;·&nbsp; {q.remaining} left</span>
                        </div>
                        <div className="progress">
                          <div
                            className={`progress-bar ${pct >= 100 ? 'danger' : colorClass}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pending Lists Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="card">
              <div className="card-title" style={{ color: 'var(--danger)' }}>📋 Pending Documents</div>
              <div className="table-wrap" style={{ maxHeight: 200, overflowY: 'auto' }}>
                <table style={{ fontSize: 13 }}>
                  <thead><tr><th>Name</th><th>Contact</th></tr></thead>
                  <tbody>
                    {global.applicantsPendingDocs?.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending documents</td></tr>}
                    {global.applicantsPendingDocs?.map((p) => (
                      <tr key={p.id}>
                        <td>{p.firstName} {p.lastName}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ color: 'var(--warning)' }}>💰 Pending Fees</div>
              <div className="table-wrap" style={{ maxHeight: 200, overflowY: 'auto' }}>
                <table style={{ fontSize: 13 }}>
                  <thead><tr><th>Name</th><th>Contact</th></tr></thead>
                  <tbody>
                    {global.applicantsPendingFee?.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending fees</td></tr>}
                    {global.applicantsPendingFee?.map((p) => (
                      <tr key={p.id}>
                        <td>{p.firstName} {p.lastName}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{p.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Program-wise table */}
          <div className="card" style={{ marginBottom: 24, padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 16, height: 16, background: 'linear-gradient(135deg, #10B981, #3B82F6)', borderRadius: 3 }}></div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Program-wise Seat Status</h3>
            </div>

            <div style={{ padding: '16px 24px', background: '#F9FAFB', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label style={{ fontSize: 10 }}>Institution</label>
                <select id="dash-inst-filter" value={tableInst} onChange={(e) => { setTableInst(e.target.value); setTableCamp(''); }} style={{ background: '#fff' }}>
                  <option value="">-- All Institutions --</option>
                  {tableInstitutions.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: 10 }}>Campus</label>
                <select id="dash-camp-filter" value={tableCamp} onChange={(e) => setTableCamp(e.target.value)} style={{ background: '#fff' }}>
                  <option value="">-- All Campuses --</option>
                  {tableCampuses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: 10 }}>Search Program</label>
                <input id="dash-search-filter" placeholder="Search by name..." value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} style={{ background: '#fff' }} />
              </div>
            </div>

            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead style={{ background: '#F9FAFB' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', width: '25%' }}>PROGRAM</th>
                    <th>CODE</th>
                    <th>INTAKE</th>
                    <th>ADMITTED</th>
                    <th>REMAINING</th>
                    <th style={{ color: 'var(--danger)' }}>PENDING DOCS</th>
                    <th style={{ color: 'var(--warning)' }}>FEE PENDING</th>
                    <th style={{ textAlign: 'right', paddingRight: 40 }}>FILL %</th>
                  </tr>
                </thead>
                <tbody>
                  {tableFilteredSummaries.map((p) => {
                    const pct = Math.round((p.admitted / (p.intake || 1)) * 100)
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setDrillInst(p.department?.campus?.institution?.id ? String(p.department.campus.institution.id) : '');
                          setDrillCamp(p.department?.campus?.id ? String(p.department.campus.id) : '');
                          setSelectedProg(String(p.id));
                          document.getElementById('dash-program-select')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Click to view details"
                      >
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.department?.campus?.institution?.name} · {p.department?.campus?.name}</div>
                        </td>
                        <td>
                          <span style={{
                            background: 'var(--accent-glow)',
                            color: 'var(--accent)',
                            padding: '4px 12px',
                            borderRadius: 16,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.05em'
                          }}>
                            {p.code}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{p.intake}</td>
                        <td style={{ fontWeight: 500 }}>{p.admitted}</td>
                        <td>
                          <span style={{
                            background: p.remaining === 0 ? '#FEF2F2' : '#F0FDF4',
                            color: p.remaining === 0 ? '#EF4444' : '#10B981',
                            padding: '4px 12px',
                            borderRadius: 6,
                            fontWeight: 600,
                            fontSize: 12
                          }}>
                            {p.remaining}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: p.pendingDocs > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{p.pendingDocs}</td>
                        <td style={{ fontWeight: 600, color: p.feePending > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{p.feePending}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingRight: 24 }}>
                            <div className="progress" style={{ width: 120, margin: 0, height: 4, background: '#E5E7EB' }}>
                              <div
                                className={`progress-bar ${pct > 90 ? 'danger' : pct > 60 ? 'warning' : 'success'}`}
                                style={{ width: `${pct}%`, background: pct === 0 ? 'transparent' : undefined }}
                              />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, minWidth: 32 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {tableFilteredSummaries.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Per-program drill-down */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 16, height: 16, background: 'linear-gradient(135deg, #3B82F6, #6366F1)', borderRadius: 3 }}></div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Program Drill-down – Quota Analysis</h3>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div className="form-group">
              <label>Institution</label>
              <select value={drillInst} onChange={(e) => { setDrillInst(e.target.value); setDrillCamp(''); setSelectedProg(''); }}>
                <option value="">-- All Institutions --</option>
                {Array.from(new Map(programs.filter(p => p.department?.campus?.institution).map(p => [p.department!.campus!.institution!.id, p.department!.campus!.institution!])).values()).map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Campus</label>
              <select value={drillCamp} onChange={(e) => { setDrillCamp(e.target.value); setSelectedProg(''); }}>
                <option value="">-- All Campuses --</option>
                {Array.from(new Map(programs.filter(p => (!drillInst || String(p.department?.campus?.institution?.id) === drillInst) && p.department?.campus).map(p => [p.department!.campus!.id, p.department!.campus!])).values()).map(camp => (
                  <option key={camp.id} value={camp.id}>{camp.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Select Program</label>
              <select
                id="dash-program-select"
                value={selectedProg}
                onChange={(e) => setSelectedProg(e.target.value)}
              >
                <option value="">-- Choose a program --</option>
                {programs
                  .filter(p => {
                    if (drillInst && String(p.department?.campus?.institution?.id) !== drillInst) return false;
                    if (drillCamp && String(p.department?.campus?.id) !== drillCamp) return false;
                    return true;
                  })
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
              </select>
            </div>
          </div>

          {progSummary && (
            <div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <div className="stat-card info" style={{ flex: '1 1 130px', padding: 16 }}>
                  <div className="stat-value" style={{ fontSize: 22 }}>{progSummary.totalIntake}</div>
                  <div className="stat-label">Total Intake</div>
                </div>
                <div className="stat-card success" style={{ flex: '1 1 130px', padding: 16 }}>
                  <div className="stat-value" style={{ fontSize: 22 }}>{progSummary.admitted}</div>
                  <div className="stat-label">Admitted</div>
                </div>
                <div className="stat-card accent" style={{ flex: '1 1 130px', padding: 16 }}>
                  <div className="stat-value" style={{ fontSize: 22 }}>{progSummary.remainingSeats}</div>
                  <div className="stat-label">Remaining</div>
                </div>
                <div className="stat-card warning" style={{ flex: '1 1 130px', padding: 16 }}>
                  <div className="stat-value" style={{ fontSize: 22 }}>{progSummary.pendingDocumentsApplicants}</div>
                  <div className="stat-label">Pending Docs</div>
                </div>
                <div className="stat-card danger" style={{ flex: '1 1 130px', padding: 16 }}>
                  <div className="stat-value" style={{ fontSize: 22 }}>{progSummary.feePendingApplicants}</div>
                  <div className="stat-label">Fee Pending</div>
                </div>
              </div>

              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12, color: 'var(--text-secondary)' }}>
                📊 QUOTA-WISE BREAKDOWN
              </div>
              {progSummary.quotaSummary.map((q) => {
                const pct = Math.round((q.filled / (q.total || 1)) * 100)
                const colorClass = quotaColor[q.quotaType] || 'accent'
                return (
                  <div key={q.quotaType} className="quota-row" style={{ padding: '16px 20px', border: '1px solid var(--border)', borderRadius: 12, background: '#F9FAFB' }}>
                    <div className="quota-header" style={{ marginBottom: 12 }}>
                      <span className="quota-label">
                        <span className={`badge badge-${colorClass}`} style={{ padding: '6px 14px', fontSize: 12 }}>{q.quotaType}</span>
                      </span>
                      <span className="quota-count" style={{ fontSize: 14, fontWeight: 600 }}>
                        {q.filled} / {q.total} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>seats used</span> · <span style={{ color: q.remaining === 0 ? 'var(--danger)' : 'var(--success)' }}>{q.remaining} remaining</span>
                      </span>
                    </div>
                    <div className="progress" style={{ height: 8, background: '#E5E7EB' }}>
                      <div
                        className={`progress-bar ${pct >= 100 ? 'danger' : colorClass}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
