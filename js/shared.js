// Shared helpers used by index.html, profile.html and add.html

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

function cardHTML(card, index) {
  const color = card.color || "#8f7ff2";
  const avatar = card.avatar_url || fallbackAvatar(card.display_name);
  return `
    <a class="card" href="profile.html?id=${card.id}" style="--card-color:${color}; animation-delay:${Math.min(index * 0.05, 0.6)}s">
      <span class="card-role ${card.role}">${roleLabel(card.role)}</span>
      <img class="card-avatar" src="${avatar}" alt="${escapeHtml(card.display_name)}'s avatar" loading="lazy">
      <div class="card-name">${escapeHtml(card.display_name)}</div>
      <div class="card-pronouns">${escapeHtml(card.pronouns || "")}</div>
      ${cardStatsHTML(card)}
    </a>`;
}
