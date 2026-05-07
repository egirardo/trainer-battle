import styles from './TrainerInfoForm.module.css';
import InputField from '@/components/atoms/InputField';
import IconButton from '@/components/atoms/IconButton';
import femaleIcon from "@/assets/sprites/icons/female-icon.svg";
import maleIcon from "@/assets/sprites/icons/male-icon.svg";
import nbIcon from "@/assets/sprites/icons/nb-icon.svg";
import React from 'react';
import TrainerAvatarPreview from './TrainerAvatarPreview';
import { useTrainerCreation } from '@/hooks/useTrainerCreation';
import { validateTrainerName } from '@/utils/trainerValidation';
import type { TrainerGender } from '@/context/trainerCreationContextDef';

interface TrainerInfoFormProps {
    trainerGender: TrainerGender;
    setTrainerGender: React.Dispatch<React.SetStateAction<TrainerGender>>;
    trainerName: string;
    setTrainerName: React.Dispatch<React.SetStateAction<string>>;
}

export default function TrainerInfoForm({ trainerGender, setTrainerGender, trainerName, setTrainerName }: TrainerInfoFormProps) {
    const { trainerNameError, setTrainerNameError } = useTrainerCreation();

    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        const error = validateTrainerName(trainerName);
        if (error) { setTrainerNameError(error); return; }
        setTrainerNameError(undefined);
        console.log({ trainerName, trainerGender });
        // TODO: replace console.log with Supabase insert
    };

    return (
        <>
        <div className={styles.instructions}>
            <h1>Your Trainer</h1>
        </div>
        <TrainerAvatarPreview trainerGender={trainerGender} />
        <form className={styles.trainerInfoForm} onSubmit={handleSubmit} noValidate>
            <InputField labelName='What is your name?' id="trainer-name" type="text" placeholder="Enter your name..." value={trainerName} onChange={e => { setTrainerName(e.target.value); setTrainerNameError(undefined); }} error={trainerNameError} />
            <fieldset className={styles.genderSelect}>
                <legend className={styles.genderSelectLegend}>What is your gender?</legend>
                <IconButton image={femaleIcon} ariaLabel="Select Female Gender" onClick={() => setTrainerGender('female')} isSelected={trainerGender === 'female'} />
                <IconButton image={maleIcon} ariaLabel="Select Male Gender" onClick={() => setTrainerGender('male')} isSelected={trainerGender === 'male'} />
                <IconButton image={nbIcon} ariaLabel="Select Non-Binary Gender" onClick={() => setTrainerGender('nb')} isSelected={trainerGender === 'nb'} />
            </fieldset>
        </form>
    </>
    )

}