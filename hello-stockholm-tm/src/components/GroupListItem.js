import { useEffect, useState } from 'react';
import styles from '../app/groups/page.module.css'
import Link from 'next/link';

function GroupTopItem({group}) {
    return (
        <div className={styles.GroupTopContainer} style={{borderBottom: "solid", borderBottomWidth: "thin"}}>
            <div className={styles.GroupItemName} style={{borderTopLeftRadius: "10px"}}>
                <div className={styles.text}>{group.Name}</div>
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

function GroupTeamItem({team, bottom}) {
    return (
        <div className={styles.GroupTopContainer}>
            <div className={!bottom ? styles.GroupItemName : styles.GroupItemNameBottom}>
                <div className={styles.text}>{team.Name}</div>
            </div>
            <div className={styles.GroupStatContainer}>
                <div className={styles.text}>{team.Games}</div>
                <div className={styles.text}>{team.Wins}</div>
                <div className={styles.text}>{team.Losses}</div>
                <div className={styles.text}>{team.PD}</div>
            </div>
            <div className={!bottom ? styles.GroupPtsContainer : styles.GroupPtsContainerBottom}>
                <div className={styles.text}>
                    {team.P}
                </div>  
            </div>
        </div>
    );
}

export default function GroupListItem({group}) {
    const [teamList, setTeamList] = useState([]);
    const [lastTeam, setLastTeam] = useState(null);

    const teams = () => {
        let nStats = 6;
        let nTeams = Math.floor(group.TeamData.length/nStats);
        let lst = [];
        
        for(let i = 0; i < nTeams-1; i++){
            let team = 
            {
                id: i,
                Name: group.TeamData[i*nStats],
                Games: group.TeamData[i*nStats + 1],
                Wins: group.TeamData[i*nStats + 2],
                Losses: group.TeamData[i*nStats + 3],
                PD: group.TeamData[i*nStats + 4],
                P: group.TeamData[i*nStats + 5]
            }
            lst.push(team)
        }
        setTeamList(lst);

        let lastTeam = 
        {
            id: nTeams-1,
            Name: group.TeamData[(group.TeamData.length-nStats)],
            Games: group.TeamData[(group.TeamData.length-nStats) + 1],
            Wins: group.TeamData[(group.TeamData.length-nStats) + 2],
            Losses: group.TeamData[(group.TeamData.length-nStats) + 3],
            PD: group.TeamData[(group.TeamData.length-nStats) + 4],
            P: group.TeamData[(group.TeamData.length-nStats) + 5] 
        }

        setLastTeam(lastTeam)
    }

    useEffect(() => {
        teams();
    }, [])

    let url = '/group/' + group.id;
    return (
        <Link href={url}>
            <div className={styles.GroupListItem}>
                <GroupTopItem group={group}/>
                {teamList.map((team) => <GroupTeamItem key={team.id} team={team} />)}
                { lastTeam != null
                    ? <GroupTeamItem team={lastTeam} bottom={true}/>
                    : <></>
                }
                
            </div>
        </Link>
    );
}