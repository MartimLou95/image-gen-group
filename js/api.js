// Person A owns this file. The "engine" that talks to the proxy.
//
// THE CONTRACT (what this function promises the rest of the team):
//   input:  a File (the photo) + a style word ("anime", "pixar", ...)
//   output: a string you can put straight into an <img src="...">
//
// It STARTS as a mock so B and C can build today without waiting for the proxy.
// When the Cloudflare Worker is live, A replaces the body with the real fetch.

async function convertImage(file, style) {
  // ponytail: mock until the proxy is live. Swap the body below for the real call.
  await new Promise((resolve) => setTimeout(resolve, 1000)); // pretend the network took 1s
  return "https://placehold.co/600x600?text=" + style;

  /* ---- REAL VERSION (A fills this in once the Worker is deployed) ----
  const WORKER_URL = "https://YOUR-WORKER.workers.dev";

  const form = new FormData();
  form.append("image", file);
  form.append("style", style);

  const res = await fetch(WORKER_URL, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Conversion failed");
  return data.image; // "data:image/png;base64,...." per the contract
  -------------------------------------------------------------------- */
}
