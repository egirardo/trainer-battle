import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTrainerCreation } from '@/hooks/useTrainerCreation'
import IconButton from '@/components/atoms/IconButton'
import backArrow from '@/assets/sprites/components/back-arrow.svg'
import forwardArrow from '@/assets/sprites/components/forward-arrow.svg'
import styles from './CreationFlowLayout.module.css'
import { validateTrainerName } from '@/utils/trainerValidation'

const steps = [
    { path: '/character-select', label: '- Step 1 of 3 -', back: null,                  next: '/creature-select' },
    { path: '/creature-select',   label: '- Step 2 of 3 -', back: '/character-select',   next: '/profile-confirmation' },
    { path: '/profile-confirmation', label: '- Step 3 of 3 -', back: '/creature-select', next: null },
]
// Need to add a guard later so that users cannot navigate to these routes without going through the flow in order, but for now this is fine since there are no other links to these pages. Copilot feedback: The PR description says the flow enforces step completion before navigation, but this layout only blocks the Next button. A user can still deep-link directly to /creature-select or /profile-confirmation and bypass earlier steps. Add a guard (e.g., useEffect on pathname) to redirect to the first incomplete step when prerequisites aren’t met.

export default function CreationFlowLayout() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { trainerName, setTrainerNameError, selectedCreature, setCreatureError } = useTrainerCreation()

    const currentStep = steps.find(s => s.path === pathname)

    function handleBack() {
        if (currentStep?.back) navigate(currentStep.back)
    }

    function handleNext() {
        if (!currentStep?.next) return
        if (pathname === '/character-select') {
            const error = validateTrainerName(trainerName)
            if (error) { setTrainerNameError(error); return }
        }
        if (pathname === '/creature-select') {
            if (selectedCreature === null) { setCreatureError('You must select a creature to proceed'); return }
            setCreatureError(undefined)
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
