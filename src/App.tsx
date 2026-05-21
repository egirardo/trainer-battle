import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { isIdentityToken } from './lib/identityToken'

function IdentityTokenEntry() {
  const { identityToken } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (isIdentityToken(identityToken)) {
      sessionStorage.setItem('identity_token', identityToken)
    } else {
      sessionStorage.removeItem('identity_token')
    }

    void navigate(ROUTES.start, { replace: true })
  }, [identityToken, navigate])

  return <div>Loading...</div>
}


function App() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { error, processing, flowActive } = useIdentityToken()
  const identityTokenInUrl = new URLSearchParams(location.search).get('identity_token')
  const validIdentityTokenInUrl = isIdentityToken(identityTokenInUrl) ? identityTokenInUrl : null
  const storedIdentityToken = sessionStorage.getItem('identity_token')
  const pendingIdentityToken = validIdentityTokenInUrl ?? (isIdentityToken(storedIdentityToken) ? storedIdentityToken : null)

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
            pendingIdentityToken || flowActive
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

        <Route path='/:identityToken' element={<IdentityTokenEntry />} />

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