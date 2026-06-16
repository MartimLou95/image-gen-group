// Person A owns this. The proxy: it holds the secret key so the website never sees it.
//
// The browser POSTs FormData { image, style } here.
// This worker calls OpenAI with the SHARED key, then returns { image: "data:..." }.
// The key lives in a Cloudflare *secret* (env.OPENAI_API_KEY), never in this file.

// Map a style word -> the instruction sent to OpenAI. Tweak these to taste.
const PROMPTS = {
  anime: "Redraw this photo as a Studio Ghibli style anime illustration.",
  pixar: "Redraw this photo as a 3D Pixar style animated character.",
  poster: "Reimagine this photo as a dramatic movie poster.",
  watercolour: "Repaint this photo as a soft watercolour painting.",
};

// CORS: lets your GitHub Pages site call this worker from the browser.
const CORS = {
  "Access-Control-Allow-Origin": "*", // ponytail: "*" is fine for a class demo; lock to your Pages URL if you want
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // Browsers send a pre-flight OPTIONS request first — answer it.
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (request.method !== "POST") {
      return json({ error: "Use POST" }, 405);
    }

    try {
      const form = await request.formData();
      const image = form.get("image");
      const style = form.get("style");
      const prompt = PROMPTS[style];

      if (!image || !prompt) return json({ error: "Missing image or unknown style" }, 400);

      // TODO (A): call OpenAI's images/edits endpoint.
      // Verify the exact current request shape against OpenAI's live docs first.
      // Rough shape:
      //
      //   const openaiForm = new FormData();
      //   openaiForm.append("model", "gpt-image-1");
      //   openaiForm.append("image", image);
      //   openaiForm.append("prompt", prompt);
      //
      //   const res = await fetch("https://api.openai.com/v1/images/edits", {
      //     method: "POST",
      //     headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      //     body: openaiForm,
      //   });
      //   const data = await res.json();
      //   if (!res.ok) return json({ error: data.error?.message || "OpenAI error" }, 502);
      //   const b64 = data.data[0].b64_json;
      //   return json({ image: `data:image/png;base64,${b64}` });

      return json({ error: "Not implemented yet — A still has to wire OpenAI." }, 501);
    } catch (err) {
      return json({ error: "Proxy crashed: " + err.message }, 500);
    }
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}
