import { useState, type ChangeEvent } from "react";
import Button from "../atoms/button";
import InputField from "../atoms/InputField";
import type { Tables } from "@/types/database.types";

type Creature = Tables<"creatures">;

type CreatureFormRowProps = {
    idPrefix?: string;
    submitLabel?: string;
    initialValues?: Partial<Omit<Creature, 'id'>>;
    onSubmit: (data: Omit<Creature, 'id'>) => Promise<void>;
};

export default function CreatureFormRow({ 
    idPrefix = "new",
    submitLabel = "Add",
    initialValues = {},
    onSubmit,
}: CreatureFormRowProps) {
    const [form, setForm] = useState({
        name: initialValues.name ?? "",
        type: initialValues.type ?? "",
        base_hp: initialValues.base_hp ?? 0,
        base_attack: initialValues.base_attack ?? 0,
        base_defence: initialValues.base_defence ?? 0,
        base_speed: initialValues.base_speed ?? 0,
        description: initialValues.description ?? "",
        image: initialValues.image ?? "",
    });

    function handleChange(e: ChangeEvent<HTMLInputElement>): void {
        const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    }

    return (
        <tr>
            <td>{idPrefix === "new" ? "New" : idPrefix}</td>
            <td><InputField hasLabel={false} name="name" id={`${idPrefix}-name`} placeholder="Creature name" value={form.name} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} name="type" id={`${idPrefix}-type`} placeholder="Type of creature" value={form.type} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} type="number" name="base_hp" id={`${idPrefix}-base_hp`} placeholder="Base HP" value={form.base_hp} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} type="number" name="base_attack" id={`${idPrefix}-base_attack`} placeholder="Base attack" value={form.base_attack} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} type="number" name="base_defence" id={`${idPrefix}-base_defence`} placeholder="Base defence" value={form.base_defence} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} type="number" name="base_speed" id={`${idPrefix}-base_speed`} placeholder="Base speed" value={form.base_speed} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} name="description" id={`${idPrefix}-description`} placeholder="Description" value={form.description} onChange={handleChange} /></td>
            <td><InputField hasLabel={false} name="image" id={`${idPrefix}-image`} placeholder="Image URL" value={form.image} onChange={handleChange} /></td>
            <td><Button type="button" onClick={() => { void onSubmit(form); }}>{submitLabel}</Button>
</td>
        </tr>
    );
}
