import Button from "../atoms/button";
import InputField from "../atoms/InputField";

type CreatureFormRowProps = {
    idPrefix?: string;
    submitLabel?: string;
};

export default function CreatureFormRow({ idPrefix = "new", submitLabel = "Add" }: CreatureFormRowProps) {
    return (
        <tr>
            <td>{idPrefix === "new" ? "New" : idPrefix}</td>
            <td><InputField hasLabel={false} name="name" id={`${idPrefix}-name`} placeholder="Creature name" /></td>
            <td><InputField hasLabel={false} name="type" id={`${idPrefix}-type`} placeholder="Type of creature" /></td>
            <td><InputField hasLabel={false} type="number" name="base_hp" id={`${idPrefix}-base_hp`} placeholder="Base HP" /></td>
            <td><InputField hasLabel={false} type="number" name="base_attack" id={`${idPrefix}-base_attack`} placeholder="Base attack" /></td>
            <td><InputField hasLabel={false} type="number" name="base_defence" id={`${idPrefix}-base_defence`} placeholder="Base defence" /></td>
            <td><InputField hasLabel={false} type="number" name="base_speed" id={`${idPrefix}-base_speed`} placeholder="Base speed" /></td>
            <td><InputField hasLabel={false} name="description" id={`${idPrefix}-description`} placeholder="Description" /></td>
            <td><Button type="submit">{submitLabel}</Button></td>
        </tr>
    );
}
