/* ============================================================
   TYAGI CORE — main.js v2.0
   ============================================================ */

/* [1] DARK MODE — apply before paint */
(function(){
  if(localStorage.getItem("theme")==="dark") document.body.classList.add("dark-mode");
})();

document.addEventListener("DOMContentLoaded", () => {

  /* [2] THEME TOGGLE */
  const themeBtn = document.getElementById("dark-mode-toggle");
  if(themeBtn){
    const wrap = themeBtn.querySelector(".wheel-icon-wrap");
    themeBtn.addEventListener("click", () => {
      if(wrap) wrap.classList.add("wheel-spin");
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
      setTimeout(() => { if(wrap) wrap.classList.remove("wheel-spin"); }, 650);
    });
  }

  /* [3] MOBILE MENU */
  window.toggleMenu = function(state){
    document.querySelector(".mobile-menu")?.classList.toggle("active", state);
    document.querySelector(".mobile-overlay")?.classList.toggle("active", state);
    const btn = document.querySelector(".hamburger");
    if(btn) btn.setAttribute("aria-expanded", state);
    document.body.style.overflow = state ? "hidden" : "";
  };
  document.addEventListener("keydown", e => {
    if(e.key === "Escape"){ toggleMenu(false); toggleSearch(false); }
  });

  /* [4] SEARCH */
  window.toggleSearch = function(state){
    const m = document.getElementById("searchModal");
    if(!m) return;
    m.style.display = state ? "flex" : "none";
    if(state){ setTimeout(() => document.getElementById("searchInput")?.focus(), 50); }
  };
  window.closeOnOverlay = function(e){ if(e.target.id==="searchModal") toggleSearch(false); };
  window.globalSearch = function(){
    const q = (document.getElementById("searchInput")?.value || "").toLowerCase();
    const rc = document.getElementById("searchResults");
    if(!rc) return;
    if(q.length < 2){
      rc.innerHTML = '<p style="text-align:center;padding:20px;color:#94a3b8;">Type 2+ letters...</p>';
      return;
    }
    const posts = window.tyagiPosts || [];
    const hits  = posts.filter(p =>
      (p.title||"").toLowerCase().includes(q) || (p.excerpt||"").toLowerCase().includes(q)
    ).slice(0, 8);
    if(!hits.length){ rc.innerHTML = '<p style="text-align:center;padding:20px;color:#94a3b8;">No results found.</p>'; return; }
    rc.innerHTML = hits.map(p => {
      const imgHtml = p.image ? `<img src="${p.image}" alt="${p.title}" loading="lazy">` : "";
      return `<a href="${p.url}" class="result-item">${imgHtml}<div><h4>${p.title}</h4><p>${p.excerpt}</p></div></a>`;
    }).join("");
  };

  /* [5] TOC */
  const tocList = document.getElementById("toc-list");
  const tocBox  = document.getElementById("toc-box");
  if(tocList){
    const headings = document.querySelectorAll(".tc-left h2, .tc-left h3, .tc-left h4");
    if(headings.length > 2){
      if(tocBox) tocBox.style.display = "block";
      headings.forEach((h, i) => {
        const id = "tcs-" + i;
        h.id = id;
        const li = document.createElement("li");
        const a  = document.createElement("a");
        a.textContent = h.textContent.replace(/^\d+\s*/, "").trim();
        a.href = "#" + id;
        if(h.tagName==="H3"){ li.style.marginLeft="16px"; li.style.fontSize="0.88em"; }
        if(h.tagName==="H4"){ li.style.marginLeft="30px"; li.style.fontSize="0.83em"; }
        li.appendChild(a); tocList.appendChild(li);
      });
    }
    const tocBtn = document.getElementById("toc-toggle-btn");
    if(tocBtn){
      tocBtn.addEventListener("click", () => {
        const exp = tocList.classList.toggle("expanded");
        tocBtn.setAttribute("aria-expanded", exp);
        tocBtn.innerHTML = exp
          ? 'See Less <i class="fas fa-chevron-up" aria-hidden="true"></i>'
          : 'See More <i class="fas fa-chevron-down" aria-hidden="true"></i>';
        if(!exp && tocBox) tocBox.scrollIntoView({ behavior:"smooth" });
      });
    }
  }

  /* [6] COPY CODE */
  document.querySelectorAll("pre").forEach(block => {
    if(block.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.innerText = "Copy"; btn.className = "copy-btn";
    btn.setAttribute("aria-label","Copy code");
    block.appendChild(btn);
    btn.addEventListener("click", () => {
      const code = block.querySelector("code");
      navigator.clipboard.writeText((code ? code.innerText : block.innerText).trim()).then(() => {
        btn.innerText = "Copied!"; btn.style.background = "#22c55e";
        setTimeout(() => { btn.innerText = "Copy"; btn.style.background = ""; }, 1800);
      });
    });
  });

  /* [7] SCROLL TO TOP */
  const wrap = document.getElementById("tyagi-top-wrap");
  const path = wrap?.querySelector("path");
  if(path){
    const len = path.getTotalLength();
    path.style.strokeDasharray  = len+" "+len;
    path.style.strokeDashoffset = len;
    const update = () => {
      const s  = window.pageYOffset;
      const h  = document.documentElement.scrollHeight - window.innerHeight;
      path.style.strokeDashoffset = h > 0 ? len - (s*len/h) : len;
      wrap.classList.toggle("active-progress", s > 200);
    };
    window.addEventListener("scroll", update, { passive:true });
    update();
  }
  wrap?.addEventListener("click", e => { e.preventDefault(); window.scrollTo({top:0, behavior:"smooth"}); });

  /* [8] READING PROGRESS */
  window.addEventListener("scroll", () => {
    const s = document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const bar = document.getElementById("reading-progress-bar");
    if(bar) bar.style.width = (h>0 ? (s/h)*100 : 0)+"%";
  }, { passive:true });

  /* [9] TRENDING SIDEBAR — each post uses its own image */
  const trendContainer = document.getElementById("trending-sidebar-items");
  if(trendContainer && window.tyagiPosts?.length){
    const seed = Math.floor(Date.now() / (1000*60*60*6));
    const posts = [...window.tyagiPosts]
      .filter(p => p.image) // prefer posts with images
      .sort((a,b) => Math.sin(seed + a.title.length) - Math.sin(seed + b.title.length))
      .slice(0, 5);
    // fill up to 5 if less than 5 have images
    if(posts.length < 5){
      const extra = [...window.tyagiPosts]
        .filter(p => !p.image)
        .sort((a,b) => Math.sin(seed + a.title.length) - Math.sin(seed + b.title.length))
        .slice(0, 5 - posts.length);
      posts.push(...extra);
    }
    trendContainer.innerHTML = posts.map(p => `
      <a href="${p.url}" class="trend-card">
        ${p.image
          ? `<img src="${p.image}" class="trend-thumb" alt="${p.title}" loading="lazy" width="62" height="44">`
          : `<div class="trend-thumb" style="background:var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:20px;">📄</div>`
        }
        <span class="trend-title">${p.title}</span>
      </a>`).join("");
  }

  /* [10] CATEGORY + PAGINATION */
  const sourceCat = document.getElementById("source-category-nav");
  const targetCat = document.getElementById("index-category-nav");
  if(sourceCat && targetCat){ targetCat.innerHTML = sourceCat.innerHTML; sourceCat.remove(); }

  const PER_PAGE = 20;
  let filtered = Array.from(document.querySelectorAll(".js-post"));
  const navEl  = document.getElementById("pagination-nav");

  function renderPage(page){
    const start = (page-1)*PER_PAGE, end = start+PER_PAGE;
    document.querySelectorAll(".js-post").forEach(p => p.style.display="none");
    filtered.forEach((p,i) => { if(i>=start && i<end) p.style.display="flex"; });
    renderPagBtns(page);
  }
  function renderPagBtns(active){
    if(!navEl) return;
    navEl.innerHTML = "";
    const total = Math.ceil(filtered.length/PER_PAGE);
    if(total<=1) return;
    for(let i=1;i<=total;i++){
      const b = document.createElement("button");
      b.innerText=i; b.className="page-btn"+(i===active?" active":"");
      b.setAttribute("aria-label","Page "+i);
      b.onclick = () => { renderPage(i); window.scrollTo({top:0,behavior:"smooth"}); };
      navEl.appendChild(b);
    }
  }
  window.filterCategory = function(cat, btn){
    document.querySelectorAll(".cat-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const all = Array.from(document.querySelectorAll(".js-post"));
    filtered = cat==="all" ? all : all.filter(p=>(p.getAttribute("data-categories")||"").split(",").map(c=>c.trim()).includes(cat));
    renderPage(1);
  };
  if(filtered.length) renderPage(1);

});

/* [11] SHARE */
window.tyagiShare = function(){
  if(navigator.share){
    navigator.share({ title:document.title, url:window.location.href }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(window.location.href).then(()=>{
      const btn = document.querySelector(".tyagi-share-btn");
      if(btn){ const o=btn.innerHTML; btn.innerHTML='<i class="fas fa-check"></i> Copied!'; setTimeout(()=>btn.innerHTML=o,2000); }
    });
  }
};
window.nativeShare = function(title, url){
  if(navigator.share) navigator.share({title, url}).catch(()=>{});
  else navigator.clipboard.writeText(url).then(()=>alert("Link copied!"));
};

/* [12] LANG TOGGLE for static pages */
window.toggleLang = function(){
  const en = document.querySelectorAll(".lang-en");
  const hi = document.querySelectorAll(".lang-hi");
  const btn = document.getElementById("lang-toggle-btn");
  const isEn = btn?.getAttribute("data-lang") === "en";
  en.forEach(el => el.style.display = isEn ? "none" : "block");
  hi.forEach(el => el.style.display = isEn ? "block" : "none");
  if(btn){ btn.setAttribute("data-lang", isEn?"hi":"en"); btn.textContent = isEn ? "🌐 Switch to English" : "🌐 हिंदी में पढ़ें"; }
};

/* [13] SERVICE WORKER */
if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(()=>{}));
}
