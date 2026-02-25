/* ===== THEME WHEEL & DARK MODE ===== */
const themeBtn = document.getElementById("dark-mode-toggle");
const iconWrap = themeBtn ? themeBtn.querySelector(".wheel-icon-wrap") : null;

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    iconWrap.classList.add("wheel-spin");
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setTimeout(() => { iconWrap.classList.remove("wheel-spin"); }, 800);
  });
}

/* ===== TOC GENERATOR ===== */
document.addEventListener("DOMContentLoaded", function() {
  const tocList = document.getElementById("toc-list");
  const tocBox = document.getElementById("toc-box");
  const contentArea = document.querySelector(".post-content") || document.body;
  const headings = contentArea.querySelectorAll("h2, h3, h4");

  if (headings.length > 0 && tocList) {
    if(tocBox) tocBox.style.display = "block";
    headings.forEach((heading, index) => {
      const id = "section-" + index;
      heading.setAttribute("id", id);
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = heading.textContent;
      a.setAttribute("href", "#" + id);
      if (heading.tagName === "H3") { li.style.marginLeft = "20px"; li.style.fontSize = "0.9em"; }
      if (heading.tagName === "H4") { li.style.marginLeft = "40px"; li.style.fontSize = "0.9em"; }
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }
});

/* ===== SHARE FUNCTION ===== */
function tyagiShare() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      text: 'Check out this awesome tech post on Tyagi Core:',
      url: window.location.href
    }).then(() => console.log('Shared!')).catch((err) => console.log('Share failed:', err));
  } else {
    navigator.clipboard.writeText(window.location.href);
    const btn = document.querySelector('.tyagi-share-btn');
    if(btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> LINK COPIED';
      setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    }
  }
}


/* ===== SEARCH LOGIC ===== */
function globalSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const resCont = document.getElementById("searchResults");
  if (query.length < 2) { resCont.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">Type 2+ letters...</p>'; return; }
  const filtered = window.tyagiPosts.filter(p => p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query));
  resCont.innerHTML = filtered.length ? "" : '<p style="text-align:center;padding:20px;">No results found.</p>';
  filtered.forEach(p => {
    resCont.innerHTML += `<a href="${p.url}" class="result-item"><img src="${p.image}"><div><h4>${p.title}</h4><p>${p.excerpt}</p></div></a>`;
  });
}

function toggleSearch(s) {
  document.getElementById("searchModal").style.display = s ? "flex" : "none";
  if(s) document.getElementById("searchInput").focus();
}

function toggleMenu(s) {
  document.querySelector(".mobile-menu").classList.toggle("active", s);
  document.querySelector(".mobile-overlay").classList.toggle("active", s);
}

function closeOnOverlay(e) { if(e.target.id === "searchModal") toggleSearch(false); }

/* ===== PROGRESS BARS ===== */
window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  const progressBar = document.getElementById("reading-progress-bar");
  if (progressBar) { progressBar.style.width = scrolled + "%"; }
});

