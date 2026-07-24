// Powers events.html — upcoming events, history, create-event + log-event modals.

let allCardsForLog = [];
let currentLogEvent = null;

async function init() {
  if (warnIfUnconfigured()) {
    document.getElementById("upcoming-list").innerHTML = `<div class="empty-state"><h3>Events aren't connected yet</h3>
      <p>Add your Supabase keys to js/supabase-config.js to see events here.</p></div>`;
    document.getElementById("history-list").innerHTML = "";
    document.getElementById("upcoming-count").textContent = "—";
    document.getElementById("history-count").textContent = "—";
    return;
  }
  await loadEvents();
}

async function loadEvents() {
  const upcomingWrap = document.getElementById("upcoming-list");
  const historyWrap = document.getElementById("history-list");

  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    upcomingWrap.innerHTML = `<div class="empty-state"><h3>Couldn't load events</h3><p>${escapeHtml(error.message)}</p></div>`;
    historyWrap.innerHTML = "";
    return;
  }

  const events = data || [];
  const upcoming = events.filter((e) => e.status === "upcoming");
  const history = events
    .filter((e) => e.status === "logged")
    .sort((a, b) => (a.event_date < b.event_date ? 1 : -1));

  document.getElementById("upcoming-count").textContent = `${upcoming.length} event${upcoming.length === 1 ? "" : "s"}`;
  document.getElementById("history-count").textContent = `${history.length} event${history.length === 1 ? "" : "s"}`;

  // participants for the events we're about to render (mainly history, but harmless for upcoming too)
  const eventIds = events.map((e) => e.id);
  let participantsByEvent = {};
  if (eventIds.length) {
    const { data: parts } = await supabaseClient
      .from("event_participants")
      .select("event_id, cards(id, display_name, avatar_url)")
      .in("event_id", eventIds);
    (parts || []).forEach((row) => {
      if (!row.cards) return;
      if (!participantsByEvent[row.event_id]) participantsByEvent[row.event_id] = [];
      participantsByEvent[row.event_id].push(row.cards);
    });
  }

  upcomingWrap.innerHTML = upcoming.length
    ? upcoming.map((ev) => eventCardHTML(ev, participantsByEvent[ev.id] || [], true)).join("")
    : `<div class="empty-state"><h3>Nothing on the calendar</h3><p>Mods can create the next event with the button above.</p></div>`;

  historyWrap.innerHTML = history.length
    ? history.map((ev) => eventCardHTML(ev, participantsByEvent[ev.id] || [], false)).join("")
    : `<div class="empty-state"><h3>No events logged yet</h3><p>Once an upcoming event is logged, it'll show up here.</p></div>`;

  document.querySelectorAll("[data-log-event]").forEach((btn) => {
    btn.addEventListener("click", () => openLogModal(btn.dataset.logEvent, btn.dataset.logTitle));
  });
}

function eventCardHTML(ev, participants, showLogButton) {
  const date = new Date(ev.event_date + "T00:00:00");
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  return `
    <div class="event-card">
      <div class="event-date-badge">
        <span class="ev-month">${month}</span>
        <span class="ev-day">${day}</span>
        <span class="ev-year">${year}</span>
      </div>
      <div class="event-body">
        <div class="event-title-row">
          <h3>${escapeHtml(ev.title)}</h3>
          <span class="event-status ${ev.status}">${ev.status === "logged" ? "Logged" : "Upcoming"}</span>
          ${ev.event_time ? `<span class="event-time">${formatEventTime(ev.event_time)}</span>` : ""}
        </div>
        ${ev.description ? `<p class="event-desc">${escapeHtml(ev.description)}</p>` : ""}
        ${
          participants.length
            ? `<div class="event-participants">${participants
                .map(
                  (c) => `
              <a class="participant-chip" href="profile.html?id=${c.id}">
                <img src="${c.avatar_url || fallbackAvatar(c.display_name)}" alt="">
                <span>${escapeHtml(c.display_name)}</span>
              </a>`
                )
                .join("")}</div>`
            : ""
        }
        ${
          showLogButton
            ? `<div class="event-actions">
                <button class="btn btn-primary" data-log-event="${ev.id}" data-log-title="${escapeHtml(ev.title)}">Log this event</button>
              </div>`
            : ""
        }
      </div>
    </div>`;
}

// ---------------- Create event modal ----------------

const createModal = document.getElementById("create-modal");
const createMsg = document.getElementById("create-msg");

document.getElementById("create-event-btn").addEventListener("click", () => {
  createMsg.className = "form-msg";
  createModal.classList.add("open");
});
document.getElementById("create-cancel").addEventListener("click", () => createModal.classList.remove("open"));
createModal.addEventListener("click", (e) => {
  if (e.target === createModal) createModal.classList.remove("open");
});

