// logic.js

/* --- GitHub Profile + Projects --- */
const username = "SwapnopamMitra";
const projectList = document.getElementById("project-list");
const toggleBtn = document.getElementById("themeToggle");
const icon = toggleBtn.querySelector("i");

Promise.all([
  fetch(`https://api.github.com/users/${username}/repos?sort=updated`),
  fetch(`https://api.github.com/users/${username}`)
])
  .then(async ([reposRes, userRes]) => [await reposRes.json(), await userRes.json()])
  .then(([repos, user]) => {
    document.getElementById("avatar").src = user.avatar_url;
    document.getElementById("github-name").textContent = user.name || username;
    document.getElementById("github-bio").textContent =
      user.bio || "Developer and open-source enthusiast.";
    document.getElementById("github-link").href = user.html_url;

    projectList.innerHTML = "";
    repos.forEach(repo => {
      if (repo.fork || repo.private) return;
      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || "No description provided."}</p>
        <div class="project-meta">
          ⭐ ${repo.stargazers_count} | 🕓 Updated: ${new Date(repo.updated_at).toLocaleDateString()} | 🧠 ${repo.language || "N/A"}
        </div>
        <a href="${repo.html_url}" target="_blank">View on GitHub</a>
      `;
      projectList.appendChild(card);
    });
    if (!projectList.innerHTML.trim()) {
      projectList.innerHTML = "<p>No public projects found yet.</p>";
    }
  })
  .catch(() => {
    projectList.innerHTML = "<p>Unable to load GitHub data right now.</p>";
  });

/* --- Theme Toggle --- */
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light");
  icon.classList.replace("fa-moon", "fa-sun");
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  icon.classList.toggle("fa-sun", isLight);
  icon.classList.toggle("fa-moon", !isLight);
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

/* --- Scroll Reveal --- */
const sections = document.querySelectorAll("section");
const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.85;
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top < trigger) section.classList.add("visible");
  });
};
window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* --- Back to Top Button --- */
const backToTop = document.createElement("button");
backToTop.id = "backToTop";
backToTop.innerHTML = "↑";
document.body.appendChild(backToTop);

window.addEventListener("scroll", () => {
  backToTop.style.display = window.scrollY > 300 ? "block" : "none";
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* --- Download / Watermarked EXE --- */
const downloadForm = document.getElementById("downloadForm");
const downloadMsg = document.getElementById("downloadMsg");

if (downloadForm) {
  downloadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("userEmail").value.trim();
    if (!email) return;

    downloadMsg.textContent = "Generating your download link...";

    try {
      const userLink = `https://raw.githubusercontent.com/SwapnopamMitra/predictive-sort/releases/latest/predictive_sort_release.exe?email=${encodeURIComponent(email)}`;
      downloadMsg.innerHTML = `✅ Download ready: <a href="${userLink}" target="_blank">Click here</a>`;
    } catch (err) {
      downloadMsg.textContent = "❌ Failed to generate download link. Try again later.";
      console.error(err);
    }
  });
}
