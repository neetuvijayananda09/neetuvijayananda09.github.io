// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  window.clearTimeout(toast._timer);
  toast._timer = window.setTimeout(() => t.classList.remove("show"), 2200);
}

// ===== Year =====
$("#year").textContent = new Date().getFullYear();

// ===== Theme toggle (persisted) =====
const themeBtn = $("#themeBtn");
const root = document.documentElement;

function setTheme(mode) {
  if (mode === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");

  localStorage.setItem("theme", mode);
}

const saved = localStorage.getItem("theme");
if (saved === "light" || saved === "dark") setTheme(saved);

themeBtn?.addEventListener("click", () => {
  const isLight = root.getAttribute("data-theme") === "light";
  setTheme(isLight ? "dark" : "light");
  toast(isLight ? "Dark theme enabled" : "Light theme enabled");
});

// ===== Mobile drawer =====
const drawer = $("#drawer");
const menuBtn = $("#menuBtn");
const closeDrawerBtn = $("#closeDrawerBtn");

function openDrawer() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

menuBtn?.addEventListener("click", openDrawer);
closeDrawerBtn?.addEventListener("click", closeDrawer);

// Close drawer on click outside the panel
drawer?.addEventListener("click", (e) => {
  // Clicking the overlay (not the inner panel content)
  if (e.target === drawer) closeDrawer();
});

// Close drawer after clicking a link
$$(".drawerLinks a").forEach((a) => a.addEventListener("click", closeDrawer));

// ===== Active nav highlight (simple) =====
const sections = ["about", "experience", "projects", "skills", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const navLinks = $$(".nav a");

const io = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const id = visible.target.id;
    navLinks.forEach((a) => {
      const active = a.getAttribute("href") === `#${id}`;
      a.style.color = active ? "var(--text)" : "";
      a.style.borderColor = active ? "var(--line)" : "transparent";
      a.style.background = active ? "rgba(255,255,255,0.04)" : "";
    });
  },
  { threshold: [0.22, 0.4, 0.6] }
);

sections.forEach((s) => io.observe(s));

// ===== Contact form: copy-to-clipboard =====
$("#contactForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = (fd.get("name") || "").toString().trim();
  const email = (fd.get("email") || "").toString().trim();
  const message = (fd.get("message") || "").toString().trim();

  const payload =
`Hi Neetu,

${message}

— ${name}
${email}
`;

  try {
    await navigator.clipboard.writeText(payload);
    toast("Copied! Paste it into an email ✉️");
    e.target.reset();
  } catch {
    // Fallback: select text in a temporary textarea
    const ta = document.createElement("textarea");
    ta.value = payload;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("Copied (fallback). Paste it into an email ✉️");
    e.target.reset();
  }
});
