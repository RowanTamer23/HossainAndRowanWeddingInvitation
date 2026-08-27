# Connecting your RSVP form to a live "Excel" (Google Sheet)

Right now the website saves each guest's answer on their own phone/computer, but to get
**one final list of everyone's answers**, follow these steps (about 5 minutes, free, no
coding needed beyond copy-paste). This turns a Google Sheet into your live guest-response
database — you can open it any time, and download it as an actual `.xlsx` Excel file
whenever you like.

## Step 1 — Create the Sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank sheet.
2. Name it something like **"Hossain & Rowan RSVPs"**.
3. In row 1, add these headers: `Timestamp | Name | Response`

## Step 2 — Add the script
1. In the Sheet, click **Extensions → Apps Script**.
2. Delete anything in the editor and paste this in its place:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.timestamp, data.name, data.response]);
  return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Click the **Save** icon (name the project anything, e.g. "RSVP Backend").

## Step 3 — Deploy it as a Web App
1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**. The first time, Google will ask you to authorize the script —
   click through **Authorize access → (your account) → Advanced → Go to [project name] (unsafe) → Allow**.
   This warning appears only because it's your own private script; it's normal.
5. Copy the **Web app URL** it gives you — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## Step 4 — Connect it to the website
1. Open `index.html` in a text editor.
2. Find this line near the top of the `<script>` section:
   ```javascript
   var APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
   ```
3. Replace the placeholder with the URL you copied, keeping the quotes:
   ```javascript
   var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
4. Save the file and re-upload/re-host it (see hosting note below).

That's it — every time a guest submits the RSVP form, a new row appears in your
Google Sheet with their name, response, and timestamp. Whenever you want your
**final guest list as an Excel file**, open the Sheet and go to
**File → Download → Microsoft Excel (.xlsx)**.

## Also double-check the venue pin
Near the top of the script, you'll also see:
```javascript
var VENUE_QUERY = "Sea Garden Open Air Hall";
```
This is what builds your Google Maps link and embed. Open the site and tap
**"Open in Google Maps"** to confirm it points to the right place. If it doesn't,
replace the text with the full address (e.g. `"Sea Garden Open Air Hall, 123 Corniche Rd, Alexandria"`)
for a more precise pin.

## Hosting the site so guests can open it
A file sitting on your computer only works for you. To share it with guests, upload
the whole "Wedding Invitation" folder to a free host such as:
- **Netlify Drop** (netlify.com/drop) — drag and drop the folder, get a link instantly
- **GitHub Pages** — free, good if you're comfortable with GitHub
- Any regular web hosting you already have

Then share that link with your guests instead of the raw file.
