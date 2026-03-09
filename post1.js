/* ═══════════════════════════════════════════
   post1.js — 评论区，直连 Supabase
   ═══════════════════════════════════════════ */

const SUPABASE_URL = "https://ajyirdyzsgkgycpiryrx.supabase.co";
const SUPABASE_KEY = "sb_publishable_bXZ9FlACnc9w_na-udD0Fg_0ozs_9Kb";

// ── 读取评论 ────────────────────────────────
async function loadComments() {
    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/comments?select=*&order=created_at.desc`,
        {
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        }
    );
    const comments = await res.json();
    renderComments(comments);
}

// ── 渲染评论到页面 ──────────────────────────
function renderComments(comments) {
    const list = document.getElementById("comment-list");
    if (!list) return;

    list.innerHTML = "";

    if (!comments || comments.length === 0) {
        list.innerHTML = `<p class="no-comments">No comments yet — be the first! ♡</p>`;
        return;
    }

    comments.forEach(c => {
        const date = new Date(c.created_at).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
        }).toLowerCase();

        const div = document.createElement("div");
        div.className = "gb-msg";
        div.innerHTML = `
            <div class="gb-msg-header">
                <span class="gb-name">${randomEmoji()} ${escapeHtml(c.name)}</span>
                <span class="gb-date">${date}</span>
            </div>
            <p>${escapeHtml(c.message)}</p>
        `;
        list.appendChild(div);
    });
}

// ── 提交新评论 ──────────────────────────────
async function addComment() {
    const nameInput = document.getElementById("c-name");
    const msgInput  = document.getElementById("c-message");
    const name      = (nameInput?.value || "").trim();
    const message   = (msgInput?.value  || "").trim();

    if (!name || !message) {
        alert("Please fill in both your name and a message ♡");
        return;
    }

    const btn = document.querySelector(".gb-submit");
    btn.textContent = "⏳ posting...";
    btn.disabled = true;

    const res = await fetch(
        `${SUPABASE_URL}/rest/v1/comments`,
        {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify({ name, message })
        }
    );

    btn.textContent = "✦ post ✦";
    btn.disabled = false;

    if (res.ok) {
        nameInput.value = "";
        msgInput.value  = "";
        loadComments();
    } else {
        alert("Something went wrong, please try again ♡");
    }
}

// ── 固定 emoji（按 id 决定）────────────────
function randomEmoji() {
    const emojis = ["🌸", "🎀", "🧸", "🫖", "✨", "💗"];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// ── escapeHtml（防止XSS）──────────────────
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ── 页面加载时读取评论 ──────────────────────
document.addEventListener("DOMContentLoaded", loadComments);
