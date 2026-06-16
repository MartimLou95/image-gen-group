// Person C owns this file. Guard the input before it ever reaches the API.
//
// Promise to the team: returns true if the file is OK to send, false if not.
// When it returns false, it should also have shown the user a friendly message.

function isValidImage(file) {
  // TODO (C): write the checks. Suggested rules:
  //   1. a file was actually chosen           -> if (!file) { ...message...; return false; }
  //   2. it's really an image                  -> file.type.startsWith("image/")
  //   3. it's not enormous (e.g. < 5 MB)       -> file.size < 5 * 1024 * 1024
  // Show messages via the #status element (see showStatus in js/ui.js).

  return true; // placeholder so the app runs before C writes the real checks
}
