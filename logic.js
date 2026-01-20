/**
 * RAILSPK OFFICIAL LOGIC SYSTEM
 * Version: 3.7.0 (Integrated with New Frontend + Hashtags + Polls)
 * Project: therails.pk
 */

// --- 1. CONFIGURATION & STATE ---
const appId = "railspk-official-1de54"; 
const firebaseConfig = { 
    apiKey: "AIzaSyCfoXeQk-6ubcJZz3ES7c6yE2IWSFp2z9A", 
    authDomain: "railspk-official-1de54.firebaseapp.com", 
    projectId: "railspk-official-1de54", 
    storageBucket: "railspk-official-1de54.firebasestorage.app", 
    messagingSenderId: "282037027182", 
    appId: "1:282037027182:web:6b4f8bb420eb410374c17f" 
};

let db, auth, user, adminAuthorised = false;
let YT_KEY = null, YT_CHANNEL = null; // Path: /artifacts/youtube
let yt_token = null, yt_duration = 'long', allReviews = [];

let expandedPosts = {}; 
let currentSliderImages = [];
let currentSliderIndex = 0;
let sliderTimer = null;

// --- 2. TRAIN DATA REPOSITORY ---
const trainsData = [
    { 
        id: 'greenline', 
        name: 'Green Line Express', 
        route: 'Karachi ⟷ Islamabad Margalla', 
        cities: ['Karachi', 'Hyderabad', 'Rohri', 'Bahawalpur','Khanewal','Lahore', 'Rawalpindi', 'Islamabad'], 
        slides: ['greenline_7.webp','greenline_2.webp','greenline_1.webp'], 
        fares: [{class:"AC Parlor",price:"Rs. 13,500"},{class:"Economy",price:"Rs. 4,500"},{class:"Standard",price:"Rs. 7,500"},{class:"Business",price:"Rs. 10,500"}],
        stats: { punctuality: '95%', cleanliness: 5, food: 4, behavior: 5 },
        amenities: ['wifi', 'charging', 'bedding', 'dining', 'ac'],
        composition: { parlor: '01 Coach', business: '06 Coaches', standard: '06 Coach', economy: '05 Coaches' }
    },
    { 
        id: 'khybermail', 
        name: 'Khyber Mail Express', 
        route: 'Karachi ⟷ Peshawar', 
        cities: ['Karachi', 'Multan', 'Lahore', 'Peshawar'], 
        slides: ['coming_soon.avif'], 
        fares: [{class:"AC Sleeper",price:"Rs. 13,000"},{class:"Economy",price:"Rs. 4,000"},{class:"Standard",price:"Rs. 7,000"},{class:"Business",price:"Rs. 10,000"}],
        stats: { punctuality: '82%', cleanliness: 3, food: 3, behavior: 4 },
        amenities: ['charging', 'bedding', 'dining', 'ac'],
        composition: { parlor: 'None', business: '03 Coaches', standard: '02 Coaches', economy: '08 Coaches' }
    },
    { 
        id: 'karakoram', 
        name: 'Karakoram Express', 
        route: 'Karachi ⟷ Lahore', 
        cities: ['Karachi', 'Hyderabad', 'Rohri', 'Lahore'], 
        slides: ['karakoram_express_train_rake.webp'], 
        fares: [{class:"AC Business",price:"Rs. 9,500"},{class:"Economy",price:"Rs. 4,000"},{class:"Standard",price:"Rs. 7,000"}],
        stats: { punctuality: '90%', cleanliness: 4, food: 4, behavior: 5 },
        amenities: ['wifi', 'charging', 'bedding', 'dining', 'ac'],
        composition: { parlor: 'None', business: '02 Coaches', standard: '02 Coaches', economy: '13 Coaches' }
    },
    { 
        id: 'shalimar', 
        name: 'Shalimar Express', 
        route: 'Karachi ⟷ Lahore', 
        cities: ['Karachi', 'Drigh Road Jn', 'Landhi Jn', 'Hyderabad', 'Rohri', 'Rahim Yar Khan', 'Khanpur', 'Multan', 'Faisalabad', 'Lahore'], 
        slides: ['shalimar_1.webp','shalimar_2.webp','shalimar_3.webp', 'shalimar_4.webp', 'shalimar_5.webp', 'shalimar_6.webp', 'shalimar_7.webp', 'shalimar_8.webp', 'shalimar_9.webp', 'shalimar_10.webp', 'shalimar_11.webp', 'shalimar_12.webp', 'shalimar_13.webp', 'shalimar_14.webp', 'shalimar_15.webp'], 
        fares: [{class:"AC Parlor",price:"Rs. 10,100"},{class:"Economy",price:"Rs. 4,100"},{class:"Standard",price:"Rs. 7,500"},{class:"Business",price:"Rs. 10,600"}],
        stats: { punctuality: '95%', cleanliness: 5, food: 5, behavior: 5 },
        amenities: ['wifi', 'charging', 'bedding', 'dining', 'ac'],
        composition: { parlor: 'None', business: '02 Coaches', standard: '02 Coaches', economy: '13 Coaches' }
    }
];

