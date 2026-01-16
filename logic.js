/**
 * RAILSPK OFFICIAL LOGIC SYSTEM
 * Version: 3.6.0 (Integrated with New Frontend + Hashtags + Polls)
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

let currentSliderImages = [];
let currentSliderIndex = 0;
let sliderTimer = null;

// --- 2. TRAIN DATA REPOSITORY (Full 17 Trains) ---
const trainsData = [
    { id: 'greenline', name: 'Green Line Express', route: 'Karachi ⟷ Islamabad', cities: ['Karachi', 'Hyderabad', 'Rohri', 'Bahawalpur', 'Khanewal', 'Lahore', 'Rawalpindi', 'Islamabad'], slides: ['greenline_7.webp','greenline_2.webp','greenline_3.webp','greenline_4.webp','greenline_5.webp','greenline_6.webp','greenline_1.webp','greenline_8.webp','greenline_9.webp'], fares: [{class:"AC Parlor",price:"Rs. 13,500"},{class:"Economy",price:"Rs. 4,500"}] },
    { id: 'tezgam', name: 'Tezgam Express', route: 'Karachi ⟷ Rawalpindi', cities: ['Karachi', 'Hyderabad', 'Rohri', 'Bahawalpur', 'Multan', 'Lahore', 'Rawalpindi'], slides: ['coming_soon.avif'], fares: [{class:"AC Sleeper",price:"Rs. 12,000"},{class:"Economy",price:"Rs. 3,800"}] },
    { id: 'allamaiqbal', name: 'Allama Iqbal Express', route: 'Karachi ⟷ Sialkot', cities: ['Karachi', 'Hyderabad', 'Rohri', 'Khanewal', 'Sahiwal', 'Lahore', 'Sialkot'], slides: ['allama_1.webp'], fares: [{class:"AC Standard",price:"Rs. 6,800"},{class:"Economy",price:"Rs. 3,500"}] },
    { id: 'karachi', name: 'Karachi Express', route: 'Karachi ⟷ Lahore', cities: ['Karachi', 'Hyderabad', 'Rohri', 'Bahawalpur', 'Multan', 'Sahiwal', 'Lahore'], slides: ['ac_sleeper_karachi_express.webp','ac_sleeper_karachi_express2.webp'], fares: [{class:"AC Sleeper",price:"Rs. 11,500"},{class:"Economy",price:"Rs. 3,800"}] },
    { id: 'millat', name: 'Millat Express', route: 'Karachi ⟷ Faisalabad', cities: ['Karachi', 'Hyderabad', 'Rohri', 'Bahawalpur', 'Khanewal', 'Faisalabad'], slides: ['coming_soon.avif'], fares: [{class:"AC Business",price:"Rs. 9,000"},{class:"Economy",price:"Rs. 3,500"}] },
    { id: 'shalimar', name: 'Shalimar Express', route: 'Karachi ⟷ Lahore', cities: ['Karachi', 'Hyderabad', 'Rohri', 'Multan', 'Sahiwal', 'Lahore'], slides: ['shalimar_1.webp','shalimar_2.webp','shalimar_3.webp','shalimar_4.webp','shalimar_5.webp','shalimar_6.webp','shalimar_7.webp','shalimar_8.webp'], fares: [{class:"AC Parlor",price:"Rs. 11,000"},{class:"Economy",price:"Rs. 3,500"}] },
    { id: 'pakbusiness', name: 'Pak Business Express', route: 'Karachi ⟷ Lahore', cities: ['Karachi', 'Hyderabad', 'Rohri', 'Khanewal', 'Sahiwal', 'Lahore'], slides: ['business_1.webp','business_2.webp','business_3.webp','business_4.webp','business_5.webp','business_6.webp','business_7.webp'], fares: [{class:"AC Standard",price:"Rs. 7,500"},{class:"Economy",price:"Rs. 3,800"}] },
    { id: 'karakoram', name: 'Karakoram Express', route: 'Karachi ⟷ Lahore', cities: ['Karachi', 'Hyderabad', 'Rohri', 'Khanewal', 'Faisalabad', 'Lahore'], slides: ['karakoram_express_train_rake.webp','millat_express_vs_karakoram_express.webp'], fares: [{class:"AC Business",price:"Rs. 9,500"},{class:"AC Standard",price:"Rs. 7,500"},{class:"Economy",price:"Rs. 4,000"}] },
    { id: 'mehran', name: 'Mehran Express', route: 'Karachi ⟷ Mirpur Khas', cities: ['Karachi', 'Hyderabad', 'Mirpur Khas'], slides: ['mehran_4.webp','mehran_2.webp','mehran_3.webp','mehran_1.webp'], fares: [{class:"Economy",price:"Rs. 800"}] },
    { id: 'shahlatif', name: 'Shah Latif Express', route: 'Karachi ⟷ Mirpur Khas', cities: ['Karachi', 'Hyderabad', 'Mirpur Khas'], slides: ['coming_soon.avif'], fares: [{class:"Economy",price:"Rs. 800"}] },
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

function fetchUpdates() {
    if (!user) return;
    db.collection('artifacts').doc(appId).collection('public').doc('data').collection('updates').onSnapshot(snap => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a,b)=>b.timestamp-a.timestamp);
        const container = document.getElementById('updates-container'); if (!container) return;
        document.getElementById('updates-status')?.classList.add('hidden');
        
        container.innerHTML = data.map(u => {
            const urls = u.imageUrls || (u.imageUrl ? [u.imageUrl] : []);
            return `
            <div class="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl text-left mb-10 transition-transform">
                <div class="flex justify-between mb-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <span>Official Broadcast</span><span>${formatTimestamp(u.timestamp)}</span>
                </div>
                ${renderUpdateGrid(urls)}
                <h3 class="text-2xl font-black uppercase mb-4 italic text-gray-900 dark:text-white">${escapeHTML(u.title)}</h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">${parseHashtags(u.content)}</p>
                <div class="mt-8 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-6">
                    <div class="flex space-x-6 text-sm">
                        <button onclick="handleReaction('${u.id}', 'like')" class="hover:scale-110 transition">👍 ${u.reactions?.like || 0}</button>
                        <button onclick="handleReaction('${u.id}', 'heart')" class="hover:scale-110 transition">❤️ ${u.reactions?.heart || 0}</button>
                    </div>
                </div>
            </div>`;
        }).join('') || '<p class="col-span-full text-center py-20 text-gray-400 font-black italic">No updates available.</p>';
    });
}

// --- 8. UI RENDERING ---
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

function renderTrainCards(filter = 'all') {
    const grid = document.getElementById('scorecards-grid'); if (!grid) return;
    let data = trainsData; if (filter !== 'all') data = trainsData.filter(t => t.cities.includes(filter));

    grid.innerHTML = data.map(t => {
        const filtered = allReviews.filter(r => r.trainId === t.id).sort((a,b)=>b.timestamp - a.timestamp);
        const avg = filtered.length ? filtered.reduce((a, b) => a + b.rating, 0) / filtered.length : 0;
        const fullSlidePaths = t.slides.map(s => 'images/' + s);
        const escapedSlides = JSON.stringify(fullSlidePaths).replace(/"/g, '&quot;');
        
        const feedbackHtml = filtered.slice(0, 3).map(r => `
            <div class="bg-gray-50 dark:bg-rail-dark p-3 rounded-xl border border-gray-100 dark:border-gray-700 mb-2">
                <div class="flex justify-between text-[10px] font-black uppercase text-rail-accent"><span>${escapeHTML(r.name)}</span><span class="stars">${'★'.repeat(r.rating)}</span></div>
                <p class="text-[11px] italic text-gray-600 dark:text-gray-400">"${escapeHTML(r.comment)}"</p>
            </div>`).join('') || '<p class="text-[10px] text-gray-400 italic">No feedback yet.</p>';

        return `
        <div class="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col text-left mb-8 group transition-all hover:translate-y-[-5px]">
            <div class="p-8 flex flex-col md:flex-row gap-8">
                <div class="flex-1">
                    <h3 class="text-2xl font-black uppercase text-gray-900 dark:text-white mb-1">${t.name}</h3>
                    <p class="text-rail-accent font-bold text-[10px] uppercase tracking-widest mb-6">${t.route}</p>
                    <div class="bg-gray-50 dark:bg-rail-dark p-4 rounded-2xl mb-6 text-[11px] font-bold">
                        ${t.fares.map(f=>`<div class="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-1 last:border-0"><span>${f.class}</span><span class="text-rail-accent">${f.price}</span></div>`).join('')}
                    </div>
                    <div class="flex justify-between items-center font-black">
                        <span class="text-[10px] text-gray-400 uppercase tracking-widest">Score</span>
                        <span class="stars text-lg">${'★'.repeat(Math.round(avg)) || '☆☆☆☆☆'}</span>
                    </div>
                </div>
                <div class="md:w-48 aspect-square rounded-[2rem] overflow-hidden cursor-pointer shadow-lg relative bg-gray-100 dark:bg-gray-700" onclick="openSliderModal(${escapedSlides}, 0)">
                    <img src="images/${t.slides[0]}" loading="lazy" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                    ${t.slides.length > 1 ? `<div class="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] px-3 py-1 rounded-full font-black">${t.slides.length} Photos</div>` : ''}
                </div>
            </div>
            <div class="px-8 pb-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                <h4 class="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Recent Feedback</h4>
                <div class="max-h-40 overflow-y-auto pr-2 custom-scrollbar">${feedbackHtml}</div>
            </div>
        </div>`;
    }).join('');
}

// --- 9. YOUTUBE API ---
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

// --- 10. ADMIN ACTIONS ---
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

// --- 11. MODAL OPENERS ---
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

// --- 12. ADMIN LOGIC ---
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

// --- 13. INITIALIZATION ---
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