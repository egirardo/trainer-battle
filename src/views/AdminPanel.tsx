import CreatureFormRow from "../components/molecules/CreatureFormRow";
import MoveFormRow from "../components/molecules/MoveFormRow";
import ItemFormRow from "../components/molecules/ItemFormRow";

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
                            <ItemFormRow />
                        </tbody>
                    </table>
                </form>
            </section>
        </main>
    )
}