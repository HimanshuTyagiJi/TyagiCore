 const themeBtn = document.getElementById("dark-mode-toggle");
const iconWrap = themeBtn.querySelector(".wheel-icon-wrap");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

themeBtn.addEventListener("click", () => {
  // 1. Add rotation animation
  iconWrap.classList.add("wheel-spin");

  // 2. Toggle dark mode class
  document.body.classList.toggle("dark-mode");

  // 3. Save to localStorage
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  // 4. Remove animation class after it finishes (0.8s)
  setTimeout(() => {
    iconWrap.classList.remove("wheel-spin");
  }, 800);
});

  document.addEventListener("DOMContentLoaded", function() {
    const tocList = document.getElementById("toc-list");
    const tocBox = document.getElementById("toc-box");
    // Sirf post content ke andar ki headings pakdega
    const contentArea = document.querySelector(".post-content") || document.body;
    const headings = contentArea.querySelectorAll("h2, h3, h4");

    if (headings.length > 0) {
      tocBox.style.display = "block";
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

  function tyagiShare() {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: 'Check out this awesome tech post on Tyagi Core:',
        url: window.location.href
      }).then(() => console.log('Shared!'))
        .catch((err) => console.log('Share failed:', err));
    } else {
      // Fallback for Desktop
      navigator.clipboard.writeText(window.location.href);
      const btn = document.querySelector('.tyagi-share-btn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> LINK COPIED';
      setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    }
  }


const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJw3Y9NNNidGTwkztEDpT6fF5lFkvg-EQodSW6VeetxnfeYlV_Zy3GT38BtAGux4QR/exec";
let currentUser = null;
let selectedRating = 0;
let commentCount = 0;

// Initialize
window.onload = () => {
    const session = localStorage.getItem("app_user");
    if(session) { currentUser = JSON.parse(session); showEditor(); }
    
    const prevRate = localStorage.getItem("rate_" + window.location.pathname);
    if(prevRate) { selectedRating = prevRate; applyStarLock(prevRate); }
    
    sync();
    setInterval(sync, 12000); // Live sync every 12s
    if ("Notification" in window) Notification.requestPermission();
};

function onGoogleAuth(res) {
    const data = JSON.parse(atob(res.credential.split('.')[1]));
    currentUser = { n: data.name, e: data.email, p: data.picture };
    localStorage.setItem("app_user", JSON.stringify(currentUser));
    showEditor();
    sync();
}

function showEditor() {
    document.getElementById("login-panel").style.display = "none";
    document.getElementById("editor-panel").style.display = "block";
    document.getElementById("user-name").innerText = currentUser.n;
    document.getElementById("user-pfp").src = currentUser.p;
}

function logout() { localStorage.removeItem("app_user"); location.reload(); }

// Rating Stars Logic
function hoverStars(n) { updateStarsUI(n, "#f4b400"); }
function resetStars() { updateStarsUI(selectedRating, "#f4b400"); }
function applyStarLock(n) { updateStarsUI(n, "#f4b400"); document.getElementById("rating-msg").innerText = "You rated this " + n + " stars"; document.getElementById("rating-msg").style.display = "block"; }

function updateStarsUI(n, color) {
    const s = document.querySelectorAll("#star-row span");
    s.forEach((el, i) => el.style.color = i < n ? color : "#dadce0");
}

function handleStarClick(n) {
    if(!currentUser) { alert("Please login to rate!"); return; }
    selectedRating = n;
    localStorage.setItem("rate_" + window.location.pathname, n);
    applyStarLock(n);
    submitComment(null, true); // Auto-submit rating
}

async function submitComment(e, isRateOnly = false) {
    if(e) e.preventDefault();
    const btn = document.getElementById("post-btn");
    const txt = isRateOnly ? "Gave a rating" : document.getElementById("comment-input").value;
    
    btn.disabled = true;
    const payload = {
        url: window.location.pathname,
        name: currentUser.n,
        email: currentUser.e,
        comment: txt,
        parentId: document.getElementById("reply-to").value || "0",
        pic: currentUser.p,
        rating: selectedRating
    };

    await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload), mode: 'no-cors' });
    if(!isRateOnly) { document.getElementById("comment-input").value = ""; cancelReply(); }
    setTimeout(sync, 1500);
    btn.disabled = false;
}

async function sync() {
    try {
        const res = await fetch(`${SCRIPT_URL}?url=${window.location.pathname}`);
        const data = await res.json();
        
        // Notifications
        if(data.comments.length > commentCount && commentCount !== 0) {
            new Notification("New Comment!", { body: data.comments[0].name + " just posted." });
        }
        commentCount = data.comments.length;

        // Avg Rating UI
        document.getElementById("rating-summary").innerText = "⭐ " + data.avgRating + "/5 (" + data.totalVotes + " reviews)";

        const box = document.getElementById("feed-container");
        box.innerHTML = "";
        
        if(data.comments.length === 0) { box.innerHTML = "<p style='text-align:center; color:#999;'>No comments yet.</p>"; return; }

        const mains = data.comments.filter(c => c.parentId == "0");
        mains.reverse().forEach(m => {
            box.innerHTML += renderCard(m, false);
            data.comments.filter(r => r.parentId == m.rowId).forEach(rep => {
                box.innerHTML += renderCard(rep, true);
            });
        });
    } catch(e) { console.log("Sync error"); }
}

