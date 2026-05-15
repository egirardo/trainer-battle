import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTrainerCreation } from '@/hooks/useTrainerCreation'
import { ROUTES } from '@/routes'
import IconButton from '@/components/atoms/IconButton'
import StickyHeader from '@/components/atoms/StickyHeader'
import backArrow from '@/assets/sprites/components/back-arrow.svg'
import forwardArrow from '@/assets/sprites/components/forward-arrow.svg'
import styles from './CreationFlowLayout.module.css'
import { validateTrainerName } from '@/utils/trainerValidation'
import CloseButton from '@/components/atoms/headerButtons/CloseButton'

const steps = [
    { path: ROUTES.characterSelect,    label: '- Step 1 of 3 -', headerLabel: 'Your Trainer',     back: null,                     next: ROUTES.creatureSelect },
    { path: ROUTES.creatureSelect,     label: '- Step 2 of 3 -', headerLabel: 'Your Creature',    back: ROUTES.characterSelect,   next: ROUTES.profileConfirmation },
    { path: ROUTES.profileConfirmation, label: '- Step 3 of 3 -', headerLabel: 'Your Information', back: ROUTES.creatureSelect,   next: null },
]
// Need to add a guard later so that users cannot navigate to these routes without going through the flow in order, but for now this is fine since there are no other links to these pages. Copilot feedback: The PR description says the flow enforces step completion before navigation, but this layout only blocks the Next button. A user can still deep-link directly to /creature-select or /profile-confirmation and bypass earlier steps. Add a guard (e.g., useEffect on pathname) to redirect to the first incomplete step when prerequisites aren’t met.

export default function CreationFlowLayout() {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { trainerName, setTrainerNameError, selectedCreature, setCreatureError } = useTrainerCreation()

    const currentStep = steps.find(s => s.path === pathname)

    function handleBack() {
        if (currentStep?.back) void navigate(currentStep.back)
    }

    function handleNext(): void {
        if (!currentStep?.next) return

        if (pathname === ROUTES.characterSelect) {
            const error = validateTrainerName(trainerName)
            if (error) { setTrainerNameError(error); return } 
        }

        if (pathname === ROUTES.creatureSelect) {
            if (selectedCreature === null) { setCreatureError('You must select a creature to proceed'); return }
            setCreatureError(undefined)
        }

        void navigate(currentStep.next)
    }

    return (
        <div className={styles.layout}>
            <StickyHeader
                label={currentStep?.headerLabel ?? ''}
                action={<CloseButton onClick={() => void navigate(ROUTES.start)} />}
            />
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
