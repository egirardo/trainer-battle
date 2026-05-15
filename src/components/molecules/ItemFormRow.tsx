import { useState, type ChangeEvent } from "react";
import Button from "../atoms/button";
import InputField from "../atoms/InputField";
import type { Tables } from "@/types/database.types";

type Item = Tables<"items">;
type EffectType = "heal" | "attack_boost" | "defence_boost";

type ItemFormRowProps = {
    idPrefix?: string;
    submitLabel?: string;
    initialValues?: {
        name?: string | null;
        description?: string | null;
        on_use?: string | null;
        image?: string | null;
        effect?: number | null;
        effect_type?: EffectType | null;
        price?: number | null;
    };
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
        on_use: initialValues.on_use ?? "",
        image: initialValues.image ?? "",
        effect: initialValues.effect ?? 0,
        effect_type: initialValues.effect_type ?? "heal",
        price: initialValues.price ?? 0
    });

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
        const update = { [e.target.name]: value } as Partial<typeof form>;
        setForm({ ...form, ...update });
    }

    function handleSubmit() {
        void onSubmit({
            ...form,
            name: form.name || null,
            description: form.description || null,
            on_use: form.on_use || null,
            image: form.image || null,
            effect: form.effect,
            price: form.price,
        });
    }

    return (
        <tr>
            <td>{idPrefix === "new" ? "New" : idPrefix}</td>
            <td><InputField hasLabel={false} name="name" id={`${idPrefix}-name`} placeholder="Item name" value={form.name} onChange={handleChange} /></td>
            <td>
                <InputField hasLabel={false} name="description" id={`${idPrefix}-description`} placeholder="Description" value={form.description} onChange={handleChange} />
                <InputField hasLabel={false} name="on_use" id={`${idPrefix}-on_use`} placeholder="On use message" value={form.on_use} onChange={handleChange} />
                <InputField hasLabel={false} name="image" id={`${idPrefix}-image`} placeholder="Image" value={form.image} onChange={handleChange} />
            </td>
            <td><InputField hasLabel={false} type="number" name="effect" id={`${idPrefix}-effect`} placeholder="Effect" value={form.effect} onChange={handleChange} /></td>
            <td>
                <select name="effect_type" id={`${idPrefix}-effect_type`} value={form.effect_type} onChange={handleChange}>
                    <option value="heal">Heal</option>
                    <option value="attack_boost">Attack Boost</option>
                    <option value="defence_boost">Defence Boost</option>
                </select>
            </td>
            <td><InputField hasLabel={false} type="number" name="price" id={`${idPrefix}-price`} placeholder="Price" value={form.price} onChange={handleChange} /></td>
            <td><Button type="button" onClick={handleSubmit}>{submitLabel}</Button></td>
        </tr>
    );
}
