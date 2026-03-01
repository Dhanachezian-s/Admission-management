import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

type Applicant = {
  id: number
  firstName: string
  lastName: string
  category: string
  quotaType: 'KCET' | 'COMEDK' | 'Management'
  documentStatus: string
  feeStatus: string
  allotmentNumber?: string
  admissions?: Array<{ id: number; quotaType: string; status: string; program?: { id: number } }>
}
type Institution = { id: number; name: string };
type Campus = { id: number; name: string; institution?: Institution };
type Program = { id: number; name: string; code: string; department?: { campus?: Campus } }
type SeatsInfo = Array<{ quotaType: string; total: number; used: number; remaining: number }>
type AdmissionResult = { admissionNumber: string; status: string }

const statusColor = {
  success: { bg: 'var(--success-bg)', color: 'var(--success)', border: 'rgba(16,185,129,0.25)' },
  danger: { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'rgba(239,68,68,0.25)' },
  info: { bg: 'var(--info-bg)', color: 'var(--info)', border: 'rgba(59,130,246,0.25)' },
}

export default function Allocation() {
  const [searchParams] = useSearchParams()
  const preApplicantId = searchParams.get('applicantId') || ''

  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [selApplicant, setSelApplicant] = useState(preApplicantId)
  const [selProgram, setSelProgram] = useState('')
  const [selInst, setSelInst] = useState('')
  const [selCamp, setSelCamp] = useState('')
  const [selQuota, setSelQuota] = useState<'KCET' | 'COMEDK' | 'Management'>('KCET')
  const [allotmentNumber, setAllotmentNumber] = useState('')
  const [seatsInfo, setSeatsInfo] = useState<SeatsInfo>([])
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [admitted, setAdmitted] = useState<AdmissionResult | null>(null)

  async function loadData() {
    const [apps, progs] = await Promise.all([
      api<Applicant[]>('/applicants'),
      api<Program[]>('/masters/programs'),
    ])
    setApplicants(apps)
    setPrograms(progs)
    // If a pre-selected applicant exists (from URL), load their details now
    if (preApplicantId) {
      loadApplicantDetails(preApplicantId, progs)
    }
  }

  async function loadApplicantDetails(id: string, loadedPrograms?: Program[]) {
    if (!id) return
    try {
      const details = await api<Applicant>(`/applicants/${id}`)
      // Pre-fill allotment number if available
      if (details.allotmentNumber) {
        setAllotmentNumber(details.allotmentNumber)
      } else {
        setAllotmentNumber('')
      }

      let initialQuota = details.quotaType;

      // check if the user has an existing admission
      const existingAdmission = details.admissions?.find(a => a.status === 'Allocated' || a.status === 'Confirmed')
      if (existingAdmission && existingAdmission.program) {
        // prefill dropdowns
        setSelProgram(String(existingAdmission.program.id));
        const progsList = loadedPrograms || programs;
        const p = progsList.find(p => p.id === existingAdmission.program?.id);
        if (p?.department?.campus) {
          setSelCamp(String(p.department.campus.id));
          if (p.department.campus.institution) {
            setSelInst(String(p.department.campus.institution.id));
          }
        }
        if (existingAdmission.quotaType) {
          initialQuota = existingAdmission.quotaType as any;
        }
      } else {
        setSelProgram('');
        setSelCamp('');
        setSelInst('');
      }

      // Auto-set quota to applicant's registered quota or existing admission quota
      if (initialQuota) {
        setSelQuota(initialQuota as any)
      }
      // Update the applicant in the list with full details (including admissions)
      setApplicants(prev => prev.map(a => a.id === details.id ? { ...a, ...details } : a))
    } catch { /* ignore */ }
  }

  useEffect(() => { loadData().catch((e) => setMsg({ text: e.message, type: 'danger' })) }, [])

  // When applicant changes, load their full details (quota, allotment, admissions)
  useEffect(() => {
    if (selApplicant) {
      loadApplicantDetails(selApplicant)
    } else {
      setAllotmentNumber('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selApplicant])

  useEffect(() => {
    if (!selProgram) { setSeatsInfo([]); return }
    api<SeatsInfo>(`/allocation/remaining/${selProgram}`)
      .then(setSeatsInfo)
      .catch((e) => setMsg({ text: e.message, type: 'danger' }))
  }, [selProgram])

  const selectedApplicantData = applicants.find((a) => String(a.id) === String(selApplicant))

  async function allocateSeat() {
    const currentQuota = seatsInfo.find(s => s.quotaType === selQuota)
    if (currentQuota && currentQuota.remaining <= 0) {
      window.alert(`The seat for ${selQuota} quota is already filled! Cannot allocate.`)
      return
    }

    setLoading(true)
    setMsg(null)
    try {
      await api('/allocation/allocate', {
        method: 'POST',
        data: {
          applicantId: selApplicant,
          programId: selProgram,
          quotaType: selQuota,
          allotmentNumber: (selQuota !== 'Management') ? allotmentNumber : undefined,
        },
      })
      setMsg({ text: '✅ Seat allocated successfully! Verify documents and mark fee as paid, then confirm admission.', type: 'success' })
      const seatsUpdated = await api<SeatsInfo>(`/allocation/remaining/${selProgram}`)
      setSeatsInfo(seatsUpdated)
      // Reload applicant details so the Confirm button reflects the new allocated status
      if (selApplicant) await loadApplicantDetails(selApplicant)
    } catch (e: any) {
      setMsg({ text: `⚠️ ${e.message}`, type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  async function updateDocStatus(documentStatus: string) {
    if (!selApplicant) return
    try {
      await api(`/applicants/${selApplicant}/document-status`, {
        method: 'PATCH',
        data: { documentStatus },
      })
      await loadData()
      setMsg({ text: `📋 Document status updated to "${documentStatus}"`, type: 'info' })
    } catch (e: any) {
      setMsg({ text: e.message, type: 'danger' })
    }
  }

  async function markFeePaid() {
    if (!selApplicant) return
    try {
      await api(`/applicants/${selApplicant}/fee-status`, {
        method: 'PATCH',
        data: { feeStatus: 'Paid' },
      })
      await loadData()
      setMsg({ text: '💰 Fee status marked as Paid', type: 'success' })
    } catch (e: any) {
      setMsg({ text: e.message, type: 'danger' })
    }
  }

  async function confirmAdmission() {
    if (!selApplicant || !selProgram) return
    setLoading(true)
    setMsg(null)
    try {
      const result = await api<AdmissionResult>('/allocation/confirm', {
        method: 'POST',
        data: { applicantId: selApplicant, programId: selProgram },
      })
      setAdmitted(result)
      setMsg({ text: `🎉 Admission Confirmed! Number: ${result.admissionNumber}`, type: 'success' })
    } catch (e: any) {
      setMsg({ text: `⚠️ ${e.message}`, type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const quotaColorMap: Record<string, string> = {
    KCET: 'info',
    COMEDK: 'accent',
    Management: 'warning',
  }

  const availableInstitutions = Array.from(new Map(programs.filter(p => p.department?.campus?.institution).map(p => [p.department!.campus!.institution!.id, p.department!.campus!.institution!])).values());
  const availableCampuses = Array.from(new Map(programs.filter(p => (!selInst || String(p.department?.campus?.institution?.id) === selInst) && p.department?.campus).map(p => [p.department!.campus!.id, p.department!.campus!])).values());

  const filteredPrograms = programs.filter(p => {
    if (selInst && String(p.department?.campus?.institution?.id) !== selInst) return false;
    if (selCamp && String(p.department?.campus?.id) !== selCamp) return false;
    return true;
  });

  const hasInProgressAdmission = Boolean(selectedApplicantData?.admissions?.some(ad => ad.status === 'Allocated' || ad.status === 'Confirmed'))

  return (
    <div>
      {msg && (
        <div
          className={`alert alert-${msg.type}`}
          style={{ fontSize: 14, marginBottom: 20 }}
        >
          {msg.text}
        </div>
      )}

      {admitted && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
          border: '1px solid rgba(16,185,129,0.3)',
          marginBottom: 20,
          textAlign: 'center',
          padding: 32,
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)', marginBottom: 4 }}>Admission Confirmed!</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
            {admitted.admissionNumber}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            This admission number is unique and immutable.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Applicant */}
        <div>
          <div className="card" style={{ marginBottom: 16, padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, height: 14, background: 'var(--info)', borderRadius: 3 }}></div>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Select Applicant</h3>
            </div>
            <div style={{ padding: 20 }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11 }}>Choose Applicant</label>
                <select
                  id="alloc-applicant"
                  value={selApplicant}
                  onChange={(e) => setSelApplicant(e.target.value)}
                >
                  <option value="">-- Search Applicant --</option>
                  {applicants
                    .filter(a => {
                      const isConfirmed = a.admissions?.some(ad => ad.status === 'Confirmed');
                      return !isConfirmed || String(a.id) === String(selApplicant);
                    })
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} ({a.category}) [{a.quotaType}]
                      </option>
                    ))}
                </select>
              </div>

              {selectedApplicantData && (
                <div style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 16,
                  fontSize: 13,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Category</span>
                    <span className="badge badge-info" style={{ borderRadius: 4 }}>{selectedApplicantData.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Quota</span>
                    <span className={`badge badge-${quotaColorMap[selectedApplicantData.quotaType]}`} style={{ borderRadius: 4 }}>
                      {selectedApplicantData.quotaType}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Documents</span>
                    <span className={`badge ${selectedApplicantData.documentStatus === 'Verified' ? 'badge-success' : selectedApplicantData.documentStatus === 'Submitted' ? 'badge-warning' : 'badge-danger'}`} style={{ borderRadius: 4 }}>
                      {selectedApplicantData.documentStatus}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Fee</span>
                    <span className={`badge ${selectedApplicantData.feeStatus === 'Paid' ? 'badge-success' : 'badge-danger'}`} style={{ borderRadius: 4 }}>
                      {selectedApplicantData.feeStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document & Fee actions */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, height: 14, background: 'var(--success)', borderRadius: 3 }}></div>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Document & Fee Management</h3>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <button
                  id="btn-docs-submitted"
                  className="btn btn-warning w-full"
                  disabled={!selApplicant}
                  onClick={() => updateDocStatus('Submitted')}
                >
                  📤 Mark Docs Submitted
                </button>
                <button
                  id="btn-docs-verified"
                  className="btn btn-success w-full"
                  disabled={!selApplicant}
                  onClick={() => updateDocStatus('Verified')}
                >
                  ✅ Mark Docs Verified
                </button>
                <button
                  id="btn-fee-paid"
                  className="btn btn-success w-full"
                  disabled={!selApplicant || selectedApplicantData?.feeStatus === 'Paid'}
                  onClick={markFeePaid}
                >
                  💰 Mark Fee as Paid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Program & Allocation */}
        <div className="right-side">
          <div className="card" style={{ marginBottom: 16, padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 14, height: 14, background: 'var(--accent)', borderRadius: 3 }}></div>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Program & Quota Selection</h3>
            </div>
            <div style={{ padding: 20 }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11 }}>Institution</label>
                <select value={selInst} onChange={(e) => { setSelInst(e.target.value); setSelCamp(''); setSelProgram(''); }} disabled={hasInProgressAdmission}>
                  <option value="">-- Select Institution --</option>
                  {availableInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11 }}>Campus</label>
                <select value={selCamp} onChange={(e) => { setSelCamp(e.target.value); setSelProgram(''); }} disabled={(!selInst && availableCampuses.length === 0) || hasInProgressAdmission}>
                  <option value="">-- Select Campus --</option>
                  {availableCampuses.map((camp) => (
                    <option key={camp.id} value={camp.id}>{camp.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11 }}>Program</label>
                <select id="alloc-program" value={selProgram} onChange={(e) => setSelProgram(e.target.value)} disabled={hasInProgressAdmission}>
                  <option value="">-- Choose Program --</option>
                  {filteredPrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11 }}>Quota Type</label>
                <select id="alloc-quota" value={selQuota} onChange={(e) => setSelQuota(e.target.value as any)} disabled={hasInProgressAdmission}>
                  <option value="KCET">KCET (Government)</option>
                  <option value="COMEDK">COMEDK (Government)</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              {(selQuota === 'KCET' || selQuota === 'COMEDK') && (
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11 }}>Government Allotment Number</label>
                  <input
                    id="alloc-allotment"
                    placeholder="Enter allotment number"
                    value={allotmentNumber}
                    onChange={(e) => setAllotmentNumber(e.target.value)}
                    disabled={hasInProgressAdmission}
                  />
                </div>
              )}

              {/* Seats availability */}
              {seatsInfo.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Current Availability
                  </div>
                  {seatsInfo.map((s) => {
                    const pct = Math.round((s.used / (s.total || 1)) * 100)
                    const isFull = s.remaining === 0
                    const color = quotaColorMap[s.quotaType]
                    return (
                      <div key={s.quotaType} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span className={`badge badge-${color}`} style={{ padding: '3px 10px', fontSize: 11 }}>{s.quotaType}</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>
                            <span style={{ color: isFull ? 'var(--danger)' : 'var(--text-primary)' }}>{s.used} / {s.total}</span>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>
                              {isFull ? '(FULL)' : `(${s.remaining} left)`}
                            </span>
                          </span>
                        </div>
                        <div className="progress" style={{ height: 6, background: '#F3F4F6' }}>
                          <div
                            className={`progress-bar ${isFull ? 'danger' : color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Quota mismatch warning */}
              {selectedApplicantData && selQuota !== selectedApplicantData.quotaType && (
                <div style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.35)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 12.5,
                  color: 'var(--warning)',
                  marginBottom: 12,
                }}>
                  ⚠️ Warning: Applicant registered under <strong>{selectedApplicantData.quotaType}</strong> but you are allocating under <strong>{selQuota}</strong>. Confirm this is intentional.
                </div>
              )}

              <button
                id="btn-allocate-seat"
                className="btn btn-primary w-full"
                onClick={allocateSeat}
                disabled={loading || !selApplicant || !selProgram}
                style={{ padding: '12px', fontSize: 14 }}
              >
                {loading ? '⏳ Processing…' : '🪑 Allocate Seat'}
              </button>
            </div>
          </div>

          {/* Confirm Admission */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(79,70,229,0.04))',
            border: '1px solid var(--border)',
          }}>
            <div className="card-title">🎓 Confirm Admission</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.7 }}>
              Confirmation requires:<br />
              ✅ Seat allocated &nbsp;·&nbsp; 📋 Docs verified &nbsp;·&nbsp; 💰 Fee paid
            </p>
            {(() => {
              const hasAllocatedSeat = selectedApplicantData?.admissions?.some(
                ad => String(ad.program?.id) === String(selProgram) && (ad.status === 'Allocated' || ad.status === 'Confirmed')
              )
              return (
                <>
                  {selProgram && !hasAllocatedSeat && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontStyle: 'italic' }}>
                      ℹ️ Allocate a seat first before confirming admission.
                    </div>
                  )}
                  <button
                    id="btn-confirm-admission"
                    className="btn btn-success w-full"
                    style={{ padding: '12px 18px', fontSize: 15 }}
                    onClick={confirmAdmission}
                    disabled={loading || !selApplicant || !selProgram || !hasAllocatedSeat}
                  >
                    {loading ? '⏳ Confirming…' : '🎉 Confirm Admission & Generate Number'}
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
