import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { ROUTES } from './routes'
import { useAuth } from './hooks/useAuth'
import StartScreen from './views/StartScreen'
import CharacterSelectScreen from './views/CharacterSelectScreen'
import GameMenuScreen from './views/GameMenuScreen'
import LobbyScreen from './views/LobbyScreen'
import BattleScreen from './views/BattleScreen'
import CreatureSelectScreen from './views/CreatureSelectScreen'
import ResultScreen from './views/ResultScreen'
import AdminLogin from './views/AdminLogin'
import AdminPanel from './views/AdminPanel'
import Login from './views/Login'
import Register from './views/Register'
import ProfileConfirmation from './views/ProfileConfirmation'
import { TrainerCreationProvider } from './context/TrainerCreationContext'
import CreationFlowLayout from './layouts/CreationFlowLayout'

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>

  return (
    <Routes>
        {/* Public routes */}
        <Route path={ROUTES.start} element={<StartScreen />}></Route>

        {/* Auth routes - redirect away if already logged in */}
        <Route 
        path={ROUTES.login} 
        element={user ? <Navigate to={ROUTES.gameMenu} replace /> : <Login />}
        />
        <Route 
        path={ROUTES.register} 
        element={user ? <Navigate to={ROUTES.gameMenu} replace /> : <Register />}
        />
        <Route 
        path={ROUTES.adminLogin} 
        element={user ? <Navigate to={ROUTES.adminPanel} replace /> : <AdminLogin/>}
        />

        {/* Protected routes - redirect to login if not logged in */}
        <Route 
        path={ROUTES.gameMenu} 
        element={!user ? <Navigate to={ROUTES.login} replace /> : <GameMenuScreen />}
        />
        <Route 
        path={ROUTES.lobby} 
        element={!user ? <Navigate to={ROUTES.login} replace /> : <LobbyScreen />}
        />
        <Route 
        path={ROUTES.battle} 
        element={!user ? <Navigate to={ROUTES.login} replace /> : <BattleScreen />}
        />
        <Route 
        path={ROUTES.battleSession} 
        element={!user ? <Navigate to={ROUTES.login} replace /> : <BattleScreen />}
        />
        <Route 
        path={ROUTES.battleResult} 
        element={!user ? <Navigate to={ROUTES.login} replace /> : <ResultScreen />}
        />
        <Route 
        path={ROUTES.adminPanel} 
        element={!user ? <Navigate to={ROUTES.adminLogin} replace /> : <AdminPanel/>}
        />

        {/* Onboarding flow - protected */}


        <Route 
          element={
            !user
              ? <Navigate to={ROUTES.login} replace />
              : <TrainerCreationProvider><CreationFlowLayout /></TrainerCreationProvider>
          }
        > 
          <Route path={ROUTES.characterSelect} element={<CharacterSelectScreen />} />
          <Route path={ROUTES.creatureSelect} element={<CreatureSelectScreen />} />
          <Route path={ROUTES.profileConfirmation} element={<ProfileConfirmation />} />
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.start} replace />} />
    </Routes>
  )
}

export default App;