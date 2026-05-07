import styles from './TrainerInfoForm.module.css';
import InputField from '@/components/atoms/InputField';
import Button from '@/components/atoms/button';
import IconButton from '@/components/atoms/IconButton';
import femaleIcon from "@/assets/sprites/icons/female-icon.svg";
import maleIcon from "@/assets/sprites/icons/male-icon.svg";
import nbIcon from "@/assets/sprites/icons/nb-icon.svg";
import React from 'react';

type TrainerGender = 'male' | 'female' | 'nb';

interface TrainerInfoFormProps {
    trainerGender: TrainerGender;
    setTrainerGender: React.Dispatch<React.SetStateAction<TrainerGender>>;
    trainerName: string;
    setTrainerName: React.Dispatch<React.SetStateAction<string>>;
}

export default function TrainerInfoForm({ trainerGender, setTrainerGender, trainerName, setTrainerName }: TrainerInfoFormProps) {

    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log({ trainerName, trainerGender });
        // TODO: replace console.log with Supabase insert
    };

    return (
        <>
        <div className={styles.instructions}>
            <p>Welcome to the world of Trainer Battle! Please enter your trainer information below to get started.</p>
            <p>Don't worry about making mistakes — you can always change your name and gender later in your profile settings.</p>
        </div>
        <form className={styles.trainerInfoForm} onSubmit={handleSubmit}>
            <label htmlFor="trainer-name">Trainer Name:</label>
            <InputField id="trainer-name" type="text" placeholder="Enter your trainer name..." value={trainerName} onChange={e => setTrainerName(e.target.value)} required/> {/* // Add error handling to InputField once Laura's PR is merged, then add validation here to prevent empty names or names that are too long. */}
            <fieldset className={styles.genderSelect}>
                <legend>Choose your gender:</legend>
                <IconButton image={femaleIcon} ariaLabel="Select Female Gender" onClick={() => setTrainerGender('female')} isSelected={trainerGender === 'female'} />
                <IconButton image={maleIcon} ariaLabel="Select Male Gender" onClick={() => setTrainerGender('male')} isSelected={trainerGender === 'male'} />
                <IconButton image={nbIcon} ariaLabel="Select Non-Binary Gender" onClick={() => setTrainerGender('nb')} isSelected={trainerGender === 'nb'} />
            </fieldset>
            <Button type="submit">Submit</Button>
        </form>
    </>
    )

}