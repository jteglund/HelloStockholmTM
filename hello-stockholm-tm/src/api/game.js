import { collection, getDocs, addDoc, getDoc, updateDoc, doc, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../app/firebase-config";
import TeamsList from "@/components/TeamsList";


export async function createGame(gamesCollectionRef, team1name, team1id, team2name, team2id, datetime, field, division, gamename){
  let game = 
  {
    Team1Name: team1name,
    Team1ID: team1id,
    Team2Name: team2name,
    Team2ID: team2id,
    Team1Score: 0,
    Team2Score: 0,
    Status: 0,
    WNextGame: "",
    LNextGame: "",
    DateTime: datetime,
    Field: field,
    Division: division,
    GameName: gamename,
  }

  await addDoc(gamesCollectionRef, game);
}

function convertDateToMinutes(day, hour, minute){
  const originDay = 23;
  let days = parseInt(day) - originDay;

  return days*1440 + parseInt(hour)*60 + parseInt(minute);
}

export function convertMinutesToDate(dateTime){
  let monthMap = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec"
  }

  const date = dateTime.toDate()
  let hour = date.getHours();
  let minutes = date.getMinutes();
  let day = date.getDate();
  let month = monthMap[date.getMonth()];
  if(minutes < 10){
    minutes = "0" + minutes.toString()
  }
  return [hour, minutes, day, month];
}

async function advanceTeams(game, team1ID, team2ID){
  //Beräkna förloraren och vinnaren
  let winnerId = "";
  let winnerName = "";
  let loserId = "";
  let loserName = "";
  let winnerScore = 0;
  let loserScore = 0;

  let scoreDiff = game.Team1Score - game.Team2Score;
  if(scoreDiff > 0){
    winnerId = team1ID;
    winnerName = game.Team1Name;
    winnerScore = game.Team1Score;
    loserId = team2ID;
    loserName = game.Team2Name;
    loserScore = game.Team2Score;
  } else{
    winnerId = team2ID;
    winnerName = game.Team2Name;
    winnerScore = game.Team2Score;
    loserId = team1ID;
    loserName = game.Team1Name;
    loserScore = game.Team1Score;
  }

  //Dra ner matcherna som ska skickas till
  if(game.WNextGame.length > 0){
    if(game.WNextGame[1] < 3){
      let winRef = doc(db, "Games", game.WNextGame[0]);
      let wRes = await getDoc(winRef);
      let wGame = {...wRes.data(), id: wRes.id}  

      //Dra ner alla lag kopplade till matchen
      const teamGameRef = collection(db, "TeamGame");
      let teamGameW = [];
      const q = query(teamGameRef, where("GameID", "==", wGame.id));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
          teamGameW.push({ ...doc.data(), id: doc.id });
      });

      //Kolla så den är ostartad
      if(wGame.Status == 0){
        //Kolla så att id är tomt i matchen annars måste det hanteras
        
        let idToRemove = "";

        for(let i in teamGameW){
          if(teamGameW[i].TeamPosition == game.WNextGame[1]){
            idToRemove = teamGameW[i].id;
          }
        }

        if(idToRemove != ""){
          //Ta bort matchen från det laget
          let removeRef = doc(db, "TeamGame", idToRemove);
          await deleteDoc(removeRef);
        }
        //Lägg in lag
        //Wgame
        if(game.WNextGame[1] == 1){
          await updateDoc(winRef, {
            Team1Name: winnerName
          })
        }else if(game.WNextGame[1] == 2){
          await updateDoc(winRef, {
            Team2Name: winnerName
          })
        }
        
        let teamGameObj = {
          TeamID: winnerId,
          GameID: wGame.id,
          TeamPosition: game.WNextGame[1],
        }

        await addDoc(teamGameRef, teamGameObj);
      }
    }else{
      await advanceTeamToGroup(game.WNextGame[0], game.WNextGame[1], winnerId, winnerName)
    }
  }
  
  if(game.LNextGame.length > 0){
    if(game.LNextGame[1] < 3){
      let lossRef = doc(db, "Games", game.LNextGame[0]);
      let lRes = await getDoc(lossRef);
      let lGame = {...lRes.data(), id: lRes.id}
      
      //Dra ner alla lag kopplade till matchen
      const teamGameRef = collection(db, "TeamGame");
      let teamGameL = [];
      const q = query(teamGameRef, where("GameID", "==", lGame.id));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
          teamGameL.push({ ...doc.data(), id: doc.id });
      });

      if(lGame.Status == 0){
        let idToRemove = "";

      for(let i in teamGameL){
        if(teamGameL[i].TeamPosition == game.LNextGame[1]){
          idToRemove = teamGameL[i].id;
        }
      }

      if(idToRemove != ""){
        //Ta bort matchen från det laget
        let removeRef = doc(db, "TeamGame", idToRemove);
        await deleteDoc(removeRef);
      }

        if(game.LNextGame[1] == 1){
          await updateDoc(lossRef, {
            Team1Name: loserName
          })
        }else if(game.LNextGame[1] == 2){
          await updateDoc(lossRef, {
            Team2Name: loserName
          })
        }
        

        let teamGameObj = {
          TeamID: loserId,
          GameID: lGame.id,
          TeamPosition: game.LNextGame[1],
        }

        await addDoc(teamGameRef, teamGameObj);
        }
    }else{
      await advanceTeamToGroup(game.LNextGame[0], game.LNextGame[1], loserId, loserName)
    }
  }
}

