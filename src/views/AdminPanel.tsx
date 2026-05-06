import CreatureFormRow from "../components/molecules/CreatureFormRow";

export default function AdminPanel(){
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
                            <CreatureFormRow />
                        </tbody>
                    </table>
                </form>
            </section>
        </main>
    )
}