import React, { Suspense, lazy, useEffect, useState } from 'react';
import { computeOverscan } from './config';
import { BrowserRouter, Route, Routes, Navigate, useParams, useLocation } from 'react-router-dom';
import { trackEvent, startSpan, endSpan } from './services/monitoring';
import * as pillarStorage from './services/pillarStorage';
import { ThemeProvider } from './components/ThemeProvider';
import { PillarProvider, usePillar } from './components/PillarProvider';
import { ToastProvider } from './components/UI/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sidebar } from './components/Layout/Sidebar';
import { RouteGuard } from './components/RouteGuard';
import { Topbar } from './components/Layout/Topbar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminDashboard = lazy(() => import('./pages/supplier/AdminDashboard'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const Onboarding = lazy(() => import('./pages/client/Onboarding'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const CodeLogin = lazy(() => import('./pages/CodeLogin'));
const QuoteBuilder = lazy(() => import('./pages/QuoteBuilder'));
const OrderTracker = lazy(() => import('./pages/OrderTracker'));
const DocumentManager = lazy(() => import('./pages/DocumentManager'));
const CommunicationHub = lazy(() => import('./pages/CommunicationHub'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Reporting = lazy(() => import('./pages/supplier/Reporting'));
const PRList = lazy(() => import('./pages/procurement/PRList'));
const PRCreate = lazy(() => import('./pages/procurement/PRCreate'));
const EnhancedPRCreation = lazy(() => import('./pages/procurement/EnhancedPRCreation').then(m => ({ default: m.EnhancedPRCreation })));
const EnhancedRFQCreation = lazy(() => import('./pages/procurement/EnhancedRFQCreation').then(m => ({ default: m.EnhancedRFQCreation })));
const EnhancedSupplierManagement = lazy(() => import('./pages/supplier/EnhancedSupplierManagement').then(m => ({ default: m.EnhancedSupplierManagement })));
const EnhancedInvoiceMatching = lazy(() => import('./pages/finance/EnhancedInvoiceMatching').then(m => ({ default: m.EnhancedInvoiceMatching })));
const EmailDashboard = lazy(() => import('./pages/supplier/EmailDashboard'));
const POPreview = lazy(() => import('./pages/POPreview'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const DocViewer = lazy(() => import('./pages/DocViewer'));
const DBStatus = lazy(() => import('./pages/DBStatus'));
const ProcurementWorkflow = lazy(() => import('./pages/ProcurementWorkflow'));
const SupplierDirectory = lazy(() => import('./pages/SupplierDirectory'));
const ClientDirectory = lazy(() => import('./pages/ClientDirectory'));
const QuoteComparison = lazy(() => import('./pages/client/QuoteComparison'));
const AdminInvitations = lazy(() => import('./pages/AdminInvitations'));
const DeliveryNotes = lazy(() => import('./pages/DeliveryNotes'));
const PeopleDirectory = lazy(() => import('./pages/admin/PeopleDirectory'));
const UserProfile = lazy(() => import('./pages/people/UserProfile'));

function hasApprovedPRForSupplier(): boolean {
  try {
    const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
    if (userType !== 'supplier') return false;
    const supplierId = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_id') : null);
    if (!supplierId) return false;
    const mapRaw = (typeof localStorage !== 'undefined' ? pillarStorage.getItem('mpsone_pr_sent') : null) || '{}';
    const sentMap = JSON.parse(mapRaw);
    const prIds = Object.keys(sentMap || {});
    for (const prId of prIds) {
      const list = Array.isArray(sentMap[prId]) ? sentMap[prId] : [];
      if (list.some((x: any) => String(x.supplierId) === String(supplierId))) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

function ClientQuoteGuard() {
  const { prId } = useParams();
  const [ready, setReady] = useState(false);
  const [canView, setCanView] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
      if (userType !== 'client') { setCanView(false); return; }
      const rowsRaw = (typeof localStorage !== 'undefined' ? localStorage.getItem('mock_pr_rows') : null) || '[]';
      const rows = JSON.parse(rowsRaw);
      const approved = Array.isArray(rows) && rows.some((r: any) => String(r.id) === String(prId) && r.status === 'Approved');
      setCanView(approved);
    } catch {
      setCanView(false);
    } finally {
      setReady(true);
    }
  }, [prId]);
  if (!ready) return null;
  if (!canView) return <Navigate to="/procurement/workflow" replace />;
  return <QuoteComparison />;
}

function POPreviewGuard() {
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [redirectPr, setRedirectPr] = useState<string | null>(null);
  useEffect(() => {
    try {
      const dev = ((import.meta as any).env?.DEV) || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_dev') : null) === '1') || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null) === 'Developer');
      if (dev) { setValid(true); return; }
      const seedRaw = (typeof localStorage !== 'undefined' ? pillarStorage.getItem('mpsone_po_from_quote') : null) || '{}';
      const seed = JSON.parse(seedRaw);
      if (!seed || !seed.prId || !seed.supplierId) {
        setValid(false);
        return;
      }
      const accRaw = (typeof localStorage !== 'undefined' ? pillarStorage.getItem('mpsone_quote_accepted') : null) || '{}';
      const acceptedMap = JSON.parse(accRaw);
      const accepted = acceptedMap[String(seed.prId)];
      const ok = !!accepted && String(accepted.supplierId) === String(seed.supplierId) && Number(accepted.version) === Number(seed.version);
      if (!ok) setRedirectPr(String(seed.prId));
      setValid(ok);
    } catch {
      setValid(false);
    } finally {
      setReady(true);
    }
  }, []);
  if (!ready) return null;
  if (!valid) return redirectPr ? <Navigate to={`/client/quotes/${encodeURIComponent(String(redirectPr))}`} replace /> : <Navigate to="/procurement/workflow" replace />;
  return <POPreview />;
}

function isLoggedInUserType(): boolean {
  try {
    const dev = ((import.meta as any).env?.DEV) || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_dev') : null) === '1') || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null) === 'Developer');
    if (dev) return true;
    const t = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
    return t === 'client' || t === 'supplier';
  } catch {
    return false;
  }
}

// Frontend route guards by procurement mode (pillar separation):
function ClientOnlyProcurement({ children }: { children: React.ReactElement }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const dev = ((import.meta as any).env?.DEV) || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_dev') : null) === '1') || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null) === 'Developer');
      if (dev) { setOk(true); return; }
      const t = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
      setOk(t === 'client');
    } catch {
      setOk(false);
    } finally {
      setReady(true);
    }
  }, []);
  if (!ready) return null;
  if (!ok) return <Navigate to="/login/client" replace />;
  return children;
}

function SupplierOnly({ children }: { children: React.ReactElement }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const dev = ((import.meta as any).env?.DEV) || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_dev') : null) === '1') || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null) === 'Developer');
      if (dev) { setOk(true); return; }
      const t = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
      setOk(t === 'supplier');
    } catch {
      setOk(false);
    } finally {
      setReady(true);
    }
  }, []);
  if (!ready) return null;
  if (!ok) return <Navigate to="/login/supplier" replace />;
  return children;
}

