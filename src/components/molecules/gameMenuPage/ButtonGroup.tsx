import Button from '@/components/atoms/button';
import styles from './ButtonGroup.module.css';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';

interface Props {
    horizontal?: boolean;
    onShowInstructions?: () => void;
}

export default function ButtonGroup({ horizontal = false, onShowInstructions }: Props) {
    return (
        <div className={`${styles.buttonGroup}${horizontal ? ` ${styles.horizontal}` : ''}`}>
            <Button variant='danger' as={Link} to={ROUTES.lobby}>
                Find a Match
            </Button>
            <div className={styles.lowerGroup}>
                <Button as={Link} to={ROUTES.shop}> {/* Placeholder links for shop and bag, replace with actual shop route when implemented. */}
                    Shop
                </Button>
                <Button as={Link} to={ROUTES.bag}>
                    Bag
                </Button>
                <Button onClick={onShowInstructions}>
                    Help
                </Button>
            </div>
        </div>
    )
}