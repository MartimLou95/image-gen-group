// STYLE_PROMPTS is a variable that collects instructions for ChatGPT-image-1 depending on the user choice.
const STYLE_PROMPTS = {
  ghibli:
    "Repaint this photo as a hand-drawn Studio Ghibli anime scene: soft watercolour backgrounds, warm natural light, gentle cel-shading, clean delicate linework, and lush painterly skies and foliage. Keep the original subject, pose, and composition.",
  anime:
    "Redraw this photo as a modern Japanese anime illustration: crisp clean linework, vibrant cel-shaded colours, expressive eyes, smooth gradients and soft highlights, and a polished studio finish. Preserve the subject's pose, framing, and likeness.",
  disney:
    "Restyle this photo as a polished 3D Disney/Pixar animated character: smooth rounded forms, soft subsurface skin shading, warm cinematic lighting, friendly expressive features, and rich saturated colour. Keep the original pose, composition, and recognisable likeness.",
  cyberpunk:
    "Transform this photo into a neon cyberpunk scene: moody night atmosphere, glowing magenta and cyan neon, rim-lit reflections, holographic signage, rain-slicked surfaces, and a high-contrast futuristic colour grade. Keep the subject's pose, composition, and likeness.",
  oil_painting:
    "Repaint this photo as a classical old-master oil painting: visible textured brushstrokes, rich layered colour, warm chiaroscuro lighting, and real canvas texture. Preserve the subject's pose, composition, and likeness.",
  pixel_art:
    "Recreate this photo as detailed retro pixel art: a limited 16-bit colour palette, crisp aligned pixels, clean dithering for shading, and bold readable shapes like a classic video-game sprite. Keep the subject's pose and composition recognisable.",
};

// Headers we attach to every reply we send back.
// The "Access-Control" ones let our webpage call this backend.
const RESPONSE_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// This runs every time our webpage sends a request to the backend.
export default {
  async fetch(request, env) {
    // STEP 1: The browser first sends an "everything working?" check.
    // We just answer "yes" with our permission headers.
    if (request.method === "OPTIONS") {
      return new Response("", { headers: RESPONSE_HEADERS });
    }

    // Only allow POST. A GET or anything else is rejected.
    if (request.method !== "POST") {
      const errorReply = JSON.stringify({ error: "Please use POST." });
      return new Response(errorReply, { status: 405, headers: RESPONSE_HEADERS });
    }

    // We wrap the rest in "try" so that if anything breaks, we send back a tidy
    // error instead of the whole backend crashing. "catch" is the safety net.
    try {
      // STEP 2: Read the photo and the chosen style out of the request.
      const formData = await request.formData();
      const photo = formData.get("image");
      const style = formData.get("style");

      // STEP 2b: Read the optional style the user typed in.
      const customStyle = formData.get("customStyle");

      // STEP 3: Decide the AI instruction. Use the typed style if there is one,
      // otherwise look up the instruction for the chosen dropdown style.
      let prompt;
      if (customStyle && customStyle.trim() !== "") {
        prompt = "Transform this photo in the following style: " + customStyle;
      } else {
        prompt = STYLE_PROMPTS[style];
      }

      // STEP 4: If the photo or the style is missing, stop and say so.
      if (!photo || !prompt) {
        const errorReply = JSON.stringify({
          error: "Missing photo or unknown style.",
        });
        return new Response(errorReply, {
          status: 400,
          headers: RESPONSE_HEADERS,
        });
      }

      // STEP 4b: Reject non-image or oversized files before calling OpenAI.
      // This protects our API spend, since anyone could call this Worker directly.
      const maxSizeMB = 26;
      if (!photo.type || !photo.type.startsWith("image/")) {
        const errorReply = JSON.stringify({
          error: "Uploaded file is not an image.",
        });
        return new Response(errorReply, {
          status: 400,
          headers: RESPONSE_HEADERS,
        });
      }
      if (photo.size > maxSizeMB * 1024 * 1024) {
        const errorReply = JSON.stringify({
          error: "Image is too large (max 26 MB).",
        });
        return new Response(errorReply, {
          status: 400,
          headers: RESPONSE_HEADERS,
        });
      }

      // STEP 5: Build the package we send to OpenAI: the model, the photo, the prompt.
      const openaiData = new FormData();
      openaiData.append("model", "gpt-image-1");
      openaiData.append("image", photo);
      openaiData.append("prompt", prompt);

      // STEP 6: Send it to OpenAI. The key comes from the secret locker (env), not typed here.
      const openaiResponse = await fetch(
        "https://api.openai.com/v1/images/edits",
        {
          method: "POST",
          headers: { Authorization: "Bearer " + env.OPENAI_API_KEY },
          body: openaiData,
        },
      );

      // STEP 7: Read OpenAI's answer.
      const result = await openaiResponse.json();

      // STEP 8: If OpenAI was unhappy, pass its actual reason back to the webpage.
      if (openaiResponse.ok === false) {
        const reason = result.error ? result.error.message : "Unknown error";
        const errorReply = JSON.stringify({
          error: "OpenAI rejected the request: " + reason,
        });
        return new Response(errorReply, {
          status: 502,
          headers: RESPONSE_HEADERS,
        });
      }

      // STEP 9: OpenAI returns the new image as text (base64). We wrap it so an
      // <img> tag on the webpage can show it directly.
      const base64Image = result.data[0].b64_json;
      const imageReply = JSON.stringify({
        image: "data:image/png;base64," + base64Image,
      });
      return new Response(imageReply, { headers: RESPONSE_HEADERS });
    } catch (error) {
      // The safety net: any unexpected break ends up here.
      const errorReply = JSON.stringify({
        error: "Something went wrong on the backend.",
      });
      return new Response(errorReply, {
        status: 500,
        headers: RESPONSE_HEADERS,
      });
    }
  },
};
