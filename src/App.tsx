import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Universities from './pages/Universities';
import UniversityDetail from './pages/UniversityDetail';
import Degrees from './pages/Degrees';
import DegreeDetail from './pages/DegreeDetail';
import Scholarships from './pages/Scholarships';
import ScholarshipDetail from './pages/ScholarshipDetail';
import AdmissionCalendar from './pages/AdmissionCalendar';
import Compare from './pages/Compare';
import MeritPredictor from './pages/MeritPredictor';
import CareerAdvisor from './pages/CareerAdvisor';
import FeeCalculator from './pages/FeeCalculator';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/universities/:slug" element={<UniversityDetail />} />
        <Route path="/degrees" element={<Degrees />} />
        <Route path="/degrees/:slug" element={<DegreeDetail />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/scholarships/:slug" element={<ScholarshipDetail />} />
        <Route path="/admission-calendar" element={<AdmissionCalendar />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/merit-predictor" element={<MeritPredictor />} />
        <Route path="/career-advisor" element={<CareerAdvisor />} />
        <Route path="/fee-calculator" element={<FeeCalculator />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
