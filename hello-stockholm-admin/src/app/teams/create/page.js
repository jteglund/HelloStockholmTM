'use client'

import styles from '../../page.module.css'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../firebase-config'
import { collection, getDocs, addDoc} from 'firebase/firestore'

export default function Home() {
  const [loggedin, setLoggedin] = useState(false);
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [division, setDivision] = useState("0");
  const [teams, setTeams] = useState(null);
  const teamsCollectionRef = collection(db, "Teams");
  const [errorMessage, setEMessage] = useState(0);
  const [successMessage, setSuccessMessage] = useState(0);
  const [refresh, setRefresh] = useState(0);

  const updateTeamName = (event) => {
    setTeamName(event.target.value);
  }

  const checkIfTeamExists = (teamName, division) => {
    if(teams){
      for(let i in teams){
        if(teams[i].Name === teamName && teams[i].Division === division || teamName === ""){
          return true;
        }
      }
      return false;
    }else{
      console.log("ERROR: Cannot cross check with database");
      return true;
    }
  }

  const createTeam = async () => {
    if(checkIfTeamExists(teamName, parseInt(division))){
      console.log("ERROR: Team already exists!!");
      setEMessage(1);
      setSuccessMessage(0);
    }else{
      let team = 
      {
        TeamName: teamName
      }

      await addDoc(teamsCollectionRef, team);
      setEMessage(0);
      setSuccessMessage(1);
      setRefresh(refresh+1);
    }
  }

  useEffect(()=>{
      onAuthStateChanged(auth, (user) => {
          if (user) {
            const uid = user.uid;
            setLoggedin(true)
          } else {
            setLoggedin(false);
            router.push('/');
          }
        });
        
  }, [])

  useEffect(() => {
    const getTeams = async () => {
      const data = await getDocs(teamsCollectionRef);
      setTeams(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    
    getTeams();
  }, [refresh])

  return (
      <main className={styles.main}>
        { loggedin && teams &&
          <div className={styles.centerVert}>
            <h2>Create Team</h2>
            <div className={styles.center}>
              <Link href={"/teams"}>
                <div className={styles.enterButton}>Go back</div>
              </Link>
            </div>
            <div className={styles.center2}> 
              <h3>Team name: </h3>
              <input value={teamName} onChange={updateTeamName} className={styles.input} placeholder='Enter team name'></input>
            </div>
            <div className={styles.center}>
              <div className={styles.createButton} onClick={createTeam}>Create team</div>
            </div>
            { errorMessage === 1 &&
              <h3>ERROR: Team already exists</h3>
            }
            { successMessage === 1 &&
              <h3>Added team to database</h3>
            }
          </div>
        }
      </main>
  )
}