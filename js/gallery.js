let allCards = [];
let activeFilter = "all";

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
  renderGrid();
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

  grid.innerHTML = list.map((card, i) => cardHTML(card, i)).join("");
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
