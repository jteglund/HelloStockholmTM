import styles from '../../app/schedule/page.module.css'

export default function InfoBar({prompt, alignment}) {
    return(
        <div className={alignment == "left" ? styles.InfoBarLeft : alignment == "center" ? styles.InfoBarCenter : styles.InfoBarRight}>
            <h4 className={styles.textStatusBar}>{prompt}</h4>
        </div>
    );
}