document.getElementById("create-submit").addEventListener("click", async () => {
  const pw = document.getElementById("create-pw").value;
  const title = document.getElementById("ev-title").value.trim();
  const eventDate = document.getElementById("ev-date").value;
  const eventTime = document.getElementById("ev-time").value;
  const description = document.getElementById("ev-desc").value.trim();

  if (pw !== EVENTS_PASSWORD) {
    showFormMsg(createMsg, "Wrong password — only mods/admin can create events.", "error");
    return;
  }
  if (!title || !eventDate) {
    showFormMsg(createMsg, "Event title and date are required.", "error");
    return;
  }

  const btn = document.getElementById("create-submit");
  btn.disabled = true;
  btn.textContent = "Creating…";

  try {
    const { error } = await supabaseClient.from("events").insert({
      title,
      event_date: eventDate,
      event_time: eventTime || null,
      description: description || null,
      status: "upcoming",
    });
    if (error) throw error;

    showFormMsg(createMsg, "Event created!", "success");
    document.getElementById("ev-title").value = "";
    document.getElementById("ev-date").value = "";
    document.getElementById("ev-time").value = "";
    document.getElementById("ev-desc").value = "";
    document.getElementById("create-pw").value = "";
    await loadEvents();
    setTimeout(() => createModal.classList.remove("open"), 900);
  } catch (err) {
    showFormMsg(createMsg, err.message || "Something went wrong — try again.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Create event";
  }
});

// ---------------- Log event modal ----------------

const logModal = document.getElementById("log-modal");
const logMsg = document.getElementById("log-msg");

async function openLogModal(eventId, eventTitle) {
  currentLogEvent = eventId;
  logMsg.className = "form-msg";
  document.getElementById("log-event-title").textContent = eventTitle;
  document.getElementById("log-pw").value = "";

  const checklist = document.getElementById("member-checklist");
  checklist.innerHTML = `<div class="skeleton" style="height:60px;"></div>`;
  logModal.classList.add("open");

  if (!allCardsForLog.length) {
    const { data } = await supabaseClient.from("cards").select("id, display_name, avatar_url").order("display_name");
    allCardsForLog = data || [];
  }

  // pre-check anyone already logged for this event (in case of re-editing)
  const { data: existing } = await supabaseClient
    .from("event_participants")
    .select("card_id")
    .eq("event_id", eventId);
  const existingIds = new Set((existing || []).map((r) => r.card_id));

  if (!allCardsForLog.length) {
    checklist.innerHTML = `<p class="lore-text" style="color:var(--text-faint);">No members on the roster yet.</p>`;
    return;
  }

  checklist.innerHTML = allCardsForLog
    .map(
      (c) => `
    <label class="member-check-item">
      <input type="checkbox" value="${c.id}" ${existingIds.has(c.id) ? "checked" : ""}>
      <img src="${c.avatar_url || fallbackAvatar(c.display_name)}" alt="">
      <span>${escapeHtml(c.display_name)}</span>
    </label>`
    )
    .join("");
}

document.getElementById("log-cancel").addEventListener("click", () => logModal.classList.remove("open"));
logModal.addEventListener("click", (e) => {
  if (e.target === logModal) logModal.classList.remove("open");
});

document.getElementById("log-submit").addEventListener("click", async () => {
  const pw = document.getElementById("log-pw").value;
  if (pw !== EVENTS_PASSWORD) {
    showFormMsg(logMsg, "Wrong password — only mods/admin can log events.", "error");
    return;
  }
  if (!currentLogEvent) return;

  const checkedIds = Array.from(document.querySelectorAll("#member-checklist input:checked")).map((el) => el.value);

  const btn = document.getElementById("log-submit");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    // clear any existing participants for this event, then insert the current selection
    const { error: delError } = await supabaseClient.from("event_participants").delete().eq("event_id", currentLogEvent);
    if (delError) throw delError;

    if (checkedIds.length) {
      const rows = checkedIds.map((cardId) => ({ event_id: currentLogEvent, card_id: cardId }));
      const { error: insError } = await supabaseClient.from("event_participants").insert(rows);
      if (insError) throw insError;
    }

    const { error: updError } = await supabaseClient.from("events").update({ status: "logged" }).eq("id", currentLogEvent);
    if (updError) throw updError;

    showFormMsg(logMsg, "Event logged!", "success");
    await loadEvents();
    setTimeout(() => logModal.classList.remove("open"), 900);
  } catch (err) {
    showFormMsg(logMsg, err.message || "Something went wrong — try again.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save log";
  }
});

function showFormMsg(el, text, type) {
  el.textContent = text;
  el.className = `form-msg show ${type}`;
}

init();
