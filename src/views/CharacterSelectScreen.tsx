import React from "react";
import { Link } from "react-router-dom";
import TrainerCard from "@/components/molecules/createTrainerPage/TrainerCard";
import TrainerInfoForm from "@/components/molecules/createTrainerPage/TrainerInfoForm";


export default function CharacterSelectScreen(){
    const [trainerGender, setTrainerGender] = React.useState<'male' | 'female' | 'nb'>('female');
    const [trainerName, setTrainerName] = React.useState('');

    return(
        <main>
            <TrainerCard trainerName={trainerName || "Your Trainer Name"} trainerGender={trainerGender} />
            <TrainerInfoForm
                trainerGender={trainerGender}
                setTrainerGender={setTrainerGender}
                trainerName={trainerName}
                setTrainerName={setTrainerName}
            />
            <Link to="/monster-select">Next to monster select</Link>
        </main>
    )
}