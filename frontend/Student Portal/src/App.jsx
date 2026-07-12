import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './core/context/AppContext';
import { MainLayout } from './core/layouts/MainLayout';
import { AuthLayout } from './core/layouts/AuthLayout';
import { ProtectedRoute } from './core/components/ProtectedRoute';

import { SignInPage } from './modules/auth/pages/SignInPage';
import { SignUpPage } from './modules/auth/pages/SignUpPage';

import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { AnalyticsPage } from './modules/analytics/pages/AnalyticsPage';
import { ResumeBuilderPage } from './modules/resume/pages/ResumeBuilderPage';
import { ATSViewPage } from './modules/ats/pages/ATSViewPage';
import { ProfilePage } from './modules/profile/pages/ProfilePage';
import { SettingsPage } from './modules/settings/pages/SettingsPage';
import { SearchJobsPage } from './modules/jobs/pages/SearchJobsPage';
import { InterviewOverviewPage } from './modules/interview/pages/InterviewOverviewPage';
import { AptitudePage, TechnicalPage, CodingPage, HRPage, MockTestPage, CompanyPage, ProgressPage } from './modules/interview/pages/InterviewPlaceholders';
import { NotificationsPage } from './modules/notifications/pages/NotificationsPage';
import { HelpdeskPage } from './modules/helpdesk/pages/HelpdeskPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>

          {/* Protected Main Routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="search" element={<SearchJobsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="resume" element={<ResumeBuilderPage />} />
            <Route path="ats" element={<ATSViewPage />} />
            <Route path="interview">
              <Route index element={<InterviewOverviewPage />} />
              <Route path="overview" element={<InterviewOverviewPage />} />
              <Route path="aptitude" element={<AptitudePage />} />
              <Route path="technical" element={<TechnicalPage />} />
              <Route path="coding" element={<CodingPage />} />
              <Route path="hr" element={<HRPage />} />
              <Route path="mock-test" element={<MockTestPage />} />
              <Route path="company" element={<CompanyPage />} />
              <Route path="progress" element={<ProgressPage />} />
            </Route>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="helpdesk" element={<HelpdeskPage />} />
            {/* Fallback for pages not implemented yet */}
            <Route path="*" element={
              <div className="p-6">
                <h2 className="text-2xl font-bold">Coming Soon</h2>
                <p className="text-gray-500">This feature is not fully implemented yet.</p>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
