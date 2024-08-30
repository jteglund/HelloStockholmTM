'use client'

import styles from './page.module.css'
import TextButton from '@/components/TextButton'
import { useEffect, useState } from 'react'
import { db } from './firebase-config'
import { collection, getDocs } from 'firebase/firestore'
import { createTeam } from '@/api/team'
import TeamsList from '@/components/TeamsList'
import DivisionButton from '@/components/DivisionButton'

export default function Home() {
  const [teams, setTeams] = useState([]);
  const [openTeams, setOT] = useState([]);
  const [womenTeams, setWT] = useState([]);
  const [divisionFlag, setDFlag] = useState('Open');
  const teamsCollectionRef = collection(db, "Teams");

  const setOFlag = () => {
    setDFlag("Open");
  }
  const setWFlag = () => {
    setDFlag("Women");
  }
  
  useEffect(() => {
    const sortTeams = (team1, team2) => {
      return team1.TeamName <= team2.TeamName ? -1 : 1;
    }

    const getTeams = async () => {
      const data = await getDocs(teamsCollectionRef);
      let teamsList = [];
      teamsList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      teamsList.sort(sortTeams);
      let wTeams = [];
      let oTeams = [];
      for(let t in teamsList){
        if(teamsList[t].Division == 'Women'){
          wTeams.push(teamsList[t]);
        }else if(teamsList[t].Division == 'Open'){
          oTeams.push(teamsList[t]);
        }
      }
      setOT(oTeams);
      setWT(wTeams)
      //setTeams(teamsList);
    }
    
    getTeams();
  }, [])

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <DivisionButton
            prompt="OPEN"
            onPressFunction={setOFlag}
          />
          
          <DivisionButton
            prompt="WOMEN"
            onPressFunction={setWFlag}
          />
        </div>
      <div className={styles.teamListContainer}>
        {divisionFlag == 'Open' ?
        <> 
          { openTeams.map((team) => <TeamsList key={team.id} team={team} />) }
        </> :
        <>
          { womenTeams.map((team) => <TeamsList key={team.id} team={team} />) } 
        </>
        }
        
      </div>
    </main>
  )
}
