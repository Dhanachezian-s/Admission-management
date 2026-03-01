import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Institution = { id: string; name: string; code: string };
type Campus = { id: string; name: string; institution: Institution };
type Department = { id: string; name: string; campus: Campus };
type AcademicYear = { id: string; year: number };
type Program = { id: string; name: string; code: string; intake: number; courseType: string; entryType: string; admissionMode: string };

type Tab = 'institution' | 'campus' | 'department' | 'year' | 'program' | 'cap';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'institution', label: 'Institution', icon: '🏛️' },
  { key: 'campus', label: 'Campus', icon: '🏢' },
  { key: 'department', label: 'Department', icon: '🏬' },
  { key: 'year', label: 'Academic Year', icon: '📅' },
  { key: 'program', label: 'Program & Quotas', icon: '📚' },
  { key: 'cap', label: 'Institution Cap', icon: '🔒' },
];

export default function MastersSetup() {
  const [activeTab, setActiveTab] = useState<Tab>('institution');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  async function refresh() {
    const [inst, camp, dept, ay, progs] = await Promise.all([
      api<Institution[]>('/masters/institutions'),
      api<Campus[]>('/masters/campuses'),
      api<Department[]>('/masters/departments'),
      api<AcademicYear[]>('/masters/academic-years'),
      api<Program[]>('/masters/programs'),
    ]);
    setInstitutions(inst); setCampuses(camp); setDepartments(dept);
    setYears(ay); setPrograms(progs);
  }

  useEffect(() => { refresh().catch((e) => setStatus({ msg: e.toString(), ok: false })); }, []);

  function flash(msg: string, ok = true) {
    setStatus({ msg, ok });
    setTimeout(() => setStatus(null), 3500);
  }

  // --- Institution ---
  const [instName, setInstName] = useState('');
  const [instCode, setInstCode] = useState('');
  async function createInstitution() {
    try {
      await api('/masters/institution', { method: 'POST', data: { name: instName, code: instCode } });
      setInstName(''); setInstCode('');
      await refresh(); flash('Institution created ✓');
    } catch (e: any) { flash(e.toString(), false); }
  }

  // --- Campus ---
  const [campName, setCampName] = useState('');
  const [campInst, setCampInst] = useState('');
  async function createCampus() {
    try {
      await api('/masters/campus', { method: 'POST', data: { institutionId: campInst, name: campName } });
      setCampName(''); setCampInst('');
      await refresh(); flash('Campus created ✓');
    } catch (e: any) { flash(e.toString(), false); }
  }

  // --- Department ---
  const [deptName, setDeptName] = useState('');
  const [deptInst, setDeptInst] = useState('');
  const [deptCamp, setDeptCamp] = useState('');
  async function createDepartment() {
    try {
      await api('/masters/department', { method: 'POST', data: { campusId: deptCamp, name: deptName } });
      setDeptName(''); setDeptCamp(''); setDeptInst('');
      await refresh(); flash('Department created ✓');
    } catch (e: any) { flash(e.toString(), false); }
  }

  // --- Academic Year ---
  const [yearVal, setYearVal] = useState<number>(new Date().getFullYear() + 1);
  async function createAcademicYear() {
    try {
      await api('/masters/academic-year', { method: 'POST', data: { year: yearVal } });
      await refresh(); flash('Academic Year created ✓');
    } catch (e: any) { flash(e.toString(), false); }
  }

  // --- Program ---
  const [progName, setProgName] = useState('');
  const [progCode, setProgCode] = useState('');
  const [progInst, setProgInst] = useState('');
  const [progCamp, setProgCamp] = useState('');
  const [progDept, setProgDept] = useState('');
  const [progYear, setProgYear] = useState('');
  const [courseType, setCourseType] = useState<'UG' | 'PG'>('UG');
  const [entryType, setEntryType] = useState<'Regular' | 'Lateral'>('Regular');
  const [admissionMode, setAdmissionMode] = useState<'Government' | 'Management'>('Government');
  const [intake, setIntake] = useState<number>(60);
  const [quotaKCET, setQuotaKCET] = useState<number>(0);
  const [quotaCOMEDK, setQuotaCOMEDK] = useState<number>(0);
  const [quotaMGMT, setQuotaMGMT] = useState<number>(0);
  const quotaTotal = quotaKCET + quotaCOMEDK + quotaMGMT;

  async function createProgram() {
    if (quotaTotal !== intake) {
      flash(`Quota total (${quotaTotal}) must equal intake (${intake})`, false);
      return;
    }
    try {
      const prog = await api<Program>('/masters/program', {
        method: 'POST',
        data: { departmentId: progDept, academicYearId: progYear, name: progName, code: progCode, courseType, entryType, admissionMode, intake, supernumerarySeats: 0 },
      });
      await api('/masters/program/quotas', {
        method: 'POST',
        data: {
          programId: prog.id, quotas: [
            { quotaType: 'KCET', seats: quotaKCET },
            { quotaType: 'COMEDK', seats: quotaCOMEDK },
            { quotaType: 'Management', seats: quotaMGMT },
          ]
        },
      });
      setProgName(''); setProgCode(''); setProgDept(''); setProgCamp(''); setProgInst(''); setProgYear(''); setIntake(60); setQuotaKCET(0); setQuotaCOMEDK(0); setQuotaMGMT(0);
      await refresh(); flash('Program + Quotas created ✓');
    } catch (e: any) { flash(e.toString(), false); }
  }

  // --- Institution Cap ---
  const [capInst, setCapInst] = useState('');
  const [capLimit, setCapLimit] = useState<number>(0);
  async function addInstitutionCap() {
    try {
      await api('/masters/institution/cap', { method: 'POST', data: { institutionId: capInst, categoryCode: 'JK', capLimit } });
      setCapInst(''); setCapLimit(0);
      flash('Institution cap added ✓');
    } catch (e: any) { flash(e.toString(), false); }
  }

  return (
    <div>
      {status && (
        <div className={`alert ${status.ok ? 'alert-success' : 'alert-danger'}`}>
          {status.ok ? '✅' : '⚠️'} {status.msg}
        </div>
      )}

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Institution */}
      {activeTab === 'institution' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-title">🏛️ Add Institution</div>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label>Institution Name</label>
                <input id="inst-name" placeholder="e.g. City Engineering College" value={instName} onChange={(e) => setInstName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input id="inst-code" placeholder="e.g. CEC" value={instCode} onChange={(e) => setInstCode(e.target.value)} />
              </div>
            </div>
            <button id="btn-create-institution" className="btn btn-primary" onClick={createInstitution} disabled={!instName || !instCode}>
              ➕ Add Institution
            </button>
          </div>
          <div className="card">
            <div className="card-title">📋 Institutions ({institutions.length})</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Code</th></tr></thead>
                <tbody>
                  {institutions.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No institutions yet</td></tr>}
                  {institutions.map((i, idx) => (
                    <tr key={i.id}><td>{idx + 1}</td><td>{i.name}</td><td><span className="badge badge-accent">{i.code}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Campus */}
      {activeTab === 'campus' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-title">🏢 Add Campus</div>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label>Institution</label>
                <select id="camp-inst" value={campInst} onChange={(e) => setCampInst(e.target.value)}>
                  <option value="">Select Institution</option>
                  {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Campus Name</label>
                <input id="camp-name" placeholder="e.g. Main Campus" value={campName} onChange={(e) => setCampName(e.target.value)} />
              </div>
            </div>
            <button id="btn-create-campus" className="btn btn-primary" onClick={createCampus} disabled={!campInst || !campName}>
              ➕ Add Campus
            </button>
          </div>
          <div className="card">
            <div className="card-title">📋 Campuses ({campuses.length})</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Campus</th><th>Institution</th></tr></thead>
                <tbody>
                  {campuses.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No campuses yet</td></tr>}
                  {campuses.map((c, idx) => (
                    <tr key={c.id}><td>{idx + 1}</td><td>{c.name}</td><td style={{ color: 'var(--text-muted)' }}>{c.institution?.name}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Department */}
      {activeTab === 'department' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-title">🏬 Add Department</div>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label>Institution (Filter)</label>
                <select id="dept-inst" value={deptInst} onChange={(e) => { setDeptInst(e.target.value); setDeptCamp(''); }}>
                  <option value="">Select Institution</option>
                  {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Campus</label>
                <select id="dept-camp" value={deptCamp} onChange={(e) => setDeptCamp(e.target.value)} disabled={!deptInst}>
                  <option value="">Select Campus</option>
                  {campuses.filter((c) => c.institution?.id.toString() === deptInst).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department Name</label>
                <input id="dept-name" placeholder="e.g. Computer Science" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
              </div>
            </div>
            <button id="btn-create-dept" className="btn btn-primary" onClick={createDepartment} disabled={!deptCamp || !deptName}>
              ➕ Add Department
            </button>
          </div>
          <div className="card">
            <div className="card-title">📋 Departments ({departments.length})</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Department</th><th>Campus</th><th>Institution</th></tr></thead>
                <tbody>
                  {departments.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No departments yet</td></tr>}
                  {departments.map((d, idx) => (
                    <tr key={d.id}><td>{idx + 1}</td><td>{d.name}</td><td style={{ color: 'var(--text-muted)' }}>{d.campus?.name}</td><td style={{ color: 'var(--text-muted)' }}>{d.campus?.institution?.name}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Academic Year */}
      {activeTab === 'year' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-title">📅 Add Academic Year</div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Year</label>
              <input id="year-val" type="number" value={yearVal} onChange={(e) => setYearVal(Number(e.target.value))} min={2020} max={2050} />
            </div>
            <button id="btn-create-year" className="btn btn-primary" onClick={createAcademicYear}>
              ➕ Add Academic Year
            </button>
          </div>
          <div className="card">
            <div className="card-title">📋 Academic Years ({years.length})</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Year</th></tr></thead>
                <tbody>
                  {years.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No years yet</td></tr>}
                  {years.map((y, idx) => (
                    <tr key={y.id}><td>{idx + 1}</td><td>{y.year}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Program & Quotas */}
      {activeTab === 'program' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-title">📚 Add Program & Quota</div>

            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label>Institution (Filter)</label>
                <select id="prog-inst" value={progInst} onChange={(e) => { setProgInst(e.target.value); setProgCamp(''); setProgDept(''); }}>
                  <option value="">Select Institution</option>
                  {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Campus (Filter)</label>
                <select id="prog-camp" value={progCamp} onChange={(e) => { setProgCamp(e.target.value); setProgDept(''); }} disabled={!progInst}>
                  <option value="">Select Campus</option>
                  {campuses.filter((c) => c.institution?.id.toString() === progInst).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select id="prog-dept" value={progDept} onChange={(e) => setProgDept(e.target.value)} disabled={!progCamp}>
                  <option value="">Select Department</option>
                  {departments.filter((d) => d.campus?.id.toString() === progCamp).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Academic Year</label>
                <select id="prog-year" value={progYear} onChange={(e) => setProgYear(e.target.value)}>
                  <option value="">Select Year</option>
                  {years.map((y) => <option key={y.id} value={y.id}>{y.year}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Program Name</label>
                <input id="prog-name" placeholder="e.g. B.E. Computer Science" value={progName} onChange={(e) => setProgName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Program Code</label>
                <input id="prog-code" placeholder="e.g. CSE" value={progCode} onChange={(e) => setProgCode(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Course Type</label>
                <select id="prog-course-type" value={courseType} onChange={(e) => setCourseType(e.target.value as any)}>
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                </select>
              </div>
              <div className="form-group">
                <label>Entry Type</label>
                <select id="prog-entry-type" value={entryType} onChange={(e) => setEntryType(e.target.value as any)}>
                  <option value="Regular">Regular</option>
                  <option value="Lateral">Lateral</option>
                </select>
              </div>
              <div className="form-group">
                <label>Admission Mode</label>
                <select id="prog-admission-mode" value={admissionMode} onChange={(e) => setAdmissionMode(e.target.value as any)}>
                  <option value="Government">Government</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="form-group">
                <label>Intake (Total Seats)</label>
                <input id="prog-intake" type="number" value={intake} min={1} onChange={(e) => setIntake(Number(e.target.value))} />
              </div>
            </div>

            <div className="divider" />
            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📊 Quota Distribution (must total {intake})
            </div>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label>KCET Seats</label>
                <input id="quota-kcet" type="number" value={quotaKCET} min={0} onChange={(e) => setQuotaKCET(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>COMEDK Seats</label>
                <input id="quota-comedk" type="number" value={quotaCOMEDK} min={0} onChange={(e) => setQuotaCOMEDK(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Management Seats</label>
                <input id="quota-mgmt" type="number" value={quotaMGMT} min={0} onChange={(e) => setQuotaMGMT(Number(e.target.value))} />
              </div>
            </div>

            <div style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: quotaTotal === intake ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: quotaTotal === intake ? 'var(--success)' : 'var(--danger)',
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 16,
            }}>
              {quotaTotal === intake ? '✅' : '⚠️'} Quota total: {quotaTotal} / {intake}
            </div>

            <button
              id="btn-create-program"
              className="btn btn-primary"
              onClick={createProgram}
              disabled={!progDept || !progYear || !progName || !progCode || quotaTotal !== intake}
            >
              ➕ Create Program + Quotas
            </button>
          </div>
          <div className="card">
            <div className="card-title">📋 Programs ({programs.length})</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Program</th><th>Code</th><th>Type</th><th>Intake</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No programs yet</td></tr>}
                  {programs.map((p, idx) => (
                    <tr key={p.id}>
                      <td>{idx + 1}</td>
                      <td>{p.name}</td>
                      <td><span className="badge badge-accent">{p.code}</span></td>
                      <td>
                        <span className={`badge ${p.courseType === 'UG' ? 'badge-info' : 'badge-warning'}`}>{p.courseType}</span>
                      </td>
                      <td>{p.intake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Institution Cap */}
      {activeTab === 'cap' && (
        <div className="card-grid">
          <div className="card">
            <div className="card-title">🔒 J&K Institution-level Cap</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Limits the total number of J&K (JK) category applicants that can be admitted across all programs in an institution.
            </p>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label>Institution</label>
                <select id="cap-inst" value={capInst} onChange={(e) => setCapInst(e.target.value)}>
                  <option value="">Select Institution</option>
                  {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Cap Limit (JK seats)</label>
                <input id="cap-limit" type="number" value={capLimit} min={0} onChange={(e) => setCapLimit(Number(e.target.value))} />
              </div>
            </div>
            <button id="btn-add-cap" className="btn btn-primary" onClick={addInstitutionCap} disabled={!capInst || capLimit <= 0}>
              🔒 Set Cap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
