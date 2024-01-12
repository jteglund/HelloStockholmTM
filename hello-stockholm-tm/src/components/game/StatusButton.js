import styles from '../../app/schedule/page.module.css'

export default function StatusButton({prompt, handlePress, status}) {

    return(
        <div className={styles.StatusButton} onClick={handlePress} style={status === 1 ? {backgroundColor: "#cf3c32"} : {backgroundColor: "#0e9e00"}}>
            <h4 className={styles.textStatusButton}>{prompt}</h4>
        </div>
    );
}