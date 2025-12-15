// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDErLVZTUVU6SBNcr3GnU494RiInIvKSQE",
  authDomain: "segui-rodando-pos.firebaseapp.com",
  projectId: "segui-rodando-pos",
  storageBucket: "segui-rodando-pos.firebasestorage.app",
  messagingSenderId: "871190935998",
  appId: "1:871190935998:web:94f8718694e9f710cbe1ef",
  measurementId: "G-RCY08SGE1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);