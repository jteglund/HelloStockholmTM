import styles from '../app/schedule/page.module.css'
import Link from 'next/link';
import { convertMinutesToDate } from '@/api/game';

export default function GameListItem({game}) {
    const url = '/game/' + game.id;

    return (
        <Link href={url}>
            <div className={styles.gameContainer}>
                <div>
                <div className={styles.gameBottomContainer}>
                        <div className={styles.gameTopLeftItem}>
                            <h4 className={styles.textLeft}>{game.Team1Name}</h4>
                        </div>
                        <div className={styles.gameTopRightItem}>
                            <h4 className={styles.textRight}>{game.GameName}</h4>
                        </div>
                    </div>
                    <div className={styles.gameBottomContainer}>
                        <div className={styles.gameBottomLeftItem}>
                            <h4 className={styles.textLeft}>{game.Team2Name}</h4>
                        </div>
                        <div className={styles.gameBottomRightItem}>
                            <h4 className={styles.textRight}>
                                {game.Status === 0 
                                    ? "Upcoming"
                                    : game.Status === 1 
                                    ? "Live"
                                    : "Previous"
                                }
                            </h4>
                        </div>
                    </div>
                </div>
                <div>
                    <div className={styles.gameRightTopItem}>
                        <h4 className={styles.textCenter}>{convertMinutesToDate(game.DateTime)}</h4>
                    </div>
                    <div className={styles.gameRightBottomItem}>
                        <h4 className={styles.textCenter}>{game.Field}</h4>
                    </div>
                </div>
            </div>
        </Link>
    )
  }