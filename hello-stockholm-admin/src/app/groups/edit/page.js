'use client'

import styles from '../../page.module.css'
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../firebase-config'
import { collection, getDocs, doc, updateDoc, deleteDoc} from 'firebase/firestore'
import { generateGroupGames, deleteGroup } from '@/api/api';

export default function Home() {
  const [loggedin, setLoggedin] = useState(false);
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [division, setDivision] = useState("0");
  const [groups, setGroups] = useState(null);
  const groupsCollectionRef = collection(db, "Group");
  const [groupIndex, setGroupIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDivision, setEditDivision] = useState("");
  const [started, setStarted] = useState(0);
  const [addTeamFlag, setAddTeamFlag] = useState(0);
  const [generateGamesFlag, setGenerateGamesFlag] = useState(0);
  const [finishGroupFlag, setFinishGroupFlag] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [teamDivision, setTeamDivision] = useState("0");
  const [successMessage, setSuccessMessage] = useState(0);
  const [errorMessage, setErrorMessage] = useState(0);
  const [refresh, setRefresh] = useState(0);

  const generateGames = async () => {
    let res = await generateGroupGames(groups[groupIndex].id, groups[groupIndex].Name, groups[groupIndex].Division, groups[groupIndex].TeamIDs, groups[groupIndex].TeamData, groups[groupIndex].Games);
    setRefresh(refresh+1);
  }

  const removeGroup = async () => {
    await deleteGroup(groups[groupIndex]);
    router.push("/groups");
  }

  const addTeamToGroup = async () => {
    const teamsCollectionRef = collection(db, "Team")
    //Find team in database
    const updateTeamGroupID = async (teamID, groupID, oldGroupID) => {
      const teamRef = doc(db, "Team", teamID);
      let groupIDList = oldGroupID;
      groupIDList.push(groupID);
      await updateDoc(teamRef, {
        GroupID: groupIDList
      });
    }

    const getTeams = async () => {
      let lst = [];
      const data = await getDocs(teamsCollectionRef);
      lst = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      return lst;
    }
    const checkIfTeamExists = (lst, teamName, d) => {
      for(let i in lst){
        if(teamName === lst[i].Name && parseInt(d) === lst[i].Division){
          return i;
        }
      }
      return -1;
    }

    let teamsList = await getTeams();
    let index = checkIfTeamExists(teamsList, teamName, teamDivision);
    if(index != -1){
      //Generate team data
      let teamData = [teamsList[index].Name, "0", "0", "0", "0", "0"];
      let teamID = teamsList[index].id;
      let oldTeamData = groups[groupIndex].TeamData;
      let oldTeamIDs = groups[groupIndex].TeamIDs;
      
      let newTeamData = oldTeamData.concat(teamData);
      oldTeamIDs.push(teamID);

      //Add to db
      const groupRef = doc(db, "Group", groups[groupIndex].id);
      await updateDoc(groupRef, {
        TeamData: newTeamData,
        TeamIDs: oldTeamIDs
      });
      await updateTeamGroupID(teamID, groups[groupIndex].id, teamsList[index].GroupID);
      setSuccessMessage(1);
      setErrorMessage(0); 
      setRefresh(refresh+1);
      return true;
    }
    setSuccessMessage(0);
    setErrorMessage(1);
    return false;
  }

  const toggleAddTeam = () =>{
    if (addTeamFlag === 0){
      setAddTeamFlag(1);
    }else{
      setAddTeamFlag(0);
    }
  }

  const toggleGenerateGames = () =>{
    if (generateGamesFlag === 0){
      setGenerateGamesFlag(1);
    }else{
      setGenerateGamesFlag(0);
    }
  }

  const toggleFinishGroup = () =>{
    if (finishGroupFlag === 0){
      setFinishGroupFlag(1);
    }else{
      setFinishGroupFlag(0);
    }
  }

  const updateTeamName = (event) => {
    setTeamName(event.target.value);
  }

  const updateGroupName = (event) => {
    setGroupName(event.target.value);
  }
  const updateEditName = (event) => {
    setEditName(event.target.value);
  }

  /*
  const deleteGroup = async () => {
    const groupRef = doc(db, "Group", groups[groupIndex].id);
    await deleteDoc(groupRef);
    router.push("/groups");
  }*/

  
  const saveEdit = async () => {
    let newDiv = parseInt(editDivision);
    if(editName === ""){
      return null;
    }
    const groupRef = doc(db, "Group", groups[groupIndex].id);
    await updateDoc(groupRef, {
      Name: editName,
      Division: newDiv
    });
    router.push("/groups")
  }

  const checkIfGroupExists = () => {
    if(groups){
      for(let i in groups){
        if(groups[i].Name === groupName){
          setGroupIndex(i);
          setEditName(groups[i].Name);
          setEditDivision(groups[i].Division.toString());
          if(groups[i].Games.length === 0){
            setStarted(0);
          }else{
            setStarted(1);
          }
          return true;
        }
      }
      setGroupIndex(null);
      return false;
    }
    return null;
  }

  useEffect(() => {
    const getGroups = async () => {
      const data = await getDocs(groupsCollectionRef);
      setGroups(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    
    getGroups();
  }, [refresh])
  
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
            
            <div className={styles.center} style={{borderBottom: "solid"}}>
              <div className={styles.createButton} onClick={checkIfGroupExists}>Edit group</div>
            </div>
            
            { groupIndex &&
              <>
                <div className={styles.center2}>
                  <h3>Edit name: </h3>
                  <input value={editName} onChange={updateEditName} className={styles.input} placeholder='Enter new group name'></input>
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
                  <div className={styles.deleteButton} onClick={removeGroup}>Delete group</div>
                </div>
                <div className={styles.center} style={{borderBottom: "solid"}}>
                  <div className={styles.createButton} onClick={saveEdit}>Save</div>
                </div>
                <div className={styles.center3}>
                  <div className={styles.createButton} onClick={toggleAddTeam}>Add team</div>
                  { addTeamFlag === 1 && started === 0 &&
                  <>
                    <div className={styles.center2}> 
                      <h3>Team name: </h3>
                      <input value={teamName} onChange={updateTeamName} className={styles.input} placeholder='Enter team name'></input>
                    </div>
                    <div className={styles.center2}> 
                      <h3>Division:</h3>
                      <select 
                        value={teamDivision}
                        onChange={e => setTeamDivision(e.target.value)}
                        className={styles.select}
                      >
                        <option value="0">Open</option>
                        <option value="1">Women</option>
                      </select>
                    </div>
                    <div className={styles.enterButton} onClick={addTeamToGroup}>Add to group</div>
                    { successMessage === 1 &&
                      <h3>Success!</h3>
                    }
                    { errorMessage === 1 &&
                      <h3>Error!</h3>
                    }
                  </>
                  }
                </div>
                { started === 0 &&
                <>
                  <div className={styles.center}>
                    <div className={styles.createButton} onClick={toggleGenerateGames} >Generate games</div>
                  </div>
                    { generateGamesFlag === 1 &&
                      <div className={styles.center2} style={{borderBottom: "solid"}}>
                        <div className={styles.enterButton} onClick={generateGames}>Are you sure?</div>
                      </div>
                    }
                  <div className={styles.center}>
                    <div className={styles.createButton} onClick={toggleFinishGroup}>Finish group</div>
                  </div>
                </>
                }
              </>
            }
          </div>
        }
      </main>
)
}