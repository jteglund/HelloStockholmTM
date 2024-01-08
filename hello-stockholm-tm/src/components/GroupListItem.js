import styles from '../app/groups/page.module.css'

function GroupTopItem({game}) {
    return (
        <div className={styles.GroupTopContainer} style={{borderBottom: "solid", borderBottomWidth: "thin"}}>
            <div className={styles.GroupItemName} style={{borderTopLeftRadius: "10px"}}>
                <div className={styles.text}>Group OA</div>
            </div>
            <div className={styles.GroupStatContainer}>
                <div className={styles.text}>G</div>
                <div className={styles.text}>W</div>
                <div className={styles.text}>L</div>
                <div className={styles.text}>+/-</div>
            </div>
            <div className={styles.GroupPtsContainer} style={{borderTopRightRadius: "10px"}}>
                <div className={styles.text}>
                    P
                </div>  
            </div>
        </div>
    );
}

function GroupTeamItem({game, bottom}) {
    return (
        <div className={styles.GroupTopContainer}>
            <div className={!bottom ? styles.GroupItemName : styles.GroupItemNameBottom}>
                <div className={styles.text}>Senungsund</div>
            </div>
            <div className={styles.GroupStatContainer}>
                <div className={styles.text}>3</div>
                <div className={styles.text}>3</div>
                <div className={styles.text}>0</div>
                <div className={styles.text}>+30</div>
            </div>
            <div className={!bottom ? styles.GroupPtsContainer : styles.GroupPtsContainerBottom}>
                <div className={styles.text}>
                    9
                </div>  
            </div>
        </div>
    );
}

export default function GroupListItem({game}) {
    return (
        <div className={styles.GroupListItem}>
            <GroupTopItem />
            <GroupTeamItem />
            <GroupTeamItem />
            <GroupTeamItem />
            <GroupTeamItem bottom={true}/>
        </div>
    );
}