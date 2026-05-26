import styles from './XpBar.module.css'

interface XpBarProps {
    level: number
    experience: number
    xpPerLevel: number
}

export default function XpBar({ level, experience, xpPerLevel }: XpBarProps) {
    const currentXp = xpPerLevel > 0 ? experience % xpPerLevel : 0
    const xpToNext = xpPerLevel > 0 ? xpPerLevel - currentXp : 0

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
