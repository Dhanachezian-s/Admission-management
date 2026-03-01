import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

type Applicant = {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    category: string
    entryType: string
    quotaType: string
    documentStatus: string
    feeStatus: string
    allotmentNumber?: string
    admissions?: Array<{ status: string }>
}

const docColors: Record<string, string> = {
    Pending: 'badge-danger',
    Submitted: 'badge-warning',
    Verified: 'badge-success',
}

const feeColors: Record<string, string> = {
    Pending: 'badge-danger',
    Paid: 'badge-success',
}

export default function ApplicantsList() {
    const navigate = useNavigate()
    const [applicants, setApplicants] = useState<Applicant[]>([])
    const [search, setSearch] = useState('')
    const [filterQuota, setFilterQuota] = useState('')
    const [filterDoc, setFilterDoc] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async function load() {
        try {
            const data = await api<Applicant[]>('/applicants')
            setApplicants(data)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const filtered = applicants.filter((a) => {
        const q = search.toLowerCase()
        const matchSearch = !q || `${a.firstName} ${a.lastName} ${a.email} ${a.phone}`.toLowerCase().includes(q)
        const matchQuota = !filterQuota || a.quotaType === filterQuota
        const matchDoc = !filterDoc || a.documentStatus === filterDoc
        return matchSearch && matchQuota && matchDoc
    })

    return (
        <div>
            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
                    <input
                        id="search-applicant"
                        placeholder="🔍 Search by name, email, phone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: 280 }}
                    />
                    <select id="filter-quota" value={filterQuota} onChange={(e) => setFilterQuota(e.target.value)} style={{ maxWidth: 160 }}>
                        <option value="">All Quotas</option>
                        <option value="KCET">KCET</option>
                        <option value="COMEDK">COMEDK</option>
                        <option value="Management">Management</option>
                    </select>
                    <select id="filter-doc" value={filterDoc} onChange={(e) => setFilterDoc(e.target.value)} style={{ maxWidth: 180 }}>
                        <option value="">All Doc Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Verified">Verified</option>
                    </select>
                </div>
                <button
                    id="btn-new-applicant"
                    className="btn btn-primary"
                    onClick={() => navigate('/applicant/new')}
                    style={{ flexShrink: 0 }}
                >
                    ➕ New Applicant
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading…</div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Category</th>
                                <th>Quota</th>
                                <th>Entry Type</th>
                                <th>Documents</th>
                                <th>Fee</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                        No applicants found
                                    </td>
                                </tr>
                            )}
                            {filtered.map((a, idx) => (
                                <tr key={a.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.email}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{a.phone}</td>
                                    <td><span className="badge badge-info">{a.category}</span></td>
                                    <td>
                                        <span className={`badge ${a.quotaType === 'KCET' ? 'badge-info' :
                                            a.quotaType === 'COMEDK' ? 'badge-accent' : 'badge-warning'
                                            }`}>{a.quotaType}</span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{a.entryType}</td>
                                    <td><span className={`badge ${docColors[a.documentStatus] || 'badge-info'}`}>{a.documentStatus}</span></td>
                                    <td><span className={`badge ${feeColors[a.feeStatus] || 'badge-info'}`}>{a.feeStatus}</span></td>
                                    <td>
                                        {(() => {
                                            const isConfirmed = a.admissions?.some(ad => ad.status === 'Confirmed')
                                            const isAllocated = !isConfirmed && a.admissions?.some(ad => ad.status === 'Allocated')
                                            return (
                                                <button
                                                    id={`btn-allocate-${a.id}`}
                                                    className={`btn btn-sm ${isConfirmed ? 'btn-success' : isAllocated ? 'btn-warning' : 'btn-ghost'}`}
                                                    onClick={() => navigate(`/allocation?applicantId=${a.id}`)}
                                                    disabled={isConfirmed}
                                                    title={isConfirmed ? "Seat already confirmed" : ""}
                                                    style={{ opacity: isConfirmed ? 0.8 : 1, cursor: isConfirmed ? 'not-allowed' : 'pointer' }}
                                                >
                                                    {isConfirmed ? '✅ Confirmed' : isAllocated ? '⏳ Confirm' : '🪑 Allocate'}
                                                </button>
                                            )
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                Showing {filtered.length} of {applicants.length} applicants
            </div>
        </div>
    )
}
