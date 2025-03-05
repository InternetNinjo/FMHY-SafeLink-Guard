# FMHY-SafeLink-Guard
FMHY SafeLink Guard keeps a lookout for potentially harmful or scammy links on any website you visit. Drawing on the up-to-date FMHY filterlist, it flags these links directly on the webpage, enabling you to spot suspicious domains at a glance and steer clear of trouble.
# Key Features

    Uses the latest FMHY filterlist, fetching fresh data on every run.
    Displays a prominent red warning badge (⚠️ FMHY Unsafe Site) next to flagged links.
    Includes a MutationObserver to track pages that load content dynamically, ensuring new links don’t go unnoticed.

# Why Use It?

    Proactive Protection: Alerts you before you even consider clicking a suspicious site.
    Automatic Updates: Pulls the domain blacklist directly from FMHY’s GitHub, so you’re always current.
    Low Maintenance: Installs once and operates quietly in the background.

# Installation

    Install a User Script Manager
        Chrome: Try Tampermonkey.
        Firefox: Use either Tampermonkey or Violentmonkey.
    Add the FMHY SafeLink Guard Script
        Open the script’s hosting page (for instance, Greasy Fork) and select Install or Import to add it to your user script manager.
    Verify Activation
        Your user script manager interface should confirm that “FMHY SafeLink Guard” is running.

# Usage

    Browse as Usual: The script inspects every link in real time.
    Look for Warnings: Any domain matching the FMHY filterlist is flagged by a ⚠️ FMHY Unsafe Site badge.
    Proceed Carefully: If you see the warning badge, think twice before clicking, or at least do further research.
    Stay Current: The script automatically retrieves the most recent domain data each time.

# Advanced Tips

    Console Insight: Check your browser’s console for details on how many domains were loaded in the filterlist.
    Customization: If you want to add or remove specific domains yourself, you can edit the code directly.

# Compatibility

    Works on modern browsers like Chrome, Firefox, and Edge with a user script manager installed.
    Tested primarily with Tampermonkey and Violentmonkey.

# Known Constraints

    On sites with frequent dynamic content updates, you might briefly see links before they are flagged. The MutationObserver usually handles them quickly.
    Performance remains smooth for most use cases, though extremely large or complex pages may cause a minor slowdown.

# Disclaimer


FMHY SafeLink Guard uses the FMHY filterlist as its data source and cannot guarantee absolute protection against every malicious or phishing site. Always use sound judgment when visiting unfamiliar URLs. The author and contributors assume no liability for any damages or losses incurred while using this script.

Secure your browsing with FMHY SafeLink Guard!
