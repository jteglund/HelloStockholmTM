
import style from '../app/page.module.css'
import Link from 'next/link'
import { usePathname } from "next/navigation";
import StandingItem from './StandingItem';
export default function HistoryItem({historyItem}) {

    let fixLater1 = {
        TeamName: historyItem.TeamName[0]
    }

    let fixLater2 = {
        TeamName: historyItem.TeamName[1]
    }

    let fixLater3 = {
        TeamName: historyItem.TeamName[2]
    }

    return (
        <div className={style.historyBox}>  
            <h1 className={style.historyText}>{historyItem.Season}</h1>
            <StandingItem standingItem={fixLater1} points={historyItem.Points[0]} placement={historyItem.Placements[0]} history={true}/>
            <StandingItem standingItem={fixLater2} points={historyItem.Points[1]} placement={historyItem.Placements[1]} history={true}/>
            <StandingItem standingItem={fixLater3} points={historyItem.Points[2]} placement={historyItem.Placements[2]} history={true}/>
        </div>
    )
  }