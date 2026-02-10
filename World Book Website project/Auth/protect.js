import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const authBtn = document.getElementById("authBtn");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // USER IS LOGGED IN
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
       authBtn.textContent = `Logout (${docSnap.data().name})`;
    } else {
       authBtn.textContent = "Logout";
    }

    authBtn.onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.reload(); // Refresh to show "Login" again
    };
  } else {
    // USER IS LOGGED OUT
    authBtn.textContent = "Login";
    authBtn.href = "./login page/login.html";
    
    // Optional: Only redirect if they are on a "members only" page
    // if (window.location.pathname.includes("recipes.html")) { 
    //    window.location.href = "./login page/login.html"; 
    // }
  }
});