const galleryData = [
    { title: "Green Line Dawn", src: "images/train_background.webp" },
    { title: "Track Symmetry", src: "images/train_background2.webp" },
    { title: "ZCU-30 Locomotive", src: "images/zcu30_locomotive.webp" },
    { title: "ZCU-20 Power", src: "images/zcu20_locomotive.webp" },
    { title: "Subak Kharam Railcar", src: "images/railcar_new_train.webp" },
    { title: "GEU-40 Fleet", src: "images/geu40_locomotive.webp" },
    { title: "HGMU-30 Class", src: "images/hgmu30_locomotive.webp" },];

// --- 3. HELPERS & PARSERS ---
function formatTimestamp(ts) {
    if(!ts) return "Just Now";
    const date = new Date(ts);
    return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(s) { 
    if(!s) return "";
    const d = document.createElement('div'); d.textContent = s; return d.innerHTML; 
}

function parseHashtags(text) {
    if(!text) return "";
    const escaped = escapeHTML(text);
    // Hashtags ko detect karke blue clickable style dena
    return escaped.replace(/#(\w+)/g, '<span class="text-rail-accent font-bold cursor-pointer hover:underline">#$1</span>');
}

// --- 4. NAVIGATION ---
function routeTo(e, p){ 
    if(e) e.preventDefault(); 
    window.history.pushState({}, "", p); 
    handleRouting(); 
}

function handleRouting(){ 
    let p = window.location.pathname.split('/').pop() || 'home'; 
    if(p.endsWith('.html')) p = p.replace('.html', ''); 
    if(p === '' || p === 'index') p = 'home'; 
    
    document.querySelectorAll('.page-view').forEach(v => {
        v.classList.toggle('active', v.id === p + '-view');
    }); 
    
    if(!document.querySelector('.page-view.active')) {
        document.getElementById('home-view').classList.add('active');
    }

    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0); 
    
    if(p === 'home' && YT_KEY) fetchVideos(yt_duration); 
    if(p === 'gallery') renderGallery();
    if(p === 'reviews') renderTrainCards();
}

function toggleMenu() {
    const m = document.getElementById('mobile-menu');
    if(m) m.classList.toggle('hidden');
}

// --- 5. FIREBASE CORE ---
async function initFirebase() {
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.firestore(); 
        auth = firebase.auth();

        // Rule 3: Pehlay Auth initialize karein
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await auth.signInWithCustomToken(__initial_auth_token).catch(() => auth.signInAnonymously());
        } else { await auth.signInAnonymously(); }

        auth.onAuthStateChanged(async (u) => {
            user = u; 
            if (user) { 
                await fetchSecureConfigs(); 
                startReviewsListener(); 
                startPollsListener(); 
                fetchUpdates(); 
                handleRouting(); 
            }
        });
    } catch (e) { console.error("Firebase Error", e); }
}

async function fetchSecureConfigs() {
    try {
        // --- Video ke mutabiq path: artifacts/youtube ---
        const doc = await db.collection('artifacts').doc('youtube').get();
        
        if (doc.exists) {
            const data = doc.data();
            /**
             * FIX (Based on Video): Aapne field ka naam hi API Key rakha hai.
             * Hum Object.keys(data)[0] use karenge pehla field name (API Key) uthane ke liye.
             */
            const keys = Object.keys(data);
            if (keys.length > 0) {
                YT_KEY = keys[0]; 
                YT_CHANNEL = data[YT_KEY]; // Value is the Channel ID
                console.log("✅ YouTube API Config Parsed from Video Structure");
                
                if(window.location.pathname.includes('home') || window.location.pathname === '/') {
                    fetchVideos(yt_duration);
                }
            }
        } else {
            console.error("❌ YouTube Config Document Missing at path: artifacts/youtube");
        }
    } catch (e) { console.error("❌ Config Fetch Error:", e); }
}

