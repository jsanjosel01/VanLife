import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { LandingPage } from '../pages/LandingPage';
import { MapPage } from '../pages/MapPage';
import LoginPage from '../pages/LoginPage';
import { Toaster } from 'sonner';
import { SignUpPage } from '../pages/SignUpPage';
import Profile from '../pages/Profile';
import ResetPassword from '@/pages/ResetPassword';
import { AdminPage } from '@/pages/AdminPage';
import { TermsPage } from '@/pages/TermsPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { DashboardPage } from '@/pages/DashboardPage';


function App() {
  return (
    <AppLayout>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        
        <Route path="/admin" element={<AdminPage />} />

        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/admin/dashboard" element={<DashboardPage />} />
        
      </Routes>
    </AppLayout>
  );
}

export default App;