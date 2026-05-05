import { Route, Routes } from 'react-router-dom'
import './App.css'
import StartScreen from './views/StartScreen'
import CharacterSelectScreen from './views/CharacterSelectScreen'
import GameMenuScreen from './views/GameMenuScreen'
import LobbyScreen from './views/LobbyScreen'
import BattleScreen from './views/BattleScreen'
import MonsterSelectScreen from './views/MonsterSelectScreen'
import ResultScreen from './views/ResultScreen'

function App() {

  return (
    <>
    <Routes>
        <Route path="/" element={<StartScreen />}></Route>
        <Route path="/character-select" element={<CharacterSelectScreen />}></Route>
        <Route path="/game-menu" element={<GameMenuScreen />}></Route>
        <Route path="/lobby" element={<LobbyScreen/>}></Route>
        <Route path="/battle" element={<BattleScreen />}></Route>
        <Route path="/monster-select" element={<MonsterSelectScreen />}></Route>
        <Route path="/battle-result" element={<ResultScreen />}></Route>
    </Routes>

    </>
  )
}

export default App
