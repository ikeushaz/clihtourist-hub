// Shared helpers used by index.html, profile.html, add.html and events.html

// Shared "mod/admin" password gate for creating + logging events.
// NOTE: this is a soft, client-side gate, not real auth -- see supabase-schema.sql notes.
const EVENTS_PASSWORD = "ikeucantik";

function formatEventDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatEventTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const date = new Date(2000, 0, 1, h, m || 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function roleLabel(role) {
  return { owner: "Owner", mod: "Mod", member: "Member" }[role] || "Member";
}

function fallbackAvatar(name) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="#29213e"/>
      <text x="50%" y="55%" font-family="sans-serif" font-size="90" fill="#8f7ff2"
        text-anchor="middle" dominant-baseline="middle">${initial}</text>
    </svg>`);
}

// Warn on-page if someone forgot to fill in supabase-config.js, instead of failing silently
function warnIfUnconfigured() {
  if (typeof SUPABASE_URL === "undefined" || SUPABASE_URL.includes("YOUR-PROJECT-REF")) {
    const banner = document.createElement("div");
    banner.style.cssText =
      "position:fixed;bottom:16px;left:16px;right:16px;z-index:999;max-width:520px;margin:0 auto;" +
      "background:#3a1f2b;color:#ffb3c6;border:1px solid #ff8fae55;padding:14px 18px;border-radius:12px;" +
      "font-family:sans-serif;font-size:13.5px;line-height:1.5;box-shadow:0 10px 30px rgba(0,0,0,.4)";
    banner.innerHTML =
      "<strong>Setup needed:</strong> add your Supabase URL + anon key to <code>js/supabase-config.js</code> " +
      "to make the roster live. See README.md.";
    document.body.appendChild(banner);
    return true;
  }
  return false;
}

function cardStatsHTML(card) {
  return `
    <div class="card-stats">
      <div class="stat-row" title="Server activeness">
        <span class="stat-label">🟢</span>
        <div class="stat-track"><div class="stat-fill activeness" style="width:${card.stat_activeness}%"></div></div>
      </div>
      <div class="stat-row" title="Gaming skills">
        <span class="stat-label">🎮</span>
        <div class="stat-track"><div class="stat-fill gaming" style="width:${card.stat_gaming}%"></div></div>
      </div>
      <div class="stat-row" title="Gayness">
        <span class="stat-label">🏳️‍🌈</span>
        <div class="stat-track"><div class="stat-fill gayness" style="width:${card.stat_gayness}%"></div></div>
      </div>
    </div>`;
}

function dollSVG(card, size) {
  const color = card.color || "#8f7ff2";
  const avatar = card.avatar_url || fallbackAvatar(card.display_name);
  const clipId = `headclip-${card.id}`;
  const headPts = "25,12 33,12 33,4 67,4 67,12 75,12 75,46 67,46 67,54 33,54 33,46 25,46";
  return `
    <svg class="doll" viewBox="0 0 100 140" width="${size}" shape-rendering="crispEdges" role="img" aria-label="${escapeHtml(card.display_name)}'s character">
      <defs>
        <clipPath id="${clipId}"><polygon points="${headPts}" /></clipPath>
      </defs>
      <rect x="29" y="128" width="18" height="9" fill="#100c1c" />
      <rect x="53" y="128" width="18" height="9" fill="#100c1c" />
      <rect x="31" y="102" width="16" height="28" fill="#2a2140" />
      <rect x="53" y="102" width="16" height="28" fill="#2a2140" />
      <rect x="8" y="64" width="17" height="38" fill="${color}" stroke="#100c1c" stroke-width="3" />
      <rect x="75" y="64" width="17" height="38" fill="${color}" stroke="#100c1c" stroke-width="3" />
      <rect x="8" y="96" width="17" height="12" fill="#100c1c" />
      <rect x="75" y="96" width="17" height="12" fill="#100c1c" />
      <rect x="42" y="52" width="16" height="12" fill="${color}" />
      <rect x="25" y="60" width="50" height="44" fill="${color}" stroke="#100c1c" stroke-width="3" />
      <rect x="25" y="60" width="50" height="8" fill="#100c1c" opacity="0.25" />
      <image href="${avatar}" xlink:href="${avatar}" x="25" y="4" width="50" height="50" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />
      <polygon points="${headPts}" fill="none" stroke="#100c1c" stroke-width="3" stroke-linejoin="miter" />
    </svg>`;
}

function starsHTML(count) {
  if (!count) return "";
  return "⭐".repeat(count);
}

function cardHTML(card, index, eventCount) {
  const color = card.color || "#8f7ff2";
  const count = eventCount || 0;
  return `
    <a class="card" href="profile.html?id=${card.id}" style="--card-color:${color}; animation-delay:${Math.min(index * 0.05, 0.6)}s">
      <span class="card-role ${card.role}">${roleLabel(card.role)}</span>
      <div class="doll-wrap">${dollSVG(card, 96)}</div>
      <div class="card-name">${escapeHtml(card.display_name)}</div>
      <div class="card-pronouns">${escapeHtml(card.pronouns || "")}</div>
      ${cardStatsHTML(card)}
      ${count > 0 ? `<div class="card-events" title="${count} event${count === 1 ? "" : "s"} joined">${starsHTML(count)}</div>` : ""}
    </a>`;
}