document.addEventListener('DOMContentLoaded', function() {
    const progressPath = document.querySelector('#tyagi-top-wrap path');
    if(progressPath) {
        const pathLength = progressPath.getTotalLength();
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        const updateProgress = () => {
            const scroll = window.pageYOffset;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = pathLength - (scroll * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
            scroll > 200 ? document.querySelector('#tyagi-top-wrap').classList.add('active-progress') : document.querySelector('#tyagi-top-wrap').classList.remove('active-progress');
        };
        window.addEventListener('scroll', updateProgress);
    }
    document.querySelector('#tyagi-top-wrap')?.addEventListener('click', (e) => {
        e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

/* ===== COPY CODE BUTTON ===== */
document.addEventListener("DOMContentLoaded", function() {
    const codeBlocks = document.querySelectorAll("pre");
    codeBlocks.forEach((block) => {
      const button = document.createElement("button");
      button.innerText = "Copy";
      button.className = "copy-btn";
      block.appendChild(button);
      button.addEventListener("click", () => {
        const codeText = block.querySelector("code").innerText.trim();
        navigator.clipboard.writeText(codeText).then(() => {
          button.innerText = "COPIED!";
          button.style.background = "#22c55e";
          setTimeout(() => {
            button.innerText = "COPY";
            button.style.background = "#166534";
          }, 2000);
        });
      });
    });
});
document.addEventListener("wheel", function(e) {
    if (window.innerWidth < 901) return; // Mobile par normal rakho

    const left = document.querySelector(".post-content-area");
    const right = document.querySelector(".tc-sidebar");
    
    // Safety Check: Agar dono elements page par nahi hain, toh scroll logic skip karo
    if (!left || !right) return; 

    // Ab niche ka logic safe hai kyunki left aur right 'null' nahi hain
    const isOverLeft = left.matches(':hover');
    const isOverRight = right.matches(':hover');

    if (isOverLeft) {
        const isAtBottom = left.scrollHeight - left.scrollTop <= left.clientHeight + 1;
        const isAtTop = left.scrollTop === 0;

        if (e.deltaY > 0 && isAtBottom) {
            right.scrollTop += e.deltaY;
            e.preventDefault();
        } else if (e.deltaY < 0 && isAtTop) {
            return;
        }
    } 
    else if (isOverRight) {
        const isAtBottom = right.scrollHeight - right.scrollTop <= right.clientHeight + 1;
        const isAtTop = right.scrollTop === 0;

        if (e.deltaY > 0 && isAtBottom) {
            left.scrollTop += e.deltaY;
            e.preventDefault();
        } else if (e.deltaY < 0 && isAtTop) {
            return;
        }
    }
}, { passive: false });



const tocBtn = document.getElementById('toc-toggle-btn');

// Check karo ki kya button page par exist karta hai
if (tocBtn) {
    tocBtn.addEventListener('click', function() {
        const list = document.getElementById('toc-list');
        const btn = this;

        if (list && list.classList.contains('expanded')) {
            list.classList.remove('expanded');
            btn.innerHTML = 'See More <i class="fas fa-chevron-down"></i>';
            const tocBox = document.getElementById('toc-box');
            if (tocBox) tocBox.scrollIntoView({ behavior: 'smooth' });
        } else if (list) {
            list.classList.add('expanded');
            btn.innerHTML = 'See Less <i class="fas fa-chevron-up"></i>';
            btn.style.background = "none";
        }
    });
}




import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey           : "AIzaSyCFIKqQ5OICMZhWPtZqmgem0bEW7QpoPcw",
  authDomain       : "appcomment.firebaseapp.com",
  projectId        : "appcomment",
  storageBucket    : "appcomment.firebasestorage.app",
  messagingSenderId: "156258808941",
  appId            : "1:156258808941:web:04a1f7470ac43657c7fb64"
};

const VAPID_KEY  = "BPSPa7nCW1nGok9peZQepk25VC1OxeFxFHtWVZsen2TnwVCya3Sq2Dtb4W0sX8u06fRsg-eAqgxEUoW2XP1Oyvo";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbympst5_Jwnf_IMo6aiSe0pxryLrrmdDY6ZfH7uf5Km69lZNTDD2OwqWGzstzKVPQvw/exec";

const app       = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

window._tcInitFCM = async function() {
  const storedUser = JSON.parse(localStorage.getItem("tc_user"));
  if (!storedUser) return;
  try {
    const sw = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    await navigator.serviceWorker.ready;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: sw });
    if (token) {
      fetch(SCRIPT_URL, {
        method: "POST", mode: "no-cors",
        body: JSON.stringify({ action: "fcm_subscribe", fcmToken: token, email: storedUser.e, name: storedUser.n })
      });
      console.log("FCM ready ✅");
    }
  } catch(err) { console.log("FCM Error:", err); }

 
  onMessage(messaging, function(payload) {
    var title  = payload.notification ? payload.notification.title : "TyagiCore 🔔";
    var body   = payload.notification ? payload.notification.body  : "";
    var url    = (payload.data && payload.data.url) ? payload.data.url : "https://tyagicore.gklearnstudy.in";
    if (url.startsWith("/")) url = "https://tyagicore.gklearnstudy.in" + url;

    navigator.serviceWorker.ready.then(function(reg) {
      reg.showNotification(title, {
        body   : body,
        icon   : "/assets/images/tyagi_core.png",
        tag    : "tc-notif",
        data   : { url: url },
        vibrate: [200, 100, 200]
      });
    });
  });
};
