import { useState, type ChangeEvent } from "react";
import Button from "../atoms/button";
import InputField from "../atoms/InputField";
import type { Tables } from "@/types/database.types";

type Move = Tables<"moves">;

type MoveFormRowProps = {
    idPrefix?: string;
    submitLabel?: string;
    initialValues?: Partial<Omit<Move, 'id'>>;
    onSubmit: (data: Omit<Move, 'id'>) => Promise<void>;
};

export default function MoveFormRow({ idPrefix = "new", 
    submitLabel = "Add", 
    initialValues = {}, 
    onSubmit 
}: MoveFormRowProps) {
    const [form, setForm] = useState({
        name: initialValues.name ?? "",
        type: initialValues.type ?? "",
        power: initialValues.power ?? 0,
        accuracy: initialValues.accuracy ?? 0,
        effect: initialValues.effect ?? "",
        description: initialValues.description ?? "",
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
            <td><InputField hasLabel={false} name="name" id={`${idPrefix}-name`} placeholder="Move name" value={form.name} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} name="type" id={`${idPrefix}-type`} placeholder="Type" value={form.type} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} type="number" name="power" id={`${idPrefix}-power`} placeholder="Power" value={form.power} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} type="number" name="accuracy" id={`${idPrefix}-accuracy`} placeholder="Accuracy" value={form.accuracy} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} name="effect" id={`${idPrefix}-effect`} placeholder="Effect" value={form.effect} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} name="description" id={`${idPrefix}-description`} placeholder="Description" value={form.description} onChange={handleChange} /></td>
            <td><Button type="button" onClick={handleSubmit}>{submitLabel}</Button></td>
        </tr>
    );
}
