import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTrainerCreation } from '@/hooks/useTrainerCreation'
import IconButton from '@/components/atoms/IconButton'
import backArrow from '@/assets/sprites/components/back-arrow.svg'
import forwardArrow from '@/assets/sprites/components/forward-arrow.svg'
import styles from './CreationFlowLayout.module.css'

const steps = [
    { path: '/character-select', label: '- Step 1 of 3 -', back: null,                  next: '/monster-select' },
    { path: '/monster-select',   label: '- Step 2 of 3 -', back: '/character-select',   next: '/profile-confirmation' },
    { path: '/profile-confirmation', label: '- Step 3 of 3 -', back: '/monster-select', next: null },
]

export default function CreationFlowLayout() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { trainerName, setTrainerNameError, selectedMonster } = useTrainerCreation()

    const currentStep = steps.find(s => s.path === pathname)

    const canProceed: Record<string, boolean> = {
        '/character-select': trainerName.trim().length > 0,
        '/monster-select': selectedMonster !== null,
        '/profile-confirmation': true,
    }

    function handleBack() {
        if (currentStep?.back) navigate(currentStep.back)
    }

    function handleNext() {
        if (!currentStep?.next) return
        if (!canProceed[pathname]) {
            if (pathname === '/character-select') setTrainerNameError('Trainer name is required.')
            return
        }
        navigate(currentStep.next)
    }

    return (
        <div className={styles.layout}>
            <p className={styles.stepLabel}>{currentStep?.label}</p>
            <div className={styles.content}>
                <Outlet />
            </div>
            <nav className={styles.nav} aria-label="Creation flow navigation">
                {currentStep?.back
                    ? <IconButton image={backArrow} ariaLabel="Go to previous step" onClick={handleBack} />
                    : <span />
                }
                {currentStep?.next
                    ? <IconButton image={forwardArrow} ariaLabel="Go to next step" onClick={handleNext} />
                    : <span />
                }
            </nav>
        </div>
    )
}
