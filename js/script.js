// The address of our live backend (the deployed Cloudflare Worker).
// This runs in the cloud 24/7 — no terminal needed on your Mac.
const BACKEND_URL = "https://style-my-photo-proxy.martimlou.workers.dev";

// Preview uploaded image before generation.
const imageUpload = document.getElementById("imageUpload");
const previewImage = document.getElementById("previewImage");
const previewText = document.getElementById("previewText");

imageUpload.addEventListener("change", function () {
  const file = imageUpload.files[0];

  if (!file) {
    previewImage.style.display = "none";
    previewText.textContent = "No photo selected yet.";
    return;
  }

  if (!file.type.startsWith("image/")) {
    previewImage.style.display = "none";
    previewText.textContent = "Please choose an image file.";
    return;
  }

  previewImage.src = URL.createObjectURL(file);
  previewImage.style.display = "block";
  previewText.textContent = "";
});

// This runs when the user clicks the "Generate AI Art" button.
async function convertImage() {
  const status = document.getElementById("status");
  const resultImage = document.getElementById("resultImage");
  const convertBtn = document.querySelector(".convert-btn");
  const downloadBtn = document.getElementById("downloadBtn");

  const photo = document.getElementById("imageUpload").files[0];
  const style = document.getElementById("artStyle").value;

  if (!photo) {
    status.textContent = "Please choose a photo first.";
    return;
  }

  if (!photo.type.startsWith("image/")) {
    status.textContent = "That file is not an image. Please choose a photo.";
    return;
  }

  const maxSizeMB = 20;
  if (photo.size > maxSizeMB * 1024 * 1024) {
    status.textContent = "That image is too big. Please choose one under 20 MB.";
    return;
  }

  convertBtn.disabled = true;
  convertBtn.textContent = "🎨 Generating...";

  if (downloadBtn) {
    downloadBtn.hidden = true;
  }

  status.textContent = "Creating your artwork... this can take up to a minute.";
  resultImage.style.display = "none";

  const formData = new FormData();
  formData.append("image", photo);
  formData.append("style", style);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.error) {
      convertBtn.disabled = false;
      convertBtn.textContent = "Generate AI Art";

      status.textContent = "Error: " + result.error;
      return;
    }

    resultImage.src = result.image;
    resultImage.style.display = "block";

    if (downloadBtn) {
      downloadBtn.href = result.image;
      downloadBtn.hidden = false;
    }

    convertBtn.disabled = false;
    convertBtn.textContent = "Generate AI Art";

    status.textContent = "Done! Your styled image is ready.";
  } catch (error) {
    convertBtn.disabled = false;
    convertBtn.textContent = "Generate AI Art";

    status.textContent = "Could not reach the backend. Is it running?";
  }
}