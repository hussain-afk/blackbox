// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
// Your web app's Firebase configuration
import { firebaseConfig } from "./firebase-config.js";

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Firebase Auth and get a reference to the service
const auth = getAuth(app);


/**
 * Triggers a high-tech toast notification.
 * @param {string} message - The body text.
 * @param {string} type - 'success', 'error', or 'info'.
 */
function showToast(message, type = 'info') {
    // 1. Check for/Create Container
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Create Toast Element
    const toast = document.createElement('div');
    toast.className = `gaming-toast toast-${type}`;

    // Set titles based on type
    const titles = {
        success: 'CONNECTION_STABLE',
        error: 'SYSTEM_FAILURE',
        info: 'SYSTEM_NOTICE'
    };

    // 3. Set Inner HTML
    toast.innerHTML = `
        <div class="toast-content">
            <h4>${titles[type]}</h4>
            <p>${message}</p>
        </div>
    `;

    // 4. Add to DOM and Trigger Animation
    container.appendChild(toast);

    // Small delay to trigger the CSS transition
    setTimeout(() => toast.classList.add('show'), 10);

    // 5. Auto-Cleanup
    const removeToast = () => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    };

    // Remove after 4 seconds
    const autoHide = setTimeout(removeToast, 4000);

    // Click to dismiss early
    toast.onclick = () => {
        clearTimeout(autoHide);
        removeToast();
    };
}

// 3. Export the initialized auth instance and the helper functions
export {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    showToast,
    signInWithPopup,
    GoogleAuthProvider,
    getFirestore,
    collection,
    addDoc,
    app,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    deleteDoc
};