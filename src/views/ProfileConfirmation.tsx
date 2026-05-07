import { useTrainerCreation } from '@/hooks/useTrainerCreation'
import { useNavigate } from 'react-router-dom'

export default function ProfileConfirmation() {
    const { trainerName, trainerGender, selectedCreature } = useTrainerCreation()
    const navigate = useNavigate()

    function handleSubmit() {
        console.log({ trainerName, trainerGender, selectedCreature })
        // TODO: replace with Supabase insert
        navigate('/game-menu')
    }

    return (
        <main>
            <h1>Confirm Your Profile</h1>
            <p>Name: {trainerName}</p>
            <p>Gender: {trainerGender}</p>
            <p>Starter Creature: {selectedCreature ?? 'None selected'}</p>
            <button onClick={handleSubmit}>Confirm & Start</button>
        </main>
    )
}
