import styles from '../../app/schedule/page.module.css'
import Link from 'next/link'

export default function TeamLeft({teamName1, score1, teamName2, score2, teamID1, teamID2}) {
    let team1url = '/team/' + teamID1;
    let team2url = '/team/' + teamID2;

    return(
        <div>
            <Link href={team1url}>
                <div className={styles.center}>
                    <div className={styles.TeamLeftName} style={{borderTopLeftRadius: "10px"}}>
                        <h4 className={styles.TeamLeftText2}>{teamName1}</h4>
                    </div>
                    <div className={styles.TeamLeftScore} style={{borderTopRightRadius: "10px", borderBottomColor: "darkblue", borderBottom: "solid", borderBottomWidth: "thin"}}>
                        <h4 className={styles.TeamLeftScoreText3}>{score1}</h4>
                    </div>
                </div>
            </Link>
            <Link href={team2url}>
                <div className={styles.center}>
                    <div className={styles.TeamLeftName}>
                        <h4 className={styles.TeamLeftText3}>{teamName2}</h4>
                    </div>
                    <div className={styles.TeamLeftScore}>
                        <h4 className={styles.TeamLeftScoreText2}>{score2}</h4>
                    </div>
                </div>
            </Link>
        </div>
    );
}