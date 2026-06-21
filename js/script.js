// The address of our live backend (the deployed Cloudflare Worker).
// This runs in the cloud 24/7 — no terminal needed on your Mac.
const BACKEND_URL = "https://style-my-photo-proxy.martimlou.workers.dev";

// This runs when the user clicks the "Generate AI Art" button.
async function convertImage() {
  const status = document.getElementById("status");
  const spinner = document.getElementById("spinner");
  const resultImage = document.getElementById("resultImage");
  const originalImage = document.getElementById("originalImage");
  const compare = document.getElementById("compare");
  const compareSlider = document.getElementById("compareSlider");
  const downloadLink = document.getElementById("downloadLink");

  // Get the photo the user chose, the dropdown style, and any typed style.
  const photo = document.getElementById("imageUpload").files[0];
  const style = document.getElementById("artStyle").value;
  const customStyle = document.getElementById("customStyle").value;

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
    status.textContent =
      "That image is too big. Please choose one under 20 MB.";
    return;
  }

  // Show a loading message and spinner; hide any old result.
  status.textContent = "Generating your image... this can take up to a minute.";
  spinner.hidden = false;
  compare.hidden = true;
  compareSlider.hidden = true;
  downloadLink.hidden = true;

  // OpenAI's edit endpoint only accepts PNG, so convert the photo first.
  const pngBlob = await imageToPng(photo);

  // Put the photo, the dropdown style, and the typed style into a package.
  const formData = new FormData();
  formData.append("image", pngBlob, "upload.png");
  formData.append("style", style);
  formData.append("customStyle", customStyle);

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
      spinner.hidden = true;
      return;
    }

    // Success! Show the original and the result in the compare box.
    originalImage.src = URL.createObjectURL(photo);
    resultImage.src = result.image;
    resultImage.style.clipPath = "inset(0 0% 0 0)";
    compareSlider.value = 100;

    // Reveal the result, the slider, and the download link.
    compare.hidden = false;
    compareSlider.hidden = false;
    downloadLink.href = result.image;
    downloadLink.hidden = false;

    status.textContent = "Done!";
    spinner.hidden = true;
  } catch (error) {
    status.textContent = "Could not reach the backend. Is it running?";
    spinner.hidden = true;
  }
}

// Before/after slider: drag to wipe between the original and the result.
document
  .getElementById("compareSlider")
  .addEventListener("input", function (event) {
    const value = event.target.value;
    document.getElementById("resultImage").style.clipPath =
      "inset(0 " + (100 - value) + "% 0 0)";
  });

// Convert any uploaded image into a PNG, because OpenAI's edit endpoint
// only accepts PNG. We draw the photo onto a canvas and export it as PNG.
function imageToPng(file) {
  return new Promise(function (resolve) {
    const img = new Image();
    img.onload = function () {
      // Shrink very large photos to 1024px max (the result is 1024 anyway).
      const maxDim = 1024;
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
