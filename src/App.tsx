import { Navigate, Route, Routes } from 'react-router-dom'

import './App.css'
import StartScreen from './views/StartScreen'
import CharacterSelectScreen from './views/CharacterSelectScreen'
import GameMenuScreen from './views/GameMenuScreen'
import LobbyScreen from './views/LobbyScreen'
import BattleScreen from './views/BattleScreen'
import CreatureSelectScreen from './views/CreatureSelectScreen'
import ResultScreen from './views/ResultScreen'
import AdminPanel from './views/AdminPanel'
import AdminLogin from './views/AdminLogin'
import Login from './views/Login'
import Register from './views/Register'
import ProfileConfirmation from './views/ProfileConfirmation'
import { TrainerCreationProvider } from './context/TrainerCreationContext'
import CreationFlowLayout from './layouts/CreationFlowLayout'

// AdminRoute must be a component (not an inline expression in App) so that
// localStorage is read at render time and not once when App first mounts.
// An inline `isAdmin` variable in App would be stale after navigate() is called.
function AdminRoute() {
  return localStorage.getItem('adminUsername') !== null
    ? <AdminPanel />
    : <Navigate to="/admin-login" replace />;
}

function App() {
  return (
    <>
    <Routes>
        <Route path="/" element={<StartScreen />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route element={<TrainerCreationProvider><CreationFlowLayout /></TrainerCreationProvider>}>
            <Route path="/character-select" element={<CharacterSelectScreen />} />
            <Route path="/creature-select" element={<CreatureSelectScreen />} />
            <Route path="/profile-confirmation" element={<ProfileConfirmation />} />
        </Route>
        <Route path="/game-menu" element={<GameMenuScreen />}></Route>
        <Route path="/lobby" element={<LobbyScreen/>}></Route>
        <Route path="/battle" element={<BattleScreen />}></Route>
        <Route path="/battle-result" element={<ResultScreen />}></Route>
        <Route path="/admin-login" element={<AdminLogin />}></Route>
        <Route path="/admin-panel" element={<AdminRoute />}></Route>
        <Route path="*" element={<Navigate to="/" replace />}></Route>
    </Routes>

    </>
  )
}

export default App
