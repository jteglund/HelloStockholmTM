import styles from '../../app/schedule/page.module.css'

export default function TeamLeft({teamName1, score1, teamName2, score2}) {
    return(
        <div>
            <div className={styles.center}>
                <div className={styles.TeamLeftName} style={{borderTopLeftRadius: "10px", borderBottomColor: "darkblue", borderBottom: "solid", borderBottomWidth: "thin"}}>
                    <h4 className={styles.TeamLeftText}>{teamName1}</h4>
                </div>
                <div className={styles.TeamLeftScore} style={{borderTopRightRadius: "10px", borderBottomColor: "darkblue", borderBottom: "solid", borderBottomWidth: "thin"}}>
                    <h4 className={styles.TeamLeftScoreText}>{score1}</h4>
                </div>
            </div>
            <div className={styles.center}>
                <div className={styles.TeamLeftName} style={{borderBottomLeftRadius: "10px"}}>
                    <h4 className={styles.TeamLeftText}>{teamName2}</h4>
                </div>
                <div className={styles.TeamLeftScore} style={{borderBottomRightRadius: "10px"}}>
                    <h4 className={styles.TeamLeftScoreText}>{score2}</h4>
                </div>
            </div>
        </div>
    );
}