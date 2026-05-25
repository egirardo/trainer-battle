import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/button";
import CloseButton from "@/components/atoms/headerButtons/CloseButton";
import StickyHeader from "@/components/atoms/StickyHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/routes";
import styles from './GameInstructions.module.css';

interface Props {
    onClose?: () => void;
}

export default function CashoutIntructions({ onClose }: Props){
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [credits, setCredits] = useState(0)
    const [startingCredits, setStartingCredits] = useState(0)
    const [transactionId, setTransactionId] = useState<string | null>(null)
    const [bossBeaten, setBossBeaten] = useState(false)

    useEffect(() => {
        if (!user) return
        async function fetchStats() {
            const { data } = await supabase
                .from('player_stats')
                .select('credits, transaction_id, starting_credits, boss_beaten')
                .eq('player_id', user!.id)
                .maybeSingle()
            if (data) {
                setCredits(data.credits)
                setTransactionId(data.transaction_id)
                setStartingCredits(data.starting_credits)
                setBossBeaten(data.boss_beaten ?? false)
            }
        }
        void fetchStats()
    }, [user])

    const isCentralbankUser = !!profile?.centralbank_uuid
    const canCashOut = isCentralbankUser && !!transactionId && credits > startingCredits && bossBeaten

    function calculatePayout(amount: number): number {
        const raw = amount * 0.03
        return Math.floor(raw / 0.5) * 0.5
    }

    const payout = calculatePayout(Math.max(0, credits - startingCredits))

    async function handleCashOut(): Promise<void> {
        const { error } = await supabase.functions.invoke<void>('cashout')
        if (error) {
            console.error('Cash out failed:', error)
            return
        }
        await supabase.auth.signOut()
        void navigate(ROUTES.start)
    }

    return(
        <section className={styles.section}>

            <StickyHeader
                label="Cashout"
                action={<CloseButton onClick={onClose} />}
            />
            <article className={styles.contentContainer}>
                <div className={styles.contentSection}>
                    <h2>
                        What is cashout?
                    </h2>
                    <p>Cashout converts your in-game credits into Tivoli's euros and ends your current session. You can only cash out if you've earned more credits than you started with - the payout is based on your profit, not your total balance.</p>
                    <p>Your credits are converted at a fixed rate. The exact amount is shown on the cash out button before you confirm.</p>
                    <p>You must <span className={styles.accentText}>defeat the boss</span> to cash out your credits.</p>
                    <p>After cashing out you'll be logged out, but your progress is saved. When you come back, returning players pay a reduced entry fee.</p>
                </div>
                <div className={styles.btnContainer}>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="danger"
                        disabled={!canCashOut}
                        onClick={() => void handleCashOut()}
                    >
                        {canCashOut ? `Cash out €${payout}` : 'Cash out'}
                    </Button>
                </div>
            </article>
        </section>
    )
}
