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
const date = document.getElementById("date");
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
    // Clear existing content to prevent duplicates
    if (eventList) eventList.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";

    // 1. Handle Empty State (If no documents exist in the collection)
    if (snapshot.empty) {
        const noEventsHTML = `
            <div class="col-span-full py-20 text-center">
                <p class="text-zinc-500 font-gaming uppercase tracking-widest animate-pulse">
                    — No Live Events Detected —
                </p>
            </div>`;
        
        if (cardsContainer) cardsContainer.innerHTML = noEventsHTML;
        if (eventList) {
            eventList.innerHTML = `
                <tr>
                    <td colspan="4" class="p-10 text-center text-zinc-600 font-mono italic">
                        Mainframe database is currently empty.
                    </td>
                </tr>`;
        }
        return; // Exit function early since there is nothing to loop through
    }

    // 2. Loop through documents if they exist
    snapshot.forEach((snapshotDoc) => {
        const data = snapshotDoc.data();
        const id = snapshotDoc.id;

        // --- Render Admin Table Row ---
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
                                data-date="${data.date || ''}" 
                                class="edit-btn text-purple-500 hover:text-white transition-colors">EDIT</button>
                        <button data-id="${id}" class="delete-btn text-zinc-600 hover:text-red-500 transition-colors">DELETE</button>
                    </td>
                </tr>`;
            eventList.innerHTML += row;
        }

        // --- Render Public Cards ---
        if (cardsContainer) {
            const card = `
    <div class="relative rounded-2xl overflow-hidden group bg-zinc-950/40 border border-white/5 transition-all duration-700 hover:shadow-[0_0_50px_rgba(239,68,68,0.2)] hover:-translate-y-3 hover:border-red-500/50">
        
        <div class="absolute top-4 right-4 z-30 flex items-center gap-2 translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <div class="bg-red-600 px-3 py-1 rounded-sm font-gaming font-bold text-[10px] uppercase tracking-tighter text-white shadow-2xl">
                ${data.status}
            </div>
            <div class="bg-white/10 backdrop-blur-md px-3 py-1 rounded-sm font-gaming font-bold text-[10px] uppercase tracking-tighter text-white border border-white/20">
                ${data.date || 'TBA'}
            </div>
        </div>

        <div class="h-60 overflow-hidden relative">
            <div class="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]"></div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10 opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>
            
            <img src="${data.imgSrc || 'https://via.placeholder.com/600x400?text=No+Asset+Linked'}" 
                 class="w-full h-full object-cover transition duration-1000 scale-100 group-hover:scale-110 blur-[1px] group-hover:blur-0" 
                 alt="Tournament">
        </div>

        <div class="p-6 relative z-20 bg-zinc-950/80 backdrop-blur-sm border-t border-white/5">
            <div class="flex items-center gap-2 mb-2">
                <div class="h-[1px] w-8 bg-red-600 group-hover:w-16 transition-all duration-500"></div>
                <span class="text-[9px] text-red-500 font-gaming font-bold uppercase tracking-[0.4em] opacity-80">
                    Phase One // Entry
                </span>
            </div>
            
            <h3 class="font-gaming text-2xl font-black mb-6 text-white tracking-tighter group-hover:text-red-500 transition-colors duration-300 italic">
                ${data.eventName}
            </h3>

            <div class="flex justify-between items-end">
                <div class="flex flex-col">
                    <span class="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-bold">Main Prize Pool</span>
                    <div class="flex items-baseline gap-1">
                        <span class="text-emerald-500 font-gaming font-bold text-2xl group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all">
                            $${Number(data.prizePool).toLocaleString()}
                        </span>
                        <span class="text-emerald-900 text-[10px] font-bold uppercase">USD</span>
                    </div>
                </div>

                <button class="relative overflow-hidden bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-400 w-12 h-12 rounded-xl transition-all duration-500 group/btn">
                    <div class="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    <i class="fa-solid fa-arrow-right relative z-10 text-white group-hover/btn:rotate-[-45deg] transition-transform duration-300"></i>
                </button>
            </div>
        </div>

        <div class="absolute bottom-0 left-0 h-1 bg-red-600 w-0 group-hover:w-full transition-all duration-700"></div>
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
        date: date.value,
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
        date.value = "";
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
        date.value = e.target.getAttribute("data-date");
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
