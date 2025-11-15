import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';

function Topbar() {
  return (
    <div className="topbar">
      <div className="inner">
        <Link to="/" className="btn">MPSBook</Link>
        <input className="input" placeholder="Search people, posts, companies" aria-label="Search" />
        <div style={{ flex: 1 }} />
        <Link className="btn" to="/messages">Messages</Link>
        <Link className="btn" to="/notifications">Notifications</Link>
        <Link className="btn primary" to="/profile">Profile</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Topbar />
      <Suspense fallback={<div className="card" style={{ margin: 16 }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

