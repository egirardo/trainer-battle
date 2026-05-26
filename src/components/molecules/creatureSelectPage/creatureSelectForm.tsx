import styles from './creatureSelectForm.module.css';
import CreaturePreview from './creaturePreview';
import IconButton from '@/components/atoms/IconButton';
import { useTrainerCreation } from '@/hooks/useTrainerCreation';
import { useCreatures } from '@/hooks/useCreatures';
import fireBall from '@/assets/sprites/creatures/fire-ball.png';
import waterBall from '@/assets/sprites/creatures/water-ball.png';
import grassBall from '@/assets/sprites/creatures/grass-ball.png';
import type { CreatureType } from '@/models/models';
import CreatureInfo from './creatureInfo';

const ballImages: Partial<Record<CreatureType, string>> = {
    fire: fireBall,
    water: waterBall,
    grass: grassBall,
};

export default function CreatureSelectForm() {
    const { selectedCreature, setSelectedCreature, creatureError, setCreatureError } = useTrainerCreation();
    const { creatures, loading, error } = useCreatures();

    return (
        <div className={styles.creatureSelectFormContainer}>
            <CreaturePreview creature={selectedCreature} />
            <form className={styles.creatureSelectForm} noValidate>
                <fieldset className={styles.creatureTypeSelect}>
                    <legend className={styles.creatureTypeSelectLegend}>Choose your creature</legend>
                    <div className={styles.creatureOptions}>
                        {loading && <p>Loading creatures...</p>}
                        {error && <p role="alert">{error}</p>}
                        {creatures.map(creature => (
                            <IconButton
                                key={creature.id}
                                image={ballImages[creature.type]}
                                iconSize='L'
                                ariaLabel={`Select ${creature.name}`}
                                onClick={() => { setSelectedCreature(creature); setCreatureError(undefined); }}
                                isSelected={selectedCreature?.id === creature.id}
                            />
                        ))}
                    </div>
                </fieldset>
                {selectedCreature && (
                    <CreatureInfo creature={selectedCreature} />
                )}
                {creatureError && <span className={styles.errorMessage} role="alert">{creatureError}</span>}
            </form>
        </div>
    );
}
