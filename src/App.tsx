import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import './App.css'
import StartScreen from './views/StartScreen'
import CharacterSelectScreen from './views/CharacterSelectScreen'
import GameMenuScreen from './views/GameMenuScreen'
import LobbyScreen from './views/LobbyScreen'
import BattleScreen from './views/BattleScreen'
import CreatureSelectScreen from './views/CreatureSelectScreen'
import ResultScreen from './views/ResultScreen'
import AdminPanel from './views/AdminPanel'
import Login from './views/Login'
import Register from './views/Register'
import ProfileConfirmation from './views/ProfileConfirmation'
import { TrainerCreationProvider } from './context/TrainerCreationContext'
import CreationFlowLayout from './layouts/CreationFlowLayout'

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
        <Route path="/admin-panel" element={<AdminPanel/>}></Route>
        <Route path="*" element={<Navigate to="/" replace />}></Route>
    </Routes>

    </>
  )
}

export default App
