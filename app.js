/* Ahmed Dahmash — Architectural Portfolio · interactions */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const SKILLS = [
    { k: "Design & Drafting", v: "Autodesk Revit (BIM) · AutoCAD 2D/3D" },
    { k: "3D Visualization", v: "3ds Max · Lumion · SketchUp · Photoshop" },
    { k: "Site & Construction", v: "Supervision · QA/QC · lifecycle management · slab & foundation inspection" },
    { k: "Quantity Surveying", v: "Material take-offs · structural & finishing estimation" },
    { k: "Documentation", v: "Specifications · contracts · technical reporting · stakeholder coordination" },
  ];

  // Editorial layout rhythm for the project grid (repeats across the list)
  const SPAN_PATTERN = ["feat", "", "", "tall", "tall", "tall", "", "", "feat", "", ""];

  let PROJECTS = [];
  let currentFilter = "All";
  let lbList = [];
  let lbIndex = 0;

  /* ---------------- boot ---------------- */
  fetch("assets/data.json")
    .then((r) => r.json())
    .then((d) => {
      PROJECTS = d.projects.sort((a, b) => a.num - b.num);
      initHero();
      initFilters();
      renderGrid();
      initSkills();
      initRouting();
    })
    .catch((e) => console.error("data load failed", e));

  /* ---------------- hero ---------------- */
  function initHero() {
    $("#year").textContent = new Date().getFullYear();
    // count-up
    $$(".stat__n[data-count]").forEach((el) => {
      const target = +el.dataset.count;
      const suffix = el.textContent.includes("+") ? "+" : "";
      let n = 0;
      const step = Math.max(1, Math.round(target / 28));
      const t = setInterval(() => {
        n += step;
        if (n >= target) { n = target; clearInterval(t); }
        el.textContent = n + suffix;
      }, 26);
    });
  }

  /* ---------------- filters ---------------- */
  function initFilters() {
    const cats = ["All", ...new Set(PROJECTS.map((p) => p.category))];
    const counts = {};
    PROJECTS.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1));
    const wrap = $("#filters");
    cats.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "filter" + (i === 0 ? " active" : "");
      b.dataset.cat = c;
      const n = c === "All" ? 28 : counts[c];
      b.innerHTML = `${c}<span>${String(n).padStart(2, "0")}</span>`;
      b.addEventListener("click", () => {
        currentFilter = c;
        $$(".filter").forEach((f) => f.classList.toggle("active", f === b));
        renderGrid();
      });
      wrap.appendChild(b);
    });
  }

  /* ---------------- grid ---------------- */
  function renderGrid() {
    const grid = $("#grid");
    grid.innerHTML = "";
    const list = PROJECTS.filter((p) => currentFilter === "All" || p.category === currentFilter);
    list.forEach((p, i) => {
      const span = currentFilter === "All" ? SPAN_PATTERN[i % SPAN_PATTERN.length] : (i % 5 === 0 ? "feat" : "");
      const card = document.createElement("article");
      card.className = "card " + span;
      card.innerHTML = `
        <div class="card__media">
          <span class="card__num">${String(p.num).padStart(2, "0")}</span>
          <span class="card__tag">${p.category}</span>
          <img src="${span === "feat" ? p.hero : p.heroThumb}" alt="${p.title}" loading="lazy" />
          <div class="card__view"><span>View project →</span></div>
        </div>
        <div class="card__body">
          <div>
            <h3 class="card__title">${p.title}</h3>
            <p class="card__role">${p.role}</p>
          </div>
          <div class="card__meta">${p.location.split(",")[0]}<br/>${p.year || ""}</div>
        </div>`;
      card.addEventListener("click", () => { location.hash = "project/" + p.num; });
      grid.appendChild(card);
    });
    observeCards();
  }

  function observeCards() {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("in"), (i % 4) * 70);
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    $$(".card").forEach((c) => io.observe(c));
  }

  /* ---------------- skills ---------------- */
  function initSkills() {
    const wrap = $("#skills");
    SKILLS.forEach((s) => {
      const d = document.createElement("div");
      d.className = "skill";
      d.innerHTML = `<div class="skill__k">${s.k}</div><div class="skill__v">${s.v}</div>`;
      wrap.appendChild(d);
    });
  }

  /* ---------------- detail overlay ---------------- */
  function openDetail(num) {
    const p = PROJECTS.find((x) => x.num === num);
    if (!p) return;
    const pos = PROJECTS.findIndex((x) => x.num === num);
    const next = PROJECTS[(pos + 1) % PROJECTS.length];

    const facts = [
      ["Category", p.category],
      ["Type", p.type],
      ["Location", p.location],
      ["Year", p.year || "—"],
      ["Role", p.role],
    ];

    const gallery = p.media || [];
    const galleryHTML = gallery.map((m, i) => `
      <figure class="dt-shot ${m.kind === "plan" ? "plan" : ""}" data-lb="${i}">
        <img src="${m.sm}" alt="${p.title} — image ${i + 1}" loading="lazy"/>
        ${m.caption ? `<figcaption class="dt-shot__cap">${m.caption}</figcaption>` : ""}
      </figure>`).join("");

    $("#detailScroll").innerHTML = `
      <div class="dt-head">
        <div class="dt-head__num">Project ${String(p.num).padStart(2, "0")}</div>
        <h1 class="dt-head__title">${p.title}</h1>
        ${p.subtitle ? `<div class="dt-head__sub">${p.subtitle}</div>` : ""}
        <div class="dt-head__main">
          <p class="dt-summary">${p.summary}</p>
          <div class="dt-facts">
            ${facts.map((f) => `<div class="dt-fact"><span class="dt-fact__k">${f[0]}</span><span class="dt-fact__v">${f[1]}</span></div>`).join("")}
          </div>
        </div>
      </div>
      <div class="dt-masonry">${galleryHTML}</div>
      <div class="dt-next" id="dtNext">
        <div>
          <div class="dt-next__k">Next · Project ${String(next.num).padStart(2, "0")}</div>
          <div class="dt-next__t">${next.title}</div>
        </div>
        <div class="dt-next__arrow">→</div>
      </div>`;

    lbList = gallery.map((m) => ({ src: m.lg, cap: m.caption || p.title }));
    $$(".dt-shot").forEach((el) =>
      el.addEventListener("click", () => openLightbox(+el.dataset.lb, lbList))
    );
    $("#dtNext").addEventListener("click", () => {
      location.hash = "project/" + next.num;
    });

    const d = $("#detail");
    d.classList.add("open");
    d.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    $("#detailScroll").scrollTop = 0;
    d.scrollTop = 0;
  }

  function closeDetail() {
    const d = $("#detail");
    d.classList.remove("open");
    d.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
  }

  /* ---------------- lightbox ---------------- */
  let lbRot = 0;
  function applyRot() {
    $("#lbImg").style.transform = `rotate(${lbRot}deg)`;
    const r = ((lbRot % 360) + 360) % 360;
    $("#lightbox").classList.toggle("rot", r === 90 || r === 270);
  }
  function openLightbox(i, list) {
    lbList = list;
    lbIndex = i;
    lbRot = 0;
    showLb();
    const lb = $("#lightbox");
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
  }
  function showLb() {
    const item = lbList[lbIndex];
    if (!item) return;
    lbRot = 0;
    applyRot();
    $("#lbImg").src = item.src;
    $("#lbCap").textContent = item.cap || "";
    const multi = lbList.length > 1;
    $("#lbPrev").style.display = multi ? "" : "none";
    $("#lbNext").style.display = multi ? "" : "none";
  }
  function rotate(dir) { lbRot += dir * 90; applyRot(); }
  function closeLb() {
    $("#lightbox").classList.remove("open");
    $("#lightbox").setAttribute("aria-hidden", "true");
    if (!$("#detail").classList.contains("open")) document.body.classList.remove("locked");
  }
  function lbStep(d) {
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    showLb();
  }

  /* ---------------- routing (hash) ---------------- */
  function initRouting() {
    window.addEventListener("hashchange", route);
    route();
  }
  let lastIndex = null;
  function route() {
    const m = location.hash.match(/project\/(\d+)/);
    if (m) {
      const idx = +m[1];
      if (idx !== lastIndex || !$("#detail").classList.contains("open")) openDetail(idx);
      lastIndex = idx;
    } else {
      lastIndex = null;
      closeDetail();
    }
  }

  /* ---------------- global UI wiring ---------------- */
  // nav scroll state + loadbar
  const nav = $("#nav");
  const loadbar = $("#loadbar");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    loadbar.style.width = pct + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // mobile menu
  $("#navMenu").addEventListener("click", () => $(".nav__links").classList.toggle("open"));
  $$(".nav__links a").forEach((a) => a.addEventListener("click", () => $(".nav__links").classList.remove("open")));

  // detail + lightbox controls
  $("#detailClose").addEventListener("click", () => { history.pushState("", document.title, location.pathname + location.search); closeDetail(); });
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => lbStep(-1));
  $("#lbNext").addEventListener("click", () => lbStep(1));
  $("#lbRotL").addEventListener("click", (e) => { e.stopPropagation(); rotate(-1); });
  $("#lbRotR").addEventListener("click", (e) => { e.stopPropagation(); rotate(1); });
  $("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") closeLb(); });

  document.addEventListener("keydown", (e) => {
    if ($("#lightbox").classList.contains("open")) {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") lbStep(-1);
      if (e.key === "ArrowRight") lbStep(1);
      if (e.key === "r") rotate(1);
      if (e.key === "R") rotate(-1);
    } else if ($("#detail").classList.contains("open") && e.key === "Escape") {
      history.pushState("", document.title, location.pathname + location.search);
      closeDetail();
    }
  });

  // section reveal
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.14 }
  );
  $$(".section-head, .about__bio, .about__skills, .contact__inner").forEach((el) => { el.classList.add("reveal"); io.observe(el); });

})();
