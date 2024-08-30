import styles from '../app/schedule/page.module.css'
import Link from 'next/link';
import { convertMinutesToDate } from '@/api/game';
import { useState, useEffect} from 'react';

export default function GameListItem({game, clickable}) {
    const url = '/game/' + game.id;
    const [dateTime, setDateTime] = useState([]);

    useEffect(() => {
        setDateTime(convertMinutesToDate(game.DateTime))
    }, [])
    
    return (
        <>
        { clickable ?
            <Link href={url}>
                <div className={styles.gameContainer}>
                <div>
                    <div className={styles.gameBottomContainer}>
                        <div className={styles.gameDateBox}>
                            <h4 className={styles.textCenter}>{dateTime[0]}:{dateTime[1]} - {dateTime[2]} {dateTime[3]}</h4>
                        </div>
                        <div className={styles.gameFieldBox}>
                            <h4 className={styles.textCenter}>{game.Field}</h4>
                        </div>
                    </div>
                    <div className={styles.gameBottomContainer}>
                        <div className={styles.gameTopLeftItem}>
                            <h4 className={styles.textLeft}>{game.Team1Name}</h4>
                        </div>
                        <div className={styles.gameTopRightItem}>
                            <h4 className={styles.textRight}>{game.GameName}</h4>
                        </div>
                        <div className={styles.TeamLeftScore} style={{borderBottomColor: "darkblue", borderBottom: "solid", borderBottomWidth: "thin"}}>
                            <h4 className={styles.TeamLeftScoreText}>{game.Team1Score}</h4>
                        </div>
                        </div>
                        <div className={styles.gameBottomContainer}>
                            <div className={styles.gameBottomLeftItem}>
                                <h4 className={styles.textLeft}>{game.Team2Name}</h4>
                            </div>
                            <div className={styles.gameBottomRightItem}>
                                <h4 className={styles.textRight}>
                                    {game.Status === 0 
                                        ? "Framtida"
                                        : game.Status === 1 
                                        ? "Spelas"
                                        : "Färdig"
                                    }
                                </h4>
                            </div>
                            <div className={styles.TeamLeftScore} style={{borderBottomRightRadius: "10px", marginBottom: "20px"}}>
                                <h4 className={styles.TeamLeftScoreText2}>{game.Team2Score}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
            :
            <div className={styles.gameContainer}>
                <div>
                    <div className={styles.gameBottomContainer}>
                        <div className={styles.gameDateBox}>
                            <h4 className={styles.textCenter}>{dateTime[0]}:{dateTime[1]} - {dateTime[2]} {dateTime[3]}</h4>
                        </div>
                        <div className={styles.gameFieldBox}>
                            <h4 className={styles.textCenter}>{game.Field}</h4>
                        </div>
                    </div>
                    <div className={styles.gameBottomContainer}>
                        <div className={styles.gameTopLeftItem}>
                            <h4 className={styles.textLeft}>{game.Team1Name}</h4>
                        </div>
                        <div className={styles.gameTopRightItem}>
                            <h4 className={styles.textRight}>{game.GameName}</h4>
                        </div>
                        <div className={styles.TeamLeftScore} style={{borderBottomColor: "darkblue", borderBottom: "solid", borderBottomWidth: "thin"}}>
                            <h4 className={styles.TeamLeftScoreText}>{game.Team1Score}</h4>
                        </div>
                        </div>
                        <div className={styles.gameBottomContainer}>
                            <div className={styles.gameBottomLeftItem}>
                                <h4 className={styles.textLeft}>{game.Team2Name}</h4>
                            </div>
                            <div className={styles.gameBottomRightItem}>
                                <h4 className={styles.textRight}>
                                    {game.Status === 0 
                                        ? "Framtida"
                                        : game.Status === 1 
                                        ? "Spelas"
                                        : "Färdig"
                                    }
                                </h4>
                            </div>
                            <div className={styles.TeamLeftScore} style={{borderBottomRightRadius: "10px", marginBottom: "20px"}}>
                                <h4 className={styles.TeamLeftScoreText2}>{game.Team2Score}</h4>
                            </div>
                        </div>
                    </div>
                </div>
        }
        </>
    )
  }