import CreatureFormRow from "../components/molecules/CreatureFormRow";
import MoveFormRow from "../components/molecules/MoveFormRow";
import ItemFormRow from "../components/molecules/ItemFormRow";
import { useEffect, useState } from 'react';
import { Tables } from "@/types/database.types";
import { supabase } from "@/lib/supabase";

export default function AdminPanel(){

    const [ creatures, setCreatures ] = useState<Tables<'creatures'>[]>([]);
    const [ moves, setMoves ] = useState<Tables<'moves'>[]>([])
    const [ items, setItems ] = useState<Tables<'items'>[]>([]);

    useEffect(() => {
        async function fetchData(){
            const [cRes, mRes, iRes] = await Promise.all([
                supabase.from('creatures').select(),
                supabase.from('moves').select(),
                supabase.from('items').select(),
            ])
            if(cRes.data) setCreatures(cRes.data)
            if(mRes.data) setMoves(mRes.data)
            if(iRes.data) setItems(iRes.data)
        }
    fetchData();
    })

    return(
        <main>
            <h1>Welcome!</h1>

            <section>
                <h2>Creatures:</h2>
                <form>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>HP</th>
                                <th>Attack</th>
                                <th>Defence</th>
                                <th>Speed</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { creatures.map((creature) => (
                                <tr key={creature.id}>
                                    <td>{creature.id}</td>
                                    <td>{creature.name}</td>
                                    <td>{creature.type}</td>
                                    <td>{creature.base_hp}</td>
                                    <td>{creature.base_attack}</td>
                                    <td>{creature.base_defence}</td>
                                    <td>{creature.base_speed}</td>
                                    <td>{creature.description}</td>
                                    <td></td>
                                </tr>
                            ))}
                            <CreatureFormRow />
                        </tbody>
                    </table>
                </form>
            </section>

            <section>
                <h2>Moves:</h2>
                <form>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Power</th>
                                <th>Accuracy</th>
                                <th>Effect</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { moves.map((move) => (
                                <tr key={move.id}>
                                    <td>{move.id}</td>
                                    <td>{move.name}</td>
                                    <td>{move.type}</td>
                                    <td>{move.power}</td>
                                    <td>{move.accuracy}</td>
                                    <td>{move.effect}</td>
                                    <td>{move.description}</td>
                                    <td></td>
                                </tr>
                            ))}
                            <MoveFormRow />
                        </tbody>
                    </table>
                </form>
            </section>

            <section>
                <h2>Items:</h2>
                <form>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Effect</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            { items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>{item.effect}</td>
                                    <td>{item.price}</td>
                                    <td></td>
                                </tr>
                            ))}
                            <ItemFormRow />
                        </tbody>
                    </table>
                </form>
            </section>
        </main>
    )
}