// --- 6. MODAL & AUTO SLIDER (4 SEC) ---
function openSliderModal(images, index) {
    if(!images || images.length === 0) return;
    currentSliderImages = Array.isArray(images) ? images : [images];
    currentSliderIndex = index;
    
    if(sliderTimer) clearInterval(sliderTimer);
    updateSliderDisplay();
    
    const modal = document.getElementById('image-modal');
    const controls = document.getElementById('slider-controls');
    
    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    document.body.style.overflow = 'hidden';

    if(controls) {
        if(currentSliderImages.length > 1) {
            controls.classList.remove('hidden');
            controls.style.opacity = "1";
            // 4 Second timer
            sliderTimer = setInterval(() => nextSlide(), 4000);
        } else {
            controls.classList.add('hidden');
        }
    }
}

function updateSliderDisplay() {
    const img = document.getElementById('modal-image-content');
    const counter = document.getElementById('slider-counter');
    if(!img) return;
    img.style.opacity = '0'; 
    setTimeout(() => {
        img.src = currentSliderImages[currentSliderIndex];
        img.style.opacity = '1';
        if(counter) counter.innerText = `${currentSliderIndex + 1} / ${currentSliderImages.length}`;
    }, 150);
}

function nextSlide(e) { 
    if(e) {
        e.stopPropagation(); 
        if(sliderTimer) { clearInterval(sliderTimer); sliderTimer = setInterval(nextSlide, 4000); }
    }
    currentSliderIndex = (currentSliderIndex + 1) % currentSliderImages.length; 
    updateSliderDisplay(); 
}

function prevSlide(e) { 
    if(e) {
        e.stopPropagation(); 
        if(sliderTimer) { clearInterval(sliderTimer); sliderTimer = setInterval(nextSlide, 4000); }
    }
    currentSliderIndex = (currentSliderIndex - 1 + currentSliderImages.length) % currentSliderImages.length; 
    updateSliderDisplay(); 
}

function closeModal(id) { 
    const m = document.getElementById(id); if(m) m.classList.add('hidden'); 
    if(id === 'image-modal' && sliderTimer) clearInterval(sliderTimer);
    document.body.style.overflow = 'auto'; 
    if(id==='video-modal') {
        const c = document.getElementById('video-embed-container');
        if(c) c.innerHTML = '';
    }
}

// --- 7. DATA LISTENERS ---
function startReviewsListener() {
    if (!user) return;
    db.collection('artifacts').doc(appId).collection('public').doc('data').collection('reviews').onSnapshot(snap => {
        allReviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if(window.location.pathname.includes('reviews')) renderTrainCards(); 
    });
}

