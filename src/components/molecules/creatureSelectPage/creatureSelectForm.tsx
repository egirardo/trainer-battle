import styles from './creatureSelectForm.module.css';
import CreaturePreview from './creaturePreview';
import IconButton from '@/components/atoms/IconButton';
import React from 'react';
import { useTrainerCreation } from '@/hooks/useTrainerCreation';
import { localCreatures } from '@/data/localCreatures';
import fireBall from '@/assets/sprites/creatures/fire-ball.png';
import waterBall from '@/assets/sprites/creatures/water-ball.png';
import grassBall from '@/assets/sprites/creatures/grass-ball.png';
import type { Creature, CreatureType } from '@/models/models';
import CreatureInfo from './creatureInfo';

const ballImages: Record<CreatureType, string> = {
    fire: fireBall,
    water: waterBall,
    grass: grassBall,
};

export default function CreatureSelectForm() {
    const { selectedCreature, setSelectedCreature, creatureError, setCreatureError } = useTrainerCreation();

    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(selectedCreature);
        // TODO: replace console.log with Supabase insert
    }

    return (
        <div className={styles.creatureSelectFormContainer}>
            <div>
                <h1>Your Creature</h1>
            </div>
            <CreaturePreview creature={selectedCreature} />
            <form className={styles.creatureSelectForm} onSubmit={handleSubmit} noValidate>
                <fieldset className={styles.creatureTypeSelect}>
                    <legend className={styles.creatureTypeSelectLegend}>Choose your creature</legend>
                    <div className={styles.creatureOptions}>
                    {localCreatures.map((creature: Creature) => (
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
