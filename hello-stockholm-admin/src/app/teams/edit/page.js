'use client'

import styles from '../../page.module.css'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../firebase-config'
import { collection, getDocs, doc, updateDoc, deleteDoc} from 'firebase/firestore'

export default function Home() {
  const [loggedin, setLoggedin] = useState(false);
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [division, setDivision] = useState("0");
  const [teams, setTeams] = useState(null);
  const teamsCollectionRef = collection(db, "Teams");
  const [teamIndex, setTeamIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDivision, setEditDivision] = useState("");
  
  const updateTeamName = (event) => {
    setTeamName(event.target.value);
  }
  const updateEditName = (event) => {
    setEditName(event.target.value);
  }
  const deleteTeam = async () => {
    const teamRef = doc(db, "Team", teams[teamIndex].id);
    await deleteDoc(teamRef);
    router.push("/teams");
  }

  const saveEdit = async () => {
    let newDiv = parseInt(editDivision);
    if(editName === ""){
      return null;
    }
    const teamRef = doc(db, "Teams", teams[teamIndex].id);
    await updateDoc(teamRef, {
      Name: editName
    });
    router.push("/teams")
  }

  const checkIfTeamExists = () => {
    if(teams){
      for(let i in teams){
        if(teams[i].Name === teamName && teams[i].Division === parseInt(division)){
          setTeamIndex(i);
          setEditName(teams[i].Name);
          setEditDivision(teams[i].Division.toString());
          return true;
        }
      }
      setTeamIndex(null);
      return false;
    }
    return null;
  }

  useEffect(() => {
    const getTeams = async () => {
      const data = await getDocs(teamsCollectionRef);
      setTeams(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    
    getTeams();
  }, [])

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
            <div className={styles.center2}> 
              <h3>Division:</h3>
              <select 
                value={division}
                onChange={e => setDivision(e.target.value)}
                className={styles.select}
              >
                <option value="0">Open</option>
                <option value="1">Women</option>
              </select>
            </div>
            <div className={styles.center}>
              <div className={styles.createButton} onClick={checkIfTeamExists}>Edit team</div>
            </div>
            
            { teamIndex &&
              <>
                <div className={styles.center2}>
                  <h3>Edit name: </h3>
                  <input value={editName} onChange={updateEditName} className={styles.input} placeholder='Enter new team name'></input>
                </div>
                <div className={styles.center2}>
                  <h3>Edit division:</h3>
                  <select
                      value={editDivision}
                      onChange={e => setEditDivision(e.target.value)}
                      className={styles.select}
                    >
                    <option value="0">Open</option>
                    <option value="1">Women</option>
                  </select>
                </div>
                <div className={styles.center}>
                  <div className={styles.deleteButton} onClick={deleteTeam}>Delete team</div>
                </div>
                <div className={styles.center}>
                  <div className={styles.createButton} onClick={saveEdit}>Save</div>
                </div>
              </>
            }
          </div>
        }
      </main>
)
}