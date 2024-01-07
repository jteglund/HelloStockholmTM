'use client'

import styles from './page.module.css'
import TextButton from '@/components/TextButton'
import { useEffect, useState } from 'react'
import { db } from './firebase-config'
import { collection, getDocs } from 'firebase/firestore'
import { createTeam } from '@/api/team'
import TeamsList from '@/components/TeamsList'

export default function Home() {
  const [openWomen, setOpenWomen] = useState(true);
  const [teams, setTeams] = useState([]);
  const [openTeams, setOpenTeams] = useState([]);
  const [womenTeams, setWomenTeams] = useState([]);
  const teamsCollectionRef = collection(db, "Team");

  const handleOpenButtonPress = () => {
    setOpenWomen(true);
  }

  const handleWomenButtonPress = () => {
    setOpenWomen(false);
  }

  const setTeamsByDivision = () => {
    let open = [];
    let women = [];

    for(let t in teams){
      if(teams[t].Division === 0){
        open.push(teams[t]);
      }else if (teams[t].Division === 1){
        women.push(teams[t]);
      }
    }
    open.sort((a, b) => (a.Name > b.Name) ? 1 : -1)
    women.sort((a, b) => (a.Name > b.Name) ? 1 : -1)
    setOpenTeams(open);
    setWomenTeams(women);
  }

  useEffect(() => {
    const getTeams = async () => {
      const data = await getDocs(teamsCollectionRef);
      setTeams(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    
    getTeams();
  }, [])

  useEffect(() => {
    setTeamsByDivision(teams);
  }, [teams])

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <TextButton prompt={"OPEN"} handlePress={handleOpenButtonPress} active={openWomen}/>
        <TextButton prompt={"WOMEN"} handlePress={handleWomenButtonPress} active={!openWomen}/>
      </div>
      <div className={styles.teamListContainer}>
        {openWomen 
                    ? openTeams.map((team) => <TeamsList key={team.id} team={team} />) 
                    : womenTeams.map((team) => <TeamsList key={team.id} team={team} />)        
        }
      </div>
    </main>
  )
}
