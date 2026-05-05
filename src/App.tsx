import { Route, Routes } from 'react-router-dom'
import './App.css'
import StartScreen from './views/StartScreen'
import CharacterScreen from './views/CharacterScreen'
import Gameplayscreen from './views/GameplayScreen'
import LobbyScreen from './views/LobbyScreen'
import BattleScreen from './views/BattleScreen'
import MonsterScreen from './views/MonsterScreen'
import ResultScreen from './views/ResultScreen'

function App() {

  return (
    <>
    <Routes>
        <Route path="/" element={<StartScreen />}></Route>
        <Route path="/character" element={<CharacterScreen />}></Route>
        <Route path="/menu" element={<Gameplayscreen />}></Route>
        <Route path="/lobby" element={<LobbyScreen/>}></Route>
        <Route path="/battle" element={<BattleScreen />}></Route>
        <Route path="/monster" element={<MonsterScreen />}></Route>
        <Route path="/result" element={<ResultScreen />}></Route>
    </Routes>

    </>
  )
}

export default App
