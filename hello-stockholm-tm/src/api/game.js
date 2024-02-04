import { collection, getDocs, addDoc, getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../app/firebase-config";

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
            newGameIDs.push(team.GameIDs[i]);
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
      
    }
  }
  //Lägg till ny match i lag
  let wTeamRef = doc(db, "Team", winnerId);
  let wTRes = await getDoc(wTeamRef);
  let wTeam = {...wTRes.data(), id:wTRes.id};
  let wGameIDs = wTeam.gameIDs;
  if(game.WNextGame.length > 0){
    wGameIDs.push(game.WNextGame[0]);
  }
  
  await updateDoc(wTeamRef, {
    WinsTotal: wTeam.WinsTotal+1,
    GoalsScoredTotal: wTeam.GoalsScoredTotal+winnerScore,
    GoalsConcededTotal: wTeam.GoalsConcededTotal+loserScore,
    gameIDs: wGameIDs
  });
  
  if(game.LNextGame.length > 0){
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
            newGameIDs.push(team.GameIDs[i]);
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

    }
  }
  let lTeamRef = doc(db, "Team", loserId);
  let lTRes = await getDoc(lTeamRef);
  let lTeam = {...lTRes.data(), id:lTRes.id};
  let lGameIDs = lTeam.gameIDs;
  if(game.LNextGame.length > 0){
    lGameIDs.push(game.LNextGame[0]);
  }
  await updateDoc(lTeamRef, {
    LossesTotal: lTeam.LossesTotal+1,
    GoalsScoredTotal: lTeam.GoalsScoredTotal+loserScore,
    GoalsConcededTotal: lTeam.GoalsConcededTotal+winnerScore,
    gameIDs: lGameIDs
  });
}

export async function finishGame(game){
  if(game.Type === 1){
    await advanceTeams(game);
  }else if(game.Type === 0){
    //await reCalculateGroup();
  }
}