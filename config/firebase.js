import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDo5hMapxRxzYM3uYob3XKiOb66PHjBUkg",
  authDomain: "arenda-a732c.firebaseapp.com",
  projectId: "arenda-a732c",
  storageBucket: "arenda-a732c.appspot.com",
  messagingSenderId: "1042906025202",
  appId: "1:1042906025202:web:d9af63b6329466cc37946b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
