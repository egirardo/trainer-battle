import Button from '@/components/atoms/button';
import styles from './ButtonGroup.module.css';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';

interface Props {
    horizontal?: boolean;
}

export default function ButtonGroup({ horizontal = false }: Props) {
    return (
        <div className={`${styles.buttonGroup}${horizontal ? ` ${styles.horizontal}` : ''}`}>
            <Button variant='danger' as={Link} to={ROUTES.lobby}>
                Find a Match
            </Button>
            <div className={styles.lowerGroup}>
                <Button as={Link} to="/shop"> {/* Placeholder links for shop and bag, replace with actual shop route when implemented. */}
                    Shop
                </Button>
                <Button as={Link} to="/bag">
                    Bag
                </Button>
                <Button as={Link} to="/help">
                    Help
                </Button> {/* Will be a help popup eventually, the link is just a placeholder for now.*/}
            </div>
        </div>
    )
}