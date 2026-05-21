const itemSprites = import.meta.glob<string>(
    '../assets/sprites/items/*.png',
    { eager: true, import: 'default' }
);

export function resolveItemImage(filename: unknown): string | undefined {
    if (typeof filename !== 'string' || !filename) return undefined;
    const key = Object.keys(itemSprites).find(k => k.endsWith(`/${filename}`));
    return key ? itemSprites[key] : undefined;
}