async function advanceTeamToGroup(groupID, placeholderPos, teamID, teamName) {
  placeholderPos = placeholderPos -2; // TODO: Indexfel? Kanske inte
  // Dra ner gruppen
  let groupDocRef = doc(db, "Groups", groupID);
  let res = await getDoc(groupDocRef);
  let groupObj = {...res.data(), id: res.id};

  // Dra ner GroupTeams som matchar placeholderPos och gruppID
  const q = query(collection(db, "GroupTeams"), where("GroupID", "==", groupID));
  const querySnapshot = await getDocs(q);
  let groupTeamsObj = [];

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    groupTeamsObj.push({...doc.data(), id: doc.id});
  });

  let gtObjToUpdate = null;
  let numOfGtObj = 0;
  for(let i in groupTeamsObj){
    if(numOfGtObj > 1){
      console.log("ERROR: Too many groupTeams objects exists in db")
      return null;
    }

    if(groupTeamsObj[i].PlaceholderPos == placeholderPos){
      numOfGtObj++;
      gtObjToUpdate = groupTeamsObj[i]
    }
  }
  
  let oldTeamData = gtObjToUpdate.TeamData;
  let oldTeamName = oldTeamData[0];
  oldTeamData[0] = teamName;

  //Lägg till data i groupTeams
  let gtDocRef = doc(db, "GroupTeams", gtObjToUpdate.id);
  await updateDoc(gtDocRef, {
    'TeamID': teamID,
    'TeamData': oldTeamData,
  })

  //Dra ner alla gruppmatcher
  let groupGames = groupObj.GameIDs;
  let gamesCollectionRef = collection(db, "Games")

  res = await getDocs(gamesCollectionRef);
  res.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    for(let i in groupGames){
      if(groupGames[i].id == doc.id){
        let tmpGameObj = {...doc.data(), id: doc.id};
        addTeamToGroupGame(tmpGameObj, oldTeamName, teamName, teamID);
      }
    }
    groupTeamsObj.push({...doc.data(), id: doc.id});
  });
}

async function addTeamToGroupGame(gameObj, oldTeamName, newTeamName, newTeamId){
  if(gameObj.Team1Name == oldTeamName){
    // Updatera game med nytt namn
    await updateTeamNameInGame(gameObj, newTeamName, 1);
    // Ta bort gammal teamgame
    await findAndRemoveTeamGame(gameObj.id, 1);
    // Skapa en teamgame
    await createTeamGame(gameObj.id, newTeamId, 1);
    
  }else if(gameObj.Team2Name == oldTeamName){
    // Updatera game med nytt namn
    await updateTeamNameInGame(gameObj, newTeamName, 2);
    // Ta bort gammal teamgame
    await findAndRemoveTeamGame(gameObj.id, 2);
    // Skapa en teamgame
    await createTeamGame(gameObj.id, newTeamId, 2);
  }
}

