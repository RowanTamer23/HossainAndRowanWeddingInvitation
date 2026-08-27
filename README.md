# Hossain & Rowan — Wedding Invitation

A premium, bilingual (English & Arabic) wedding invitation featuring dynamic envelope-opening animations, a custom countdown clock, Google Maps venue integration, and an RSVP form that saves guest responses locally and syncs them to a Google Sheet database.

## Project Structure

The project has been refactored to separate concerns:
- **`index.html`**: Clean semantic HTML structure and asset links.
- **`css/style.css`**: Design tokens, custom styling, layout, ribbon animations, folding effects, and responsive design.
- **`js/app.js`**: Interactive controls, countdown calculation, Arabic/English translation logic, and the RSVP submission handler.

---

## 🚀 Running Locally

This project uses **Vite** for local development with fast hot reloading.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed on your system.

### Steps
1. Open your terminal in this directory.
2. Install the development server:
   ```bash
   npm install
   ```
3. Run the local dev server:
   ```bash
   npm run dev
   ```
4. Click the link shown in the terminal (usually `http://localhost:5173`) to view the website.

---

## 🗄️ RSVP Database Setup (Google Sheets)

To collect and view responses in a single live Google Sheet, follow these steps:

### Step 1: Create the Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it something like **"Hossain & Rowan RSVPs"**.
3. In row 1 (the first row), create three headers:
   `Timestamp` | `Name` | `Response`

### Step 2: Add the Apps Script
1. In the Google Sheet menu, go to **Extensions → Apps Script**.
2. Delete any default code in the editor, and paste the following code:
   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     sheet.appendRow([data.timestamp, data.name, data.response]);
     return ContentService.createTextOutput(JSON.stringify({status: "ok"}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
3. Click the **Save** (floppy disk) icon. You can name the Apps Script project "RSVP Backend".

### Step 3: Deploy as a Web App
1. Click **Deploy → New deployment** (top right).
2. Click the gear icon next to "Select type" and select **Web app**.
3. Set the following settings:
   - **Description**: RSVP API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**.
5. Google will ask you to authorize permissions:
   - Click **Authorize access** → select your Google account.
   - Click **Advanced** → Click **Go to RSVP Backend (unsafe)** → Click **Allow**.
   *(Note: This warning is standard for private scripts you run yourself.)*
6. Copy the generated **Web app URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 4: Link to the Invitation Site
1. Open the [js/app.js](file:///Volumes/HardDisk/Wedding%20Invitation/js/app.js) file.
2. Find this line near the top:
   ```javascript
   var APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
   ```
3. Replace the placeholder string with your copied URL. Keep the double quotes:
   ```javascript
   var APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ACTUAL_DEployed_URL/exec";
   ```
4. Save the file.

---

## 📍 Customizing the Venue Google Maps Pin

At the top of [js/app.js](file:///Volumes/HardDisk/Wedding%20Invitation/js/app.js), you can update the query used to generate the Google Maps embed:
```javascript
var VENUE_QUERY = "Sea Garden Open Air Hall";
```
If the pin is not accurate, replace this with the full physical address (e.g. `"Sea Garden Open Air Hall, 123 Corniche Rd, Alexandria"`).
