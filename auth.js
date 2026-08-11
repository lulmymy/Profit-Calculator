import { auth } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const authModal = document.getElementById("authModal");
const modalTitle = document.getElementById("modalTitle");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authError = document.getElementById("authError");
const authSubmitBtn = document.getElementById("authSubmitBtn");

const signInBtn = document.getElementById("signInBtn");
const registerBtn = document.getElementById("registerBtn");
const signOutBtn = document.getElementById("signOutBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const userEmailEl = document.getElementById("userEmail");

let mode = "signin";

function openModal(selectedMode) {
  mode = selectedMode;
  modalTitle.textContent = mode === "signin" ? "Sign In" : "Register";
  authSubmitBtn.textContent = mode === "signin" ? "Sign In" : "Register";
  authError.textContent = "";
  authEmail.value = "";
  authPassword.value = "";
  authModal.classList.add("visible");
}

signInBtn.addEventListener("click", function () { openModal("signin"); });
registerBtn.addEventListener("click", function () { openModal("register"); });
closeModalBtn.addEventListener("click", function () {
  authModal.classList.remove("visible");
});

authSubmitBtn.addEventListener("click", async function () {
  authError.textContent = "";
  const email = authEmail.value;
  const password = authPassword.value;

  try {
    if (mode === "signin") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    authModal.classList.remove("visible");
  } catch (error) {
    authError.textContent = error.message;
  }
});

signOutBtn.addEventListener("click", function () {
  signOut(auth);
});

const forgotPasswordLink = document.getElementById("forgotPasswordLink");

forgotPasswordLink.addEventListener("click", async function (e) {
  e.preventDefault();
  const email = authEmail.value;
  if (!email) {
    authError.textContent = "Enter your email above first, then click this link.";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    authError.style.color = "#A855F7";
    authError.textContent = "Password reset email sent — check your inbox.";
  } catch (error) {
    authError.textContent = error.message;
  }
});

onAuthStateChanged(auth, function (user) {
  if (user) {
    userEmailEl.textContent = user.email;
    userEmailEl.style.display = "inline";
    signOutBtn.style.display = "block";
    signInBtn.style.display = "none";
    registerBtn.style.display = "none";
  } else {
    userEmailEl.style.display = "none";
    signOutBtn.style.display = "none";
    signInBtn.style.display = "block";
    registerBtn.style.display = "block";
  }
});