import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAEAUwx3btwMAPcXBMnWXVVKTG6CBYq6mQ",
    authDomain: "rz-upperline-app.firebaseapp.com",
    databaseURL: "https://rz-upperline-app.firebaseio.com",
    projectId: "rz-upperline-app",
    storageBucket: "",
    messagingSenderId: "505497050212",
    appId: "1:505497050212:web:4e29886a955f4f7d"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)
  
  export const auth = firebase.auth()
  export const db = firebase.firestore()
  
  export default firebase