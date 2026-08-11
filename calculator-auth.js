import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

window.currentUser = null;

window.firestoreSaveItems = async function (itemsArray) {
  if (!window.currentUser) return;
  try {
    await setDoc(doc(db, "users", window.currentUser.uid), { items: itemsArray });
  } catch (error) {
    console.error("Failed to save items:", error);
  }
};

window.firestoreLoadItems = async function () {
  if (!window.currentUser) return [];
  try {
    const snap = await getDoc(doc(db, "users", window.currentUser.uid));
    if (snap.exists() && snap.data().items) {
      return snap.data().items;
    }
  } catch (error) {
    console.error("Failed to load items:", error);
  }
  return [];
};

onAuthStateChanged(auth, function (user) {
  window.currentUser = user;
  const banner = document.getElementById("authBanner");

  if (user) {
    banner.textContent = "Signed in as " + user.email + " — your items are saved automatically.";
    banner.classList.add("visible");
    if (window.loadUserItems) window.loadUserItems();
  } else {
    banner.innerHTML = 'Not signed in — items won\'t be saved. <a href="index.html">Sign in</a>';
    banner.classList.add("visible");
  }
});