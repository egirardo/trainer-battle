import styles from './XpBar.module.css'

interface XpBarProps {
    level: number
    currentXp: number
    xpPerLevel: number
}

export default function XpBar({ level, currentXp, xpPerLevel }: XpBarProps) {
    const xpToNext = xpPerLevel - currentXp

    return (
        <div>
            <div className={styles.header}>
                <span>Lv. {level}</span>
                <span>{currentXp} / {xpPerLevel} XP</span>
            </div>
            <progress className={styles.bar} value={currentXp} max={xpPerLevel} />
            <p>{xpToNext} XP to Lv. {level + 1}</p>

        </div>
    )
}
