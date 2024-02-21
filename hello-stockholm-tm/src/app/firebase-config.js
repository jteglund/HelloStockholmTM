import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"
import { getAuth } from "@firebase/auth"

const firebaseConfig = {
 apiKey: process.env.NEXT_PUBLIC_API_KEY,
 authDomain: "hellostockholm-10129.firebaseapp.com",
 projectId: "hellostockholm-10129",
 storageBucket: "hellostockholm-10129.appspot.com",
 messagingSenderId: "573847371101",
 appId: "1:573847371101:web:00de7ea4acc3e038febcb4",
 measurementId: "G-Z8WGFVDVWK"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app)