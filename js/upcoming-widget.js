// Small "Upcoming events" widget shown on the index dashboard.

async function loadUpcomingWidget() {
  const wrap = document.getElementById("upcoming-widget");
  if (!wrap) return;
  if (typeof SUPABASE_URL === "undefined" || SUPABASE_URL.includes("YOUR-PROJECT-REF")) {
    wrap.innerHTML = "";
    return;
  }

  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("status", "upcoming")
    .order("event_date", { ascending: true })
    .limit(3);

  if (error) {
    wrap.innerHTML = `<div class="empty-state"><h3>Couldn't load events</h3><p>${escapeHtml(error.message)}</p></div>`;
    return;
  }

  const events = data || [];
  if (!events.length) {
    wrap.innerHTML = `<div class="empty-state">
      <h3>Nothing on the calendar yet</h3>
      <p>Mods can add the next event from the Events page.</p>
      <a class="btn btn-primary" href="events.html">Go to events</a>
    </div>`;
    return;
  }

  wrap.innerHTML = events
    .map(
      (ev) => `
    <a class="upcoming-widget-item" href="events.html">
      <div class="ev-info">
        <h4>${escapeHtml(ev.title)}</h4>
        <div class="ev-when">${formatEventDate(ev.event_date)}${ev.event_time ? " · " + formatEventTime(ev.event_time) : ""}</div>
      </div>
      <span class="event-status upcoming">Upcoming</span>
    </a>`
    )
    .join("");
}

loadUpcomingWidget();
