async function loadProfile() {
  const wrap = document.getElementById("profile-content");
  if (warnIfUnconfigured()) return;

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    wrap.innerHTML = `<div class="empty-state"><h3>No member specified</h3><p>Go back to the roster and pick a card.</p></div>`;
    return;
  }

  const { data: card, error } = await supabaseClient.from("cards").select("*").eq("id", id).single();

  if (error || !card) {
    wrap.innerHTML = `<div class="empty-state"><h3>This member couldn't be found</h3><p>They may have been removed, or the link is off.</p></div>`;
    return;
  }

  document.title = `${card.display_name} · Friend Hub`;

  const color = card.color || "#8f7ff2";

  const { data: participations } = await supabaseClient
    .from("event_participants")
    .select("events(id, title, event_date)")
    .eq("card_id", id);

  const joinedEvents = (participations || [])
    .map((p) => p.events)
    .filter(Boolean)
    .sort((a, b) => (a.event_date < b.event_date ? 1 : -1));

  wrap.innerHTML = `
    <div class="profile-hero" style="--card-color:${color}">
      <div class="profile-top">
        <div class="doll-wrap large">${dollSVG(card, 150)}</div>
        <div class="profile-id">
          <h1>${escapeHtml(card.display_name)} <span class="card-role ${card.role}">${roleLabel(card.role)}</span></h1>
          <div class="profile-pronouns">${escapeHtml(card.pronouns || "")}</div>
          <div class="profile-username mono">@${escapeHtml(card.discord_username)}</div>
        </div>
      </div>

      <div class="profile-body">
        <div class="panel">
          <h3>Lore</h3>
          <p class="lore-text">${escapeHtml(card.lore || "This member is a person of mystery — no lore added yet.")}</p>
        </div>

        <div class="panel">
          <h3>Stats</h3>
          <div class="big-stats">
            ${bigStat("🟢 Server activeness", card.stat_activeness, "activeness")}
            ${bigStat("🎮 Gaming skills", card.stat_gaming, "gaming")}
            ${bigStat("🏳️‍🌈 Gayness", card.stat_gayness, "gayness")}
          </div>
        </div>

        <div class="panel" style="grid-column: 1 / -1;">
          <h3>Events${joinedEvents.length ? ` — ${starsHTML(joinedEvents.length)}` : ""}</h3>
          ${eventsPanelHTML(joinedEvents)}
        </div>
      </div>
    </div>
  `;
}

function eventsPanelHTML(joinedEvents) {
  if (!joinedEvents.length) {
    return `<p class="lore-text" style="color:var(--text-faint);">Hasn't joined any events yet.</p>`;
  }
  return `
    <ul class="profile-event-list">
      ${joinedEvents
        .map(
          (ev) => `
        <li class="profile-event-item">
          <span class="profile-event-star">⭐</span>
          <a href="events.html">${escapeHtml(ev.title)}</a>
          <span class="profile-event-date mono">${formatEventDate(ev.event_date)}</span>
        </li>`
        )
        .join("")}
    </ul>`;
}

function bigStat(label, value, cls) {
  return `
    <div class="big-stat">
      <div class="stat-top"><span>${label}</span><output class="stat-value">${value}%</output></div>
      <div class="stat-track"><div class="stat-fill ${cls}" style="width:${value}%"></div></div>
    </div>`;
}

loadProfile();
