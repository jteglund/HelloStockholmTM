import styles from '../../app/schedule/page.module.css'

function ReturnButton({onPress}){
    return(
        <div className={styles.ReturnButton} onClick={onPress}>
            <h4 className={styles.buttonText}>Go back to game</h4>
        </div>
    )
}

function SaveButton({onPress}){
    return(
        <div className={styles.SaveButton} onClick={onPress}>
            <h4 className={styles.buttonText} >Finish and save</h4>
        </div>
    )
}

export default function FinishGamePopup({game, handleReturn, handleSave}) {
    return(
        <div className={styles.popup}>
            <h4 className={styles.PopupText}>Are you sure you want to finish the game?</h4>
            <h4 className={styles.PopupText}>{game.Team1Score} - {game.Team2Score}</h4>
            <h4 className={styles.PopupText}>{game.Team1Name} - {game.Team2Name}</h4>
            <div className={styles.center} >
                <ReturnButton onPress={handleReturn}/>
                <SaveButton onPress={handleSave} />
            </div>
        </div>
    );
}