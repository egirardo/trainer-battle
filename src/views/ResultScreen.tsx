import { Link, useParams, Navigate } from "react-router-dom";
import { ROUTES } from "@/routes";
import { useResult } from "@/hooks/useResult";

export default function ResultScreen(){
    const { sessionId } = useParams<{ sessionId: string }>();
    const id = Number(sessionId);

    if (!sessionId || isNaN(id)) {
        return <Navigate to={ROUTES.lobby} replace />;
    }

    return <ResultContent sessionId={id} />;

}

function ResultContent({ sessionId }: { sessionId: number }) {
    const { result, loading, error } = useResult(sessionId);

    if (loading) return <main><p>Loading result...</p></main>;
    if (error || !result) return <main><p role="alert" aria-atomic="true">{error ?? 'Result data unavailable'}</p></main>;

    const heading = result.outcome === 'win' ? 'Victory!' : 'Defeat';

    return (
        <main>
            <h1>{heading}</h1>

            {!result.isCpu && result.opponentUsername && (
                <p>vs {result.opponentUsername}</p>
            )}
            {result.isCpu && (
                <p>vs CPU</p>
            )}

            <p>Wins: {result.totalWins}</p>
            <p>Losses: {result.totalLosses}</p>
            <p>Battles: {result.totalBattles}</p>
            <p>Credits: {result.credits}</p>

            <Link to={ROUTES.lobby} className="link">Play again</Link>
            <Link to={ROUTES.gameMenu} className="link">Main menu</Link>
        </main>
    )
}