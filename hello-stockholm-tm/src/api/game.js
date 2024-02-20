import { collection, getDocs, addDoc, getDoc, updateDoc, doc, query, where } from "firebase/firestore";
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

export function convertMinutesToDate(minutes){
  const originDay = 23;
  let dayMinute = 1440;
  let hourMinute = 60;
  let remainder;

  let day = Math.floor(minutes/dayMinute) + originDay;
  remainder = minutes % dayMinute;

  let hour = Math.floor(remainder/hourMinute);
  remainder = remainder % hourMinute;

  let minute = remainder;
  let hString = hour.toString();
  if(hour < 10){
    hString = "0" + hour.toString();
  }

  let mString = minute.toString()
  if(minute < 10){
    mString = "0" + minute.toString();
  }

  return hString + ":" + mString + " - " + day.toString() + " Feb";
}

async function advanceTeams(game){
  //Beräkna förloraren och vinnaren
  let winnerId = "";
  let winnerName = "";
  let loserId = "";
  let loserName = "";
  let winnerScore = 0;
  let loserScore = 0;

  let scoreDiff = game.Team1Score - game.Team2Score;
  if(scoreDiff > 0){
    winnerId = game.Team1ID;
    winnerName = game.Team1Name;
    winnerScore = game.Team1Score;
    loserId = game.Team2ID;
    loserName = game.Team2Name;
    loserScore = game.Team2Score;
  } else{
    winnerId = game.Team2ID;
    winnerName = game.Team2Name;
    winnerScore = game.Team2Score;
    loserId = game.Team1ID;
    loserName = game.Team1Name;
    loserScore = game.Team1Score;
  }

  //Dra ner matcherna som ska skickas till
  if(game.WNextGame.length > 0){
    if(game.WNextGame[1] != 3){
      let winRef = doc(db, "Game", game.WNextGame[0]);
      let wRes = await getDoc(winRef);
      let wGame = {...wRes.data(), id: wRes.id}  

      //Kolla så den är ostartad
      if(wGame.Status == 0){
        //Kolla så att id är tomt i matchen annars måste det hanteras
        let pos = ""
        if(game.WNextGame[1] == 1){
          pos = wGame.Team1ID;
        }
        if(game.WNextGame[1] == 2){
          pos = wGame.Team2ID;
        }  

        if(pos != ""){
          //Ta bort matchen från det laget
          let gameID = wGame.id;
          let teamRef = doc(db, "Team", pos);
          let tRes = await getDoc(teamRef);
          let team = {...tRes.data(), id: tRes.id}

          let newGameIDs = []
          for(let i in team.gameIDs){
            if(team.gameIDs[i] != gameID){
              newGameIDs.push(team.gameIDs[i]);
            }
          }
          await updateDoc(teamRef, {
            gameIDs: newGameIDs
          });
        }
        //Lägg in lag
        //Wgame
        if(game.WNextGame[1] == 1){
          await updateDoc(winRef, {
            Team1ID: winnerId,
            Team1Name: winnerName
          })
        }else if(game.WNextGame[1] == 2){
          await updateDoc(winRef, {
            Team2ID: winnerId,
            Team2Name: winnerName
          })
        }
        //Lägg till ny match i lag
        let wTeamRef = doc(db, "Team", winnerId);
        let wTRes = await getDoc(wTeamRef);
        let wTeam = {...wTRes.data(), id:wTRes.id};
        let wGameIDs = wTeam.gameIDs;
        wGameIDs.push(game.WNextGame[0]);

        await updateDoc(wTeamRef, {
          gameIDs: wGameIDs
        });
      }
    }else{
      //Dra ner grupp
      let groupRef = doc(db, "Group", game.WNextGame[0]);
      let res = await getDoc(groupRef);
      let group = {...res.data(), id:res.id};
      
      let groupTeamData = group.TeamData;
      let groupTeamIDs = group.TeamIDs;
      let placeholdername = "W" + game.GameName;

      //Lägg till lagnamn i teamData
      for(let i = 0; i < groupTeamData.length/6; i++){
        if(groupTeamData[i*6] == placeholdername){
          groupTeamData[i*6] = winnerName;
        }
      }
      //Lägg till lagID i teamIDs
      groupTeamIDs.push(winnerId);

      await updateDoc(groupRef, {
        TeamData: groupTeamData,
        TeamIDs: groupTeamIDs
      });

      //Dra ner gruppmatcher
      let groupGames = group.Games;
      let gameIDs = [];
      for(let i = 0; i < groupGames.length; i++){
        //Lägg till lagnamn och lagID i matcherna med rätt placeholdername
        let groupGameRef = doc(db, "Game", groupGames[i]);
        let ggRes = await getDoc(groupGameRef);
        let groupGame = {...ggRes.data(), id:ggRes.id}

        if(groupGame.Team1Name == placeholdername){
          await updateDoc(groupGameRef, {
            Team1Name: winnerName,
            Team1ID: winnerId
          });
          gameIDs.push(groupGames[i]);
        }else if(groupGame.Team2Name == placeholdername){
          await updateDoc(groupGameRef, {
            Team2Name: winnerName,
            Team2ID: winnerId
          });
          gameIDs.push(groupGames[i]);
        }
      }      
      
      //Lägg till matchid i lag
      //Lägg till gruppid i lagss
      let wTeamRef = doc(db, "Team", winnerId);
      let wTRes = await getDoc(wTeamRef);
      let wTeam = {...wTRes.data(), id:wTRes.id};
      let wGameIDs = wTeam.gameIDs;
      let newGameID = wGameIDs.concat(gameIDs);
      let newGroupID = wTeam.GroupID;
      newGroupID.push(game.WNextGame[0]);

      await updateDoc(wTeamRef, {
        gameIDs: newGameID,
        GroupID: newGroupID
      });
    }
  }
  
  if(game.LNextGame.length > 0){
    if(game.LNextGame[1] != 3){
      let lossRef = doc(db, "Game", game.LNextGame[0]);
      let lRes = await getDoc(lossRef);
      let lGame = {...lRes.data(), id: lRes.id}

      if(lGame.Status == 0){
        let pos2 = "";
        if(game.LNextGame[1] == 1){
          pos2 = lGame.Team1ID;
        }
        if(game.LNextGame[1] == 2){
          pos2 = lGame.Team2ID;
        }  

        if(pos2 != ""){
          //Ta bort matchen från det laget
          let gameID = lGame.id;
          let teamRef = doc(db, "Team", pos2);
          let tRes = await getDoc(teamRef);
          let team = {...tRes.data(), id: tRes.id}

          let newGameIDs = []
          for(let i in team.gameIDs){
            if(team.gameIDs[i] != gameID){
              newGameIDs.push(team.gameIDs[i]);
            }
          }
          await updateDoc(teamRef, {
            gameIDs: newGameIDs
          });
        }

        if(game.LNextGame[1] == 1){
          await updateDoc(lossRef, {
            Team1ID: loserId,
            Team1Name: loserName
          })
        }else if(game.LNextGame[1] == 2){
          await updateDoc(lossRef, {
            Team2ID: loserId,
            Team2Name: loserName
          })
        }
        let lTeamRef = doc(db, "Team", loserId);
        let lTRes = await getDoc(lTeamRef);
        let lTeam = {...lTRes.data(), id:lTRes.id};
        let lGameIDs = lTeam.gameIDs;
        lGameIDs.push(game.LNextGame[0]);
        
        await updateDoc(lTeamRef, {
          gameIDs: lGameIDs
        });
      }
    }else{
      //Dra ner grupp
      let groupRef = doc(db, "Group", game.LNextGame[0]);
      let res = await getDoc(groupRef);
      let group = {...res.data(), id:res.id};
      
      let groupTeamData = group.TeamData;
      let groupTeamIDs = group.TeamIDs;
      let placeholdername = "L" + game.GameName;

      //Lägg till lagnamn i teamData
      for(let i = 0; i < groupTeamData.length/6; i++){
        if(groupTeamData[i*6] == placeholdername){
          groupTeamData[i*6] = loserName;
        }
      }
      //Lägg till lagID i teamIDs
      groupTeamIDs.push(loserId);

      await updateDoc(groupRef, {
        TeamData: groupTeamData,
        TeamIDs: groupTeamIDs
      });

      //Dra ner gruppmatcher
      let groupGames = group.Games;
      let gameIDs = [];
      for(let i = 0; i < groupGames.length; i++){
        //Lägg till lagnamn och lagID i matcherna med rätt placeholdername
        let groupGameRef = doc(db, "Game", groupGames[i]);
        let ggRes = await getDoc(groupGameRef);
        let groupGame = {...ggRes.data(), id:ggRes.id}

        if(groupGame.Team1Name == placeholdername){
          await updateDoc(groupGameRef, {
            Team1Name: loserName,
            Team1ID: loserId
          });
          gameIDs.push(groupGames[i]);
        }else if(groupGame.Team2Name == placeholdername){
          await updateDoc(groupGameRef, {
            Team2Name: loserName,
            Team2ID: loserId
          });
          gameIDs.push(groupGames[i]);
        }
      }      
      
      //Lägg till matchid i lag
      //Lägg till gruppid i lagss
      let lTeamRef = doc(db, "Team", loserId);
      let lTRes = await getDoc(lTeamRef);
      let lTeam = {...lTRes.data(), id:lTRes.id};
      let lGameIDs = lTeam.gameIDs;
      let newGameID = lGameIDs.concat(gameIDs);
      let newGroupID = lTeam.GroupID;
      newGroupID.push(game.LNextGame[0]);

      await updateDoc(lTeamRef, {
        gameIDs: newGameID,
        GroupID: newGroupID
      }); 
    }
  }
}

