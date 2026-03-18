// Import only what you need from your previous file (main.js)
// Note: We already initialized 'auth' in main.js, so we just import it directly.
import {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    showToast
} from "./main.js";


// Login Elements
const loginBtn = document.getElementById("login-btn");
const loginEmail = document.getElementById("lemail");
const loginPassword = document.getElementById("lpassword");

// Signup Elements
const signupBtn = document.getElementById("signup-btn");
const signupEmail = document.getElementById("semail");
const signupPassword = document.getElementById("spassword");

// google btn 
const googleBtn = document.getElementById("google-btn");

// Login Logic
loginBtn.addEventListener("click", () => {
    // Basic validation to prevent sending empty strings to Firebase
    if (!loginEmail.value || !loginPassword.value) {
        showToast("Please fill in all login fields", "error");
        return;
    }

    signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Set placeholder avatar if none exists
            if (!user.photoURL) {
                const name = user.email.split("@")[0];
                const avatarUrl = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
                localStorage.setItem("user_profile_pic", avatarUrl);
            } else {
                localStorage.setItem("user_profile_pic", user.photoURL);
            }

            console.log("Logged in successfully:", user.email);
            showToast("Welcome back!", "success");
            window.location.replace("../blackbox/blackbox.html");
        })
        .catch((error) => {
            console.error("Login Error:", error.code, error.message);
            showToast("Login failed: " + error.message, "error");
        });
});

// Signup Logic
signupBtn.addEventListener("click", () => {
    if (!signupEmail.value || !signupPassword.value) {
        showToast("Please fill in all signup fields", "error");
        return;
    }

    createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Set placeholder avatar since it's a new signup
            const name = user.email.split("@")[0];
            const avatarUrl = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
            localStorage.setItem("user_profile_pic", avatarUrl);

            console.log("Account created:", user.email);
            showToast("Account created successfully!", "success");
            window.location.replace("../blackbox/blackbox.html");
        })
        .catch((error) => {
            console.error("Signup Error:", error.code, error.message);
            showToast("Signup failed: " + error.message, "error");
        });
});

// google btn 
googleBtn.addEventListener("click", () => {
    signInWithPopup(auth, new GoogleAuthProvider())
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            // Save profile pic to localStorage for persistence across pages
            if (user.photoURL) {
                localStorage.setItem("user_profile_pic", user.photoURL);
            }
            console.log("Logged in successfully:", user.email);
            // console.log("google profile picture:", user.photoURL);
            showToast("Welcome back!", "success");
            window.location.replace("../blackbox/blackbox.html");
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.error("Login Error:", error.code, error.message);
            showToast("Login failed: " + error.message, "error");
        });
})


