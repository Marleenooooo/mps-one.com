import React, { Suspense, lazy } from 'react';
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
const QuoteBuilder = lazy(() => import('./pages/QuoteBuilder'));
const OrderTracker = lazy(() => import('./pages/OrderTracker'));
const DocumentManager = lazy(() => import('./pages/DocumentManager'));
const CommunicationHub = lazy(() => import('./pages/CommunicationHub'));
const Reporting = lazy(() => import('./pages/supplier/Reporting'));
const PRList = lazy(() => import('./pages/procurement/PRList'));
const PRCreate = lazy(() => import('./pages/procurement/PRCreate'));
const EmailDashboard = lazy(() => import('./pages/supplier/EmailDashboard'));

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
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to={(localStorage.getItem('mpsone_role') === 'Admin') ? '/supplier/admin' : '/client'} replace />} />
                    {/* Client routes */}
                    <Route path="/client" element={<ClientDashboard />} />
                    <Route path="/client/onboarding" element={<Onboarding />} />

                    {/* Supplier routes */}
                    <Route path="/supplier/admin" element={(localStorage.getItem('mpsone_role') === 'Admin') ? <AdminDashboard /> : <Navigate to="/client" replace />} />
                    <Route path="/supplier/reporting" element={(localStorage.getItem('mpsone_role') === 'Admin') ? <Reporting /> : <Navigate to="/client" replace />} />
                    <Route path="/supplier/email" element={(localStorage.getItem('mpsone_role') === 'Admin') ? <EmailDashboard /> : <Navigate to="/client" replace />} />
                    <Route path="/procurement/pr" element={<PRList />} />
                    <Route path="/procurement/pr/new" element={<PRCreate />} />
                    <Route path="/procurement/quote-builder" element={<QuoteBuilder />} />
                    <Route path="/supply/order-tracker" element={<OrderTracker />} />
                    <Route path="/docs" element={<DocumentManager />} />
                    <Route path="/comms" element={<CommunicationHub />} />
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
