// ==UserScript==
// @name         FMHY SafeLink Guard
// @namespace    http://tampermonkey.net/
// @version      0.5.1
// @description  Warns about unsafe/scammy links based on FMHY filterlist
// @author       maxikozie
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      raw.githubusercontent.com
// @run-at       document-end
// @license      MIT
// @icon         https://fmhy.net/fmhy.ico
// @downloadURL  https://update.greasyfork.org/scripts/528660/FMHY%20SafeLink%20Guard.user.js
// @updateURL    https://update.greasyfork.org/scripts/528660/FMHY%20SafeLink%20Guard.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const unsafeListUrl = 'https://raw.githubusercontent.com/fmhy/FMHYFilterlist/refs/heads/main/sitelist.txt';
    const safeListUrl = 'https://raw.githubusercontent.com/fmhy/bookmarks/refs/heads/main/fmhy_in_bookmarks.html';

    const unsafeDomains = new Set();
    const safeDomains = new Set();

    const userAdditions = [];
    const userRemovals = [];

    const processedLinks = new WeakSet();
    const highlightedUnsafeCounts = new Map();
    const highlightedSafeCounts = new Map();

    const trustedGlow = '0 0 4px #32cd32';
    const unsafeGlow = '0 0 4px #ff4444';

    const warningStyle = `
        background-color: #ff0000;
        color: #fff;
        padding: 2px 6px;
        font-weight: bold;
        border-radius: 4px;
        font-size: 12px;
        margin-left: 6px;
        z-index: 9999;
    `;

    // Load settings
    let settings = {
        highlightTrusted: GM_getValue('highlightTrusted', true),
        highlightUntrusted: GM_getValue('highlightUntrusted', true),
        highlightWarningBanners: GM_getValue('highlightWarningBanners', true) // NEW TOGGLES
    };

    // Register settings menu
    GM_registerMenuCommand('⚙️ FMHY SafeLink Guard Settings', openSettingsPanel);

    fetchUnsafeDomains();

    function fetchUnsafeDomains() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: unsafeListUrl,
            onload: response => {
                parseDomainList(response.responseText, unsafeDomains);
                applyUserCustomDomains();
                fetchSafeDomains();
            },
            onerror: () => {
                console.error('[FMHY Guard] Failed to fetch unsafe list');
                fetchSafeDomains();
            }
        });
    }

    function fetchSafeDomains() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: safeListUrl,
            onload: response => {
                parseSafeDomains(response.responseText);
                markLinksIn(document.body);
                observePageChanges();
            },
            onerror: () => {
                console.error('[FMHY Guard] Failed to fetch safe list');
                markLinksIn(document.body);
                observePageChanges();
            }
        });
    }

    function parseDomainList(text, targetSet) {
        text.split('\n').forEach(line => {
            const domain = line.trim();
            if (domain && !domain.startsWith('!')) targetSet.add(domain.toLowerCase());
        });
    }

    function applyUserCustomDomains() {
        userAdditions.forEach(d => unsafeDomains.add(d.toLowerCase()));
        userRemovals.forEach(d => unsafeDomains.delete(d.toLowerCase()));
    }

    function parseSafeDomains(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('a[href]').forEach(link => {
            try {
                safeDomains.add(normalizeDomain(new URL(link.href).hostname));
            } catch (e) {}
        });
    }

    const banneredDomains = new Set();

    function markLinksIn(container) {
        const links = container.querySelectorAll('a[href]');
        for (const link of links) {
            if (processedLinks.has(link)) continue;
            processedLinks.add(link);

            const domain = normalizeDomain(new URL(link.href, location.href).hostname);

            if (isUnsafe(domain)) {
                // Show the banner only if enabled and once per domain
                if (settings.highlightWarningBanners && !banneredDomains.has(domain)) {
                    addWarning(link);
                    banneredDomains.add(domain);
                }

                // Highlight only if user wants
                if (settings.highlightUntrusted && (highlightedUnsafeCounts.get(domain) || 0) < 2) {
                    highlightUnsafeLink(link);
                    highlightedUnsafeCounts.set(domain, (highlightedUnsafeCounts.get(domain) || 0) + 1);
                }
            } else if (settings.highlightTrusted && isSafe(domain)) {
                if ((highlightedSafeCounts.get(domain) || 0) < 2) {
                    highlightTrustedLink(link);
                    highlightedSafeCounts.set(domain, (highlightedSafeCounts.get(domain) || 0) + 1);
                }
            }
        }
    }

    function highlightTrustedLink(link) {
        link.style.textShadow = trustedGlow;
        link.style.fontWeight = 'bold';
    }

    function highlightUnsafeLink(link) {
        link.style.textShadow = unsafeGlow;
        link.style.fontWeight = 'bold';
    }

    function addWarning(link) {
        const warning = document.createElement('span');
        warning.textContent = '⚠️ FMHY Unsafe Site';
        warning.style = warningStyle;
        link.after(warning);
    }

    function isUnsafe(domain) {
        return domainMatch(domain, unsafeDomains);
    }

    function isSafe(domain) {
        return domainMatch(domain, safeDomains);
    }

    function domainMatch(domain, set) {
        return [...set].some(d => domain === d || domain.endsWith('.' + d));
    }

    function normalizeDomain(hostname) {
        return hostname.replace(/^www\./, '').toLowerCase();
    }

    function observePageChanges() {
        new MutationObserver(mutations => {
            for (const {addedNodes} of mutations) {
                for (const node of addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) markLinksIn(node);
                }
            }
        }).observe(document.body, {childList: true, subtree: true});
    }

    function openSettingsPanel() {
        document.getElementById('fmhy-settings-panel')?.remove();

        const panel = document.createElement('div');
        panel.id = 'fmhy-settings-panel';
        panel.style = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            z-index: 99999; font-family: sans-serif; font-size: 14px;
            background: #222; color: #f5f5f5; padding: 20px;
            border: 1px solid #444; border-radius: 12px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
            width: 320px;
        `;

        panel.innerHTML = `
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 10px;">
                ⚙️ FMHY SafeLink Guard Settings
            </div>

            <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                <label>Highlight Trusted Domains</label>
                <input type="checkbox" id="highlightTrusted">
            </div>

            <div style="margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                <label>Highlight Untrusted Domains</label>
                <input type="checkbox" id="highlightUntrusted">
            </div>

            <div style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <label>Show Warning Banners</label>
                <input type="checkbox" id="highlightWarningBanners">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="saveSettings" style="
                    background: #28a745; color: white; border: none; padding: 6px 12px;
                    border-radius: 6px; cursor: pointer; font-weight: bold;">Save</button>
                <button id="closeSettings" style="
                    background: #dc3545; color: white; border: none; padding: 6px 12px;
                    border-radius: 6px; cursor: pointer;">Close</button>
            </div>
        `;

        document.body.appendChild(panel);

        document.getElementById('highlightTrusted').checked = settings.highlightTrusted;
        document.getElementById('highlightUntrusted').checked = settings.highlightUntrusted;
        document.getElementById('highlightWarningBanners').checked = settings.highlightWarningBanners;

        document.getElementById('saveSettings').onclick = () => {
            settings.highlightTrusted = document.getElementById('highlightTrusted').checked;
            settings.highlightUntrusted = document.getElementById('highlightUntrusted').checked;
            settings.highlightWarningBanners = document.getElementById('highlightWarningBanners').checked;
            GM_setValue('highlightTrusted', settings.highlightTrusted);
            GM_setValue('highlightUntrusted', settings.highlightUntrusted);
            GM_setValue('highlightWarningBanners', settings.highlightWarningBanners);
            panel.remove();
            location.reload();
        };

        document.getElementById('closeSettings').onclick = () => panel.remove();
    }
})();
