# FMHY-SafeLink-Guard

**FMHY SafeLink Guard** keeps a lookout for potentially harmful or scammy links on any website you visit. Drawing on the up-to-date FMHY sitelist and bookmarks, it flags these links directly on the webpage and highlights safe and unsafe domains, giving you a clear visual signal about the trustworthiness of each link.

## Installation Instructions

1. **Install a User Script Manager**

   - **Chrome:** [**Violentmonkey**](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) (RECOMMENDED)
     - Due to changes from the **Manifest V3 update**, some extensions work differently.
     - If you choose **Tampermonkey**, you’ll need to manually enable **Developer Mode** in Chrome.
     - ⚠️ Note: Even Violentmonkey shows a warning that future Chrome updates might break functionality.
   - **Firefox:** [**Tampermonkey**](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [**Violentmonkey**](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/).

2. **Add the FMHY SafeLink Guard Script**

   - Open the script’s [**hosting page**](https://greasyfork.org/en/scripts/528660-fmhy-safelink-guard) (Greasy Fork)
   - Click **Install** or **Import** to add it to your user script manager.

3. **Verify Activation**

   - Check your user script manager’s dashboard to confirm “FMHY SafeLink Guard” is running.

## Key Features

- **Caching System (New in v0.5.5):**

  - FMHY SafeLink Guard now **caches** its safe and unsafe domain lists for **one week** to reduce unnecessary fetches.
  - Cache is stored using Tampermonkey’s `GM_setValue` and can be force-refreshed anytime.

- **Force Update Option:**

  - Users can manually clear and reload FMHY’s lists using the **“Force Update FMHY Lists”** menu command.

- **Download Cached Data (New in v0.5.5):**

  - Users can download all cached domain lists as a **JSON file** via the **“Download All Caches”** menu command.
  - Helps with debugging and external analysis.

- **Visual Warning:** Displays a prominent red warning banner `⚠️ FMHY Unsafe Site` next to flagged links (only once per domain).

- **Safe and Unsafe Highlights:** Safe (trusted) domains can be highlighted in **green**, while unsafe (flagged) domains can be highlighted in **red**.

- **Dynamic Content Support:** Includes a MutationObserver to track pages that load content dynamically, ensuring newly added links don’t go unnoticed.

- **User Control:** A settings menu (accessible via the userscript menu) allows you to:

  - **Toggle** the following:
    - Highlighting trusted domains (with a customizable glow color).
    - Highlighting untrusted domains (with a customizable glow color).
    - Displaying the warning banner for unsafe sites.
  - **Customize colors** directly from the settings panel, choosing your preferred highlight colors for trusted and untrusted links.
  - Manage your personal **Trusted Domains** and **Untrusted Domains** lists, overriding FMHY’s own lists if needed.

## Why Use It?

- **Proactive Protection:** Alerts you before you even consider clicking a suspicious site.
- **Less Redundant Fetching:** The new **caching system** reduces repetitive online requests.
- **Manual Control:** Users can force updates or download cached data at any time.
- **Automatic Updates:** Pulls the domain lists directly from FMHY’s GitHub, so you’re always up-to-date.
- **Customizable:** Toggle individual features to match your browsing preferences.

## Usage

1. **Browse as Usual:** The script inspects every link in real time.
2. **Visual Cues:**
   - **Trusted links (from fmhy\_in\_bookmarks.html)** can be highlighted in green.
   - **Unsafe links (from sitelist.txt)** can be highlighted in red.
   - Unsafe links also receive a **warning banner** the first time they appear on a page.
3. **Customize Behavior:**
   - Open the userscript’s settings menu to toggle the highlights and banner to your liking.
4. **Use Force Update:**
   - If you suspect an outdated list, use **“Force Update FMHY Lists”** from the menu to clear cached data and fetch fresh lists.
5. **Download Cache for Inspection:**
   - Select **“Download All Caches”** to save current safe/unsafe site lists for external review.

6. **Example:**

   ![image](https://github.com/user-attachments/assets/ff40b28c-e717-4722-9fb8-d011bdeaa8c3)

   ![image](https://github.com/user-attachments/assets/a883d3a8-89e3-44a3-ad16-2832629013cf)

   ![image](https://github.com/user-attachments/assets/44d2398a-5ca6-48ad-8bd7-9e07b89a30b3)

## Compatibility

- Works on modern browsers (Chrome, Firefox, Edge) with a user script manager installed.
- Tested primarily with **Tampermonkey** and **Violentmonkey**.

## Known Constraints

- On sites with frequent dynamic content updates, you might briefly see links before they’re flagged or highlighted. The **MutationObserver** usually handles this quickly.
- Performance remains smooth for most use cases, though extremely large or complex pages may cause a minor slowdown.
- The **cache system** stores safe/unsafe domains for **7 days**, but users can force a refresh manually if needed.

## Disclaimer

FMHY SafeLink Guard uses the FMHY sitelist and bookmarks as its data source and cannot guarantee absolute protection against every malicious or phishing site. Always use sound judgment when visiting unfamiliar URLs. The author and contributors assume no liability for any damages or losses incurred while using this script.

---

Secure your browsing with **FMHY SafeLink Guard**!