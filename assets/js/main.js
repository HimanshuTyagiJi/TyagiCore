/* ============================================================
   TYAGI CORE — main.js
   ============================================================ */

/* [1] DARK MODE */
(function() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
})();

const themeBtn = document.getElementById("dark-mode-toggle");
if (themeBtn) {
  const iconWrap = themeBtn.querySelector(".wheel-icon-wrap");
  themeBtn.addEventListener("click", () => {
    if (iconWrap) iconWrap.classList.add("wheel-spin");
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    setTimeout(() => { if (iconWrap) iconWrap.classList.remove("wheel-spin"); }, 700);
  });
}

/* [2] SEARCH */
function toggleSearch(state) {
  const modal = document.getElementById("searchModal");
  if (!modal) return;
  modal.style.display = state ? "flex" : "none";
  if (state) {
    const inp = document.getElementById("searchInput");
    if (inp) inp.focus();
  }
}
function closeOnOverlay(e) {
  if (e.target.id === "searchModal") toggleSearch(false);
}
function globalSearch() {
  const query = (document.getElementById("searchInput") || {}).value || "";
  const resCont = document.getElementById("searchResults");
  if (!resCont) return;
  if (query.length < 2) {
    resCont.innerHTML = '<p style="text-align:center;padding:20px;color:#94a3b8;">Type 2+ letters to search...</p>';
    return;
  }
  const q = query.toLowerCase();
  const posts = window.tyagiPosts || [];
  const filtered = posts.filter(p =>
    (p.title || "").toLowerCase().includes(q) ||
    (p.excerpt || "").toLowerCase().includes(q)
  );
  if (!filtered.length) {
    resCont.innerHTML = '<p style="text-align:center;padding:20px;">No results found.</p>';
    return;
  }
  resCont.innerHTML = filtered.slice(0, 8).map(p => {
    const img = p.image ? `<img src="${p.image}" alt="${p.title}" loading="lazy">` : "";
    return `<a href="${p.url}" class="result-item">
      ${img}
      <div><h4>${p.title}</h4><p>${p.excerpt}</p></div>
    </a>`;
  }).join("");
}

/* [3] MOBILE MENU */
function toggleMenu(state) {
  const menu = document.querySelector(".mobile-menu");
  const overlay = document.querySelector(".mobile-overlay");
  const btn = document.querySelector(".hamburger");
  if (menu) menu.classList.toggle("active", state);
  if (overlay) overlay.classList.toggle("active", state);
  if (btn) btn.setAttribute("aria-expanded", state ? "true" : "false");
  document.body.style.overflow = state ? "hidden" : "";
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    toggleMenu(false);
    toggleSearch(false);
  }
});

/* [4] READING PROGRESS BAR */
window.addEventListener("scroll", () => {
  const scrolled = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = height > 0 ? (scrolled / height) * 100 : 0;
  const bar = document.getElementById("reading-progress-bar");
  if (bar) bar.style.width = pct + "%";
  const progressContainer = document.getElementById("reading-progress-container");
  if (progressContainer) progressContainer.setAttribute("aria-valuenow", Math.round(pct));
}, { passive: true });

/* [5] SCROLL TO TOP */
document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.getElementById("tyagi-top-wrap");
  const progressPath = wrap ? wrap.querySelector("path") : null;

  if (progressPath) {
    const pathLen = progressPath.getTotalLength();
    progressPath.style.strokeDasharray = pathLen + " " + pathLen;
    progressPath.style.strokeDashoffset = pathLen;

    const updateProgress = () => {
      const scroll = window.pageYOffset;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? pathLen - (scroll * pathLen / height) : pathLen;
      progressPath.style.strokeDashoffset = progress;
      if (wrap) {
        scroll > 200 ? wrap.classList.add("active-progress") : wrap.classList.remove("active-progress");
      }
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
  }

  if (wrap) {
    wrap.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

/* [6] TOC GENERATOR */
document.addEventListener("DOMContentLoaded", () => {
  const tocList = document.getElementById("toc-list");
  const tocBox  = document.getElementById("toc-box");
  if (!tocList) return;

  const headings = document.querySelectorAll(".tc-left h2, .tc-left h3, .tc-left h4");
  if (headings.length > 2) {
    if (tocBox) tocBox.style.display = "block";
    headings.forEach((h, i) => {
      const id = "tc-section-" + i;
      h.setAttribute("id", id);
      const li = document.createElement("li");
      const a  = document.createElement("a");
      a.textContent = h.textContent.replace(/[0-9]+/, "").trim();
      a.href = "#" + id;
      if (h.tagName === "H3") { li.style.marginLeft = "18px"; li.style.fontSize = "0.9em"; }
      if (h.tagName === "H4") { li.style.marginLeft = "36px"; li.style.fontSize = "0.85em"; }
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  const tocBtn = document.getElementById("toc-toggle-btn");
  if (tocBtn) {
    tocBtn.addEventListener("click", () => {
      const expanded = tocList.classList.toggle("expanded");
      tocBtn.setAttribute("aria-expanded", expanded);
      tocBtn.innerHTML = expanded
        ? 'See Less <i class="fas fa-chevron-up" aria-hidden="true"></i>'
        : 'See More <i class="fas fa-chevron-down" aria-hidden="true"></i>';
      if (!expanded && tocBox) tocBox.scrollIntoView({ behavior: "smooth" });
    });
  }
});

/* [7] SHARE */
function tyagiShare() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      text: "Check this out on Tyagi Core:",
      url: window.location.href,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.querySelector(".tyagi-share-btn");
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> LINK COPIED!';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
    });
  }
}
function nativeShare(title, url) {
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => alert("Link copied!")).catch(() => {});
  }
}

