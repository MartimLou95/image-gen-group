// The address of our backend. For now it's the local test server (wrangler dev).
// When we deploy, we'll swap this for the live Worker address.
const BACKEND_URL = "http://localhost:8787";

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
