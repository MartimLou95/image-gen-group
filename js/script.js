// The address of our live backend (the deployed Cloudflare Worker).
// This runs in the cloud 24/7 — no terminal needed on your Mac.
const BACKEND_URL = "https://style-my-photo-proxy.martimlou.workers.dev";

// This runs when the user clicks the "Generate AI Art" button.
async function convertImage() {
  const status = document.getElementById("status");
  const resultImage = document.getElementById("resultImage");

  // Get the photo the user chose and the style they picked.
  const photo = document.getElementById("imageUpload").files[0];
  const style = document.getElementById("artStyle").value;

  // If they didn't choose a photo, tell them and stop.
  if (!photo) {
    status.textContent = "Please choose a photo first.";
    return;
  }

  // Make sure the file is actually an image.
  if (!photo.type.startsWith("image/")) {
    status.textContent = "That file is not an image. Please choose a photo.";
    return;
  }

  // Make sure the image is not too big (limit: 20 MB).
  const maxSizeMB = 20;
  if (photo.size > maxSizeMB * 1024 * 1024) {
    status.textContent = "That image is too big. Please choose one under 20 MB.";
    return;
  }

  // Show a loading message and hide any old result.
  status.textContent = "Generating your image... this can take up to a minute.";
  resultImage.style.display = "none";

  // Put the photo and style into a package to send to the backend.
  const formData = new FormData();
  formData.append("image", photo);
  formData.append("style", style);

  try {
    // Send it to the backend and wait for the reply.
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    // If the backend sent back an error, show it and stop.
    if (result.error) {
      status.textContent = "Error: " + result.error;
      return;
    }

    // Success! Show the image the backend sent back.
    resultImage.src = result.image;
    resultImage.style.display = "block";
    status.textContent = "Done!";
  } catch (error) {
    status.textContent = "Could not reach the backend. Is it running?";
  }
}
