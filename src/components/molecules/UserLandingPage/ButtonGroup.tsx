import Button from '@/components/atoms/button';
import styles from './ButtonGroup.module.css';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';

export default function ButtonGroup() {
    return (
        <div className={styles.buttonGroup}>
            <Button as={Link} to={ROUTES.lobby}>
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