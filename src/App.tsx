import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { ROUTES } from './routes'
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


  return (
    <>
    <Routes>
        <Route path={ROUTES.start} element={<StartScreen />}></Route>
        <Route path={ROUTES.login} element={<Login />}></Route>
        <Route path={ROUTES.register} element={<Register />}></Route>
        <Route element={<TrainerCreationProvider><CreationFlowLayout /></TrainerCreationProvider>}>
            <Route path={ROUTES.characterSelect} element={<CharacterSelectScreen />} />
            <Route path={ROUTES.creatureSelect} element={<CreatureSelectScreen />} />
            <Route path={ROUTES.profileConfirmation} element={<ProfileConfirmation />} />
        </Route>
        <Route path={ROUTES.gameMenu} element={<GameMenuScreen />}></Route>
        <Route path={ROUTES.lobby} element={<LobbyScreen/>}></Route>
        <Route path={ROUTES.battle} element={<BattleScreen />}></Route>
        <Route path={ROUTES.battleSession} element={<BattleScreen />}></Route>
        <Route path={ROUTES.battleResult} element={<ResultScreen />}></Route>
        <Route path={ROUTES.adminLogin} element={<AdminLogin/>}></Route>
        <Route path={ROUTES.adminPanel} element={<AdminPanel/>}></Route>
        <Route path="/battle/:sessionId" element={<BattleScreen />} />
        <Route path="*" element={<Navigate to={ROUTES.start} replace />}></Route>
    </Routes>

    </>
  )
}

export default App
