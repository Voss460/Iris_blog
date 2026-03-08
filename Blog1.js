/* ═══════════════════════════════════════════
   Blog.js — sparkle cursor + guestbook
   ═══════════════════════════════════════════ */

// ── Sparkle Cursor Effect ──────────────────
(function () {
    const canvas = document.getElementById("sparkle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const COLORS = ["#ff6b9d", "#ffb3c6", "#ffe4ec", "#ffd6e0", "#c94a64", "#ffcce0", "#ffffff"];
    const sparkles = [];

    function Sparkle(x, y) {
        this.x = x + (Math.random() - 0.5) * 12;
        this.y = y + (Math.random() - 0.5) * 12;
        this.size = Math.random() * 5 + 2;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = 1;
        this.decay = Math.random() * 0.035 + 0.02;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5 - 0.8;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        // randomly star or circle
        this.shape = Math.random() < 0.6 ? "star" : "circle";
    }

    function drawStar(ctx, x, y, size, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        }
        ctx.stroke();
        ctx.restore();
    }

    let mouseX = -999, mouseY = -999;
    let lastX = -999, lastY = -999;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // spawn sparkles only when mouse moves
        const dist = Math.hypot(mouseX - lastX, mouseY - lastY);
        if (dist > 6) {
            const count = Math.min(Math.floor(dist / 6), 4);
            for (let i = 0; i < count; i++) {
                sparkles.push(new Sparkle(mouseX, mouseY));
            }
            lastX = mouseX;
            lastY = mouseY;
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = sparkles.length - 1; i >= 0; i--) {
            const s = sparkles[i];
            s.alpha -= s.decay;
            if (s.alpha <= 0) { sparkles.splice(i, 1); continue; }
            s.x += s.vx;
            s.y += s.vy;
            s.rotation += s.rotationSpeed;

            ctx.globalAlpha = s.alpha;
            ctx.strokeStyle = s.color;
            ctx.fillStyle   = s.color;
            ctx.lineWidth   = 1.2;

            if (s.shape === "star") {
                drawStar(ctx, s.x, s.y, s.size, s.rotation);
            } else {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    animate();
})();

// ── 音乐播放器 ──────────────────────────────
const playlist = [
    { file: "music/221b Baker Street.m4a", title: "ベーカー街221B — 北川保昌" },
    { file: "music/Iris Wilson.m4a", title: "アイリス・ワトソン ~小さな伝記作家 — 北川保昌" },
];

let currentIndex = Math.floor(Math.random() * playlist.length);
const music     = document.getElementById("bg-music");
const songTitle = document.getElementById("song-title");

function loadSong(index) {
    const song = playlist[index];
    music.src        = song.file;
    songTitle.textContent = song.title;
    music.load();
}

function playNextRandom() {
    // 随机选一首，保证不重复播放同一首
    let next;
    do {
        next = Math.floor(Math.random() * playlist.length);
    } while (next === currentIndex && playlist.length > 1);
    currentIndex = next;
    loadSong(currentIndex);
    music.play();
}

// 一首播完之后自动随机切换下一首
music.addEventListener("ended", () => {
    playNextRandom();
});

function toggleMusic() {
    const btn = document.getElementById("music-btn");
    if (music.paused) {
        music.play();
        btn.textContent = "||";
    } else {
        music.pause();
        btn.textContent = "♪";
    }
}
// 页面加载完成后，随机选一首准备好（等用户点击触发）
loadSong(currentIndex);


// ── Guestbook ─────────────────────────────
function addGuestbookEntry() {
    const nameInput    = document.getElementById("gb-name");
    const msgInput     = document.getElementById("gb-message");
    const name    = (nameInput?.value  || "").trim();
    const message = (msgInput?.value || "").trim();

    if (!name || !message) {
        alert("Please fill in both your name and a message ♡");
        return;
    }

    const container = document.querySelector(".gb-messages");
    if (!container) return;

    // Build new entry
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toLowerCase();

    const entry = document.createElement("div");
    entry.className = "gb-msg";
    entry.innerHTML = `
        <div class="gb-msg-header">
            <span class="gb-name">🌸 ${escapeHtml(name)}</span>
            <span class="gb-date">${dateStr}</span>
        </div>
        <p>${escapeHtml(message)}</p>
    `;
    entry.style.opacity = "0";
    entry.style.transform = "translateY(-8px)";
    entry.style.transition = "opacity 0.4s, transform 0.4s";

    container.insertBefore(entry, container.firstChild);
    requestAnimationFrame(() => {
        entry.style.opacity = "1";
        entry.style.transform = "translateY(0)";
    });

    // Clear inputs
    nameInput.value  = "";
    msgInput.value = "";
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
