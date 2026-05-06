import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import './App.css'
import StartScreen from './views/StartScreen'
import CharacterSelectScreen from './views/CharacterSelectScreen'
import GameMenuScreen from './views/GameMenuScreen'
import LobbyScreen from './views/LobbyScreen'
import BattleScreen from './views/BattleScreen'
import MonsterSelectScreen from './views/MonsterSelectScreen'
import ResultScreen from './views/ResultScreen'
import AdminPanel from './views/AdminPanel'
import Login from './views/Login'

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
    <Routes>
        <Route path="/" element={<StartScreen />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/character-select" element={<CharacterSelectScreen />}></Route>
        <Route path="/game-menu" element={<GameMenuScreen />}></Route>
        <Route path="/lobby" element={<LobbyScreen/>}></Route>
        <Route path="/battle" element={<BattleScreen />}></Route>
        <Route path="/monster-select" element={<MonsterSelectScreen />}></Route>
        <Route path="/battle-result" element={<ResultScreen />}></Route>
        <Route path="/admin-panel" element={<AdminPanel/>}></Route>
        <Route path="*" element={<Navigate to="/" replace />}></Route>
    </Routes>

    </>
  )
}

export default App
