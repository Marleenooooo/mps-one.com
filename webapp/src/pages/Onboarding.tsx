import React, { useState } from 'react';

type Role = 'Admin' | 'PIC Operational' | 'PIC Procurement' | 'PIC Finance';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState('');
  const [departments, setDepartments] = useState<string[]>(['Mining Ops']);
  const [roles, setRoles] = useState<Role[]>(['Admin']);
  const [budget, setBudget] = useState<number>(100000000);

  function next() { setStep(s => Math.min(4, s + 1)); }
  function prev() { setStep(s => Math.max(1, s - 1)); }

  return (
    <div className="main">
      <h1>Corporate Onboarding</h1>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div className={`status-badge ${step>=1?'info':''}`}>Company</div>
          <div className={`status-badge ${step>=2?'info':''}`}>Hierarchy</div>
          <div className={`status-badge ${step>=3?'info':''}`}>Roles</div>
          <div className={`status-badge ${step>=4?'info':''}`}>Budgets</div>
        </div>

        {step === 1 && (
          <section aria-labelledby="company">
            <h2 id="company">Company Registration</h2>
            <input className="input" placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button className="btn primary" onClick={next} disabled={!company}>Continue</button>
            </div>
          </section>
        )}
        {step === 2 && (
          <section aria-labelledby="hierarchy">
            <h2 id="hierarchy">Hierarchy Setup</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Add departments</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="New department" onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setDepartments(d => [...d, e.currentTarget.value]);
                  e.currentTarget.value = '';
                }
              }} />
              <button className="btn" onClick={() => setDepartments(d => d.slice(0, -1))}>Remove last</button>
            </div>
            <ul>
              {departments.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={prev}>Back</button>
              <button className="btn primary" onClick={next} style={{ marginLeft: 8 }}>Continue</button>
            </div>
          </section>
        )}
        {step === 3 && (
          <section aria-labelledby="roles">
            <h2 id="roles">Role-based Permissions</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Select company roles</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {(['Admin', 'PIC Operational', 'PIC Procurement', 'PIC Finance'] as Role[]).map(r => (
                <label key={r} className="btn" style={{ justifyContent: 'space-between' }}>
                  <span>{r}</span>
                  <input type="checkbox" checked={roles.includes(r)} onChange={() => setRoles(x => x.includes(r) ? x.filter(z => z!==r) : [...x, r])} />
                </label>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={prev}>Back</button>
              <button className="btn primary" onClick={next} style={{ marginLeft: 8 }}>Continue</button>
            </div>
          </section>
        )}
        {step === 4 && (
          <section aria-labelledby="budgets">
            <h2 id="budgets">Department Budgets</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Allocate budgets</p>
            <div>
              <label>Annual Budget (IDR)</label>
              <input className="input" type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={prev}>Back</button>
              <button className="btn primary" onClick={() => alert('Company onboarded!')}>Finish</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}