async function createTeamGame(gameId, teamId, teamPos){
  let collRef = collection(db, "TeamGame");
  await addDoc(collRef, {
    TeamID: teamId,
    GameID: gameId,
    TeamPosition: teamPos,
  })
}

async function findAndRemoveTeamGame(gameId, teamPos){
  let teamGames = []
  const q = query(collection(db, "TeamGame"), where("GameID", "==", gameId));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    let tmp = {...doc.data(), id: doc.id};
    if(tmp.TeamPosition == teamPos){
      teamGames.push(tmp);
    }
  });
  for(let i in teamGames){
    let docRef = doc(db, "TeamGame", teamGames[i].id);
    await deleteDoc(docRef);
  }
}

async function updateTeamNameInGame(gameObj, newTeamName, pos){
  let gameId = gameObj.id;
  let gameRef = doc(db, "Games", gameId);
  if(pos == 1){
    await updateDoc(gameRef, {
      Team1Name: newTeamName,
    });
  }else if(pos == 2){
    await updateDoc(gameRef, {
      Team2Name: newTeamName,
    });
  }
}

async function advanceTeamsFromGroup(group, teamData, teamIDs){

  let teamGames = []
  let teamGameCollectionRef = collection(db, "TeamGame");
  let result = await getDocs(teamGameCollectionRef);
  result.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    teamGames.push({...doc.data(), id: doc.id})
  });
   
  for(let i = 0; i < group.NextGames.length/2; i++){
    let pos = group.NextGames[(i*2)+1];
    if(pos < 3){
      //Kolla om matchen är ostartad
      let gameRef = doc(db, "Games", group.NextGames[i*2])
      let res = await getDoc(gameRef);
      let gameObj = {...res.data(), id: res.id}
      //TODO: Fixa den här skiten! Om en match är avslutad så blir det megakaos
      if(gameObj.Status != 1){
        //Lägg till namn i match
        
        if(pos == 1){
          await updateDoc(gameRef, {
            Team1Name: teamData[i][0],
          })
        }else if(pos == 2){
          await updateDoc(gameRef, {
            Team2Name: teamData[i][0],
          })
        }
        //Kolla så det inte ligger någon skit i teamGames
          //Ta bort isåfall
        for(let j in teamGames){
          if(teamGames[j].GameID == gameObj.id && teamGames[j].TeamPosition == pos){
            let teamGameRef = doc(db, "TeamGame", teamGames[j].id)
            await deleteDoc(teamGameRef);
          }
        }
        
        //skapa teamgames
        let teamGameObj = {
          TeamID: teamIDs[i],
          GameID: gameObj.id,
          TeamPosition: pos,
        }

        let tgRef = collection(db, "TeamGame");
        await addDoc(tgRef, teamGameObj);

      }else{
        console.log("Game already started");
      }
    }else{
      advanceTeamToGroup(group.NextGames[i*2], pos, teamIDs[i], teamData[i][0])
    }
  }
}

