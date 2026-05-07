import Button from "../atoms/button";
import InputField from "../atoms/InputField";

type MoveFormRowProps = {
    idPrefix?: string;
    submitLabel?: string;
};

export default function MoveFormRow({ idPrefix = "new", submitLabel = "Add" }: MoveFormRowProps) {
    return (
        <tr>
            <td>{idPrefix === "new" ? "New" : idPrefix}</td>
            <td><InputField hasLabel={false} name="name" id={`${idPrefix}-name`} placeholder="Move name" /></td>
            <td><InputField hasLabel={false} name="type" id={`${idPrefix}-type`} placeholder="Type" /></td>
            <td><InputField hasLabel={false} type="number" name="power" id={`${idPrefix}-power`} placeholder="Power" /></td>
            <td><InputField hasLabel={false} type="number" name="accuracy" id={`${idPrefix}-accuracy`} placeholder="Accuracy" /></td>
            <td><InputField hasLabel={false} name="effect" id={`${idPrefix}-effect`} placeholder="Effect" /></td>
            <td><InputField hasLabel={false} name="description" id={`${idPrefix}-description`} placeholder="Description" /></td>
            <td><Button type="button">{submitLabel}</Button></td>
        </tr>
    );
}
