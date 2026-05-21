const itemSprites = import.meta.glob<string>(
    '../assets/sprites/items/*.png',
    { eager: true, import: 'default' }
);

const spriteMap: Record<string, string> = {};
for (const [path, url] of Object.entries(itemSprites)) {
    const filename = path.split('/').pop();
    if (filename) spriteMap[filename] = url;
}

export function resolveItemImage(filename: unknown): string | undefined {
    if (typeof filename !== 'string' || !filename) return undefined;
    return spriteMap[filename];
}
