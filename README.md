# Trainer Battle

A turn-based creature battle game built as a school project for Yrgo WU25. Create your trainer, choose your creature, battle other players or the CPU, collect badges, and take on the boss.

## Features

- **Account system** (outside of tivoli) — register, log in, and persist your progress
- **Account system** (inside of tivoli) - enter the game through loopland.se, you are automatically registered based on your user id, and your progress is saved as you go
- **Trainer creation** — pick a name, gender, and starting creature
- **Turn-based battles** — fight vs CPU or challenge another player in PvP
  - Choose to Fight, use a Bag item, or Run each turn
  - Type matchups (Fire → Grass → Water → Fire) affect damage
  - 45-second turn timer in PvP matches
- **Progression** — earn XP to level up your creature and credits to spend in the shop
- **Badge system** — earn a badge for each win (four total badges available to earn); collect 3 to unlock a boss fight
- **Shop** — spend credits on items to use in battle
- **Profile page** — view your trainer stats, creature info, badges, and bag
- **Lobby** — find live PvP opponents or jump into a CPU match

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Routing | React Router v7 |
| Backend / DB | Supabase (PostgreSQL + Realtime) |
| Styling | CSS Modules |
| Font | Minecraft Standard (CC PD) |



## Project Structure

```
src/
├── assets/          # Sprites, badges, fonts, audio
├── components/
│   ├── atoms/       # Small reusable UI elements (Button, BadgeRow, StickyHeader…)
│   └── molecules/   # Feature-level components grouped by page
├── context/         # React context providers (auth, trainer creation)
├── hooks/           # Custom hooks
├── layouts/         # Page layout wrappers
├── models/          # TypeScript model types
├── views/           # Top-level route screens
└── routes.ts        # Route constants
```

## Credits

**Development**
- John Ahlenhed — Backend / DevOps
- Laura Kotlinska — Frontend Logic / Backend / Design
- Elsa Girardo — Frontend / Art & Design / Scrum Master

**Art & Sprites** — Elsa Girardo

**Music**
- *Boogie* — Pecan Pie
- *Boss Time* — David Renda

**Font** — Minecraft Standard (Faithful OpenType recreation of the Minecraft GUI font, CC PD)

**Special thanks** — Yrgo WU25
