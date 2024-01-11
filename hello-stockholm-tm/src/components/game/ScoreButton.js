import styles from '../../app/schedule/page.module.css'

export default function ScoreButton({prompt, handlePress, team}) {
    const click = () => {
        handlePress(team);
    }

    return(
        <div className={styles.ScoreButton} onClick={click}>
            <h4 className={styles.ScoreButtonText}>{prompt}</h4>
        </div>
    );
}