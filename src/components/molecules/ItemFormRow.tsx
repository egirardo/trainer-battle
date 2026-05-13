import { useState, type ChangeEvent } from "react";
import Button from "../atoms/button";
import InputField from "../atoms/InputField";
import type { Tables } from "@/types/database.types";

type Item = Tables<"items">;

type ItemFormRowProps = {
    idPrefix?: string;
    submitLabel?: string;
    initialValues?: Partial<Omit<Item, 'id'>>;
    onSubmit: (data: Omit<Item, 'id'>) => Promise<void>;
};

export default function ItemFormRow({ 
    idPrefix = "new", 
    submitLabel = "Add", 
    initialValues = {}, 
    onSubmit 
}: ItemFormRowProps) {
    const [form, setForm] = useState({
        name: initialValues.name ?? "",
        description: initialValues.description ?? "",
        effect: initialValues.effect ?? 0,
        price: initialValues.price ?? 0
    });

    function handleChange(e: ChangeEvent<HTMLInputElement>): void {
        const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    }

    async function handleSubmit(): Promise<void> {
        await onSubmit(form);
    }

    return (
        <tr>
            <td>{idPrefix === "new" ? "New" : idPrefix}</td>
            <td><InputField hasLabel={false} name="name" id={`${idPrefix}-name`} placeholder="Item name" value={form.name} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} name="description" id={`${idPrefix}-description`} placeholder="Description" value={form.description} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} type="number" name="effect" id={`${idPrefix}-effect`} placeholder="Effect" value={form.effect} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} type="number" name="price" id={`${idPrefix}-price`} placeholder="Price" value={form.price} onChange={handleChange} /></td>
            <td><Button type="button" onClick={handleSubmit}>{submitLabel}</Button></td>
        </tr>
    );
}