// General client mode guard (non-procurement-specific)
function ClientModeOnly({ children }: { children: React.ReactElement }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const dev = ((import.meta as any).env?.DEV) || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_dev') : null) === '1') || ((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null) === 'Developer');
      if (dev) { setOk(true); return; }
      const t = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
      setOk(t === 'client');
    } catch {
      setOk(false);
    } finally {
      setReady(true);
    }
  }, []);
  if (!ready) return null;
  if (!ok) return <Navigate to="/login/client" replace />;
  return children;
}

function StartRedirect() {
  const [ready, setReady] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  useEffect(() => {
    try { setUserType((typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null)); } catch { setUserType(null); }
    setReady(true);
  }, []);
  if (!ready) return null;
  if (userType === 'supplier') return <Navigate to="/supplier/admin" replace />;
  if (userType === 'client') return <Navigate to="/client" replace />;
  // Fallback: if no user type, redirect to login/<default_mode> when available, else client
  try {
    const def = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_default_mode') : null);
    const m = (def === 'supplier' || def === 'client') ? def : 'client';
    return <Navigate to={`/login/${m}`} replace />;
  } catch {}
  if (import.meta.env && (import.meta.env as any).DEV) {
    return <Navigate to="/login/client" replace />;
  }
  useEffect(() => {
    try {
      const KEY = 'mpsone_redirect_once';
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, '1');
        window.location.replace('https://mps-one.com');
      }
    } catch {
      window.location.replace('https://mps-one.com');
    }
  }, []);
  return null;
}

