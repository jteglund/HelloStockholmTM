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
  const [groupName, setGroupName] = useState("");
  const [division, setDivision] = useState("0");
  const [groups, setGroups] = useState(null);
  const groupsCollectionRef = collection(db, "Group");
  const [errorMessage, setEMessage] = useState(0);
  const [successMessage, setSuccessMessage] = useState(0);
  const [refresh, setRefresh] = useState(0);

  const updateGroupName = (event) => {
    setGroupName(event.target.value);
  }

  const checkIfGroupExists = (groupName) => {
    if(groups){
      for(let i in groups){
        if(groups[i].Name === groupName || groupName === ""){
          return true;
        }
      }
      return false;
    }else{
      console.log("ERROR: Cannot cross check with database");
      return true;
    }
  }

  const createGroup = async () => {
    if(checkIfGroupExists(groupName)){
      console.log("ERROR: Group already exists!!");
      setEMessage(1);
      setSuccessMessage(0);
    }else{
      let group = 
      {
        Name: groupName,
        Games: [],
        NextGame: [],
        TeamData: [],
        TeamIDs: [],
        Division: parseInt(division)
      }

      await addDoc(groupsCollectionRef, group);
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
    const getGroups = async () => {
      const data = await getDocs(groupsCollectionRef);
      setGroups(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    
    getGroups();
  }, [refresh])

  return (
      <main className={styles.main}>
        { loggedin && groups &&
          <div className={styles.centerVert}>
            <h2>Create Group</h2>
            <div className={styles.center}>
              <Link href={"/groups"}>
                <div className={styles.enterButton}>Go back</div>
              </Link>
            </div>
            <div className={styles.center2}> 
              <h3>Group name: </h3>
              <input value={groupName} onChange={updateGroupName} className={styles.input} placeholder='Enter group name'></input>
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
              <div className={styles.createButton} onClick={createGroup}>Create group</div>
            </div>
            { errorMessage === 1 &&
              <h3>ERROR: Group already exists</h3>
            }
            { successMessage === 1 &&
              <h3>Added group to database</h3>
            }
          </div>
        }
      </main>
  )
}