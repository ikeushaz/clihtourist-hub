let allCards = [];
let activeFilter = "all";
let eventCounts = {};

const roleOrder = { owner: 0, mod: 1, member: 2 };

async function loadCards() {
  const grid = document.getElementById("grid");
  if (warnIfUnconfigured()) {
    grid.innerHTML = `<div class="empty-state"><h3>Roster not connected yet</h3>
      <p>Add your Supabase keys to js/supabase-config.js to see the crew here.</p></div>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from("cards")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    grid.innerHTML = `<div class="empty-state"><h3>Couldn't load the roster</h3><p>${escapeHtml(error.message)}</p></div>`;
    return;
  }

  allCards = (data || []).sort((a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3));
  document.getElementById("roster-count").textContent = `${allCards.length} member${allCards.length === 1 ? "" : "s"}`;

  await loadEventCounts();
  renderGrid();
}

async function loadEventCounts() {
  const { data, error } = await supabaseClient.from("event_participants").select("card_id");
  if (error || !data) return;
  eventCounts = {};
  data.forEach((row) => {
    eventCounts[row.card_id] = (eventCounts[row.card_id] || 0) + 1;
  });
}

function renderGrid() {
  const grid = document.getElementById("grid");
  const list = activeFilter === "all" ? allCards : allCards.filter((c) => c.role === activeFilter);

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <h3>No one here yet</h3>
      <p>Be the first to join the roster.</p>
      <a class="btn btn-primary" href="add.html">+ Add your card</a>
    </div>`;
    return;
  }

  const addCard = activeFilter === "all" ? `
  <a href="add.html" class="card add-card">
    <div class="add-card-content">
      <div class="add-icon">➕</div>
      <h3>Add Your Character</h3>
      <p>Create your profile and join the crew!</p>
    </div>
  </a>
  ` : "";

  grid.innerHTML =
    addCard +
    list.map((card, i) => cardHTML(card, i, eventCounts[card.id])).join("");
}

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.role;
    renderGrid();
  });
});

loadCards();
