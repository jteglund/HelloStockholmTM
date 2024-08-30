
import style from '../app/page.module.css'

export default function DivisionButton({prompt, onPressFunction}) {

        return (
        <div className={style.button} onClick={onPressFunction}>  
            <h4 className={style.divisionText}>{prompt}</h4>
        </div>
    )
  }