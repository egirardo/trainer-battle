import TrainerInfoForm from "@/components/molecules/createTrainerPage/TrainerInfoForm";
import { useTrainerCreation } from "@/hooks/useTrainerCreation";

export default function CharacterSelectScreen(){
    const { trainerGender, setTrainerGender, trainerName, setTrainerName } = useTrainerCreation();

    return(
        <main>
            <TrainerInfoForm
                trainerGender={trainerGender}
                setTrainerGender={setTrainerGender}
                trainerName={trainerName}
                setTrainerName={setTrainerName}
            />
        </main>
    )
}