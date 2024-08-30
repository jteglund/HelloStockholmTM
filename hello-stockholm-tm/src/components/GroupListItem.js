import { useEffect, useState } from 'react';
import styles from '../app/groups/page.module.css'
import Link from 'next/link';

function GroupTopItem({groupName}) {
    return (
        <div className={styles.GroupTopContainer}>
            <div className={styles.GroupItemNameTop} style={{borderTopLeftRadius: "10px"}}>
                <div className={styles.text}>{groupName}</div>
            </div>
            <div className={styles.GroupStatContainerTop}>
                <div className={styles.text}>M</div>
                <div className={styles.text}>V</div>
                <div className={styles.text}>F</div>
                <div className={styles.text}>+/-</div>
            </div>
            <div className={styles.GroupPtsContainerTop} style={{borderTopRightRadius: "10px"}}>
                <div className={styles.text}>
                    P
                </div>  
            </div>
        </div>
    );
}

function GroupTeamItem({team, bottom, linkTeams}) {
    let teamUrl = '/team/' + team.id;

    return (
        <>
            { linkTeams &&
                <Link href={teamUrl}>
                    <div className={styles.GroupTopContainer}>
                        <div className={!bottom ? styles.GroupItemName : styles.GroupItemNameBottom}>
                            <div className={styles.text}>{team.Name}</div>
                        </div>
                        <div className={styles.GroupStatContainer}>
                            <div className={styles.text}>{team.Games}</div>
                            <div className={styles.text}>{team.Wins}</div>
                            <div className={styles.text}>{team.Losses}</div>
                            <div className={styles.textGD}>{team.PD}</div>
                        </div>
                        <div className={!bottom ? styles.GroupPtsContainer : styles.GroupPtsContainerBottom}>
                            <div className={styles.text}>
                                {team.P}
                            </div>  
                        </div>
                    </div>
                </Link>
            }
            {!linkTeams &&
                <div className={styles.GroupTopContainer}>
                <div className={!bottom ? styles.GroupItemName : styles.GroupItemNameBottom}>
                    <div className={styles.text}>{team.Name}</div>
                </div>
                <div className={styles.GroupStatContainer}>
                    <div className={styles.text}>{team.Games}</div>
                    <div className={styles.text}>{team.Wins}</div>
                    <div className={styles.text}>{team.Losses}</div>
                    <div className={styles.textGD}>{team.PD}</div>
                </div>
                <div className={!bottom ? styles.GroupPtsContainer : styles.GroupPtsContainerBottom}>
                    <div className={styles.text}>
                        {team.P}
                    </div>  
                </div>
            </div>
            }
        </>
        
    );
}

export default function GroupListItem({group, groupsPage}) {
    const [teamList, setTeamList] = useState([]);
    const [lastTeam, setLastTeam] = useState(null);
    //GROUP = [GroupTeams, ...] sorted by placement
    const comp = (team1, team2) => {
        if(team1.TeamData[6] <= team2.TeamData[6]){
            return -1;
        }else{
            return 1;
        }
    }
    group.sort(comp);

    const teams = () => {
        let nStats = 7;
        let nTeams = group.length;
        let lst = [];
        
        for(let i = 0; i < nTeams-1; i++){
            let team = 
            {
                key: i,
                id: group[i].TeamID,
                Name: group[i].TeamData[0],
                Games: group[i].TeamData[1],
                Wins: group[i].TeamData[2],
                Losses: group[i].TeamData[3],
                PD: group[i].TeamData[4],
                P: group[i].TeamData[5]
            }
            lst.push(team)
        }
        setTeamList(lst);

        let lastTeam = 
        {
            key: nTeams-1,
            id: group[nTeams-1].TeamID,
            Name: group[nTeams-1].TeamData[0],
            Games: group[nTeams-1].TeamData[1],
            Wins: group[nTeams-1].TeamData[2],
            Losses: group[nTeams-1].TeamData[3],
            PD: group[nTeams-1].TeamData[4],
            P: group[nTeams-1].TeamData[5]
        }

        setLastTeam(lastTeam)
    }

    useEffect(() => {
        teams();
    }, [])

    let url = '/group/' + group[0].GroupID;
    let groupName = group[0].GroupName;
    return (
        <>
            { groupsPage &&
                <Link href={url}>
                    <div className={styles.GroupListItem}>
                        <GroupTopItem groupName={groupName}/>
                        {teamList.map((team) => <GroupTeamItem key={team.key} team={team} />)}
                        { lastTeam != null
                            ? <GroupTeamItem team={lastTeam} bottom={true}/>
                            : <></>
                        }
                        
                    </div>
                </Link>
            }
            { !groupsPage &&
                <div className={styles.GroupListItem}>
                    <GroupTopItem groupName={groupName} />
                    {teamList.map((team) => <GroupTeamItem key={team.key} team={team} linkTeams={true}/>)}
                    { lastTeam != null
                        ? <GroupTeamItem team={lastTeam} bottom={true} linkTeams={true}/>
                        : <></>
                    }
                </div>
            }
        </>
        
    );
}