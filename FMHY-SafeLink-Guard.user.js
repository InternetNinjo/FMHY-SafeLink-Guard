// ==UserScript==
// @name         FMHY SafeLink Guard
// @namespace    http://tampermonkey.net/
// @version      0.5.5
// @description  Warns about unsafe/scammy links based on FMHY filterlist, and skips highlighting internal links on safe domains
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

    // Restrict script from running on domains owned by FMHY
    const excludedDomains = [
        'fmhy.net',
        'fmhy.pages.dev',
        'fmhy.lol',
        'fmhy.vercel.app',
        'fmhy.xyz'
    ];

    const currentDomain = window.location.hostname.toLowerCase();

    if (excludedDomains.some(domain => currentDomain.endsWith(domain))) {
        console.log(`[FMHY Guard] Script disabled on ${currentDomain}`);
        return;
    }

    // Remote sources for FMHY site lists
    const unsafeListUrl = 'https://raw.githubusercontent.com/fmhy/FMHYFilterlist/refs/heads/main/sitelist.txt';
    const safeListUrl   = 'https://raw.githubusercontent.com/fmhy/bookmarks/refs/heads/main/fmhy_in_bookmarks.html';

    const unsafeDomains = new Set();
    const safeDomains   = new Set();

    // User-defined overrides and settings
    const userTrusted   = new Set(GM_getValue('trusted', []));
    const userUntrusted = new Set(GM_getValue('untrusted', []));

    const settings = {
        highlightTrusted:   GM_getValue('highlightTrusted', true),
        highlightUntrusted: GM_getValue('highlightUntrusted', true),
        showWarningBanners: GM_getValue('showWarningBanners', true),
        trustedColor:       GM_getValue('trustedColor', '#32cd32'),
        untrustedColor:     GM_getValue('untrustedColor', '#ff4444')
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

            // If the current site domain is safe AND the link is internal, skip highlight
            if (
                (safeDomains.has(currentDomain) || userTrusted.has(currentDomain))
                && domain === currentDomain
            ) {
                return;
            }

            if (userUntrusted.has(domain) || (!userTrusted.has(domain) && unsafeDomains.has(domain))) {
                if (settings.highlightUntrusted && getHighlightCount(highlightCountUntrusted, domain) < 2) {
                    highlightLink(link, 'untrusted');
                    incrementHighlightCount(highlightCountUntrusted, domain);
                }
                if (settings.showWarningBanners && !banneredDomains.has(domain)) {
                    addWarningBanner(link);
                    banneredDomains.add(domain);
                }

            } else if (userTrusted.has(domain) || safeDomains.has(domain)) {
                if (settings.highlightTrusted && getHighlightCount(highlightCountTrusted, domain) < 2) {
                    highlightLink(link, 'trusted');
                    incrementHighlightCount(highlightCountTrusted, domain);
                }
            }
        });
    }

    function observePage() {
        new MutationObserver(mutations => {
            for (const { addedNodes } of mutations) {
                for (const node of addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) markLinks(node);
                }
            }
        }).observe(document.body, { childList: true, subtree: true });
    }

    function highlightLink(link, type) {
        const color = (type === 'trusted') ? settings.trustedColor : settings.untrustedColor;
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

    function saveSettings() {
        settings.highlightTrusted   = document.getElementById('highlightTrusted').checked;
        settings.highlightUntrusted = document.getElementById('highlightUntrusted').checked;
        settings.showWarningBanners = document.getElementById('showWarningBanners').checked;

        settings.trustedColor   = document.getElementById('trustedColor').value;
        settings.untrustedColor = document.getElementById('untrustedColor').value;

        GM_setValue('highlightTrusted',   settings.highlightTrusted);
        GM_setValue('highlightUntrusted', settings.highlightUntrusted);
        GM_setValue('showWarningBanners', settings.showWarningBanners);
        GM_setValue('trustedColor',       settings.trustedColor);
        GM_setValue('untrustedColor',     settings.untrustedColor);

        saveDomainList('trustedList', userTrusted);
        saveDomainList('untrustedList', userUntrusted);
    }

    function saveDomainList(id, set) {
        set.clear();
        document.getElementById(id).value
            .split('\n')
            .map(d => d.trim().toLowerCase())
            .filter(Boolean)
            .forEach(dom => set.add(dom));


        if (id === 'trustedList') {
            GM_setValue('trusted', [...set]);
        } else {
            GM_setValue('untrusted', [...set]);
        }
    }

    function openSettingsPanel() {
        document.getElementById('fmhy-settings-panel')?.remove();

        const panel = document.createElement('div');
        panel.id = 'fmhy-settings-panel';
        panel.style = `
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: #222;
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            font-family: sans-serif;
            font-size: 14px;
            z-index: 99999;
            width: 450px;
            overflow-y: auto;
            overflow-x: hidden;
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
        `;

        panel.innerHTML = `
            <h3 style="text-align:center; margin:0 0 15px;">⚙️ FMHY SafeLink Guard Settings</h3>

            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <input type="checkbox" id="highlightTrusted" style="margin-right: 6px;">
                <label for="highlightTrusted" style="flex-grow: 1; cursor: pointer;">🟢 Highlight Trusted Links</label>
                <input type="color" id="trustedColor" style="width: 30px; height: 20px; border: none; cursor: pointer;">
            </div>

            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <input type="checkbox" id="highlightUntrusted" style="margin-right: 6px;">
                <label for="highlightUntrusted" style="flex-grow: 1; cursor: pointer;">🔴 Highlight Untrusted Links</label>
                <input type="color" id="untrustedColor" style="width: 30px; height: 20px; border: none; cursor: pointer;">
            </div>

            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <input type="checkbox" id="showWarningBanners" style="margin-right: 6px;">
                <label for="showWarningBanners" style="flex-grow: 1; cursor: pointer;">⚠️ Show Warning Banners</label>
            </div>

            <label style="display: block; margin-bottom: 5px;">Trusted Domains (1 per line):</label>
            <textarea id="trustedList" style="width: 100%; height: 80px; margin-bottom: 10px;"></textarea>

            <label style="display: block; margin-bottom: 5px;">Untrusted Domains (1 per line):</label>
            <textarea id="untrustedList" style="width: 100%; height: 80px; margin-bottom: 10px;"></textarea>

            <div style="text-align: left;">
                <button id="saveSettingsBtn" style="background:#28a745;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer;">Save</button>
                <button id="closeSettingsBtn" style="background:#dc3545;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer;margin-left:10px;">Close</button>
            </div>
        `;

        document.body.appendChild(panel);

        document.getElementById('highlightTrusted').checked = settings.highlightTrusted;
        document.getElementById('highlightUntrusted').checked = settings.highlightUntrusted;
        document.getElementById('showWarningBanners').checked = settings.showWarningBanners;

        document.getElementById('trustedColor').value = settings.trustedColor;
        document.getElementById('untrustedColor').value = settings.untrustedColor;

        document.getElementById('trustedList').value   = [...userTrusted].join('\n');
        document.getElementById('untrustedList').value = [...userUntrusted].join('\n');

        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            saveSettings();
            panel.remove();
            location.reload();
        });

        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            panel.remove();
        });
    }
})();
