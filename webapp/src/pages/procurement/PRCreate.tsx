import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import { useToast } from '../../components/UI/Toast';
import { useNavigate } from 'react-router-dom';
import { apiCreatePR } from '../../services/api';

import { uniqueId } from '../../components/utils/uniqueId';
type PRItem = { id: string; name: string; qty: number; spec?: string };
type PRDraft = {
  title: string;
  department: string;
  neededBy: string; // ISO date
  description: string;
  items: PRItem[];
  budgetCode: string;
  approver: string;
};

const DRAFT_KEY = 'mpsone_pr_draft';

export default function PRCreate() {
  useModule('procurement');
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [uploads, setUploads] = useState<{ name: string; progress: number; status: 'uploading' | 'done' }[]>([]);
  const [pipelineActive, setPipelineActive] = useState(0);
  const [mounting, setMounting] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [draft, setDraft] = useState<PRDraft>(() => {
    const persisted = localStorage.getItem(DRAFT_KEY);
    if (persisted) {
      try { return JSON.parse(persisted) as PRDraft; } catch {}
    }
    return {
      title: '',
      department: 'Mining Ops',
      neededBy: new Date().toISOString().slice(0,10),
      description: '',
      items: [{ id: uniqueId('pritem'), name: 'Hydraulic Hose', qty: 4, spec: 'High-pressure' }],
      budgetCode: 'OPS-2024',
      approver: 'PIC Procurement',
    };
  });

  // Debounced autosave with hydration guard to prevent initial autosave toast
  const saveTimer = useRef<number | null>(null);
  const hydrated = useRef(false);
  useEffect(() => {
    // Hydration guard and last-saved timestamp hydration
    const savedAtRaw = localStorage.getItem(DRAFT_KEY + ':lastSavedAt');
    if (savedAtRaw) {
      try {
        const dt = new Date(savedAtRaw);
        if (!isNaN(dt.getTime())) setLastSavedAt(dt.toLocaleTimeString());
      } catch {}
    }
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    const data = JSON.stringify(draft);
    saveTimer.current = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, data);
      if (hydrated.current) {
        // Inline micro-interaction instead of toast; optional throttled toast available
        setSavedFlash(true);
        const now = new Date();
        setLastSavedAt(now.toLocaleTimeString());
        try { localStorage.setItem(DRAFT_KEY + ':lastSavedAt', now.toISOString()); } catch {}
        window.setTimeout(() => setSavedFlash(false), 2000);
        // toast.push({ type: 'info', tag: 'autosave', message: t('pr.autosaved') });
      }
    }, 60000);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [draft, t, toast]);

  useEffect(() => {
    const t = setTimeout(() => setMounting(false), 400);
    return () => clearTimeout(t);
  }, []);

  function next() { if (validate(step)) setStep(s => s + 1); }
  function prev() { setStep(s => Math.max(1, s - 1)); }

  function validate(currentStep: number) {
    const e: Record<string,string> = {};
    if (currentStep === 1) {
      if (!draft.title.trim()) e.title = t('pr.err_title');
      if (!draft.department.trim()) e.department = t('pr.err_department');
      if (!draft.neededBy) e.neededBy = t('pr.err_needed_by');
    }
    if (currentStep === 2) {
      if (!draft.items.length) e.items = t('pr.err_items');
      draft.items.forEach((it, idx) => {
        if (!it.name.trim()) e[`items.${idx}.name`] = t('pr.err_item_name');
        if (it.qty <= 0) e[`items.${idx}.qty`] = t('pr.err_item_qty');
      });
    }
    if (currentStep === 3) {
      if (!draft.budgetCode.trim()) e.budgetCode = t('pr.err_budget_code');
      if (!draft.approver.trim()) e.approver = t('pr.err_approver');
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function addItem() {
    setDraft(d => ({ ...d, items: [...d.items, { id: uniqueId('pritem'), name: '', qty: 1, spec: '' }] }));
  }
  function updateItem(idx: number, patch: Partial<PRItem>) {
    setDraft(d => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }));
  }
  function removeItem(idx: number) {
    setDraft(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));
  }

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  function simulateUpload(file: File) {
    const allowedExt = ['pdf','doc','docx','xls','xlsx','jpg','jpeg','png'];
    const maxSize = 25 * 1024 * 1024; // 25MB
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExt.includes(ext) || file.size > maxSize) {
      toast.push({ type: 'error', message: t('pr.file_rejected') || `File rejected: ${file.name}` });
      return;
    }
    const idx = uploads.length;
    setUploads(u => [...u, { name: file.name, progress: 0, status: 'uploading' }]);
    let p = 0;
    const timer = setInterval(() => {
      p = Math.min(100, p + Math.round(10 + Math.random() * 20));
      setUploads(u => u.map((x, i) => i === idx ? { ...x, progress: p, status: p >= 100 ? 'done' : 'uploading' } : x));
      if (p >= 100) {
        clearInterval(timer);
        toast.push({ type: 'success', message: t('pr.upload_complete').replace('{name}', file.name) });
      }
    }, 200);
  }

  return (
    <div className="main">
      <div className="page-header procurement" style={{ borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        <h1 style={{ margin: 0 }}>{t('admin.new_pr')}</h1>
        <div aria-label="Status pipeline" style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
          {(['pr','quote','po','processing','shipped','delivered','invoiced','paid'] as const).map((key, i) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                title={t(`status.${key}`)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: i === pipelineActive ? 'linear-gradient(135deg, var(--module-color) 0%, var(--module-gradient-end) 100%)' : 'var(--border)',
                  boxShadow: i === pipelineActive ? '0 0 10px var(--accent), 0 0 20px var(--accent)' : 'none',
                }}
              ></div>
              {i < 7 && <div style={{ width: 24, height: 2, background: 'var(--border)' }}></div>}
            </div>
          ))}
        </div>
      </div>

      {mounting && <div className="skeleton" style={{ height: 120, borderRadius: 8 }}></div>}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="status-badge info">{t('pr.step_of').replace('{n}', String(step)).replace('{max}', '3')}</div>
            {savedFlash && (
              <div className="status-badge info" aria-live="polite" style={{ transition: 'opacity .2s ease' }}>{t('pr.autosaved')}</div>
            )}
            {lastSavedAt && (
              <span aria-live="polite" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {t('form.last_saved').replace('{time}', lastSavedAt)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={prev} disabled={step === 1}>{t('action.back')}</button>
            <button className="btn primary" onClick={next} disabled={step === 3}>{t('action.continue')}</button>
          </div>
        </div>
      </div>

      {step === 1 && (
        <section className="card" style={{ padding: 16, marginTop: 16 }} aria-labelledby="details">
          <h2 id="details">{t('pr.details')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>{t('form.title')}</label>
              <input className="input" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} aria-invalid={!!errors.title} />
              {errors.title && <div role="alert" style={{ color: 'var(--secondary-gradient-start)' }}>{errors.title}</div>}
            </div>
            <div>
              <label>{t('form.department')}</label>
              <select className="select" value={draft.department} onChange={e => setDraft(d => ({ ...d, department: e.target.value }))} aria-invalid={!!errors.department}>
                {['Mining Ops','Logistics','Maintenance','Finance'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <div role="alert" style={{ color: 'var(--secondary-gradient-start)' }}>{errors.department}</div>}
            </div>
            <div>
              <label>{t('form.needed_by')}</label>
              <input className="input" type="date" value={draft.neededBy} onChange={e => setDraft(d => ({ ...d, neededBy: e.target.value }))} aria-invalid={!!errors.neededBy} />
              {errors.neededBy && <div role="alert" style={{ color: 'var(--secondary-gradient-start)' }}>{errors.neededBy}</div>}
            </div>
            <div>
              <label>{t('form.description')}</label>
              <div className="card" style={{ padding: 8 }}>
                <div
                  role="textbox"
                  aria-label="Rich description"
                  contentEditable
                  dir="ltr"
                  suppressContentEditableWarning
                  onInput={(e: React.FormEvent<HTMLDivElement>) => {
                    const text = e.currentTarget?.textContent ?? '';
                    setDraft(d => ({ ...d, description: text }));
                  }}
                  style={{ minHeight: 80, direction: 'ltr', textAlign: 'left' }}
                >{draft.description}</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>{t('form.attach_files')}</h3>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = Array.from(e.dataTransfer.files); setFiles(prev => [...prev, ...f]); f.forEach(simulateUpload); }}
              style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 24, textAlign: 'center' }}
            >
              {t('pr.files_drop_hint')}
              <input
                type="file"
                multiple
                onChange={e => { const f = Array.from(e.target.files ?? []); setFiles(prev => [...prev, ...f]); f.forEach(simulateUpload); }}
                style={{ display: 'block', margin: '8px auto' }}
              />
            </div>
            {files.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {uploads.map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ flex: 1 }}>{u.name}</span>
                    <div className="progress-bar" style={{ width: 120 }}>
                      <div className="value" style={{ width: `${u.progress}%` }}></div>
                    </div>
                    <span className="status-badge info">{u.status === 'uploading' ? t('pr.uploading') : t('pr.done')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card" style={{ padding: 16, marginTop: 16 }} aria-labelledby="items">
          <h2 id="items">{t('pr.items')}</h2>
          <div role="table" aria-label="PR items" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <div role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 80px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              {[t('quote.item'),t('quote.qty'),'Specification',''].map(h => <div key={h} role="columnheader" style={{ padding: 12, fontWeight: 600 }}>{h}</div>)}
            </div>
            {draft.items.map((it, idx) => (
              <div key={it.id} role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 80px', borderBottom: '1px solid var(--border)' }}>
                <div role="cell" style={{ padding: 8 }}>
                  <input className="input" value={it.name} onChange={e => updateItem(idx, { name: e.target.value })} aria-invalid={!!errors[`items.${idx}.name`]} />
                </div>
                <div role="cell" style={{ padding: 8 }}>
                  <input className="input" type="number" value={it.qty} onChange={e => updateItem(idx, { qty: Number(e.target.value) })} aria-invalid={!!errors[`items.${idx}.qty`]} />
                </div>
                <div role="cell" style={{ padding: 8 }}>
                  <input className="input" value={it.spec || ''} onChange={e => updateItem(idx, { spec: e.target.value })} placeholder={t('pr.item_spec')} />
                </div>
                <div role="cell" style={{ padding: 8 }}>
                  <button className="btn warn" onClick={() => removeItem(idx)}>{t('action.remove')}</button>
                </div>
              </div>
            ))}
          </div>
          {errors.items && <div role="alert" style={{ color: 'var(--secondary-gradient-start)', marginTop: 8 }}>{errors.items}</div>}
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={addItem}>{t('action.add_item')}</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card" style={{ padding: 16, marginTop: 16 }} aria-labelledby="approval">
          <h2 id="approval">{t('pr.approval_budget')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>{t('pr.budget_code')}</label>
              <input className="input" value={draft.budgetCode} onChange={e => setDraft(d => ({ ...d, budgetCode: e.target.value }))} aria-invalid={!!errors.budgetCode} />
              {errors.budgetCode && <div role="alert" style={{ color: 'var(--secondary-gradient-start)' }}>{errors.budgetCode}</div>}
            </div>
            <div>
              <label>{t('pr.approver')}</label>
              <select className="select" value={draft.approver} onChange={e => setDraft(d => ({ ...d, approver: e.target.value }))} aria-invalid={!!errors.approver}>
                {['PIC Procurement','PIC Operational','PIC Finance','Admin'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.approver && <div role="alert" style={{ color: 'var(--secondary-gradient-start)' }}>{errors.approver}</div>}
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn" onClick={prev}>{t('action.back')}</button>
            <button className="btn primary" onClick={async () => {
              if (!validate(3)) return;
              try {
                const payload = {
                  title: draft.title,
                  neededBy: draft.neededBy,
                  description: draft.description,
                  budgetCode: draft.budgetCode,
                  approver: draft.approver,
                  items: draft.items.map(it => ({ name: it.name, qty: it.qty, spec: it.spec || '' })),
                };
                const res = await apiCreatePR(payload, 'PIC_Procurement');
                localStorage.removeItem(DRAFT_KEY);
                toast.push({ type: 'success', message: t('pr.submit_success') });
                let i = pipelineActive;
                const timer = setInterval(() => {
                  i = Math.min(7, i + 1);
                  setPipelineActive(i);
                  if (i >= 7) {
                    clearInterval(timer);
                    navigate('/procurement/pr');
                  }
                }, 250);
              } catch (err: any) {
                toast.push({ type: 'error', message: err?.message || 'Submit failed' });
              }
            }} disabled={!isValid}>{t('action.submit_pr')}</button>
          </div>
        </section>
      )}
    </div>
  );
}
