import styles from '../app/schedule/page.module.css'
import Link from 'next/link';

export default function GameListItem({game}) {
    return (
        <div className={styles.gameBottomContainer}>
            <div>
                <div className={styles.gameTopItem}>
                    <h4 className={styles.textCenter}>Lag 1 - Lag 2</h4>
                </div>
                <div className={styles.gameBottomContainer}>
                    <div className={styles.gameBottomLeftItem}>
                        <h4 className={styles.textLeft}>OA1</h4>
                    </div>
                    <div className={styles.gameBottomRightItem}>
                        <h4 className={styles.textRight}>Live</h4>
                    </div>
                </div>
            </div>
            <div>
                <div className={styles.gameRightTopItem}>
                    <h4 className={styles.textCenter}>08:00 25 Feb</h4>
                </div>
                <div className={styles.gameRightBottomItem}>
                    <h4 className={styles.textCenter}>Field 1</h4>
                </div>
            </div>
        </div>
    )
  }