import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA05K4I9yuy8-k1zVjAUL6OPdgy6jUlzes",
  authDomain: "gameflixwebapp.firebaseapp.com",
  projectId: "gameflixwebapp",
  storageBucket: "gameflixwebapp.appspot.com",
  messagingSenderId: "931118787995",
  appId: "1:931118787995:web:75487e13eba6ae7c37453e"
};


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };