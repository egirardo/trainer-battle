import { useTrainerCreation } from '@/hooks/useTrainerCreation'
import monster1 from '@/assets/sprites/monsters/test-character.png'
import monster2 from '@/assets/sprites/monsters/test-character2.png'
import monster3 from '@/assets/sprites/monsters/test-character3.png'

const monsters = [
    { id: 'test-character', name: 'Monster 1', sprite: monster1 },
    { id: 'test-character2', name: 'Monster 2', sprite: monster2 },
    { id: 'test-character3', name: 'Monster 3', sprite: monster3 },
]

export default function MonsterSelectScreen() {
    const { selectedMonster, setSelectedMonster } = useTrainerCreation()

    return (
        <main>
            <h1>Choose Your Starter Monster</h1>
            <div>
                {monsters.map(monster => (
                    <button
                        key={monster.id}
                        onClick={() => setSelectedMonster(monster.id)}
                        aria-pressed={selectedMonster === monster.id}
                    >
                        <img
                            src={monster.sprite}
                            alt={monster.name}
                            style={{ imageRendering: 'pixelated' }}
                        />
                        <p>{monster.name}</p>
                    </button>
                ))}
            </div>
        </main>
    )
}