export default function App() {
  function RouteAnalytics() {
    const location = useLocation();
    const { pillar } = usePillar();
    useEffect(() => {
      // Track route view (existing lightweight event)
      trackEvent('route_view', { path: location.pathname, pillar });
      // Minimal OpenTelemetry-like navigation span
      const s = startSpan('route_navigation', { path: location.pathname, pillar });
      // End after next frame to approximate initial paint
      const id = requestAnimationFrame(() => {
        endSpan(s);
      });
      return () => cancelAnimationFrame(id);
    }, [location.pathname, pillar]);
    return null;
  }
  // Sidebar visibility state with persistence
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(() => {
    try { return localStorage.getItem('mpsone_sidebar_hidden') !== '1'; } catch { return true; }
  });
  const toggleSidebar = () => {
    setSidebarVisible(v => {
      const next = !v;
      try { localStorage.setItem('mpsone_sidebar_hidden', next ? '0' : '1'); } catch {}
      return next;
    });
  };
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <PillarProvider>
            <RouteAnalytics />
            <ErrorBoundary>
            <OfflineIndicator />
            {/* Accessibility: Skip to content link for keyboard users */}
            <a href="#main-content" className="skip-link" aria-label="Skip to main content">Skip to content</a>
            <div className={sidebarVisible ? "layout" : "layout no-sidebar"}>
              {sidebarVisible && <Sidebar />}
              <div className="content" id="main-content">
                <Topbar>
                  <button
                    className="btn ghost tooltip"
                    data-tip={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
                    aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
                    onClick={toggleSidebar}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    {sidebarVisible ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </Topbar>
                  <Suspense fallback={<div className="main"><div className="skeleton" style={{ height: 160, borderRadius: 8 }}></div></div>}>
                    <Routes>
                      {/** Device-aware overscan for DocumentManager */}
                      {/** On mobile widths, preload a bit more rows to reduce pop-in */}
                      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                      {/* @ts-ignore window exists in browser */}
                      {(() => { const w = typeof window !== 'undefined' ? window.innerWidth : 1024; (w); return null; })()}
                      {/* Auth routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/login/supplier" element={<Login />} />
                      <Route path="/login/client" element={<Login />} />
                      <Route path="/login/code" element={<CodeLogin />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/signup/supplier" element={<Signup />} />
                      <Route path="/signup/client" element={<Signup />} />
                      {/* Home: redirect based on stored user type, otherwise external */}
                      <Route path="/" element={<StartRedirect />} />
                      {/* Client routes (mode-aware) */}
                      <Route path="/client" element={<RouteGuard requireUserType="client" fallbackTo="/login/client"><ClientDashboard /></RouteGuard>} />
                      <Route path="/client/onboarding" element={(localStorage.getItem('mpsone_role') === 'Admin') ? <Onboarding /> : <Navigate to="/client" replace />} />
                      <Route path="/client/quotes/:prId" element={<ClientQuoteGuard />} />
                      <Route path="/client/suppliers" element={(localStorage.getItem('mpsone_user_type') === 'client') ? <SupplierDirectory /> : <Navigate to="/procurement/workflow" replace />} />

                      {/* Supplier routes (mode-aware, avoid redirect loops) */}
                      <Route path="/supplier/admin" element={<RouteGuard requireUserType="supplier" requireRoleIn={["Admin"]} fallbackTo="/supplier/clients"><AdminDashboard /></RouteGuard>} />
                      <Route path="/admin/invitations" element={<SupplierOnly>{(localStorage.getItem('mpsone_role') === 'Admin') ? <AdminInvitations /> : <Navigate to="/supplier/clients" replace />}</SupplierOnly>} />
                      <Route path="/admin/people" element={<SupplierOnly>{(localStorage.getItem('mpsone_role') === 'Admin') ? <PeopleDirectory /> : <Navigate to="/supplier/clients" replace />}</SupplierOnly>} />
                      <Route path="/supplier/reporting" element={<SupplierOnly>{(localStorage.getItem('mpsone_role') === 'Admin') ? <Reporting /> : <Navigate to="/supplier/clients" replace />}</SupplierOnly>} />
                      <Route path="/supplier/email" element={<SupplierOnly>{(localStorage.getItem('mpsone_role') === 'Admin') ? <EmailDashboard /> : <Navigate to="/supplier/clients" replace />}</SupplierOnly>} />
                      <Route path="/supplier/clients" element={(localStorage.getItem('mpsone_user_type') === 'supplier') ? <ClientDirectory /> : <Navigate to="/procurement/workflow" replace />} />
                      <Route path="/supplier/enhanced" element={<ClientOnlyProcurement><EnhancedSupplierManagement /></ClientOnlyProcurement>} />
                    <Route path="/procurement/pr" element={<ClientOnlyProcurement><PRList /></ClientOnlyProcurement>} />
                    <Route path="/procurement/pr/new" element={<ClientOnlyProcurement><PRCreate /></ClientOnlyProcurement>} />
                    <Route path="/procurement/pr/enhanced" element={<ClientOnlyProcurement><EnhancedPRCreation /></ClientOnlyProcurement>} />
                    <Route path="/procurement/rfq/enhanced" element={<ClientOnlyProcurement><EnhancedRFQCreation /></ClientOnlyProcurement>} />
                    <Route path="/finance/invoice-matching" element={<ClientOnlyProcurement><EnhancedInvoiceMatching /></ClientOnlyProcurement>} />
                    <Route path="/procurement/po/preview" element={<ClientOnlyProcurement><POPreviewGuard /></ClientOnlyProcurement>} />
                    <Route path="/procurement/quote-builder" element={(
                      (localStorage.getItem('mpsone_user_type') === 'supplier' && hasApprovedPRForSupplier())
                        ? <SupplierOnly><QuoteBuilder /></SupplierOnly>
                        : <Navigate to="/procurement/workflow" replace />
                    )} />
                    <Route path="/procurement/workflow" element={<ClientOnlyProcurement><ProcurementWorkflow /></ClientOnlyProcurement>} />
                    <Route path="/supply/order-tracker" element={<OrderTracker />} />
                    <Route path="/inventory/delivery-notes" element={<DeliveryNotes />} />
                    {/* Dev: DB connectivity status page */}
                    <Route path="/dev/db-status" element={<DBStatus />} />
                      <Route path="/docs" element={isLoggedInUserType() ? (<DocumentManager overscan={computeOverscan('documents')} />) : (<Navigate to="/login/client" replace />)} />
                      <Route path="/comms" element={isLoggedInUserType() ? (<CommunicationHub />) : (<Navigate to="/login/client" replace />)} />
                      <Route path="/settings" element={isLoggedInUserType() ? (<Settings />) : (<Navigate to="/login/client" replace />)} />
                      <Route path="/notifications" element={isLoggedInUserType() ? (<Notifications />) : (<Navigate to="/login/client" replace />)} />
                      <Route path="/help" element={<HelpCenter />} />
                      <Route path="/help/docs" element={<DocViewer />} />
                      {/* People profiles */}
                      <Route path="/people/:userId" element={<UserProfile />} />
                      {/* Legacy redirects */}
                      <Route path="/admin" element={<Navigate to="/supplier/admin" replace />} />
                      <Route path="/email" element={<Navigate to="/supplier/email" replace />} />
                      <Route path="/reporting" element={<Navigate to="/supplier/reporting" replace />} />
                      <Route path="/onboarding" element={<Navigate to="/client/onboarding" replace />} />
                    </Routes>
                  </Suspense>
                </div>
              </div>
            </ErrorBoundary>
          </PillarProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
