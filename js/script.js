// The address of our live backend (the deployed Cloudflare Worker).
// This runs in the cloud 24/7 — no terminal needed on your Mac.
const BACKEND_URL = "https://style-my-photo-proxy.martimlou.workers.dev";

// Elements for the live upload preview (shown before generating).
const imageUpload = document.getElementById("imageUpload");
const previewImage = document.getElementById("previewImage");
const previewText = document.getElementById("previewText");

// When the user picks a file, show a preview of it straight away.
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
  document.getElementById("originalCard").hidden = false;
});

// Runs when the user clicks the "Generate AI Art" button.
async function convertImage() {
  const status = document.getElementById("status");
  const resultImage = document.getElementById("resultImage");
  const convertBtn = document.querySelector(".convert-btn");
  const downloadBtn = document.getElementById("downloadBtn");
  const resultCard = document.getElementById("resultCard");
  const originalCard = document.getElementById("originalCard");
  const compareBox = document.getElementById("compareBox");
  const compareOriginal = document.getElementById("compareOriginal");
  const compareResult = document.getElementById("compareResult");
  const compareSlider = document.getElementById("compareSlider");

  // Get the photo, the dropdown style, and any typed style.
  const photo = document.getElementById("imageUpload").files[0];
  const style = document.getElementById("artStyle").value;
  const customStyle = document.getElementById("customStyle").value;

  // Validate that a photo was selected.
  if (!photo) {
    status.textContent = "Please choose a photo first.";
    return;
  }

  // Validate that the file is actually an image.
  if (!photo.type.startsWith("image/")) {
    status.textContent = "That file is not an image. Please choose a photo.";
    return;
  }

  // Check the image is not too large (max 20 MB).
  const maxSizeMB = 26;
  if (photo.size > maxSizeMB * 1024 * 1024) {
    status.textContent =
      "That image is too big. Please choose one under 26 MB.";
    return;
  }

  // Disable the button and show a loading state so it can't be clicked twice.
  convertBtn.disabled = true;
  convertBtn.textContent = "Generating...";
  if (downloadBtn) {
    downloadBtn.hidden = true;
  }
  originalCard.hidden = false;
  resultCard.hidden = true;
  compareBox.hidden = true;
  compareSlider.hidden = true;
  status.textContent = "Creating your artwork... this can take up to a minute.";
  resultImage.style.display = "none";

  // Normalise the photo to a clean PNG so OpenAI reliably accepts it.
  const pngBlob = await imageToPng(photo);

  // Put the photo, the dropdown style, and the typed style into a package.
  const formData = new FormData();
  formData.append("image", pngBlob, "upload.png");
  formData.append("style", style);
  formData.append("customStyle", customStyle);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    // If the backend sent back an error, show it and re-enable the button.
    if (result.error) {
      status.textContent = "Error: " + result.error;
      convertBtn.disabled = false;
      convertBtn.textContent = "Generate AI Art";
      return;
    }

    // Success! Hide the original card and reveal the styled result.
    originalCard.hidden = true;
    resultCard.hidden = false;
    resultImage.src = result.image;
    resultImage.style.display = "block";

    // Enable the download button so the user can save their artwork.
    if (downloadBtn) {
      downloadBtn.href = result.image;
      downloadBtn.hidden = false;
    }

    // Show the before/after slider now that the result has arrived.
    compareOriginal.src = URL.createObjectURL(photo);
    compareResult.src = result.image;
    compareResult.style.clipPath = "inset(0 50% 0 0)";
    compareSlider.value = 50;
    compareBox.hidden = false;
    compareSlider.hidden = false;

    status.textContent = "Done! Your styled image is ready.";
    convertBtn.disabled = false;
    convertBtn.textContent = "Generate AI Art";
  } catch (error) {
    status.textContent = "Could not reach the backend. Is it running?";
    convertBtn.disabled = false;
    convertBtn.textContent = "Generate AI Art";
  }
}

// Convert any uploaded image into a clean PNG. Re-drawing the photo on a canvas
// strips odd colour profiles and metadata that can make OpenAI reject the file.
function imageToPng(file) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = function () {
      // Shrink very large photos to 1536px max (the model's largest dimension).
      const maxDim = 1536;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob(function (blob) {
        resolve(blob);
      }, "image/png");
    };
    img.src = URL.createObjectURL(file);
  });
}

// Before/after slider: drag to wipe the styled result away and reveal the original.
document
  .getElementById("compareSlider")
  .addEventListener("input", function (event) {
    const value = event.target.value;
    document.getElementById("compareResult").style.clipPath =
      "inset(0 " + (100 - value) + "% 0 0)";
  });
