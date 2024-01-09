import styles from '../../app/schedule/page.module.css'

export default function TeamLeft({teamName1, score1, teamName2, score2}) {
    return(
        <div>
            <div className={styles.center}>
                <div className={styles.TeamLeftName} style={{borderTopLeftRadius: "10px", borderBottomColor: "darkblue", borderBottom: "solid", borderBottomWidth: "thin"}}>
                    <h4 className={styles.TeamLeftText2}>{teamName1}</h4>
                </div>
                <div className={styles.TeamLeftScore} style={{borderTopRightRadius: "10px", borderBottomColor: "darkblue", borderBottom: "solid", borderBottomWidth: "thin"}}>
                    <h4 className={styles.TeamLeftScoreText3}>{score1}</h4>
                </div>
            </div>
            <div className={styles.center}>
                <div className={styles.TeamLeftName}>
                    <h4 className={styles.TeamLeftText2}>{teamName2}</h4>
                </div>
                <div className={styles.TeamLeftScore}>
                    <h4 className={styles.TeamLeftScoreText3}>{score2}</h4>
                </div>
            </div>
        </div>
    );
}