/* [8] COPY CODE BUTTON */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("pre").forEach((block) => {
    if (block.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.innerText = "Copy";
    btn.className = "copy-btn";
    btn.setAttribute("aria-label", "Copy code");
    block.appendChild(btn);
    btn.addEventListener("click", () => {
      const code = block.querySelector("code");
      const text = code ? code.innerText : block.innerText;
      navigator.clipboard.writeText(text.trim()).then(() => {
        btn.innerText = "Copied!";
        btn.style.background = "#22c55e";
        setTimeout(() => { btn.innerText = "Copy"; btn.style.background = ""; }, 2000);
      });
    });
  });
});

/* [9] TRENDING SIDEBAR */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("trending-sidebar-items");
  if (!container || !window.tyagiPosts || !window.tyagiPosts.length) return;

  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 6));
  const shuffled = [...window.tyagiPosts].sort((a, b) =>
    Math.sin(seed + a.title.length) - Math.sin(seed + b.title.length)
  ).slice(0, 5);

  const defaultImg = "https://tyagicore.gklearnstudy.in/assets/images/thumbnail-online-fraud.png";
  container.innerHTML = shuffled.map(post => `
    <a href="${post.url}" class="trend-card">
      <img src="${post.image || defaultImg}" class="trend-thumb" alt="${post.title}" loading="lazy" width="64" height="46">
      <span class="trend-title">${post.title}</span>
    </a>
  `).join("");
});

/* [10] CATEGORY FILTER & PAGINATION (index) */
document.addEventListener("DOMContentLoaded", () => {
  const sourceCatNav = document.getElementById("source-category-nav");
  const targetCatNav = document.getElementById("index-category-nav");
  if (sourceCatNav && targetCatNav) {
    targetCatNav.innerHTML = sourceCatNav.innerHTML;
    sourceCatNav.remove();
  }

  const postsPerPage = 20;
  let currentFilteredPosts = Array.from(document.querySelectorAll(".js-post"));
  const paginationNav = document.getElementById("pagination-nav");

  function renderPage(pageNum) {
    const start = (pageNum - 1) * postsPerPage;
    const end   = start + postsPerPage;
    document.querySelectorAll(".js-post").forEach(p => { p.style.display = "none"; });
    currentFilteredPosts.forEach((post, i) => {
      if (i >= start && i < end) post.style.display = "flex";
    });
    renderPaginationBtns(pageNum);
  }

  function renderPaginationBtns(active) {
    if (!paginationNav) return;
    paginationNav.innerHTML = "";
    const total = Math.ceil(currentFilteredPosts.length / postsPerPage);
    if (total <= 1) return;
    for (let i = 1; i <= total; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = "page-btn" + (i === active ? " active" : "");
      btn.setAttribute("aria-label", "Page " + i);
      btn.onclick = () => { renderPage(i); window.scrollTo({ top: 0, behavior: "smooth" }); };
      paginationNav.appendChild(btn);
    }
  }

  window.filterCategory = function(cat, btn) {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const all = Array.from(document.querySelectorAll(".js-post"));
    currentFilteredPosts = cat === "all"
      ? all
      : all.filter(p => (p.getAttribute("data-categories") || "").split(",").map(c => c.trim()).includes(cat));
    renderPage(1);
  };

  if (currentFilteredPosts.length) renderPage(1);
});

/* [11] SERVICE WORKER */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
