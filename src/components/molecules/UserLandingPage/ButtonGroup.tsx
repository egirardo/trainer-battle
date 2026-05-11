import Button from '@/components/atoms/button';
import styles from './ButtonGroup.module.css';
import { Link } from 'react-router-dom';

export default function ButtonGroup() {
    return (
        <div className={styles.buttonGroup}>
            <Button as={Link} to="/lobby">
                Find a Match
            </Button>
            <div className={styles.lowerGroup}>
                <Button as={Link} to="/shop">
                    Shop
                </Button>
                <Button as={Link} to="/bag">
                    Bag
                </Button>
                <Button as={Link} to="/help">
                    Help
                </Button>
            </div>
        </div>
    )
}