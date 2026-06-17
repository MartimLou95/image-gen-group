// STYLE_PROMPTS is a variable that collects instructions for ChatGPT-image-1 depending on the user choice.
const STYLE_PROMPTS = {
  ghibli:
    "Transform this photo in the style of a cinematic Japanese anime film.",
  anime: "Transform this photo in a Japanese animated TV show style.",
  disney: "Transform this photo in a classic 1990s animation style.",
  cyberpunk: "Transform this photo in a neon cyberpunk style.",
  oil_painting: "Transform this photo in a classical oil painting by Turner.",
  pixel_art:
    "Transform this photo in a retro, highly detailed pixel art style.",
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

    // We wrap the rest in "try" so that if anything breaks, we send back a tidy
    // error instead of the whole backend crashing. "catch" is the safety net.
    try {
      // STEP 2: Read the photo and the chosen style out of the request.
      const formData = await request.formData();
      const photo = formData.get("image");
      const style = formData.get("style");

      // STEP 3: Look up the AI instruction for that style.
      const prompt = STYLE_PROMPTS[style];

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

      // STEP 8: If OpenAI was unhappy, pass a clear error back to the webpage.
      if (openaiResponse.ok === false) {
        const errorReply = JSON.stringify({
          error: "OpenAI could not process this image.",
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
