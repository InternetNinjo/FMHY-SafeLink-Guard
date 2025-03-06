## Changelog

### Version 0.5.3

#### Improvements
- Added **detailed error logging** to the console if fetching the trusted or unsafe site lists fails. Errors now show the failing URL and full response object.
- Added a **console log summary** showing how many **safe** and **unsafe** domains were successfully loaded from FMHY.

These changes improve transparency and make troubleshooting easier if FMHY's lists ever go down or change format.

---




### Version 0.5.2

This update further enhances **FMHY SafeLink Guard**, refining its user controls, improving flexibility, and adding new limits to prevent visual clutter. Version 0.5.2 gives users **full control over trusted and untrusted domains** directly from the settings menu, prioritizes personal overrides over FMHY’s lists, and makes the script smarter when handling multiple links to the same domain. Bugs are removed.

---

### New Features

#### User-Controlled Trusted & Untrusted Domains
- The settings panel now includes two **editable lists**:
    - **Trusted Domains** – Sites the user trusts, even if FMHY lists them as unsafe.
    - **Untrusted Domains** – Sites the user wants flagged as unsafe, even if FMHY lists them as trusted.
- These lists are **persistently saved** using Tampermonkey’s `GM_setValue`, so they remain even after browser restarts.

#### Override Logic
- **User overrides take full priority**:
    - If a domain is in the **Trusted Domains**, it will always be treated as safe (green highlight if enabled), even if FMHY marks it unsafe.
    - If a domain is in the **Untrusted Domains**, it will always be treated as unsafe (red highlight and/or warning banner if enabled), even if FMHY lists it as trusted.

#### Redesigned Settings Panel
- The settings panel has been expanded and restyled.
- Trusted and Untrusted lists are fully editable in the panel.
- Icons (🟢🔴⚠️) provide better visual clarity for each setting.

---

### Comparison Table

| Feature                              | Version 0.5.1 | Version 0.5.2 |
|----------------------------------|:-------------:|:-------------:|
| Import `sitelist.txt` (unsafe)   | ✅ | ✅ |
| Show warning banner for unsafe links (toggleable) | ✅ | ✅ |
| Import `fmhy_in_bookmarks.html` (trusted) | ✅ | ✅ |
| Highlight unsafe links (red)     (toggleable) | ✅ | ✅ |
| Highlight trusted links (green)  (toggleable) | ✅ | ✅ |
| Settings menu                     | ✅ | ✅ |
| MutationObserver support for dynamic content | ✅ | ✅ |
| Editable Trusted Domains List    | ❌ | ✅ |
| Editable Untrusted Domains List  | ❌ | ✅ |
| User override (trusted > FMHY unsafe) | ❌ | ✅ |
| User override (untrusted > FMHY trusted) | ❌ | ✅ |
| Improved domain normalization    | ❌ | ✅ |

---

### Summary

Version 0.5.2 focuses on **giving users complete control** over how the script handles trusted and untrusted sites. FMHY’s lists still load automatically, but personal overrides always take priority. Combined with the new **highlight and banner limits**, this ensures cleaner pages while keeping safety information visible where it matters most.

---

### Installation Reminder

For new users, install the script via:

