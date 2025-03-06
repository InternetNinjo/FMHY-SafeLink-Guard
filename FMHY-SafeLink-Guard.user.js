// ==UserScript==
// @name         FMHY SafeLink Guard
// @namespace    http://tampermonkey.net/
// @version      0.5.3
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
// @downloadURL https://update.greasyfork.org/scripts/528660/FMHY%20SafeLink%20Guard.user.js
// @updateURL https://update.greasyfork.org/scripts/528660/FMHY%20SafeLink%20Guard.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // Remote sources for FMHY site lists
    const unsafeListUrl = 'https://raw.githubusercontent.com/fmhy/FMHYFilterlist/refs/heads/main/sitelist.txt';
    const safeListUrl   = 'https://raw.githubusercontent.com/fmhy/bookmarks/refs/heads/main/fmhy_in_bookmarks.html';

    const unsafeDomains = new Set();
    const safeDomains   = new Set();

    // User-defined overrides and settings
    const userTrusted   = new Set(GM_getValue('userTrusted', []));
    const userUntrusted = new Set(GM_getValue('userUntrusted', []));

    const settings = {
        highlightTrusted:   GM_getValue('highlightTrusted', true),
        highlightUntrusted: GM_getValue('highlightUntrusted', true),
        showWarningBanners: GM_getValue('showWarningBanners', true)
    };

    // Tracking for processed links and counters per domain
    const processedLinks = new WeakSet();
    const highlightCountTrusted = new Map();
    const highlightCountUntrusted = new Map();
    const banneredDomains = new Set();

    // Style for the warning banner
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

    GM_registerMenuCommand('⚙️ FMHY SafeLink Guard Settings', openSettingsPanel);

    fetchRemoteLists();

    function fetchRemoteLists() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: unsafeListUrl,
            onload: response => {
                parseDomainList(response.responseText, unsafeDomains);
                console.log(`[FMHY Guard] Loaded ${unsafeDomains.size} unsafe domains from FMHY.`);
    
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: safeListUrl,
                    onload: safeResp => {
                        parseSafeList(safeResp.responseText);
                        console.log(`[FMHY Guard] Loaded ${safeDomains.size} safe domains from FMHY.`);
    
                        applyUserOverrides();
                        processPage();
                    },
                    onerror: response => {
                        console.error(`[FMHY Guard] Failed to fetch safe list from ${safeListUrl}`, response);
                        processPage();
                    }
                });
            },
            onerror: response => {
                console.error(`[FMHY Guard] Failed to fetch unsafe list from ${unsafeListUrl}`, response);
                processPage();
            }
        });
    }

    function parseDomainList(text, targetSet) {
        text.split('\n').forEach(line => {
            const domain = line.trim().toLowerCase();
            if (domain && !domain.startsWith('!')) targetSet.add(domain);
        });
    }

    function parseSafeList(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('a[href]').forEach(link => {
            const domain = normalizeDomain(new URL(link.href).hostname);
            safeDomains.add(domain);
        });
    }

    function applyUserOverrides() {
        userTrusted.forEach(domain => {
            safeDomains.add(domain);
            unsafeDomains.delete(domain);
        });

        userUntrusted.forEach(domain => {
            unsafeDomains.add(domain);
            safeDomains.delete(domain);
        });
    }

    function processPage() {
        markLinks(document.body);
        observePage();
    }

    function markLinks(container) {
        container.querySelectorAll('a[href]').forEach(link => {
            if (processedLinks.has(link)) return;
            processedLinks.add(link);

            const domain = normalizeDomain(new URL(link.href).hostname);

            if (userUntrusted.has(domain) || (!userTrusted.has(domain) && unsafeDomains.has(domain))) {
                if (settings.highlightUntrusted && getHighlightCount(highlightCountUntrusted, domain) < 2) {
                    highlightLink(link, 'red');
                    incrementHighlightCount(highlightCountUntrusted, domain);
                }
                if (settings.showWarningBanners && !banneredDomains.has(domain)) {
                    addWarningBanner(link);
                    banneredDomains.add(domain);
                }
            } else if (userTrusted.has(domain) || safeDomains.has(domain)) {
                if (settings.highlightTrusted && getHighlightCount(highlightCountTrusted, domain) < 2) {
                    highlightLink(link, 'green');
                    incrementHighlightCount(highlightCountTrusted, domain);
                }
            }
        });
    }

    function observePage() {
        new MutationObserver(mutations => {
            for (const {addedNodes} of mutations) {
                for (const node of addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) markLinks(node);
                }
            }
        }).observe(document.body, {childList: true, subtree: true});
    }

    function highlightLink(link, color) {
        link.style.textShadow = `0 0 4px ${color}`;
        link.style.fontWeight = 'bold';
    }

    function addWarningBanner(link) {
        const warning = document.createElement('span');
        warning.textContent = '⚠️ FMHY Unsafe Site';
        warning.style = warningStyle;
        link.after(warning);
    }

    function normalizeDomain(hostname) {
        return hostname.replace(/^www\./, '').toLowerCase();
    }

    function getHighlightCount(map, domain) {
        return map.get(domain) || 0;
    }

    function incrementHighlightCount(map, domain) {
        map.set(domain, getHighlightCount(map, domain) + 1);
    }

    function openSettingsPanel() {
        const existingPanel = document.getElementById('fmhy-settings-panel');
        if (existingPanel) existingPanel.remove();

        const panel = document.createElement('div');
        panel.id = 'fmhy-settings-panel';
        panel.style = `
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            z-index: 999999;
            background: #222;
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            font-family: sans-serif;
            font-size: 14px;
            width: 450px;
            max-height: 80vh;
            overflow-y: auto;
            overflow-x: hidden;
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        `;

        panel.innerHTML = `
            <h3 style="margin-top: 0; text-align: center;">⚙️ FMHY SafeLink Guard Settings</h3>

            <label><input type="checkbox" id="highlightTrusted"> 🟢 Highlight Trusted Links</label><br>
            <label><input type="checkbox" id="highlightUntrusted"> 🔴 Highlight Untrusted Links</label><br>
            <label><input type="checkbox" id="showWarningBanners"> ⚠️ Show Warning Banners</label><br><br>

            <label>Trusted Domains (1 per line):</label>
            <textarea id="trustedList" style="width: 100%; height: 80px;"></textarea><br><br>

            <label>Untrusted Domains (1 per line):</label>
            <textarea id="untrustedList" style="width: 100%; height: 80px;"></textarea><br><br>

            <button id="saveSettings" style="background:#28a745;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer;">Save</button>
            <button id="closeSettings" style="background:#dc3545;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer;margin-left:10px;">Close</button>
        `;

        document.body.appendChild(panel);

        document.getElementById('highlightTrusted').checked = settings.highlightTrusted;
        document.getElementById('highlightUntrusted').checked = settings.highlightUntrusted;
        document.getElementById('showWarningBanners').checked = settings.showWarningBanners;

        document.getElementById('trustedList').value = [...userTrusted].join('\n');
        document.getElementById('untrustedList').value = [...userUntrusted].join('\n');

        document.getElementById('saveSettings').onclick = () => {
            saveSettings();
            location.reload();
        };

        document.getElementById('closeSettings').onclick = () => panel.remove();
    }

    function saveSettings() {
        ['highlightTrusted', 'highlightUntrusted', 'showWarningBanners'].forEach(setting => {
            settings[setting] = document.getElementById(setting).checked;
            GM_setValue(setting, settings[setting]);
        });

        saveDomainList('trustedList', userTrusted);
        saveDomainList('untrustedList', userUntrusted);
    }

    function saveDomainList(id, set) {
        set.clear();
        document.getElementById(id).value.split('\n').map(d => d.trim().toLowerCase()).filter(Boolean).forEach(d => set.add(d));
        GM_setValue(id.replace('List', ''), [...set]);
    }
})();