function renderCard(c, isRep) {
    const margin = isRep ? "margin-left:45px; border-left:3px solid #f1f3f4; background:#fcfcfc;" : "border-bottom:1px solid #f1f3f4;";
    // Check if current logged user is owner of comment OR Admin (Admin check is via flag from backend)
    const canDelete = currentUser && (c.isAdmin || currentUser.e === c.uMail);
    const starStr = "★".repeat(c.rating) + "☆".repeat(5 - c.rating);

    return `
        <div style="${margin} padding:15px; position:relative;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                <img src="${c.pic}" style="width:32px; height:32px; border-radius:50%;">
                <strong style="font-size:14px; color:#202124;">${c.name} ${c.isAdmin ? '<span style="color:#1a73e8; background:#e8f0fe; padding:2px 8px; border-radius:10px; font-size:10px; margin-left:5px;">Admin</span>' : ''}</strong>
                <span style="color:#f4b400; font-size:12px;">${c.rating > 0 ? starStr : ''}</span>
            </div>
            <p style="margin:5px 0 10px 42px; color:#3c4043; line-height:1.5;">${c.comment}</p>
            <div style="margin-left:42px; display:flex; gap:20px;">
                <button onclick="triggerReply('${c.rowId}')" style="background:none; border:none; color:#1a73e8; font-size:12px; cursor:pointer; font-weight:600;">Reply</button>
                ${canDelete ? `<button onclick="deleteMsg('${c.rowId}')" style="background:none; border:none; color:#d93025; font-size:12px; cursor:pointer; font-weight:600;">Delete</button>` : ""}
                <small style="color:#9aa0a6; font-size:11px; margin-left:auto;">${c.date}</small>
            </div>
        </div>
    `;
}

function triggerReply(id) { 
    if(!currentUser) return alert("Login to reply!");
    document.getElementById("reply-to").value = id; 
    document.getElementById("reply-banner").style.display = "block";
    document.getElementById("comment-input").focus(); 
}

function cancelReply() { document.getElementById("reply-to").value = "0"; document.getElementById("reply-banner").style.display = "none"; }

async function deleteMsg(id) {
    if(!confirm("Are you sure?")) return;
    await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({action:"delete", rowId:id, userEmail:currentUser.e}), mode: 'no-cors' });
    setTimeout(sync, 1000);
}



  

// 1. DATA BINDING
const allPosts = [
  {% assign post_pages = site.pages | where: "is_post", true %}
  {% for p in post_pages %}
  {
    title: {{ p.title | jsonify }},
    url: {{ p.url | relative_url | jsonify }},
    excerpt: {{ p.description | default: p.excerpt | strip_html | truncate: 100 | jsonify }},
    image: "{{ p.image | default: 'https://picsum.photos/200/150' }}"
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
];

// 2. SEARCH LOGIC
function globalSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const resCont = document.getElementById("searchResults");
  if (query.length < 2) { resCont.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">Type 2+ letters...</p>'; return; }

  const filtered = allPosts.filter(p => p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query));
  resCont.innerHTML = filtered.length ? "" : '<p style="text-align:center;padding:20px;">No results found.</p>';
  
  filtered.forEach(p => {
    resCont.innerHTML += `<a href="${p.url}" class="result-item"><img src="${p.image}"><div><h4>${p.title}</h4><p>${p.excerpt}</p></div></a>`;
  });
}

// 3. UI TOGGLES
function toggleSearch(s) {
  document.getElementById("searchModal").style.display = s ? "flex" : "none";
  if(s) document.getElementById("searchInput").focus();
}
function toggleMenu(s) {
  document.querySelector(".mobile-menu").classList.toggle("active", s);
  document.querySelector(".mobile-overlay").classList.toggle("active", s);
}
function closeOnOverlay(e) { if(e.target.id === "searchModal") toggleSearch(false); }
document.addEventListener('keydown', (e) => { if(e.key === "Escape") toggleSearch(false); });




 window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  
  const progressBar = document.getElementById("reading-progress-bar");
  if (progressBar) {
    progressBar.style.width = scrolled + "%";
  }
});


  document.addEventListener('DOMContentLoaded', function() {
    const progressPath = document.querySelector('#tyagi-top-wrap path');
    const pathLength = progressPath.getTotalLength();
    
    // Initial Setup
    progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    
    const updateProgress = () => {
      const scroll = window.pageYOffset;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = pathLength - (scroll * pathLength / height);
      progressPath.style.strokeDashoffset = progress;
      
      // Show/Hide logic
      if (scroll > 200) {
        document.querySelector('#tyagi-top-wrap').classList.add('active-progress');
      } else {
        document.querySelector('#tyagi-top-wrap').classList.remove('active-progress');
      }
    };
    
    window.addEventListener('scroll', updateProgress);
    
    // Click to Scroll Top
    document.querySelector('#tyagi-top-wrap').addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });


  document.addEventListener("DOMContentLoaded", function() {
    // Page ke saare <pre> blocks ko pakdo
    const codeBlocks = document.querySelectorAll("pre");

    codeBlocks.forEach((block) => {
      // Naya button banao
      const button = document.createElement("button");
      button.innerText = "Copy";
      button.className = "copy-btn";

      // Button ko block ke andar dalo
      block.appendChild(button);

      // Click event logic
      button.addEventListener("click", () => {
        const codeText = block.querySelector("code").innerText.trim();
        
        navigator.clipboard.writeText(codeText).then(() => {
          button.innerText = "COPIED!";
          button.style.background = "#22c55e"; // Success Green

          setTimeout(() => {
            button.innerText = "COPY";
            button.style.background = "#166534";
          }, 2000);
        }).catch(err => {
          console.error("Copy failed", err);
        });
      });
    });
  });
