import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { Company } from './pages/Company';
import { People } from './pages/People';
import { Companies } from './pages/Companies';
import { Groups } from './pages/Groups';
import { Jobs } from './pages/Jobs';
import { Search } from './pages/Search';
import { Post } from './pages/Post';
import { Settings } from './pages/Settings';
import { Network } from './pages/Network';
import { Invitations } from './pages/Invitations';
import { Events } from './pages/Events';
import { Media } from './pages/Media';
import { Discover } from './pages/Discover';
import { Insights } from './pages/Insights';
import { Calendar } from './pages/Calendar';
import { Bookmarks } from './pages/Bookmarks';
import { Articles } from './pages/Articles';
import { GroupDetail } from './pages/GroupDetail';
import { EventDetail } from './pages/EventDetail';
import { JobDetail } from './pages/JobDetail';
import { HelpCenter } from './pages/HelpCenter';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Marketplace } from './pages/Marketplace';
import { SupplierDirectory } from './pages/SupplierDirectory';
import { Opportunities } from './pages/Opportunities';
import { DealRooms } from './pages/DealRooms';
import { Offers } from './pages/Offers';
import { Catalog } from './pages/Catalog';
import { Partnerships } from './pages/Partnerships';
import { Leads } from './pages/Leads';
import { RFQBroadcast } from './pages/RFQBroadcast';
import { BusinessInquiry } from './pages/BusinessInquiry';

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
        <Link className="btn" to="/company">Company</Link>
        <Link className="btn" to="/people">People</Link>
        <Link className="btn" to="/companies">Companies</Link>
        <Link className="btn" to="/groups">Groups</Link>
        <Link className="btn" to="/jobs">Jobs</Link>
        <Link className="btn" to="/search">Search</Link>
        <Link className="btn" to="/settings">Settings</Link>
        <Link className="btn" to="/network">Network</Link>
        <Link className="btn" to="/discover">Discover</Link>
        <Link className="btn" to="/insights">Insights</Link>
        <Link className="btn" to="/media">Media</Link>
        <Link className="btn" to="/invitations">Invitations</Link>
        <Link className="btn" to="/dashboard">Dashboard</Link>
        <Link className="btn" to="/bookmarks">Bookmarks</Link>
        <Link className="btn" to="/help">Help</Link>
        <Link className="btn" to="/marketplace">Marketplace</Link>
        <Link className="btn" to="/suppliers">Suppliers</Link>
        <Link className="btn" to="/opportunities">Opportunities</Link>
        <Link className="btn" to="/dealrooms">Deal Rooms</Link>
        <Link className="btn" to="/offers">Offers</Link>
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
          <Route path="/company" element={<Company />} />
          <Route path="/people" element={<People />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/search" element={<Search />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/network" element={<Network />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/media" element={<Media />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/group/:id" element={<GroupDetail />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/suppliers" element={<SupplierDirectory />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/dealrooms" element={<DealRooms />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/rfq" element={<RFQBroadcast />} />
          <Route path="/inquiry" element={<BusinessInquiry />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
