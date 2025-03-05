// ==UserScript==
// @name         FMHY SafeLink Guard
// @namespace    http://tampermonkey.net/
// @version      0.5.1
// @description  Warns about unsafe/scammy links based on FMHY filterlist, but only once per domain
// @author       maxikozie
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-end
// @license      MIT
// @icon         https://fmhy.net/fmhy.ico
// @downloadURL  https://update.greasyfork.org/scripts/528660/FMHY%20SafeLink%20Guard.user.js
// @updateURL    https://update.greasyfork.org/scripts/528660/FMHY%20SafeLink%20Guard.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // ------------------------------------------------------------------------
    // 1) URL of the raw text version of the FMHY GitHub filterlist.
    // ------------------------------------------------------------------------
    const filterlistUrl = 'https://raw.githubusercontent.com/fmhy/FMHYFilterlist/refs/heads/main/sitelist.txt';

    // ------------------------------------------------------------------------
    // 2) We'll store unsafe domains in a Set for fast lookups.
    // ------------------------------------------------------------------------
    window.unsafeDomains = new Set();

    // ------------------------------------------------------------------------
    // 3) Custom user additions/removals (applied AFTER the FMHY list loads).
    // ------------------------------------------------------------------------
    const userAdditions = [ /* e.g. "extrabadexample.com" */ ];
    const userRemovals  = [ /* e.g. "siteyoudotrust.com"   */ ];

    // ------------------------------------------------------------------------
    // 4) We'll still keep track of individual links we’ve processed
    //    (so we don’t repeatedly check the same <a> in dynamic content).
    //    BUT we also track which domains have ALREADY been flagged once.
    // ------------------------------------------------------------------------
    const processedLinks = new WeakSet();
    const flaggedDomains = new Set(); // once we warn for a domain, we skip it thereafter

    // ------------------------------------------------------------------------
    // 5) Style for the warning badge.
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // 6) Initiate the fetching of the filterlist.
    // ------------------------------------------------------------------------
    fetchFilterlist();

    function fetchFilterlist() {
        GM_xmlhttpRequest({
            method: "GET",
            url: filterlistUrl,
            onload: function(response) {
                parseFilterlist(response.responseText);
                applyUserCustomDomains();
                markLinksIn(document.body);
                observePageChanges();
            },
            onerror: function() {
                console.error('[FMHY SafeLink Guard] Failed to fetch filterlist');
            }
        });
    }

    // ------------------------------------------------------------------------
    // 7) Parse the FMHY filterlist and populate the unsafeDomains set.
    // ------------------------------------------------------------------------
	function parseFilterlist(rawText) {
		const lines = rawText.split('\n');
		for (const line of lines) {
			const domain = line.trim();
			if (domain && !domain.startsWith('!')) {  // Skip empty lines and comments
				window.unsafeDomains.add(domain);
			}
		}
		console.log(`[FMHY SafeLink Guard] Loaded ${window.unsafeDomains.size} domains from FMHY sitelist`);
	}

    // ------------------------------------------------------------------------
    // 8) Apply user additions/removals, then log final domain count.
    // ------------------------------------------------------------------------
    function applyUserCustomDomains() {
        for (const d of userAdditions) {
            window.unsafeDomains.add(d);
            console.log(`[FMHY SafeLink Guard] ADDED custom domain: '${d}'`);
        }
        for (const d of userRemovals) {
            if (window.unsafeDomains.has(d)) {
                window.unsafeDomains.delete(d);
                console.log(`[FMHY SafeLink Guard] REMOVED domain: '${d}'`);
            }
        }
        console.log(`[FMHY SafeLink Guard] Final domain count: ${window.unsafeDomains.size}`);
    }

    // ------------------------------------------------------------------------
    // 9) markLinksIn: scans <a> tags in a container and flags them if needed.
    //    BUT only place a warning for a domain once.
    // ------------------------------------------------------------------------
    function markLinksIn(container) {
        const links = container.querySelectorAll('a[href]');
        for (const link of links) {
            if (processedLinks.has(link)) continue; // skip if we already processed this link
            processedLinks.add(link);

            const url = new URL(link.href, location.href);
            if (isUnsafe(url.hostname)) {
                // Normalize the domain by removing leading "www."
                const normalized = normalizeDomain(url.hostname);
                // If we haven't flagged this domain yet, do so now
                if (!flaggedDomains.has(normalized)) {
                    flaggedDomains.add(normalized);
                    addWarning(link);
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // 10) Adds the warning badge after a link.
    // ------------------------------------------------------------------------
    function addWarning(link) {
        const warning = document.createElement('span');
        warning.textContent = '⚠️ FMHY Unsafe Site';
        warning.style = warningStyle;
        link.after(warning);
    }

    // ------------------------------------------------------------------------
    // 11) isUnsafe: checks if a hostname ends with any domain in unsafeDomains.
    // ------------------------------------------------------------------------
    function isUnsafe(hostname) {
        hostname = hostname.replace(/^www\./, '');
        for (const domain of window.unsafeDomains) {
            if (hostname.endsWith(domain)) {
                return true;
            }
        }
        return false;
    }

    // ------------------------------------------------------------------------
    // 12) normalizeDomain: for “once per domain” checks, we can unify the domain
    //    (e.g. remove “www.”).
    // ------------------------------------------------------------------------
    function normalizeDomain(hostname) {
        return hostname.replace(/^www\./, '').toLowerCase();
    }

    // ------------------------------------------------------------------------
    // 13) observePageChanges: watches for newly inserted elements and flags as needed.
    // ------------------------------------------------------------------------
    function observePageChanges() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        markLinksIn(node);
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

})();
