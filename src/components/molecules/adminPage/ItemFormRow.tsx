import Button from "../../atoms/button";
import InputField from "../../atoms/InputField";

type ItemFormRowProps = {
    idPrefix?: string;
    submitLabel?: string;
};

export default function ItemFormRow({ idPrefix = "new", submitLabel = "Add" }: ItemFormRowProps) {
    return (
        <tr>
            <td>{idPrefix === "new" ? "New" : idPrefix}</td>
            <td><InputField hasLabel={false} name="name" id={`${idPrefix}-name`} placeholder="Item name" /></td>
            <td><InputField hasLabel={false} name="description" id={`${idPrefix}-description`} placeholder="Description" /></td>
            <td><InputField hasLabel={false} name="effect" id={`${idPrefix}-effect`} placeholder="Effect" /></td>
            <td><InputField hasLabel={false} type="number" name="price" id={`${idPrefix}-price`} placeholder="Price" /></td>
            <td><Button type="button">{submitLabel}</Button></td>
        </tr>
    );
}
