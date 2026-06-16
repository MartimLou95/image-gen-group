// Person B owns this file. The glue between the page and convertImage().
// This is the wiring; the TODOs are where you write the real behaviour.

// Grab the elements from the contract once, up top.
const imageInput = document.getElementById("image-input");
const previewImg = document.getElementById("preview-img");
const styleButtons = document.querySelectorAll(".style-btn");
const convertBtn = document.getElementById("convert-btn");
const resultImg = document.getElementById("result-img");
const statusEl = document.getElementById("status");

// Shared helper so everyone writes messages the same way.
function showStatus(message) {
  statusEl.textContent = message;
}

// Remember which style the user picked.
let selectedStyle = null;

// --- Style button selection ---
styleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedStyle = btn.dataset.style;
    // TODO (B): mark this button as selected (add .selected, remove it from the others)
  });
});

// --- Show a preview when a photo is chosen ---
imageInput.addEventListener("change", () => {
  // TODO (B): take imageInput.files[0], show it in #preview-img (URL.createObjectURL),
  // and unhide the preview (previewImg.hidden = false).
});

// --- Convert button: the main flow ---
convertBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];

  // C's guard runs first.
  if (!isValidImage(file)) return;

  if (!selectedStyle) {
    showStatus("Pick a style first.");
    return;
  }

  try {
    showStatus("Loading...");
    const imageUrl = await convertImage(file, selectedStyle); // A's engine (mock for now)
    resultImg.src = imageUrl;
    resultImg.hidden = false;
    showStatus("Done!");
  } catch (err) {
    // TODO (C): friendlier error message here
    showStatus("Something went wrong. Try again.");
  }
});