function startPollsListener() {
    if (!user) return;
    db.collection('artifacts').doc(appId).collection('public').doc('data').collection('polls').onSnapshot(snap => {
        const polls = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const container = document.getElementById('polls-container'); if (!container) return;
        container.innerHTML = polls.map(p => {
            const total = p.options.reduce((a, b) => a + b.votes, 0);
            return `
            <div class="bg-white dark:bg-rail-dark p-8 md:p-12 rounded-[3.5rem] border-2 border-rail-accent shadow-2xl text-left mb-8">
                <h3 class="text-2xl font-black italic uppercase mb-8 text-gray-900 dark:text-white">${escapeHTML(p.question)}</h3>
                <div class="space-y-6">
                    ${p.options.map((o, i) => {
                        const per = total > 0 ? Math.round((o.votes / total) * 100) : 0;
                        return `<div class="cursor-pointer group" onclick="castVote('${p.id}', ${i})">
                            <div class="flex justify-between font-black text-[11px] uppercase mb-2 text-gray-500 dark:text-gray-400"><span>${escapeHTML(o.text)}</span><span class="text-rail-accent">${per}%</span></div>
                            <div class="h-10 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                                <div class="h-full bg-rail-accent transition-all duration-1000 ease-out" style="width: ${per}%"></div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }).join('');
    });
}

// --- 8. COMMUNITY CLOUD (READ MORE & COMMENTS) ---

function togglePost(postId) {
    expandedPosts[postId] = !expandedPosts[postId];
    fetchUpdates(); // Re-render to show/hide content and interaction area
}

async function handleCommentSubmit(e, postId) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    const commentText = input.value.trim();
    if(!commentText || !user) return;

    try {
        await db.collection('artifacts').doc(appId)
                .collection('public').doc('data')
                .collection('updates').doc(postId)
                .collection('comments').add({
                    text: commentText,
                    userId: user.uid,
                    userName: "Railfan Observer",
                    timestamp: Date.now()
                });
        input.value = "";
    } catch (err) { console.error("Reply failed"); }
}

function renderComments(postId, containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;

    db.collection('artifacts').doc(appId)
      .collection('public').doc('data')
      .collection('updates').doc(postId)
      .collection('comments')
      .onSnapshot(snap => {
          const comments = snap.docs.map(doc => doc.data()).sort((a,b) => b.timestamp - a.timestamp);
          container.innerHTML = comments.map(c => `
              <div class="bg-gray-50 dark:bg-rail-dark p-4 rounded-2xl mb-3 border border-gray-100 dark:border-gray-800">
                  <div class="flex justify-between items-center mb-1">
                      <span class="text-[9px] font-black uppercase text-rail-accent tracking-widest">Public Observer</span>
                      <span class="text-[8px] text-gray-400 font-bold">${formatTimestamp(c.timestamp)}</span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-300 leading-snug">${escapeHTML(c.text)}</p>
              </div>
          `).join('') || '<p class="text-[10px] text-gray-400 italic text-center py-4">No replies yet. Be the first to interact!</p>';
      });
}

function fetchUpdates() {
    if (!user) return;
    const path = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('updates');
    path.onSnapshot(snap => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b)=>b.timestamp-a.timestamp);
        const container = document.getElementById('updates-container'); 
        if (!container) return;
        document.getElementById('updates-status')?.classList.add('hidden');
        
        container.innerHTML = data.map(u => {
            const urls = u.imageUrls || (u.imageUrl ? [u.imageUrl] : []);
            const isExpanded = expandedPosts[u.id] || false;
            const threshold = 200;
            const needsTruncation = u.content.length > threshold;
            
            const displayContent = (needsTruncation && !isExpanded) 
                ? u.content.substring(0, threshold) + "..." 
                : u.content;

            return `
            <div class="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl text-left mb-10 transition-all">
                <div class="flex justify-between mb-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <span>Neural Cloud Post</span><span>${formatTimestamp(u.timestamp)}</span>
                </div>
                ${renderUpdateGrid(urls)}
                <h3 class="text-2xl font-black uppercase mb-4 italic text-gray-900 dark:text-white">${escapeHTML(u.title)}</h3>
                
                <div class="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                    ${parseHashtags(displayContent)}
                    ${needsTruncation ? `
                        <button onclick="togglePost('${u.id}')" class="text-rail-accent font-black uppercase text-[10px] ml-2 hover:underline tracking-widest">
                            ${isExpanded ? "Show Less" : "Read More..."}
                        </button>
                    ` : ""}
                </div>

                <div class="mt-8 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-6">
                    <div class="flex space-x-6 text-sm">
                        <button onclick="handleReaction('${u.id}', 'like')" class="hover:scale-110 transition">👍 ${u.reactions?.like || 0}</button>
                        <button onclick="handleReaction('${u.id}', 'heart')" class="hover:scale-110 transition">❤️ ${u.reactions?.heart || 0}</button>
                    </div>
                </div>

                <!-- Interaction System (Visible on Expanded or Short Posts) -->
                ${(isExpanded || !needsTruncation) ? `
                <div class="mt-10 pt-8 border-t-2 border-dashed border-gray-100 dark:border-gray-700">
                    <h4 class="text-[10px] font-black uppercase text-gray-400 mb-6 tracking-[0.3em]">Neural Interaction Area</h4>
                    <div id="comments-list-${u.id}" class="max-h-60 overflow-y-auto custom-scrollbar mb-6 pr-2">
                        <!-- Replies stream yahan load hoga -->
                    </div>
                    <form onsubmit="handleCommentSubmit(event, '${u.id}')" class="flex gap-3">
                        <input type="text" placeholder="Type your reply..." required class="flex-1 bg-gray-50 dark:bg-rail-dark p-5 rounded-2xl text-xs outline-none border border-transparent focus:border-rail-accent transition-all">
                        <button type="submit" class="bg-rail-accent text-white px-8 rounded-2xl hover:bg-indigo-700 transition"><i class="fas fa-paper-plane"></i></button>
                    </form>
                </div>
                ` : ""}
            </div>`;
        }).join('') || '<p class="col-span-full text-center py-20 text-gray-400 font-black italic">No updates synchronized.</p>';

        // Comments load trigger
        data.forEach(u => {
            if (expandedPosts[u.id] || u.content.length <= 200) {
                renderComments(u.id, `comments-list-${u.id}`);
            }
        });
    });
}

