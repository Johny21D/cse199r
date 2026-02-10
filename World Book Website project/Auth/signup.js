import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("signupForm");

form.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save full name in Firestore
    await setDoc(doc(db, "users", user.uid), { name, email });

    alert("Account created successfully!");
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
});
