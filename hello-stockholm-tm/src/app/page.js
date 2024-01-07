'use client'

import styles from './page.module.css'
import TextButton from '@/components/TextButton'
import { useEffect, useState } from 'react'
import { db } from './firebase-config'
import { collection, getDocs } from 'firebase/firestore'
import { createTeam } from '@/api/team'

export default function Home() {
  const [openWomen, setOpenWomen] = useState(true);
  const [teams, setTeams] = useState([]);
  const teamsCollectionRef = collection(db, "Team")

  const handleOpenButtonPress = () => {
    setOpenWomen(true);
  }

  const handleWomenButtonPress = () => {
    setOpenWomen(false);
  }

  useEffect(() => {
    const getTeams = async () => {
      const data = await getDocs(teamsCollectionRef);
      setTeams(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    
    getTeams();
  }, [])
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <TextButton prompt={"OPEN"} handlePress={handleOpenButtonPress} active={openWomen}/>
        <TextButton prompt={"WOMEN"} handlePress={handleWomenButtonPress} active={!openWomen}/>
      </div>
      <div>
          {teams.map((team) => {
            return (
              <div>
                <h1>{team.Name}</h1>
              </div>
            );
          })}
        </div>
    </main>
  )
}
