import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useModule } from '../components/useModule';
import { useI18n } from '../components/I18nProvider';
import { StatusPipeline } from '../components/UI/StatusPipeline';
import { uniqueId } from '../components/utils/uniqueId';
import * as pillarStorage from '../services/pillarStorage';
import { canPerform } from '../services/permissions';
import { CheckCircle } from 'lucide-react';

const pipeline: ('pr'|'quote'|'po'|'processing'|'shipped'|'delivered'|'invoiced'|'paid')[] = ['pr','quote','po','processing','shipped','delivered','invoiced','paid'];

export default function OrderTracker() {
  useModule('inventory');
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState<number>(pipeline.indexOf('processing'));
  const eta = useMemo(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 45), []); // 4 days 45 mins
  const [remainingMs, setRemainingMs] = useState<number>(eta.getTime() - Date.now());

  function advance() {
    setActiveIndex((prev) => Math.min(prev + 1, pipeline.length - 1));
  }

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingMs(Math.max(0, eta.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [eta]);

  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  const [uploads, setUploads] = useState<{ id: string; name: string; progress: number; done: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tie DeliveryNotes entries into the pipeline by reading available-to-invoice gate
  const poId = useMemo(() => {
    try {
      const seed = JSON.parse(pillarStorage.getItem('mpsone_po_from_quote') || '{}');
      return seed?.poId || 'PO-9821';
    } catch { return 'PO-9821'; }
  }, []);

  const deliveryGate = useMemo(() => {
    try {
      const gate = JSON.parse(pillarStorage.getItem('mpsone_available_to_invoice') || '{}');
      return gate[poId] || null;
    } catch { return null; }
  }, [poId]);

  useEffect(() => {
    // If delivery info exists, ensure pipeline reflects 'delivered' stage
    if (deliveryGate && typeof deliveryGate.deliveredAmount === 'number' && deliveryGate.deliveredAmount > 0) {
      setActiveIndex((prev) => Math.max(prev, pipeline.indexOf('delivered')));
    }
  }, [deliveryGate]);

  function handleFiles(files: FileList) {
    const allowedExt = ['pdf','jpg','jpeg','png'];
    const maxSize = 20 * 1024 * 1024; // 20MB
    const valid = Array.from(files).filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedExt.includes(ext) || f.size > maxSize) {
        alert(`File rejected: ${f.name} (type/size)`);
        return false;
      }
      return true;
    });
    const items = valid.map((f) => ({ id: uniqueId('upload'), name: f.name, progress: 0, done: false }));
    setUploads((prev) => [...prev, ...items]);
    items.forEach((item) => {
      let p = 0;
      const timer = setInterval(() => {
        p = Math.min(100, p + 8 + Math.round(Math.random() * 6));
        setUploads((prev) => prev.map((u) => (u.id === item.id ? { ...u, progress: p, done: p >= 100 } : u)));
        if (p >= 100) clearInterval(timer);
      }, 200);
    });
  }

  return (
    <div className="main">
      <div className="page-header inventory">
        <h1 style={{ margin: 0 }}>{t('order_tracker.title')}</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <StatusPipeline statuses={pipeline} activeIndex={activeIndex} onAdvance={advance} />
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            {t('order_tracker.estimated_delivery')}: <strong>{eta.toLocaleDateString()}</strong>
          </div>
          <div className="status-badge info" aria-live="polite">
            {days} {t('time.days')} • {hours} {t('time.hours') || 'hours'} • {minutes} {t('time.minutes') || 'minutes'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t('order_tracker.shipping_info')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ color: 'var(--text-secondary)' }}>{t('order_tracker.courier')}</div>
              <div>PT Nusantara Logistics</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)' }}>{t('order_tracker.tracking_no')}</div>
              <div>
                NL-2024-9821
                <a
                  href="#"
                  className="btn ghost"
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Open courier tracking portal');
                  }}
                >
                  {t('order_tracker.view_tracking') || 'View tracking'}
                </a>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li style={{ padding: '6px 0' }}>
                <span className="status-badge info">{t('status.processing')}</span>
                <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>Warehouse sorting • 2h ago</span>
              </li>
              <li style={{ padding: '6px 0' }}>
                <span className="status-badge info">{t('status.shipped')}</span>
                <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>Departed Balikpapan • 1h ago</span>
              </li>
              <li style={{ padding: '6px 0' }}>
                <span className="status-badge info">{t('status.delivered')}</span>
                <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>ETA {eta.toLocaleDateString()}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t('order_tracker.delivery_proof')}</h2>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 24, textAlign: 'center' }}
          >
            {t('order_tracker.drop_hint')} <button className="btn" onClick={() => inputRef.current?.click()}>{t('action.upload')}</button>
            <input
              ref={inputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
            />
          </div>
          {uploads.length > 0 && (
            <div className="card" style={{ padding: 12, marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('order_tracker.uploading') || 'Uploading...'}</div>
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {uploads.map((u) => (
                  <div key={u.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{u.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{Math.min(100, Math.round(u.progress))}%</span>
                        <button className="btn ghost" onClick={() => setUploads((prev) => prev.filter((x) => x.id !== u.id))}>
                          {t('order_tracker.remove') || 'Remove'}
                        </button>
                      </div>
                    </div>
                    <div className="progress-bar" aria-label={`Upload ${u.name}`}>
                      <div className="value" style={{ width: `${Math.min(100, u.progress)}%` }}></div>
                    </div>
                    {u.done && (
                      <div className="status-badge success" style={{ marginTop: 6 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle className="w-4 h-4" />
                          {t('order_tracker.upload_complete') || 'Upload complete'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Notes Summary and link */}
      <div className="card" style={{ padding: 16, marginTop: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{t('order_tracker.delivery_notes') || 'Delivery Notes'}</h3>
          <a className="btn outline" href="/inventory/delivery-notes">Open Delivery Notes</a>
        </div>
        {deliveryGate ? (
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div><span style={{ color: 'var(--text-secondary)' }}>PO</span> <strong>{poId}</strong></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Delivered Amount</span> <span className="status-badge success">Rp {Number(deliveryGate.deliveredAmount).toLocaleString('id-ID')}</span></div>
            <div><span style={{ color: 'var(--text-secondary)' }}>Available Qty</span> <span className="status-badge info">{Number(deliveryGate.availableQty)}</span></div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>No delivery notes yet. Submit corrections to unlock invoicing.</div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
          Pipeline auto-advances to Delivered when delivery info is present; invoicing stage unlocks after corrections.
        </div>
        {activeIndex >= pipeline.indexOf('invoiced') && (
          <div style={{ marginTop: 12 }}>
            <button className={`btn success${canPerform('mark:payment') ? '' : ' disabled'}`} aria-disabled={!canPerform('mark:payment')}
                    onClick={() => {
                      if (!canPerform('mark:payment')) { alert(t('gating.finance_only') || 'Only Finance can mark paid.'); return; }
                      setActiveIndex(pipeline.indexOf('paid'));
                      try {
                        const audit = JSON.parse(pillarStorage.getItem('mpsone_audit_trail') || '{}');
                        const key = `PO:${String(poId)}`;
                        const listAudit = Array.isArray(audit[key]) ? audit[key] : [];
                        listAudit.push({ entity: 'PO', id: String(poId), action: 'mark_paid', actorRole: localStorage.getItem('mpsone_role'), actorType: localStorage.getItem('mpsone_user_type'), at: Date.now(), comment: 'Order marked as paid' });
                        audit[key] = listAudit;
                        pillarStorage.setItem('mpsone_audit_trail', JSON.stringify(audit));
                      } catch {}
                    }}>
              {t('order_tracker.mark_paid') || 'Mark as Paid'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