async function reCalculateGroup(game){
  //Ta fram gruppnamn från game.GameName
  let gamename = game.GameName.replace(/[0-9]/g, '');
  //Dra ner gruppen
  const q = query(collection(db, "Groups"), where("GroupName", "==", gamename));
  const querySnapshot = await getDocs(q);
  let groupObj = null;

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    groupObj = {...doc.data(), id: doc.id}
  });
  //Dra ner alla matcher i gruppen
  let allGames = [];
  const gamesCollectionRef = collection(db, "Games");
  let res = await getDocs(gamesCollectionRef);
  res.forEach((doc) => {
    allGames.push({...doc.data(), id: doc.id})
  });

  let groupGames = [];
  allGames.forEach((game) => {
    if(groupObj.GameIDs.includes(game.id)){
      groupGames.push(game);
    }
  });

 
  let groupTeams = [];
  
  const groupTeamsRef = collection(db, "GroupTeams");
  res = await getDocs(groupTeamsRef);
  res.forEach((doc) => {
    if(doc.data().GroupID == groupObj.id){
      groupTeams.push({...doc.data(), id: doc.id})
    }
  });

  let teamIDs = [];
  let teamNames = [];
  for(let i in groupTeams){
    teamIDs.push(groupTeams[i].TeamID);
    teamNames.push(groupTeams[i].TeamData[0]);
  }

  //Gå igenom alla spelade matcher
  //Skapa två matriser, en för vinst/förlust (1/-1) och en för gjorda mål

  let nTeams = groupTeams.length
  let winMatrix = [];
  let goalMatrix = [];
  for(let i = 0; i < nTeams; i++){
    winMatrix.push(new Array(nTeams).fill(0));
    goalMatrix.push(new Array(nTeams).fill(0));
  }

  //Indexet som laget ligger på i Group.TeamIDs är indexet i matriserna
  //Skapa statistik
  let finishedGamesCount = 0; 
  groupGames.forEach((game) => {
    if(game.Status == 2){
      finishedGamesCount++;
      //Hitta team1index och team2index
      let team1index = teamNames.indexOf(game.Team1Name);
      let team2index = teamNames.indexOf(game.Team2Name);

      //Räkna ut vem som vann
      if(game.Team1Score > game.Team2Score){
        winMatrix[team1index][team2index] = 1;
        winMatrix[team2index][team1index] = -1;

        goalMatrix[team1index][team2index] = game.Team1Score;
        goalMatrix[team2index][team1index] = game.Team2Score;
      }else {
        winMatrix[team1index][team2index] = -1;
        winMatrix[team2index][team1index] = 1;

        goalMatrix[team1index][team2index] = game.Team1Score;
        goalMatrix[team2index][team1index] = game.Team2Score;
      }
      if(game.Team1Score == game.Team2Score){
        winMatrix[team1index][team2index] = 2;
        winMatrix[team2index][team1index] = 2;

        goalMatrix[team1index][team2index] = game.Team1Score;
        goalMatrix[team2index][team1index] = game.Team2Score;
      }
      };
    })
  let advanceGroup = false;
  
  if(finishedGamesCount == groupGames.length){
    advanceGroup = true;
  }
  //Skapa lista med statistik i ordning
  let stats = [];
  //Mappa namn till index

  for(let i = 0; i < nTeams; i++){
    let gamesPlayed = 0;
    let gamesWon = 0;
    let gamesLost = 0;
    let gd = 0;
    let points = 0;

    for(let j = 0; j < nTeams; j++){
      if(winMatrix[i][j] != 0){
        gamesPlayed += 1;
      }
      if(winMatrix[i][j] == 1){
        gamesWon += 1;
        points += 1;
      }
      if(winMatrix[i][j] == -1){
        gamesLost += 1;
      }
      if(winMatrix[i][j] == 2){
        points += 1;
      }
      gd += goalMatrix[i][j];
      gd -= goalMatrix[j][i];
    }
    stats.push(teamNames[i]);
    stats.push(gamesPlayed.toString());
    stats.push(gamesWon.toString());
    stats.push(gamesLost.toString());
    
    if(gd >= 0){
      stats.push("+".concat(gd.toString()))
    }else{
      stats.push(gd.toString());
    }
    stats.push(points.toString());
  }

  let indexToPoints = [[0, parseInt(stats[5])]];
  //Gå igenom poäng
  for(let i = 1; i < nTeams; i++){
    let points = parseInt(stats[(i*6)+5]);
    indexToPoints.push([i, points]);
  }
  indexToPoints.sort((a, b) => {return -1*(a[1]-b[1])})

  let subGroups = [];
  let subGroup = [indexToPoints[0][0]];
  let prev = indexToPoints[0][1];
  for(let i = 1; i < indexToPoints.length; i++){
    if(prev != indexToPoints[i][1]){
      subGroups.push(subGroup);
      subGroup = [indexToPoints[i][0]];
      prev = indexToPoints[i][1];
    }else{
      subGroup.push(indexToPoints[i][0]);
      prev = indexToPoints[i][1];
    }
  }
  subGroups.push(subGroup);

  //Kolla längden på subGroup i subGroups
  let finalTeamIndices = [];
  for(let i = 0; i < subGroups.length; i++){
    if(subGroups[i].length > 1){
      let listOfBrokenTies = breakTies(subGroups[i], winMatrix, goalMatrix);
      for(let j = 0; j < listOfBrokenTies.length; j++){
        finalTeamIndices.push(listOfBrokenTies[j]);
      }
    }else{
      finalTeamIndices.push(subGroups[i][0]);
    }
  }

  let newTeamData = [];
  for(let i = 0; i < finalTeamIndices.length; i++){
    let tmp = []
    for(let j = 0; j < 6; j++){
      tmp.push(stats[((finalTeamIndices[i]*6)+j)])
      if(j == 5){
        tmp.push((i+1).toString());
      }
    }
    newTeamData.push(tmp);
  }
  let newTeamIDs = [];
  for(let i = 0; i < newTeamData.length; i++){
    for(let j = 0; j < teamNames.length; j++){
      if(teamNames[j] == newTeamData[i][0]){
        newTeamIDs.push(teamIDs[j]);
        break;
      }
    }
  }
  //Hitta id på GroupTeams
  //Uppdatera GroupTeams
  for(let i in newTeamIDs){
    for(let j in groupTeams){
      if(newTeamIDs[i] == groupTeams[j].TeamID){
        let gtDocRef = doc(db, "GroupTeams", groupTeams[j].id)
        await updateDoc(gtDocRef, {TeamData: newTeamData[i]})
        break;
      }
    }
  }
  if(advanceGroup){
    advanceTeamsFromGroup(groupObj, newTeamData, newTeamIDs);
  }
}

