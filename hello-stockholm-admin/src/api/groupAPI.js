import {db} from '../app/firebase-config'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc} from 'firebase/firestore'

//KLAR
export async function setAdvancements(groupId, advNames, advPos){
    //hämta alla matcher
    let adv = [];
    const gamesRef = collection(db, "Games");
    const data = await getDocs(gamesRef);
    let games = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    const groupRe = collection(db, "Groups");
    const data2 = await getDocs(groupRe);
    let groups = data2.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    //kolla så alla namn finns
    let check = true;
    for(let i in advNames){
        let innerCheck = false
        if(advPos[i] == 3){
            for(let j in groups){
                if(advNames[i] === groups[j].GroupName){
                    innerCheck = true
                    adv.push(groups[j].id);
                    break;
                }
            }
        }else{
            for(let j in games){
                if(advNames[i] === games[j].GameName){
                    innerCheck = true
                    adv.push(games[j].id);
                    break;
                }
            }
        }
        check = check && innerCheck
    }
    
    if(!check){
        return null;
    }
    //skapa array och uppdatera
    let newNextGame = [];
    for(let i in advNames){
        newNextGame.push(adv[i])
        newNextGame.push(advPos[i])
    }
    const groupRef = doc(db, "Groups", groupId);
    updateDoc(groupRef, {
        NextGames: newNextGame
    })
}

export async function finishGroup(groupId){
    //Dra ner gruppen
    const groupRef = doc(db, "Groups", groupId);
    let res = await getDoc(groupRef);
    let groupObj = {...res.data(), id:res.id}

    //Checka att alla matcher är spelade
    let groupGames = groupObj.Games;
    for(let i = 0; i < groupGames.length; i++){
        let gameRef = doc(db, "Games", groupGames[i]);
        let res = await getDoc(gameRef);
        let gameObj = {...res.data(), id:res.id}
        if(gameObj.Status != 2){
            console.log("Error: All games are not finished!")
            return -1;
        }
    }

    //Checka alla advancements så de är riktiga matcher
    //TODO:

    //Checka vilken pos i gruppen motsvarar vilket lag
    let teamData = groupObj.TeamData;
    let teamNames = [];
    for(let i = 0; i < teamData.length; i+=6){
        teamNames.push(teamData[i]);
    }

    let teamIDs = groupObj.TeamIDs;
    let teams = [];
    for(let i = 0; i < teamIDs.length; i++){
        let teamRef = doc(db, "Teams", teamIDs[i]);
        let res = await getDoc(teamRef);
        teams.push({...res.data(), id:res.id});
    }

    let teamIDToPos = [];
    for(let i = 0; i < teamNames.length; i++){
        for(let j = 0; j < teams.length; j++){
            if(teamNames[i] == teams[j].Name){
                teamIDToPos.push(teams[j].id);
                break;
            }
        }
    }

    if(teamIDToPos.length != teamIDs.length){
        console.log("ERROR: Not same amount of teamIDs");
        return -1;
    }

    //Lägg till lagID och lagNamn i matchobjekt
    //Lägg till matchID i lagobjekt
    let advancements = groupObj.NextGame;
    for(let i = 0; i < advancements.length; i+=2){
        let pos = advancements[i+1];
        let gameID = advancements[i];

        if(pos == 1){
            let gameRef = doc(db, "Games", gameID);
            await updateDoc(gameRef, {
                Team1ID: teamIDToPos[i/2],
                Team1Name: teamNames[i/2]
            })
        }else if(pos == 2){
            let gameRef = doc(db, "Games", gameID);
            await updateDoc(gameRef, {
                Team2ID: teamIDToPos[i/2],
                Team2Name: teamNames[i/2]
            })
        }

        let teamRef = doc(db, "Teams", teamIDToPos[i/2]);
        let teamRes = await getDoc(teamRef);
        let team = {...teamRes.data(), id:teamRes.id};
        let teamGames = team.gameIDs
        teamGames.push(gameID);
        await updateDoc(teamRef, {
            gameIDs: teamGames
        })
    }
}