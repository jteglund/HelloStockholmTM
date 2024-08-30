
import style from '../app/page.module.css'
import Link from 'next/link'
import { usePathname } from "next/navigation";

export default function StandingItem({standingItem, points, placement, history=false}) {

    return (
        <div className={history ? style.standingContainerHistory: style.standingContainer}>
            <div className={placement == 1 ? style.standingLeftBoxGold : placement == 2 ? style.standingLeftBoxSilver : placement == 3 ? style.standingLeftBoxBronze : style.standingLeftBox}>
                <h4 className={style.standingText}>{placement}.</h4>
            </div>
            <div className={style.standingMiddleBox}>
                <h4 className={style.standingText}>{standingItem.TeamName}</h4>
            </div>
            <div className={style.standingRightBox}>
                <h4 className={style.standingText}>{points != '-' ? points + 'p' : 'NA'}</h4>
            </div>
        </div>
    )
  }