// --- 9. UI RENDERING ---
function renderUpdateGrid(urls) {
    if(!urls || urls.length === 0) return '';
    const count = urls.length;
    const escapedUrls = JSON.stringify(urls).replace(/"/g, '&quot;');
    if(count === 1) return `<img src="${urls[0]}" onclick="openSliderModal(['${urls[0]}'], 0)" class="w-full h-auto max-h-[500px] object-cover rounded-3xl mb-6 shadow-xl cursor-zoom-in">`;
    let gridClass = count === 2 ? "grid-cols-2 h-[300px]" : "grid-cols-2 grid-rows-2 h-[400px]";
    const imagesHtml = urls.slice(0, 4).map((url, idx) => {
        const more = (idx === 3 && count > 4) ? `<div class="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-3xl font-black">+${count - 4}</div>` : "";
        return `<div class="relative overflow-hidden cursor-zoom-in aspect-square rounded-xl" onclick="openSliderModal(${escapedUrls}, ${idx})"><img src="${url}" class="w-full h-full object-cover hover:scale-105 transition duration-500">${more}</div>`;
    }).join('');
    return `<div class="grid ${gridClass} gap-2 mb-6 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl">${imagesHtml}</div>`;
}

function openExploreModal(trainId) {
    const t = trainsData.find(x => x.id === trainId);
    if(!t) return;

    const modal = document.getElementById('explore-modal');
    const content = document.getElementById('explore-modal-content');
    
    // Star Rating Helper
    const getStars = (count) => '⭐'.repeat(count) + '☆'.repeat(5-count);

    // Amenities Icons mapping
    const amenityMap = {
        'wifi': { icon: 'fa-wifi', label: 'Wi-Fi' },
        'charging': { icon: 'fa-plug', label: 'Charging' },
        'bedding': { icon: 'fa-bed', label: 'Bedding' },
        'dining': { icon: 'fa-utensils', label: 'Dining Car' },
        'ac': { icon: 'fa-snowflake', label: 'AC System' }
    };

    content.innerHTML = `
        <div class="text-center mb-12">
            <h2 class="text-4xl md:text-6xl font-black uppercase italic text-gray-900 dark:text-white mb-3 tracking-tighter">${t.name}</h2>
            <div class="inline-block bg-rail-accent/10 text-rail-accent px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em]">
                Verified Premium Review
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
            <!-- Performance Section -->
            <div class="space-y-8">
                <h4 class="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-4 italic">Performance Analytics</h4>
                <div class="space-y-7">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-bold opacity-80 uppercase italic">Punctuality</span>
                        <span class="bg-green-100 dark:bg-green-900/30 text-green-600 px-4 py-1.5 rounded-xl font-black text-xs">${t.stats.punctuality}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-bold opacity-80 uppercase italic">Cleanliness</span>
                        <span class="stars text-lg">${getStars(t.stats.cleanliness)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-bold opacity-80 uppercase italic">Food Quality</span>
                        <span class="stars text-lg">${getStars(t.stats.food)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-bold opacity-80 uppercase italic">Staff Behavior</span>
                        <span class="stars text-lg">${getStars(t.stats.behavior)}</span>
                    </div>
                </div>
            </div>

            <!-- Amenities Section -->
            <div class="space-y-8">
                <h4 class="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-4 italic">Standard Amenities</h4>
                <div class="grid grid-cols-2 gap-4">
                    ${t.amenities.map(key => `
                        <div class="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-800 transition hover:border-rail-accent group">
                            <i class="fas ${amenityMap[key].icon} text-rail-accent text-xl transition group-hover:scale-110"></i>
                            <span class="text-[10px] font-black uppercase tracking-widest">${amenityMap[key].label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Composition Section -->
        <div class="mt-16 bg-rail-accent/5 p-10 rounded-5xl border border-rail-accent/10">
            <h4 class="text-[11px] font-black uppercase tracking-[0.5em] text-rail-accent mb-8 text-center italic">Train Composition (Coaches)</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                ${Object.entries(t.composition).map(([key, val]) => `
                    <div class="space-y-1">
                        <span class="block text-[9px] font-black uppercase text-gray-400 tracking-widest">${key}</span>
                        <span class="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tighter italic">${val}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <p class="mt-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic opacity-50 animate-pulse">
            Neural Score Calculated by RAILSPK Team Observations
        </p>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function renderTrainCards(filter = 'all') {
    const grid = document.getElementById('scorecards-grid'); 
    if (!grid) return;
    
    let data = trainsData; 
    if (filter !== 'all') data = trainsData.filter(t => t.cities.includes(filter));
    
    grid.innerHTML = data.map(t => {
        const fullSlidePaths = t.slides.map(s => 'images/' + s);
        const escapedSlides = JSON.stringify(fullSlidePaths).replace(/"/g, '&quot;');
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col group transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl">
                <div class="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">
                    
                    <!-- LEFT SIDE: Content (Shrunk to 40% on desktop) -->
                    <div class="w-full md:w-[40%] space-y-6">
                        <div>
                            <h3 class="text-2xl md:text-3xl font-black uppercase text-gray-900 dark:text-white mb-1 tracking-tighter italic">${t.name}</h3>
                            <p class="text-rail-accent font-black text-[10px] uppercase tracking-[0.3em]">${t.route}</p>
                        </div>
                        
                        <div class="bg-gray-50 dark:bg-rail-dark p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 space-y-3">
                            ${t.fares.map(f=>`
                                <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0 last:pb-0">
                                    <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">${f.class}</span>
                                    <span class="text-rail-accent font-black text-xs italic">${f.price}</span>
                                </div>`).join('')}
                        </div>

                        <button onclick="openExploreModal('${t.id}')" class="w-full bg-rail-dark dark:bg-rail-accent text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all">
                            Explore Neural Mode <i class="fas fa-microchip ml-2"></i>
                        </button>
                    </div>

                    <!-- RIGHT SIDE: Image (Extended to 60% on desktop) -->
                    <div class="w-full md:w-[60%] aspect-video md:aspect-auto md:h-[380px] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl relative bg-gray-100 dark:bg-gray-700" onclick="openSliderModal(${escapedSlides}, 0)">
                        <img src="images/${t.slides[0]}" alt="${t.name} External View" loading="lazy" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div class="absolute bottom-6 right-6 bg-black/60 text-white text-[10px] px-6 py-2 rounded-full font-black backdrop-blur-md border border-white/10 uppercase tracking-widest italic">
                            ${t.slides.length} Viewpoints
                        </div>
                    </div>
                    
                </div>
            </div>`;
    }).join('');
}

// --- 10. YOUTUBE API ---
async function fetchVideos(d, tok=null, append=false) {
    const container = document.getElementById('video-cards-container'); 
    if (!container || !YT_KEY) return; 
    const dp = d.charAt(0).toUpperCase() + d.slice(1);
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YT_KEY}&channelId=${YT_CHANNEL}&part=snippet,id&order=date&maxResults=6&type=video&videoDuration=${dp}${tok?'&pageToken='+tok:''}`);
        const data = await res.json(); yt_token = data.nextPageToken; 
        if (!append) container.innerHTML = '';
        if (data.items) {
            data.items.forEach(v => {
                container.innerHTML += `<div class="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer border border-gray-100 dark:border-gray-700 transition-all hover:translate-y-[-5px]" onclick="openVideo('${v.id.videoId}')">
                    <div class="aspect-video relative overflow-hidden bg-gray-200 dark:bg-gray-700"><img src="https://img.youtube.com/vi/${v.id.videoId}/maxresdefault.jpg" class="w-full h-full object-cover transition duration-700 group-hover:scale-105" loading="lazy"><div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500"><i class="fas fa-play text-white text-5xl"></i></div></div>
                    <div class="p-8"><h3 class="text-xs font-black uppercase line-clamp-2 text-gray-900 dark:text-white text-left tracking-tight">${v.snippet.title}</h3></div>
                </div>`;
            });
        }
    } catch (e) { console.error("YT API Error"); }
}

// --- 11. ADMIN ACTIONS ---
async function postUpdate(e) {
    e.preventDefault(); if (!adminAuthorised || !user) return;
    const btn = document.getElementById('update-btn');
    const title = document.getElementById('update-title').value;
    const content = document.getElementById('update-content').value;
    const files = document.getElementById('update-image-file').files;
    let imageUrls = [];
    try {
        if(btn) btn.disabled = true;
        for (let file of files) {
            const url = await new Promise(r => { const reader = new FileReader(); reader.onloadend = () => r(reader.result); reader.readAsDataURL(file); });
            imageUrls.push(url);
        }
        await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('updates').add({ title, content, imageUrls, views: 0, reactions: { like: 0, heart: 0 }, timestamp: Date.now() });
        e.target.reset(); alert("Broadcast Published!");
    } catch (err) { alert("Failed."); } finally { if(btn) btn.disabled = false; }
}

async function postPoll(e) {
    e.preventDefault(); if (!adminAuthorised || !user) return;
    const q = document.getElementById('poll-question').value;
    const oIn = document.getElementById('poll-options').value;
    const oArr = oIn.split(',').map(opt => ({ text: opt.trim(), votes: 0 })).filter(o => o.text !== "");
    if(oArr.length < 2) return alert("Min 2 options!");
    try {
        await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('polls').add({ question: q, options: oArr, timestamp: Date.now() });
        e.target.reset(); alert("Poll Live!");
    } catch (err) { alert("Failed to create poll."); }
}

async function castVote(id, idx) {
    if (!user) return;
    const ref = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('polls').doc(id);
    await db.runTransaction(async t => {
        const doc = await t.get(ref); if (!doc.exists) return;
        const opts = doc.data().options; opts[idx].votes += 1;
        t.update(ref, { options: opts });
    });
}

async function handleReaction(id, type) {
    if (!user) return;
    const ref = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('updates').doc(id);
    await db.runTransaction(async t => {
        const doc = await t.get(ref); if (!doc.exists) return;
        const reactions = doc.data().reactions || {like:0,heart:0};
        reactions[type] = (reactions[type] || 0) + 1;
        t.update(ref, { reactions });
    });
}

// --- 12. MODAL OPENERS ---
function openVideo(id) { 
    const container = document.getElementById('video-embed-container');
    const modal = document.getElementById('video-modal');
    if(container) container.innerHTML = `<iframe class="w-full h-full shadow-2xl" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allowfullscreen></iframe>`; 
    if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    document.body.style.overflow = 'hidden';
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid'); if (!grid) return;
    grid.innerHTML = galleryData.map(img => `<div class="group relative overflow-hidden rounded-[2.5rem] bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl" onclick="openSliderModal(['${img.src}'], 0)"><img src="${img.src}" loading="lazy" class="w-full h-80 object-cover transition duration-700 group-hover:scale-110 cursor-zoom-in"><div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col justify-end p-8"><h4 class="text-white text-xl font-black italic uppercase">${img.title}</h4></div></div>`).join('');
}

// --- 13. ADMIN LOGIC ---
function checkAdmin() {
    const p = prompt("Admin Key:");
    if (p === "railspk786") {
        adminAuthorised = true;
        document.getElementById('admin-panel')?.classList.remove('hidden');
        
        const updateForm = document.getElementById('update-form');
        if(updateForm) updateForm.addEventListener('submit', postUpdate);
        
        const pollForm = document.getElementById('poll-form');
        if(pollForm) pollForm.addEventListener('submit', postPoll);
        
        routeTo(null, '/community');
    }
}

// --- 14. INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    initFirebase(); 
    const isDark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    document.getElementById('theme-toggle-dark-icon')?.classList.toggle('hidden', isDark);
    document.getElementById('theme-toggle-light-icon')?.classList.toggle('hidden', !isDark);
    
    document.getElementById('theme-toggle').onclick = () => {
        const now = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', now ? 'dark' : 'light');
        document.getElementById('theme-toggle-dark-icon')?.classList.toggle('hidden', now);
        document.getElementById('theme-toggle-light-icon')?.classList.toggle('hidden', !now);
    };
    
    document.getElementById('admin-trigger').onclick = checkAdmin;
    const vFilter = document.getElementById('video-filter');
    if(vFilter) vFilter.onchange = (e) => { yt_duration = e.target.value; fetchVideos(yt_duration); };
});

window.onpopstate = handleRouting;