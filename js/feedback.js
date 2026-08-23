const feedbackForm = document.getElementById("feedback-form");
const feedbackInput = document.getElementById("feedback-input");
const feedbackList = document.getElementById("feedback-list");
const feedbackCount = document.getElementById("feedback-count");
const feedbackTotal = document.getElementById("feedback-total");


// Character counter
feedbackInput.addEventListener("input", () => {
  const length = feedbackInput.value.length;

  feedbackCount.textContent = `${length} / 500`;

  // Visual warning when approaching the limit
  if (length >= 450) {
    feedbackCount.classList.add("near-limit");
  } else {
    feedbackCount.classList.remove("near-limit");
  }
});


// Format date
function formatFeedbackDate(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).toUpperCase();
}


// Format time
function formatFeedbackTime(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}


// Load feedback
async function loadFeedback() {

  const { data, error } = await supabaseClient
    .from("server_feedback")
    .select("id, message, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {

    console.error("Failed to load feedback:", error);

    feedbackTotal.textContent = "ERROR";

    feedbackList.innerHTML = `
      <div class="feedback-empty">
        <div class="feedback-empty-icon">⚠</div>
        <strong>COULDN'T LOAD FEEDBACK</strong>
        <span>Something went wrong. Try refreshing the page.</span>
      </div>
    `;

    return;
  }


  // Update total
  feedbackTotal.textContent =
    `${data.length} ${data.length === 1 ? "ENTRY" : "ENTRIES"}`;


  // Empty state
  if (!data || data.length === 0) {

    feedbackList.innerHTML = `
      <div class="feedback-empty">
        <div class="feedback-empty-icon">💬</div>
        <strong>NO FEEDBACK YET WOMP WOMP</strong>
        <span>Be the first person to leave a comment!</span>
      </div>
    `;

    return;
  }


  // Create feedback cards
  feedbackList.innerHTML = data.map((item, index) => {

    const isNewest = index === 0;

    const date = formatFeedbackDate(item.created_at);
    const time = formatFeedbackTime(item.created_at);

    const feedbackNumber = String(data.length - index).padStart(3, "0");

    return `
      <article class="feedback-card ${isNewest ? "feedback-newest" : ""}">

        <div class="feedback-card-top">

          <div class="feedback-id">
            FEEDBACK #${feedbackNumber}
          </div>

          ${isNewest
            ? `<span class="feedback-new-badge">NEW</span>`
            : ""
          }

        </div>


        <div class="feedback-card-author">
          <span class="feedback-avatar">?</span>

          <div>
            <strong>ANONYMOUS USER</strong>
            <span>Community Feedback</span>
          </div>
        </div>


        <div class="feedback-message">
          ${escapeHTML(item.message)}
        </div>


        <div class="feedback-card-bottom">

          <span>
            ${date}
          </span>

          <span class="feedback-divider">·</span>

          <span>
            ${time}
          </span>

        </div>

      </article>
    `;

  }).join("");
}


// Submit feedback
feedbackForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const message = feedbackInput.value.trim();

  if (!message) return;


  const button = feedbackForm.querySelector("button");

  button.disabled = true;
  button.textContent = "SENDING...";


  try {

    const { error } = await supabaseClient
      .from("server_feedback")
      .insert([
        {
          message: message
        }
      ]);


    if (error) {

      console.error("Supabase error:", error);

      alert(`Couldn't send feedback:\n${error.message}`);

      return;
    }


    // Clear form
    feedbackInput.value = "";
    feedbackCount.textContent = "0 / 500";
    feedbackCount.classList.remove("near-limit");


    // Reload history
    await loadFeedback();


  } catch (err) {

    console.error("Error:", err);

    alert(`Something went wrong:\n${err.message}`);

  } finally {

    button.disabled = false;
    button.textContent = "SEND";

  }

});


// Prevent HTML injection
function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// Initial load
loadFeedback();