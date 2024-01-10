import styles from '../../app/page.module.css'

function StatsTopBar() {
    return(
        <>
            <div className={styles.StatsTopBar} style={{borderTopLeftRadius: "10px"}}>
                <h4 className={styles.textStatsBar}>Wins</h4>
            </div>
            <div className={styles.StatsTopBar}>
                <h4 className={styles.textStatsBar}>Losses</h4>
            </div>
            <div className={styles.StatsTopBar} style={{borderTopRightRadius: "10px"}}>
                <h4 className={styles.textStatsBar}>+/-</h4>
            </div>
        </>
    );
}

function StatsBar({wins, losses, pd}) {
    return(
        <>
            <div className={styles.StatsBottomBar} style={{borderBottomLeftRadius: "10px"}}>
                <h4 className={styles.textStatsBar}>{wins}</h4>
            </div>
            <div className={styles.StatsBottomBar}>
                <h4 className={styles.textStatsBar}>{losses}</h4>
            </div>
            <div className={styles.StatsBottomBar} style={{borderBottomRightRadius: "10px"}}>
                <h4 className={styles.textStatsBar}>{pd}</h4>
            </div>
        </>
    );
}

export default function Stats({wins, losses, pd}) {
    return(
        <div>
            <div className={styles.StatsBarContainer}>
                <StatsTopBar/>
            </div>
            <div className={styles.StatsBarContainer}>
                <StatsBar wins={wins} losses={losses} pd={pd}/>
            </div>
        </div>
    );
}