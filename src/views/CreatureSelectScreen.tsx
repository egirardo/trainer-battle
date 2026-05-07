import { useTrainerCreation } from '@/hooks/useTrainerCreation'
import creature1 from '@/assets/sprites/creatures/test-character.png'
import creature2 from '@/assets/sprites/creatures/test-character2.png'
import creature3 from '@/assets/sprites/creatures/test-character3.png'

const creatures = [
    { id: 'test-character', name: 'Creature 1', sprite: creature1 },
    { id: 'test-character2', name: 'Creature 2', sprite: creature2 },
    { id: 'test-character3', name: 'Creature 3', sprite: creature3 },
]

export default function CreatureSelectScreen() {
    const { selectedCreature, setSelectedCreature } = useTrainerCreation()

    return (
        <main>
            <h1>Choose Your Starter Creature</h1>
            <div>
                {creatures.map(creature => (
                    <button
                        key={creature.id}
                        onClick={() => setSelectedCreature(creature.id)}
                        aria-pressed={selectedCreature === creature.id}
                    >
                        <img
                            src={creature.sprite}
                            alt={creature.name}
                            style={{ imageRendering: 'pixelated' }}
                        />
                        <p>{creature.name}</p>
                    </button>
                ))}
            </div>
        </main>
    )
}
