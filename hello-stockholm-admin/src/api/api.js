import {db} from '../app/firebase-config'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc} from 'firebase/firestore'

function checkIfGameExists(listOfGames, gameName){
    for(let i in listOfGames){
        if(listOfGames[i].GameName === gameName){
            return true;
        }
    }
    return false;
}

async function getGames(){
    const gamesCollectionRef = collection(db, "Game");
    const data = await getDocs(gamesCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  }

export async function getGroups(){
    const groupCollectionRef = collection(db, "Group");
    const data = await getDocs(groupCollectionRef);
    return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function createAndAddGame(gameName, division, team1ID, team2ID, team1Name, team2Name){
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
            Team1ID: team1ID,
            Team1Name: team1Name,
            Team2ID: team2ID,
            Team1Score: 0,
            Team2Name: team2Name,
            Team2Score: 0,
            WNextGame: [],
            Type: 0,
            Ready: 0
        }
         
        //Lägg till matchID i lagobjekt
        let id = await addDoc(gamesCollectionRef, game)
        const team1Ref = doc(db, "Team", team1ID);
        const team2Ref = doc(db, "Team", team2ID);
        const team1 = await getDoc(team1Ref);
        const team2 = await getDoc(team2Ref);

        let team1Games = team1.data().gameIDs;
        let team2Games = team2.data().gameIDs;
        team1Games.push(id.id);
        team2Games.push(id.id);

        await updateDoc(team1Ref, {
            gameIDs: team1Games
        });

        await updateDoc(team2Ref, {
            gameIDs: team2Games
        });

        return id;
    }
    // -1 = Game exists error
    return -1;
}

async function createTemplateGame(gameName, division, team1Name, team2Name){
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
            Team1Name: team1Name,
            Team2ID: "",
            Team1Score: 0,
            Team2Name: team2Name,
            Team2Score: 0,
            WNextGame: [],
            Type: 0,
            Ready: 0
        }
         
        //Lägg till matchID i lagobjekt
        let id = await addDoc(gamesCollectionRef, game)

        return id;
    }
    // -1 = Game exists error
    return -1;
}

async function generateTemplateGroupGames(groupID, groupName, division, teamData, groupGames){
    let gameIDs = [];
    let count = 1;
    for(let i = 0; i < teamData.length/6; i++){
        for(let j = i+1; j < teamData.length/6; j++){
            let id = await createTemplateGame(groupName+((count).toString()), division, teamData[i*6], teamData[j*6]); 
            count++;
            if(id === -1){
                return -1;
            }
            gameIDs.push(id.id);
        }
    }
    //Lägg till matchID i gruppobjekt
    const groupRef = doc(db, "Group", groupID);
    await updateDoc(groupRef, {
        Games: groupGames.concat(gameIDs)
    });
    return 1;
}

export async function generateGroupGames(groupID, groupName, division, teamIDs, teamData, groupGames){
    if(teamIDs.length == 0){
        return generateTemplateGroupGames(groupID, groupName, division, teamData, groupGames);
    }
    let gameIDs = [];
    let count = 1;
    for(let i = 0; i < teamIDs.length-1; i++){
        for(let j = i+1; j < teamIDs.length; j++){
            let id = await createAndAddGame(groupName+((count).toString()), division, teamIDs[i], teamIDs[j], teamData[i*6], teamData[j*6]); 
            count++;
            if(id === -1){
                return -1;
            }
            gameIDs.push(id.id);
        }
    }
    //Lägg till matchID i gruppobjekt
    const groupRef = doc(db, "Group", groupID);
    await updateDoc(groupRef, {
        Games: groupGames.concat(gameIDs)
    });
    return 1;
}

function removeGroupFromTeam(teamGroups, groupToRemove){
    return teamGroups.filter(function (group) {
        return group != groupToRemove;
    });
}

function removeGameFromTeam(teamGames, gameToRemove){
    return teamGames.filter(function (game) {
        return game != gameToRemove;
    });
}

export async function deleteGroup(group){
    //Ta bort gruppID från lag
    let teamIDs = group.TeamIDs;
    for(let i in teamIDs){
        let teamRef = doc(db, "Team", teamIDs[i]);
        let team = await getDoc(teamRef);
        let teamGroups = team.data().GroupID;
        let newTeamGroups = removeGroupFromTeam(teamGroups, group.id);

        let teamGames = team.data().gameIDs;
        for(let i in group.Games){
            teamGames = removeGameFromTeam(teamGames, group.Games[i]);    
        }
        
        await updateDoc(teamRef, {
            GroupID: newTeamGroups,
            gameIDs: teamGames
        });
    }
    //Ta bort matcher från Game och Team/gameIDs
    let gameIDs = group.Games;
    for(let i in gameIDs){
        let gameRef = doc(db, "Game", gameIDs[i]);
        await deleteDoc(gameRef);
    }

    //Ta bort grupp
    let groupRef = doc(db, "Group", group.id);
    await deleteDoc(groupRef);
}