async function reCalculateGroup(game){
  //Ta fram gruppnamn från game.GameName
  let gamename = game.GameName.replace(/[0-9]/g, '');
  //Dra ner gruppen
  const q = query(collection(db, "Group"), where("Name", "==", gamename));
  const querySnapshot = await getDocs(q);
  let groupObj = null;

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    groupObj = {...doc.data(), id: doc.id}
  });
  //Dra ner alla matcher i gruppen
  let allGames = [];
  const gamesCollectionRef = collection(db, "Game");
  const res = await getDocs(gamesCollectionRef);
  res.forEach((doc) => {
    allGames.push({...doc.data(), id: doc.id})
  });

  let groupGames = [];
  allGames.forEach((game) => {
    if(groupObj.Games.includes(game.id)){
      groupGames.push(game);
    }
  });

  //Gå igenom alla spelade matcher
  //Skapa två matriser, en för vinst/förlust (1/-1) och en för gjorda mål
  let nTeams = groupObj.TeamIDs.length
  let winMatrix = [];
  let goalMatrix = [];
  for(let i = 0; i < nTeams; i++){
    winMatrix.push(new Array(nTeams).fill(0));
    goalMatrix.push(new Array(nTeams).fill(0));
  }

  //Indexet som laget ligger på i Group.TeamIDs är indexet i matriserna
  //Skapa statistik

  let teamNames = [];
  for(let i = 0; i < nTeams; i++){
    for(let j = 0; j < groupGames.length; j++){
      if(groupGames[j].Team1ID == groupObj.TeamIDs[i]){
        teamNames.push(groupGames[j].Team1Name);
        break;
      }
      if(groupGames[j].Team2ID == groupObj.TeamIDs[i]){
        teamNames.push(groupGames[j].Team2Name);
        break;
      }
    }
  }

  groupGames.forEach((game) => {
    if(game.Status == 2){
      //Hitta team1index och team2index
      let team1index = groupObj.TeamIDs.indexOf(game.Team1ID);
      let team2index = groupObj.TeamIDs.indexOf(game.Team2ID);

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
      };
    })

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
        points += 3;
      }
      if(winMatrix[i][j] == -1){
        gamesLost += 1;
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
    for(let j = 0; j < 6; j++){
      newTeamData.push(stats[((finalTeamIndices[i]*6)+j)])
    }
  }
  let newTeamIDs = [];
  for(let i = 0; i < newTeamData.length/6; i++){
    for(let j = 0; j < teamNames.length; j++){
      if(teamNames[j] == newTeamData[i*6]){
        newTeamIDs.push(groupObj.TeamIDs[j]);
        break;
      }
    }
  }

  const groupRef = doc(db, "Group", groupObj.id)
  await updateDoc(groupRef, {
    TeamData: newTeamData,
    TeamIDs: newTeamIDs
  })
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

export async function finishGame(game){
  if(game.Type === 1){
    await advanceTeams(game);
  }else if(game.Type === 0){
    await reCalculateGroup(game);
  }
}