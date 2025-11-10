import React, { Suspense, lazy, useEffect } from 'react';
import { computeOverscan } from './config';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/UI/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sidebar } from './components/Layout/Sidebar';
import { Topbar, Breadcrumbs } from './components/Layout/Topbar';

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
const Reporting = lazy(() => import('./pages/supplier/Reporting'));
const PRList = lazy(() => import('./pages/procurement/PRList'));
const PRCreate = lazy(() => import('./pages/procurement/PRCreate'));
const EmailDashboard = lazy(() => import('./pages/supplier/EmailDashboard'));
const POPreview = lazy(() => import('./pages/POPreview'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const DocViewer = lazy(() => import('./pages/DocViewer'));
const DBStatus = lazy(() => import('./pages/DBStatus'));

function StartRedirect() {
  const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
  if (userType === 'supplier') return <Navigate to="/supplier/admin" replace />;
  if (userType === 'client') return <Navigate to="/client" replace />;
  // In development, route unknown users to client login for smoother testing
  if (import.meta.env && (import.meta.env as any).DEV) {
    return <Navigate to="/login/client" replace />;
  }
  useEffect(() => {
    // Fallback to corporate landing page when user type is unknown
    // Guard against React StrictMode double-invoke in development
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
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <OfflineIndicator />
            <div className="layout">
              <Sidebar />
              <div className="content" id="main-content">
                <Topbar>
                  <Breadcrumbs items={["Home"]} />
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
                    {/* Client routes */}
                    <Route path="/client" element={<ClientDashboard />} />
                    <Route path="/client/onboarding" element={<Onboarding />} />

                    {/* Supplier routes */}
                    <Route path="/supplier/admin" element={(localStorage.getItem('mpsone_role') === 'Admin') ? <AdminDashboard /> : <Navigate to="/client" replace />} />
                    <Route path="/supplier/reporting" element={(localStorage.getItem('mpsone_role') === 'Admin') ? <Reporting /> : <Navigate to="/client" replace />} />
                    <Route path="/supplier/email" element={(localStorage.getItem('mpsone_role') === 'Admin') ? <EmailDashboard /> : <Navigate to="/client" replace />} />
                    <Route path="/procurement/pr" element={<PRList />} />
                    <Route path="/procurement/pr/new" element={<PRCreate />} />
                    <Route path="/procurement/po/preview" element={<POPreview />} />
                  <Route path="/procurement/quote-builder" element={<QuoteBuilder />} />
                  <Route path="/supply/order-tracker" element={<OrderTracker />} />
                  {/* Dev: DB connectivity status page */}
                  <Route path="/dev/db-status" element={<DBStatus />} />
                    <Route path="/docs" element={<DocumentManager overscan={computeOverscan('documents')} />} />
                    <Route path="/comms" element={<CommunicationHub />} />
                    <Route path="/help" element={<HelpCenter />} />
                    <Route path="/help/docs" element={<DocViewer />} />
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
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
