import { Routes, Route, Navigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import AuthPage            from '../pages/AuthPage'
import LandingPage         from '../pages/LandingPage'
import DemoPage            from '../pages/DemoPage'
import ErrorPage           from '../pages/ErrorPage'
import ForgotPasswordPage  from '../pages/ForgotPasswordPage'
import ResetPasswordPage   from '../pages/ResetPasswordPage'
import PrivacyPage         from '../pages/legal/PrivacyPage'
import TermsPage           from '../pages/legal/TermsPage'
import ContactPage         from '../pages/legal/ContactPage'
import PublicHeader        from '../components/PublicHeader'
import Footer              from '../components/Footer'

function ErrorPageRoute() {
  const { code } = useParams()
  return <ErrorPage code={code} />
}

export default function PublicRoutes({ onAuth }) {
  return (
    <Routes>
      <Route path="/"           element={<Navigate to="/about" replace />} />
      <Route path="/about"      element={<LandingPage />} />
      <Route path="/demo"       element={<DemoPage />} />
      <Route path="/login"           element={<AuthPage onAuth={onAuth} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/privacy"    element={<><PublicHeader /><PrivacyPage /><Footer /></>} />
      <Route path="/terms"      element={<><PublicHeader /><TermsPage /><Footer /></>} />
      <Route path="/contact"    element={<><PublicHeader /><ContactPage /><Footer /></>} />
      <Route path="/error/:code" element={<ErrorPageRoute />} />
      <Route path="/child/*"    element={<Navigate to="/login" replace />} />
      <Route path="/admin/*"    element={<Navigate to="/login" replace />} />
      <Route path="*"           element={<ErrorPage code={404} />} />
    </Routes>
  )
}
