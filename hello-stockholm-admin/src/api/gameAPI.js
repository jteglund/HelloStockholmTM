import {db} from '../app/firebase-config'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc} from 'firebase/firestore'
import { getGroups } from './api';

function checkIfGameExists(listOfGames, gameName){
    for(let i in listOfGames){
        if(listOfGames[i].GameName === gameName){
            return true;
        }
    }
    return false;
}

export async function getGames(){
    const gamesCollectionRef = collection(db, "Game");
    const data = await getDocs(gamesCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

export async function getTeams(){
    const teamssCollectionRef = collection(db, "Team");
    const data = await getDocs(teamssCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function createGame(gameName, division){
    //Hämta alla matcher
    const listOfGames = await getGames();

    //Kolla om gameName finns
    let gameExists = checkIfGameExists(listOfGames, gameName);
    //Lägg till dokument
    if(!gameExists){
        const gamesCollectionRef = collection(db, "Game");
        let game = {
            DateTime: 0,
            Division: division,
            Field: "Field X",
            GameName: gameName,
            LNextGame: [],
            Status: 0,
            Team1ID: "",
            Team1Name: "Team 1",
            Team2ID: "",
            Team1Score: 0,
            Team2Name: "Team 2",
            Team2Score: 0,
            WNextGame: [],
            Type: 1,
            Ready: 0
        }
         
        //Lägg till matchID i lagobjekt
        let id = await addDoc(gamesCollectionRef, game);
        return id.id;
    }
    // -1 = Game exists error
    return -1;
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
    return [day.toString(), hString, mString];
    //return hString + ":" + mString + " - " + day.toString() + " Feb";
  }

export function convertDateToMinutes(day, hour, minute){
    const originDay = 23;
    let days = parseInt(day) - originDay;

    return days*1440 + parseInt(hour)*60 + parseInt(minute);
}

export async function updateGeneral(id, gameName, division, dateTime, field){
    const gameRef = doc(db, "Game", id);
    await updateDoc(gameRef, {
        GameName: gameName,
        Division: division,
        DateTime: dateTime,
        Field: field,
    })
}

export async function setPlaceholderTeamNames(id, team1name, team2name){
    const gameRef = doc(db, "Game", id);
    await updateDoc(gameRef, {
        Team1Name: team1name,
        Team2Name: team2name,
        Team1ID: "",
        Team2ID: "",
    })
}

export async function setExistingTeam(gameID, teamname, division, index){
    if(index < 1 || index > 2){
        return -1;
    }
    let teamsList = await getTeams();
    let teamIndex = -1;
    for(let i in teamsList){
        if(teamsList[i].Name === teamname && teamsList[i].Division === division){
            teamIndex = i;
        }
    }
    if(teamIndex === -1){
        return -1;
    }

    const gameRef = doc(db, "Game", gameID);
    //let gameDoc = await getDoc(gameRef);
    //let game = { ...gameDoc.data(), id: gameDoc.id };
    const teamRef = doc(db, "Team", teamsList[teamIndex].id)
    

    let gameIDs = teamsList[teamIndex].gameIDs
    gameIDs.push(gameID);

    await updateDoc(teamRef, {
        gameIDs: gameIDs
    })

    if(index === 1){
        //TODO: ta bort match id från lag om det redan ligger ett lag där
        
        await updateDoc(gameRef, {
            Team1Name: teamsList[teamIndex].Name,
            Team1ID: teamsList[teamIndex].id
        })
    }else if(index === 2){
        await updateDoc(gameRef, {
            Team2Name: teamsList[teamIndex].Name,
            Team2ID: teamsList[teamIndex].id
        })
    }
    return 1;
}

export async function setNextGame(gameID, gameName, wl, teamIndex){
    if(wl < 0 || wl > 1){
        return -1;
    }

    if(teamIndex < 1 || teamIndex > 3){
        return -1;
    }
    
    let id = "";
    if(teamIndex == 3){
        let groupList = await getGroups();
        let groupIndex = -1;
        for(let i in groupList){
            if(groupList[i].Name === gameName){
                groupIndex = i;
            }
        }
        if(groupIndex === -1){
            return -1;
        }
        id = groupList[groupIndex].id;
    }else{
        let gamesList = await getGames();
        let gameIndex = -1;
        for(let i in gamesList){
            if(gamesList[i].GameName === gameName){
                gameIndex = i;
            }
        }
        if(gameIndex === -1){
            return -1;
        }
        id = gamesList[gameIndex].id;
    }

    const gameRef = doc(db, "Game", gameID);
    if(wl === 0){
        await updateDoc(gameRef, {
            WNextGame: [id, teamIndex]
        })
    }else if(wl === 1){
        await updateDoc(gameRef, {
            LNextGame: [id, teamIndex]
        })
    }
    return 1;
}

export async function setGameReady(gameID){
    const gameRef = doc(db, "Game", gameID)
    await updateDoc(gameRef, {
        Ready: 1
    })
}