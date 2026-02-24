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

(function() {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbympst5_Jwnf_IMo6aiSe0pxryLrrmdDY6ZfH7uf5Km69lZNTDD2OwqWGzstzKVPQvw/exec";

  let user          = JSON.parse(localStorage.getItem("tc_user")) || null;
  let serverData    = [];
  let tempLocal     = [];
  let isTyping      = false;
  let currentRating = 0;

  function init() {
    if (user) {
      document.getElementById("tc-auth-gate").style.display = "none";
      document.getElementById("tc-user-pill").style.display = "flex";
      document.getElementById("tc-user-name").innerText = user.n;
      document.getElementById("tc-user-pfp").src = user.p;
      setTimeout(function() { if (window._tcInitFCM) window._tcInitFCM(); }, 1500);
    }
    sync();
    setInterval(function() { if (!isTyping) sync(); }, 5000);
  }

  window.onGoogleAuth = function(r) {
    var p = JSON.parse(atob(r.credential.split('.')[1]));
    user  = { n: p.name, e: p.email, p: p.picture };
    localStorage.setItem("tc_user", JSON.stringify(user));
    location.reload();
  };

  window.tcLogout = function() { localStorage.removeItem("tc_user"); location.reload(); };

  window.hoverStar = function(n) { if (!isTyping && currentRating === 0) paintStars(n); };
  window.resetStar = function()  { paintStars(currentRating); };
  window.handleStar = function(n) {
    if (!user) return alert("Login required to rate!");
    currentRating = n;
    paintStars(n);
    fetch(SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      body: JSON.stringify({ url: location.pathname, email: user.e, rating: n, comment: "__RATING_ONLY__" })
    });
  };
  function paintStars(n) {
    document.querySelectorAll(".tc-s").forEach(function(s, i) { s.classList.toggle("active", i < n); });
  }

  window.handleAction = function(pid, mode, rowId) {
    mode  = mode  || "new";
    rowId = rowId || null;
    if (!user) return alert("Please Login!");
    var inputId = mode === "edit" ? "edit-in-" + rowId : (pid === "0" ? "tc-input" : "reply-in-" + pid);
    var inputEl = document.getElementById(inputId);
    var msg     = inputEl.value.trim();
    if (!msg) return;
    if (mode === "new") {
      tempLocal.push({ rowId: "temp_"+Date.now(), name: user.n, comment: msg, parentId: pid, pic: user.p, date: "Saving...", pending: true, isAdmin: false, email: user.e });
    } else {
      var t = serverData.find(function(c) { return c.rowId == rowId; });
      if (t) { t.comment = msg; t.date = "Updating..."; }
    }
    render();
    inputEl.value = "";
    isTyping = false;
    var payload = { url: location.pathname, name: user.n, email: user.e, pic: user.p, comment: msg, parentId: pid, rating: currentRating };
    if (mode === "edit") { payload.action = "edit"; payload.rowId = rowId; }
    fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload), mode: "no-cors" });
    setTimeout(sync, 1500);
  };

  async function sync() {
    try {
      var emailParam = user ? "&email=" + encodeURIComponent(user.e) : "";
      var r    = await fetch(SCRIPT_URL + "?url=" + location.pathname + emailParam);
      var data = await r.json();
      serverData = data.comments;
      tempLocal  = [];
      if (user && data.myRating > 0) currentRating = data.myRating;
      updateRatingUI(data.avgRating, data.totalVotes);
      paintStars(currentRating);
      render();
    } catch(e) {}
  }

  function updateRatingUI(avg, total) {
    document.getElementById("tc-avg-num").innerText     = avg;
    document.getElementById("tc-total-votes").innerText = total + " reviews";
    var stars = "", rounded = Math.round(parseFloat(avg));
    for (var i = 1; i <= 5; i++) stars += i <= rounded ? "★" : "☆";
    document.getElementById("tc-avg-stars").innerText = stars;
  }

  function render() {
    var feed     = document.getElementById("tc-feed");
    var combined = serverData.concat(tempLocal);
    var mains    = combined.filter(function(c) { return c.parentId == "0"; }).reverse();
    feed.innerHTML = mains.map(function(m) { return renderCard(m, combined); }).join("");
  }

  function renderCard(c, list) {
    var canEdit = user && (user.e === c.email);
    var starStr = c.userRating > 0 ? '<span style="color:#f4b400;font-size:10px;margin-left:8px;">' + "★".repeat(c.userRating) + '</span>' : "";
    var html = '<div class="tc-card ' + (c.parentId !== "0" ? "reply " : "") + (c.pending ? "pending" : "") + '">'
      + '<div><img src="' + c.pic + '" class="tc-card-pfp">'
      + '<span style="font-weight:bold;font-size:14px;">' + c.name + '</span>'
      + (c.isAdmin ? '<span class="tc-admin-badge">ADMIN ⭐</span>' : '')
      + starStr
      + '<small style="float:right;color:#999;">' + c.date + '</small></div>'
      + '<div style="margin:8px 0 0 42px;font-size:14px;color:var(--text-color);" id="body-' + c.rowId + '">' + c.comment + '</div>'
      + '<div class="tc-actions">'
      + '<span onclick="checkAuthAndOpen(\'' + c.rowId + '\',\'reply\')">Reply</span>'
      + (canEdit ? '<span onclick="checkAuthAndOpen(\'' + c.rowId + '\',\'edit\')">Edit</span>' : '')
      + (canEdit ? '<span style="color:#d93025" onclick="deleteMsg(\'' + c.rowId + '\')">Delete</span>' : '')
      + '</div><div id="box-' + c.rowId + '" class="tc-inline-box"></div></div>';
    list.filter(function(r) { return r.parentId == c.rowId; })
        .forEach(function(r) { html += renderCard(r, list); });
    return html;
  }

  window.checkAuthAndOpen = function(id, type) {
    if (!user) return alert("Login to interact!");
    isTyping = true;
    document.querySelectorAll(".tc-inline-box").forEach(function(b) { b.innerHTML = ""; });
    var box = document.getElementById("box-" + id);
    if (type === "reply") {
      box.innerHTML = '<textarea id="reply-in-' + id + '" placeholder="Write a reply..."></textarea>'
        + '<div style="text-align:right;margin-top:5px;">'
        + '<button onclick="isTyping=false;this.parentElement.parentElement.innerHTML=\'\'" style="background:none;border:none;cursor:pointer;font-size:12px;margin-right:10px;">Cancel</button>'
        + '<button class="tc-post-btn" onclick="handleAction(\'' + id + '\')">Reply</button></div>';
    } else {
      var old = document.getElementById("body-" + id).innerText;
      box.innerHTML = '<textarea id="edit-in-' + id + '">' + old + '</textarea>'
        + '<div style="text-align:right;margin-top:5px;">'
        + '<button onclick="isTyping=false;this.parentElement.parentElement.innerHTML=\'\'" style="background:none;border:none;cursor:pointer;font-size:12px;margin-right:10px;">Cancel</button>'
        + '<button class="tc-post-btn" onclick="handleAction(\'0\',\'edit\',\'' + id + '\')">Update</button></div>';
    }
    box.querySelector("textarea").focus();
  };

  window.deleteMsg = async function(id) {
    if (!confirm("Delete permanently?")) return;
    await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "delete", rowId: id, userEmail: user.e }), mode: "no-cors" });
    sync();
  };

  init();
})();
