import styles from '../../app/schedule/page.module.css'

export default function StatusBar({status}) {
    const numberToString = (status) => {
        if(status === 0){
            return "Upcoming"
        }
        if(status === 1){
            return "Live"
        }
        if(status === 2){
            return "Previous"
        }
        return ""
    }

    return(
    <div className={styles.StatusBar}>
        <h4 className={styles.textStatusBar}>{numberToString(status)}</h4>
    </div>
    );
}