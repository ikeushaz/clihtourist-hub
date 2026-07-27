warnIfUnconfigured();

const form = document.getElementById("card-form");
const msg = document.getElementById("form-msg");
const submitBtn = document.getElementById("submit-btn");
let selectedFile = null;

// --- role & archetype pickers (each .role-picker group manages its own selection) ---
document.querySelectorAll(".role-option").forEach((opt) => {
  opt.addEventListener("click", () => {
    const group = opt.closest(".role-picker");
    group.querySelectorAll(".role-option").forEach((o) => o.classList.remove("selected"));
    opt.classList.add("selected");
    opt.querySelector("input").checked = true;
  });
});

// --- color swatches ---
const presetColors = ["#8f7ff2", "#62e0b4", "#ffc861", "#ff8fae", "#5ec8f2", "#ff9f5e"];
const swatchRow = document.getElementById("swatches");
const colorInput = document.getElementById("color-input");
presetColors.forEach((color, i) => {
  const s = document.createElement("button");
  s.type = "button";
  s.className = "swatch" + (i === 0 ? " selected" : "");
  s.style.background = color;
  s.addEventListener("click", () => {
    colorInput.value = color;
    document.querySelectorAll(".swatch").forEach((el) => el.classList.remove("selected"));
    s.classList.add("selected");
  });
  swatchRow.appendChild(s);
});
colorInput.addEventListener("input", () => {
  document.querySelectorAll(".swatch").forEach((el) => el.classList.remove("selected"));
});

// --- sliders ---
["activeness", "gaming", "gayness"].forEach((key) => {
  const slider = document.getElementById(`slider-${key}`);
  const out = document.getElementById(`out-${key}`);
  slider.addEventListener("input", () => (out.textContent = slider.value + "%"));
});

// --- avatar preview ---
const avatarInput = document.getElementById("avatar-input");
const avatarPreview = document.getElementById("avatar-preview");
const avatarDropText = document.getElementById("avatar-drop-text");
avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showMsg("That image is over 5MB — try a smaller one.", "error");
    avatarInput.value = "";
    return;
  }
  selectedFile = file;
  avatarPreview.src = URL.createObjectURL(file);
  avatarPreview.style.display = "block";
  avatarDropText.textContent = file.name;
});

function showMsg(text, type) {
  msg.textContent = text;
  msg.className = `form-msg show ${type}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "form-msg";

  const displayName = document.getElementById("display-name").value.trim();
  const discordUsername = document.getElementById("discord-username").value.trim();
  const pronouns = document.getElementById("pronouns").value.trim();
  const lore = document.getElementById("lore").value.trim();
  const role = form.querySelector('input[name="role"]:checked')?.value || "member";
  const archetype = form.querySelector('input[name="archetype"]:checked')?.value || "soldier";
  const color = colorInput.value;
  const statActiveness = document.getElementById("slider-activeness").value;
  const statGaming = document.getElementById("slider-gaming").value;
  const statGayness = document.getElementById("slider-gayness").value;

  if (!displayName || !discordUsername) {
    showMsg("Display name and Discord username are required.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span> Adding you to the roster…`;

  try {
    let avatarUrl = null;

    if (selectedFile) {
      const ext = selectedFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabaseClient.storage.from("avatars").upload(path, selectedFile);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabaseClient.storage.from("avatars").getPublicUrl(path);
      avatarUrl = publicUrlData.publicUrl;
    }

    const { data: inserted, error: insertError } = await supabaseClient
      .from("cards")
      .insert({
        display_name: displayName,
        discord_username: discordUsername,
        pronouns,
        lore,
        role,
        archetype,
        color,
        avatar_url: avatarUrl,
        stat_activeness: Number(statActiveness),
        stat_gaming: Number(statGaming),
        stat_gayness: Number(statGayness),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    showMsg("You're on the roster! Redirecting to your card…", "success");
    setTimeout(() => (window.location.href = `profile.html?id=${inserted.id}`), 1200);
  } catch (err) {
    showMsg(err.message || "Something went wrong — try again.", "error");
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Add my card";
  }
});
