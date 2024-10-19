'use client'

import styles from '../page.module.css'
import { db } from '../firebase-config'
import { doc, getDoc, collection, query, getDocs, where, documentId} from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { SingleEliminationBracket, createTheme, DoubleEliminationBracket, Match, MATCH_STATES, SVGViewer } from '@g-loot/react-tournament-brackets';
import { useWindowSize } from "@uidotdev/usehooks";

export const WhiteTheme = createTheme({
    textColor: { main: '#000000', highlighted: '#07090D', dark: '#3E414D' },
    matchBackground: { wonColor: '#149CE9', lostColor: '#127ebc' },
    score: {
      background: { wonColor: '#87b2c4', lostColor: '#87b2c4' },
      text: { highlightedWonColor: '#7BF59D', highlightedLostColor: '#FB7E94' },
    },
    border: {
      color: '#149CE9',
      highlightedColor: '#127ebc',
    },
    roundHeader: { backgroundColor: '#da96c6', fontColor: '#000' },
    connectorColor: '#CED1F2',
    connectorColorHighlight: '#da96c6',
    svgBackground: '#FAFAFA',
  });

export default function Home({params}) {
    const [bracket, setBracket] = useState([])

    const bracketRef = doc(db, "Bracket", 'my_list_document');

    const SingleElimination = () => {
        //TODO: const [width, height] = useWindowSize();
        const finalWidth = 1000;
        const finalHeight = 3000;
    
        
        return (<SingleEliminationBracket
          matches={bracket}
          matchComponent={Match}
        />)
    };

    useEffect(() => {
        const getBracket = async () => {
            const doc = await getDoc(bracketRef);
            setBracket(doc.data().objects);
        }
        getBracket();
    }, [])
    console.log(bracket)
    return (
        <main className={styles.main}>
           { bracket.length != 0 &&
            <SingleElimination></SingleElimination>
           } 
        </main>
    )
}