- [FMHY SafeLink Guard on GreasyFork](https://greasyfork.org/en/scripts/528660-fmhy-safelink-guard)

---

### Important Note for GreasyFork Users

GreasyFork **only updates the script file** when a new version is uploaded. It does **not automatically pull changelogs** from GitHub or anywhere else. If you want to stay informed about updates like this, follow the project on GitHub.

---

### Closing Note

FMHY SafeLink Guard is now much more than a simple banner script — it’s becoming a **fully customizable link management tool**. Whether you want constant visual indicators, or prefer a minimal setup with only critical warnings, the control is yours.

---




### Version 0.5.1

This update introduces significant improvements to FMHY SafeLink Guard, evolving it from a simple unsafe link banner into a comprehensive link management and highlighting tool. The script now supports both unsafe and trusted domains, adds color-coded link highlighting, and includes a settings menu for full user control.

### New Features

### Dual Source Protection
- The script now imports **both**:
    - `sitelist.txt` containing unsafe sites.
    - `fmhy_in_bookmarks.html` containing trusted sites.
- This enables the script to distinguish between trusted and unsafe sites.

### Visual Highlights
- Trusted sites from `fmhy_in_bookmarks.html` are highlighted with a **green glow**.
- Unsafe sites from `sitelist.txt` are highlighted with a **red glow**.
- These visual indicators provide clear, instant feedback about link safety.

### Improved Warning Banner
- The warning banner (`⚠️ FMHY Unsafe Site`) is still only shown **once per domain**, reducing unnecessary repetition.
- The banner works independently of the red highlighting, meaning you can choose to disable the red glow while keeping the banner active.

### Settings Menu !
- A settings panel can now be accessed directly from the Tampermonkey/Violentmonkey user script menu.
- In the settings panel, users can toggle the following options individually:
    - Highlight Trusted Links (green glow)
    - Highlight Unsafe Links (red glow)
    - Show Warning Banner for Unsafe Sites
- Changes take effect immediately after refreshing the page.

### Automatic List Updates
- The trusted and unsafe domain lists are still fetched directly from FMHY’s GitHub each time the script runs, ensuring users always receive up-to-date data.

---

## Comparison Table

| Feature                              | Previous Version | Version 0.5.1 |
|----------------------------------|:-----------------:|:-------------:|
| Import `sitelist.txt` (unsafe)   | ✅ | ✅ |
| Show warning banner for unsafe links | ✅ | ✅ (toggleable) |
| Import `fmhy_in_bookmarks.html` (trusted) | ❌ | ✅ |
| Highlight unsafe links (red)     | ❌ | ✅ (toggleable) |
| Highlight trusted links (green)  | ❌ | ✅ (toggleable) |
| Settings menu                     | ❌ | ✅ |
| MutationObserver support for dynamic content | ✅ | ✅ |

---

## Summary

This update transforms FMHY SafeLink Guard into a more versatile and user-friendly tool, providing not only proactive warnings about unsafe links but also clear positive indicators for trusted links. With the addition of the settings menu, users now have full control over how the script behaves, making it adaptable to both conservative and more relaxed browsing preferences.

---

## Installation Reminder

For new users, install the script via:

- [FMHY SafeLink Guard on GreasyFork](https://greasyfork.org/en/scripts/528660-fmhy-safelink-guard)

---

## Important Note for GreasyFork Users

GreasyFork does not automatically pull release notes or changelogs from GitHub, even when the script is linked to a repository. Only the script file itself is automatically updated.  

---

## Closing Note

Thank you for using FMHY SafeLink Guard and helping to keep your browsing experience safer and more transparent. This update is designed to give you more information and more control, with minimal disruption to your browsing flow.

---




### Version 0.4.2

#### List Source Change
- Switched to FMHY’s `sitelist.txt` instead of `filterlist.txt`.
- `filterlist.txt` was originally designed for uBlock Origin and included adblock-specific syntax like `||` and `^`. This was unnecessary for a userscript.
- `sitelist.txt` is a cleaner, domain-only list maintained by FMHY specifically for general-purpose use.

#### Simpler Parsing Logic
- Parsing code is now cleaner since `sitelist.txt` is just a plain list of domains, no extra parsing logic required.

#### Internal Improvements
- Fetching and parsing were improved to match the new format.
- Behavior stays the same: one warning per domain per page.

---

## Known Issues

- On pages that load large amounts of content dynamically, you might briefly see unflagged links until the script scans and updates them.
- Performance is generally very smooth, but extremely long or complex pages may cause minor delays.

---

## Disclaimer

FMHY SafeLink Guard relies entirely on the FMHY sitelist as its data source. This list is maintained by the FMHY community, not the script author. No warranty is provided, and the author accepts no liability for missed warnings or incorrect flags. Always apply your own judgment when visiting unfamiliar websites.

---

## Contributing

Pull requests to improve performance, functionality, or flexibility are welcome. If you have ideas for improving the script, feel free to open an issue.

---

## Older versions

If you face trouble with this version. Older updates can be found on the Greasyfork release page.

---

## License

This project is licensed under the **MIT License**.
