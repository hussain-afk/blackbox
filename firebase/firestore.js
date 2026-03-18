import {
    app, getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    showToast,
    doc,
    updateDoc,
    deleteDoc,
    query,
    onSnapshot,
    orderBy
} from "./main.js";

const db = getFirestore(app);

// DOM Elements
const collectionNameInput = document.getElementById("collection-name");
const addEventBtn = document.getElementById("add-event");
const eventNameInput = document.getElementById("event-name");
const prizePoolInput = document.getElementById("prize-pool");
const imgSrcInput = document.getElementById("img-src"); // Captured correctly now
const statusInput = document.getElementById("status");
const eventList = document.getElementById("event-list");
const cardsContainer = document.getElementById("tournament-cards-container");

let editId = null;

// --- CORE RENDER FUNCTION ---
const syncData = (colName = "events") => {
    const q = query(collection(db, colName), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        if (eventList) eventList.innerHTML = "";
        if (cardsContainer) cardsContainer.innerHTML = "";

        snapshot.forEach((snapshotDoc) => {
            const data = snapshotDoc.data();
            const id = snapshotDoc.id;

            // 1. Render Admin Table Row
            if (eventList) {
                const row = `
                    <tr class="border-b border-zinc-900 hover:bg-zinc-800/30 transition-colors">
                        <td class="p-4 text-white font-mono">
                            <div class="flex items-center gap-2">
                                <img src="${data.imgSrc || ''}" class="w-6 h-6 rounded bg-zinc-800 object-cover border border-white/10" onerror="this.style.display='none'">
                                ${data.eventName}
                            </div>
                        </td>
                        <td class="p-4 text-emerald-400 font-bold">$${Number(data.prizePool).toLocaleString()}</td>
                        <td class="p-4">
                            <span class="px-2 py-1 rounded bg-zinc-800 text-[10px] uppercase ${data.status === 'active' ? 'text-emerald-500 border border-emerald-500/30' : 'text-zinc-500'}">
                                ${data.status}
                            </span>
                        </td>
                        <td class="p-4 text-right flex justify-end gap-3">
                            <button data-id="${id}" 
                                    data-name="${data.eventName}" 
                                    data-prize="${data.prizePool}" 
                                    data-status="${data.status}" 
                                    data-img="${data.imgSrc || ''}" 
                                    class="edit-btn text-purple-500 hover:text-white transition-colors">EDIT</button>
                            <button data-id="${id}" class="delete-btn text-zinc-600 hover:text-red-500 transition-colors">DELETE</button>
                        </td>
                    </tr>`;
                eventList.innerHTML += row;
            }

            // 2. Render Public Cards
            if (cardsContainer) {
                const card = `
                    <div class="relative rounded-2xl overflow-hidden glass group bg-zinc-950/40 border border-white/10 transition-all duration-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:-translate-y-2">
                        <div class="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        
                            <div class="h-52 overflow-hidden relative">
                                <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
                                    <span class="relative flex h-2 w-2">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                    <div class="bg-red-600/90 backdrop-blur-md text-[10px] px-3 py-1 rounded-sm font-gaming font-bold uppercase tracking-widest text-white shadow-xl border border-white/10">
                                        ${data.status}
                                    </div>
                                </div>
                                <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-90"></div>
                                <img src="${data.imgSrc || 'https://via.placeholder.com/600x400?text=No+Asset+Linked'}" 
                                     class="w-full h-full object-cover transition duration-700 scale-105 group-hover:scale-110" 
                                     alt="Tournament">
                            </div>
                            <div class="p-6 relative z-20">
                                <span class="text-[9px] text-red-500 font-gaming font-bold uppercase tracking-[0.3em] mb-2 block opacity-80">Phase One // Entry</span>
                                <h3 class="font-gaming text-2xl font-bold mb-4 text-white tracking-tight group-hover:text-red-400 transition-colors">
                                    ${data.eventName}
                                </h3>
                                <div class="flex justify-between items-center border-t border-white/5 pt-5 mt-2">
                                    <div class="flex flex-col">
                                        <span class="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Total Stakes</span>
                                        <span class="text-emerald-400 font-gaming font-bold text-lg">$${Number(data.prizePool).toLocaleString()}</span>
                                    </div>
                                    <button class="bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-400 p-2 rounded-lg transition-all duration-300 group/btn">
                                        <i class="fa-solid fa-arrow-right-long text-white group-hover/btn:translate-x-1 transition-transform"></i>
                                    </button>
                                </div>
                            </div>
                        </div>`;
                cardsContainer.innerHTML += card;
            }
        });
    });
};

// --- INITIAL LOAD ---
const initialCollection = collectionNameInput?.value || "events";
syncData(initialCollection);

// --- EVENT LISTENERS ---

collectionNameInput?.addEventListener("change", () => {
    syncData(collectionNameInput.value || "events");
});

addEventBtn?.addEventListener("click", async () => {
    const colName = collectionNameInput?.value.trim() || "events";

    if (!eventNameInput.value || !prizePoolInput.value) {
        showToast("Missing Data Fields", "error");
        return;
    }

    // FIXED: Added imgSrc to the data object
    const eventData = {
        eventName: eventNameInput.value,
        prizePool: Number(prizePoolInput.value),
        imgSrc: imgSrcInput.value.trim(),
        status: statusInput.value,
        createdAt: serverTimestamp()
    };

    try {
        if (editId) {
            await updateDoc(doc(db, colName, editId), eventData);
            showToast("Deployment Updated", "success");
            addEventBtn.innerText = "Sync to Cloud Mainframe";
            editId = null;
        } else {
            await addDoc(collection(db, colName), eventData);
            showToast("Event Deployed to Cloud", "success");
        }
        // Reset Inputs
        eventNameInput.value = "";
        prizePoolInput.value = "";
        imgSrcInput.value = "";
    } catch (error) {
        showToast("System Error: " + error.message, "error");
    }
});

eventList?.addEventListener("click", async (e) => {
    const colName = collectionNameInput?.value.trim() || "events";
    const docId = e.target.getAttribute("data-id");

    if (!docId) return;

    if (e.target.classList.contains("edit-btn")) {
        editId = docId;
        eventNameInput.value = e.target.getAttribute("data-name");
        prizePoolInput.value = e.target.getAttribute("data-prize");
        statusInput.value = e.target.getAttribute("data-status");
        // FIXED: Pulling the img URL into the input field for editing
        imgSrcInput.value = e.target.getAttribute("data-img");

        addEventBtn.innerText = "UPDATE DEPLOYMENT";
        eventNameInput.focus();
    }

    if (e.target.classList.contains("delete-btn")) {
        if (confirm("Terminate this event data?")) {
            await deleteDoc(doc(db, colName, docId));
            showToast("Event Deleted", "success");
        }
    }
});

// --- PROFILE PICTURE PERSISTENCE ---
const updateProfilePictures = () => {
    const profilePicUrl = localStorage.getItem("user_profile_pic");
    if (profilePicUrl) {
        // Find all elements with class 'profile-pic-sync'
        const profilePics = document.querySelectorAll(".profile-pic-sync");
        profilePics.forEach(img => {
            img.src = profilePicUrl;
        });
    }
};

// Run on load
updateProfilePictures();