// The address of our live backend (the deployed Cloudflare Worker).
// This runs in the cloud 24/7 — no terminal needed on your Mac.
// We send image and style requests to this URL for processing.
const BACKEND_URL = "https://style-my-photo-proxy.martimlou.workers.dev";

// Get DOM elements for the upload area, image preview, and status text.
const imageUpload = document.getElementById("imageUpload");
const previewImage = document.getElementById("previewImage");
const previewText = document.getElementById("previewText");

// When user selects a file, show a preview of it.
imageUpload.addEventListener("change", function () {
  const file = imageUpload.files[0];

  // If no file selected, hide preview and show message.
  if (!file) {
    previewImage.style.display = "none";
    previewText.textContent = "No photo selected yet.";
    return;
  }

  // Validate that the selected file is actually an image.
  if (!file.type.startsWith("image/")) {
    previewImage.style.display = "none";
    previewText.textContent = "Please choose an image file.";
    return;
  }

  // Display the image preview and clear the status text.
  previewImage.src = URL.createObjectURL(file);
  previewImage.style.display = "block";
  previewText.textContent = "";
});

// Handle the image generation process when user clicks "Generate AI Art" button.
async function convertImage() {
  // Get references to UI elements we'll update during the process.
  const status = document.getElementById("status");
  const resultImage = document.getElementById("resultImage");
  const convertBtn = document.querySelector(".convert-btn");
  const downloadBtn = document.getElementById("downloadBtn");

  // Get the selected photo and art style from the form.
  const photo = document.getElementById("imageUpload").files[0];
  const style = document.getElementById("artStyle").value;

  // Validate that a photo was selected.
  if (!photo) {
    status.textContent = "Please choose a photo first.";
    return;
  }

  // Validate that the selected file is an image.
  if (!photo.type.startsWith("image/")) {
    status.textContent = "That file is not an image. Please choose a photo.";
    return;
  }

  // Check that the image file is not too large (max 20 MB).
  const maxSizeMB = 20;
  if (photo.size > maxSizeMB * 1024 * 1024) {
    status.textContent = "That image is too big. Please choose one under 20 MB.";
    return;
  }

  // Disable the button and show loading state to prevent duplicate submissions.
  convertBtn.disabled = true;
  convertBtn.textContent = "🎨 Generating...";

  // Hide the download button and result image while processing.
  if (downloadBtn) {
    downloadBtn.hidden = true;
  }

  // Update status message and hide previous result.
  status.textContent = "Creating your artwork... this can take up to a minute.";
  resultImage.style.display = "none";

  // Prepare the image and style to send to the backend.
  const formData = new FormData();
  formData.append("image", photo);
  formData.append("style", style);

  // Send the request to the backend and wait for the processed image.
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });

    // Parse the response from the backend.
    const result = await response.json();

    // If there was an error, show it and re-enable the button.
    if (result.error) {
      convertBtn.disabled = false;
      convertBtn.textContent = "Generate AI Art";

      status.textContent = "Error: " + result.error;
      return;
    }

    // Display the generated styled image.
    resultImage.src = result.image;
    resultImage.style.display = "block";

    // Enable the download button so user can save their artwork.
    if (downloadBtn) {
      downloadBtn.href = result.image;
      downloadBtn.hidden = false;
    }

    // Re-enable the convert button and show success message.
    convertBtn.disabled = false;
    convertBtn.textContent = "Generate AI Art";

    status.textContent = "Done! Your styled image is ready.";
  } catch (error) {
    // If the request fails (network error, backend down, etc.), show error message.
    convertBtn.disabled = false;
    convertBtn.textContent = "Generate AI Art";

    status.textContent = "Could not reach the backend. Is it running?";
  }
}