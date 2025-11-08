import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/UI/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sidebar } from './components/Layout/Sidebar';
import { Topbar, Breadcrumbs } from './components/Layout/Topbar';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const QuoteBuilder = lazy(() => import('./pages/QuoteBuilder'));
const OrderTracker = lazy(() => import('./pages/OrderTracker'));
const DocumentManager = lazy(() => import('./pages/DocumentManager'));
const CommunicationHub = lazy(() => import('./pages/CommunicationHub'));
const Reporting = lazy(() => import('./pages/Reporting'));

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <OfflineIndicator />
            <div className="layout">
              <Sidebar />
              <div className="content">
                <Topbar>
                  <Breadcrumbs items={["Home"]} />
                </Topbar>
                <Suspense fallback={<div className="main"><div className="skeleton" style={{ height: 160, borderRadius: 8 }}></div></div>}>
                  <Routes>
                    <Route path="/" element={<ClientDashboard />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/client" element={<ClientDashboard />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/procurement/quote-builder" element={<QuoteBuilder />} />
                    <Route path="/supply/order-tracker" element={<OrderTracker />} />
                    <Route path="/docs" element={<DocumentManager />} />
                    <Route path="/comms" element={<CommunicationHub />} />
                    <Route path="/reporting" element={<Reporting />} />
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