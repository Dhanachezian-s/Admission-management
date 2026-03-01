import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

const categories = ['GM', 'SC', 'ST', 'OBC', 'JK', 'EWS', 'PWD']

export default function ApplicantForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null)

  // 15 fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('Male')
  const [category, setCategory] = useState('GM')
  const [entryType, setEntryType] = useState<'Regular' | 'Lateral'>('Regular')
  const [quotaType, setQuotaType] = useState<'KCET' | 'COMEDK' | 'Management'>('KCET')
  const [allotmentNumber, setAllotmentNumber] = useState('')
  const [marks, setMarks] = useState('')
  const [address, setAddress] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [aadhar, setAadhar] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await api('/applicants', {
        method: 'POST',
        data: {
          firstName, lastName, email, phone, dob, gender,
          category, entryType, quotaType,
          allotmentNumber: (quotaType !== 'Management') ? allotmentNumber : null,
          marks, address, parentName, parentPhone, aadhar,
        },
      })
      setStatus({ msg: 'Applicant created successfully!', ok: true })
      setTimeout(() => navigate('/applicants'), 1500)
    } catch (e: any) {
      setStatus({ msg: e.message, ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {status && (
        <div className={`alert ${status.ok ? 'alert-success' : 'alert-danger'}`}>
          {status.ok ? '✅' : '⚠️'} {status.msg}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="card">
          <div className="card-title">👤 Personal Information</div>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name *</label>
              <input id="app-first-name" required placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input id="app-last-name" required placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input id="app-email" type="email" required placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input id="app-phone" required placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input id="app-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select id="app-gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Aadhar Number</label>
              <input id="app-aadhar" placeholder="XXXX XXXX XXXX" value={aadhar} onChange={(e) => setAadhar(e.target.value)} maxLength={14} />
            </div>
            <div className="form-group full">
              <label>Address</label>
              <input id="app-address" placeholder="Residential address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-title">👨‍👩‍👦 Parent / Guardian Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Parent / Guardian Name</label>
              <input id="app-parent-name" placeholder="Father / Mother name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Parent Phone</label>
              <input id="app-parent-phone" placeholder="Parent contact number" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-title">🎓 Academic & Admission Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Category *</label>
              <select id="app-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Entry Type *</label>
              <select id="app-entry-type" value={entryType} onChange={(e) => setEntryType(e.target.value as any)}>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quota Type *</label>
              <select id="app-quota-type" value={quotaType} onChange={(e) => setQuotaType(e.target.value as any)}>
                <option value="KCET">KCET</option>
                <option value="COMEDK">COMEDK</option>
                <option value="Management">Management</option>
              </select>
            </div>
            {(quotaType === 'KCET' || quotaType === 'COMEDK') && (
              <div className="form-group">
                <label>Allotment Number *</label>
                <input id="app-allotment" placeholder="Govt. allotment number" value={allotmentNumber} onChange={(e) => setAllotmentNumber(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label>Qualifying Exam Marks / Rank</label>
              <input id="app-marks" placeholder="e.g. 95.4% or Rank 1234" value={marks} onChange={(e) => setMarks(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-4" style={{ display: 'flex', gap: 12 }}>
          <button id="btn-create-applicant" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Saving…' : '✅ Create Applicant'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/applicants')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