function breakWon(indexList, winMatrix){
  let indexToWonGames = [];
  for(let i = 0; i < indexList.length; i++){
    let wg = 0;
    for(let j = 0; j < indexList.length; j++){
      if(winMatrix[indexList[i]][indexList[j]] == 1){
        wg += 1;
      }
    }
    indexToWonGames.push([indexList[i], wg]);
  }
  indexToWonGames.sort((a, b) => {return -1*(a[1] - b[1])});

  let subGroups = [];
  let subGroup = [indexToWonGames[0][0]];
  let prev = indexToWonGames[0][1];
  for(let i = 1; i < indexToWonGames.length; i++){
    if(prev != indexToWonGames[i][1]){
      subGroups.push(subGroup);
      subGroup = [indexToWonGames[i][0]];
      prev = indexToWonGames[i][1];
    }else{
      subGroup.push(indexToWonGames[i][0]);
      prev = indexToWonGames[i][1];
    }
  }
  subGroups.push(subGroup); 
  return subGroups;
}

function breakGS1(indexList, goalMatrix){
  let indexToGD = []
  for(let i = 0; i < indexList.length; i++){
    let gd = 0;
    for(let j = 0; j < indexList.length; j++){
      gd += (goalMatrix[indexList[i]][indexList[j]])
    }
    indexToGD.push([indexList[i], gd])
  }

  indexToGD.sort((a, b) => {return -1*(a[1] - b[1])}); 
  let subGroups = [];
  let subGroup = [indexToGD[0][0]];
  let prev = indexToGD[0][1];
  for(let i = 1; i < indexToGD.length; i++){
    if(prev != indexToGD[i][1]){
      subGroups.push(subGroup);
      subGroup = [indexToGD[i][0]];
      prev = indexToGD[i][1];
    }else{
      subGroup.push(indexToGD[i][0]);
      prev = indexToGD[i][1];
    }
  } 
  subGroups.push(subGroup);
  return subGroups;
}

function breakGS2(indexList, goalMatrix){
  let indexToGD = [];
  for(let i = 0; i < indexList.length; i++){
    let gd = 0;
    for(let j = 0; j < goalMatrix.length; j++){
      gd += (goalMatrix[indexList[i]][j])
    }
    indexToGD.push([indexList[i], gd])
  }

  
  indexToGD.sort((a, b) => {return -1*(a[1] - b[1])}); 
  let subGroups = [];
  let subGroup = [indexToGD[0][0]];
  let prev = indexToGD[0][1];
  for(let i = 1; i < indexToGD.length; i++){
    if(prev != indexToGD[i][1]){
      subGroups.push(subGroup);
      subGroup = [indexToGD[i][0]];
      prev = indexToGD[i][1];
    }else{
      subGroup.push(indexToGD[i][0]);
      prev = indexToGD[i][1];
    }
  } 
  subGroups.push(subGroup);
  return subGroups;
}

