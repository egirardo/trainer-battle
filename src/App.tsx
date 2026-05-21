import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { ROUTES } from './routes'
import { useAuth } from './hooks/useAuth'
import { useIdentityToken } from './hooks/useIdentityToken'
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
import ShopScreen from './views/ShopScreen'
import ProfilePageScreen from './views/ProfilePageScreen'


function App() {
  const { user, loading } = useAuth()
  const { error, processing, flowActive } = useIdentityToken()
  const identityTokenInUrl = new URLSearchParams(window.location.search).get('identity_token')

  if (loading || processing) return <div>Loading...</div>

  if (error) return (
    <main>
      <p>{error}</p>
      <a href="https://frontend-main-1ac7.up.railway.app/">Return to Tivoli</a>
    </main>
  )

  return (
    <Routes>
        {/* Public routes */}
        <Route 
          path={ROUTES.start} 
          element={
            identityTokenInUrl || flowActive
              ? <StartScreen />
              : user
                ? <Navigate to={ROUTES.gameMenu} replace />
                : <StartScreen />
          }
        />

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
          element={<AdminLogin />}
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
          element={!user ? <Navigate to={ROUTES.adminLogin} replace /> : <AdminPanel />}
        />
        <Route
          path={ROUTES.shop}
          element={!user ? <Navigate to={ROUTES.login} replace /> : <ShopScreen />}
        />
        <Route
          path={ROUTES.profile}
          element={!user ? <Navigate to={ROUTES.login} replace /> : <ProfilePageScreen />}
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

export default App