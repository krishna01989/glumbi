import { Routes, Route, Navigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { OfflineContext, useOffline } from '../contexts/OfflineContext'
import { ActivityTrackerContext } from '../contexts/ActivityTrackerContext'
import useActivityTracker from '../hooks/useActivityTracker'
import FeatureGuard    from '../components/FeatureGuard'
import Stories         from '../features/stories/Stories'
import Journal         from '../features/journal/Journal'
import Activities      from '../features/activities/Activities'
import Curiosity       from '../features/curiosity/Curiosity'
import Draw            from '../features/draw/Draw'
import ReadQuiz        from '../features/readquiz/ReadQuiz'
import MyWriting       from '../features/mywriting/MyWriting'
import MemoryPlay      from '../features/memory/MemoryPlay'
import Maze            from '../features/trace/Maze'
import Riddle          from '../features/riddle/Riddle'
import LearnPage       from '../features/learn/LearnPage'
import ChildForm       from '../pages/ChildForm'
import ProfilePage     from '../pages/ProfilePage'
import ErrorPage       from '../pages/ErrorPage'
import CreditPop      from '../components/CreditPop'
import PrivacyPage     from '../pages/legal/PrivacyPage'
import TermsPage       from '../pages/legal/TermsPage'
import ContactPage     from '../pages/legal/ContactPage'
import HelpPage        from '../pages/HelpPage'
import { applyTheme }  from '../themes'

function ErrorPageRoute() {
  const { code } = useParams()
  return <ErrorPage code={code} />
}

function TrackerProvider({ child, childLocked, children }) {
  const isOffline = useOffline()
  const { track } = useActivityTracker(child, isOffline, childLocked)
  return (
    <ActivityTrackerContext.Provider value={{ track }}>
      {children}
    </ActivityTrackerContext.Provider>
  )
}

export default function ChildRoutes({
  child, childLocked, offlineMode,
  quota, featureConfig,
  onChildUpdated, onLogout,
}) {
  const guard = (name, el) => (
    <FeatureGuard featureName={name} featureConfig={featureConfig}>{el}</FeatureGuard>
  )
  const blockedWhenLocked = (el) =>
    childLocked ? <Navigate to={`/child/${child.id}/stories`} replace /> : el

  return (
    <OfflineContext.Provider value={offlineMode}>
      <TrackerProvider child={child} childLocked={childLocked}>
      <CreditPop />
      <div className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/child/:childId/stories"    element={guard('story',              <Stories    child={child} quota={quota} />)} />
          <Route path="/child/:childId/activities" element={guard('activity',           <Activities child={child} quota={quota} />)} />
          <Route path="/child/:childId/curiosity"  element={guard('curiosity',          <Curiosity  child={child} quota={quota} />)} />
          <Route path="/child/:childId/draw"       element={guard('draw',               <Draw       child={child} quota={quota} featureConfig={featureConfig} />)} />
          <Route path="/child/:childId/journal"    element={<Journal    child={child} featureConfig={featureConfig} quota={quota} />} />
          <Route path="/child/:childId/readquiz"   element={guard('read-quiz',          <ReadQuiz   child={child} quota={quota} />)} />
          <Route path="/child/:childId/learn"      element={guard('learn-validate',     <LearnPage  child={child} quota={quota} />)} />
          <Route path="/child/:childId/mywriting"  element={guard('writing-coach',      <MyWriting  child={child} quota={quota} />)} />
          <Route path="/child/:childId/memory"     element={guard('memory-flashcards',  <MemoryPlay child={child} quota={quota} />)} />
          <Route path="/child/:childId/maze"       element={guard('maze',               <Maze       child={child} quota={quota} featureConfig={featureConfig} />)} />
          <Route path="/child/:childId/trace"      element={<Navigate to={`/child/${child?.id}/maze`} replace />} />
          <Route path="/child/:childId/riddle"     element={guard('riddle',             <Riddle     child={child} quota={quota} featureConfig={featureConfig} />)} />
          <Route path="/child/:id/edit"            element={blockedWhenLocked(
            <ChildForm onChildUpdated={onChildUpdated} enabledFeatureConfig={featureConfig} inChildContext />
          )} />
          <Route path="/child/:childId/profile"    element={blockedWhenLocked(<ProfilePage onLogout={onLogout} />)} />
          <Route path="/profile"                   element={blockedWhenLocked(<ProfilePage onLogout={onLogout} />)} />
          <Route path="/privacy"                   element={<PrivacyPage inApp />} />
          <Route path="/terms"                     element={<TermsPage inApp />} />
          <Route path="/contact"                   element={<ContactPage inApp />} />
          <Route path="/help"                      element={<HelpPage />} />
          <Route path="/error/:code"               element={<ErrorPageRoute />} />
          <Route path="*"                          element={<Navigate to={`/child/${child?.id}/stories`} replace />} />
        </Routes>
      </div>
      </TrackerProvider>
    </OfflineContext.Provider>
  )
}