function breakGD2(indexList, goalMatrix){
  let indexToGD = [];
  for(let i = 0; i < indexList.length; i++){
    let gd = 0;
    for(let j = 0; j < goalMatrix.length; j++){
      gd += (goalMatrix[indexList[i]][j]-goalMatrix[j][indexList[i]])
    }
    indexToGD.push([indexList[i], gd])
  }

  
  indexToGD.sort((a, b) => {return -1*(a[1] - b[1])}); 
  let subGroups = [];
  let subGroup = [indexToGD[0][0]];
  let prev = indexToGD[0][1];
  for(let i = 1; i < indexToGD.length; i++){
    if(prev != indexToGD[i][1]){
      subGroups.push(subGroup);
      subGroup = [indexToGD[i][0]];
      prev = indexToGD[i][1];
    }else{
      subGroup.push(indexToGD[i][0]);
      prev = indexToGD[i][1];
    }
  } 
  subGroups.push(subGroup);
  return subGroups; 
}

function breakGD1(indexList, goalMatrix){
  let indexToGD = []
  for(let i = 0; i < indexList.length; i++){
    let gd = 0;
    for(let j = 0; j < indexList.length; j++){
      gd += (goalMatrix[indexList[i]][indexList[j]]-goalMatrix[indexList[j]][indexList[i]])
    }
    indexToGD.push([indexList[i], gd])
  }

  indexToGD.sort((a, b) => {return -1*(a[1] - b[1])}); 
  let subGroups = [];
  let subGroup = [indexToGD[0][0]];
  let prev = indexToGD[0][1];
  for(let i = 1; i < indexToGD.length; i++){
    if(prev != indexToGD[i][1]){
      subGroups.push(subGroup);
      subGroup = [indexToGD[i][0]];
      prev = indexToGD[i][1];
    }else{
      subGroup.push(indexToGD[i][0]);
      prev = indexToGD[i][1];
    }
  } 
  subGroups.push(subGroup);
  return subGroups;
}

function breakTies(indexList, winMatrix, goalMatrix){
  //Antal vunna matcher -> Inbördes
  //Målskillnad -> Inbördes
  let newList = breakWon(indexList, winMatrix);
  let winBreak = [];
  for(let i = 0; i < newList.length; i++){
    if(newList[i].length > 1){
      let gdBroken = breakGD1(newList[i], goalMatrix);
      for(let j = 0; j < gdBroken.length; j++){
        winBreak.push(gdBroken[j]);
      }
    }else{
      winBreak.push(newList[i]);
    }
  };
  //Målskillnad alla matcher
  let winBreak2 = [];
  for(let i = 0; i < winBreak.length; i++){
    if(winBreak[i].length > 1){
      let tmp = breakGD2(winBreak[i], goalMatrix);
      for(let j = 0; j < tmp.length; j++){
        winBreak2.push(tmp[j]);
      }
    }else{
      winBreak2.push(winBreak[i]);
    }
  }
  
  //Gjorda mål -> Inbördes
  let winBreak3 = [];
  for(let i = 0; i < winBreak2.length; i++){
    if(winBreak2[i].length > 1){
      let tmp = breakGS1(winBreak2[i], goalMatrix);
      for(let j = 0; j < tmp.length; j++){
        winBreak3.push(tmp[j]);
      }
    }else{
      winBreak3.push(winBreak2[i]);
    }
  }
  //Gjorda mål alla matcher
  let winBreak4 = [];
  for(let i = 0; i < winBreak3.length; i++){
    if(winBreak3[i].length > 1){
      let tmp = breakGS2(winBreak3[i], goalMatrix);
      for(let j = 0; j < tmp.length; j++){
        winBreak4.push(tmp[j]);
      }
    }else{
      winBreak4.push(winBreak3[i]);
    }
  }

  let finalTeamPlacement = [];
  for(let i = 0; i < winBreak4.length; i++){
    if(winBreak4[i].length > 1){
      for(let j = 0; j < winBreak4[i].length; j++){
        finalTeamPlacement.push(winBreak4[i][j])
      }
    }else{
      finalTeamPlacement.push(winBreak4[i][0])
    }
  }

  return finalTeamPlacement;
}

export async function finishGame(game, team1ID, team2ID){
  if(game.Type === 1){
    await advanceTeams(game, team1ID, team2ID);
  }else if(game.Type === 0){
    await reCalculateGroup(game);
  }
}