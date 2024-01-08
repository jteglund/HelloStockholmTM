import styles from '../../app/schedule/page.module.css'

export default function InfoBar({prompt}) {
    return(
    <div className={styles.InfoBar}>
        <h4 className={styles.textStatusBar}>{prompt}</h4>
    </div>
    );
}