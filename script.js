// ==UserScript==
// @name         YouTube Header Bar Auto-hide
// @namespace    https://github.com/takattowo
// @version      1.0
// @description  Hides the YouTube top header initially and shows it when mousing over the top of the page (excluding fullscreen mode).
// @match        https://www.youtube.com/watch?v=*
// @grant        GM_addStyle
// @author       takattowo
// @homepageURL  https://github.com/takattowo/youtube-header-bar-autohide/
// @supportURL   https://github.com/takattowo/youtube-header-bar-autohide/issues
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    var delayTimer;
    var isFullscreen = false;
    var isLeavingFullscreen = false;

    function hideTop() {
        var mastheadContainer = document.getElementById('masthead-container');
        mastheadContainer.style.display = 'none';

        var header = document.querySelector('ytd-app');
        header.style.transitionDuration = isLeavingFullscreen ? '0s' : '0.3s';
        header.style.marginTop = isFullscreen ? '0' : '-50px';
    }

    function showTop() {
        var mastheadContainer = document.getElementById('masthead-container');
        mastheadContainer.style.display = ''; // Restores the default display property

        var header = document.querySelector('ytd-app');
        header.style.transitionDuration = '0.3s';
        header.style.marginTop = ''; // Resets the margin-top property
    }

    function checkFullscreen() {
        isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        if (isFullscreen) {
            hideTop();
        } else if (isLeavingFullscreen) {
            hideTop();
            isLeavingFullscreen = false;
        }
    }

    setTimeout(function () {
        hideTop();
        checkFullscreen();

        document.addEventListener('mousemove', function (event) {
            if (isFullscreen) {
                return;
            }

            var target = event.target;
            var isSearchBox = target.closest('#masthead-container #search');
            if (isSearchBox) {
                return;
            }

            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var mouseY = event.clientY;

            if (scrollTop === 0 && mouseY <= 50) { // Adjust the threshold as needed
                clearTimeout(delayTimer);
                showTop();
            } else {
                clearTimeout(delayTimer);
                delayTimer = setTimeout(function () {
                    hideTop();
                }, 250); // after mousing away, delay 250 ms before hiding the top bar
            }
        });

        // Detect when the mouse leaves the viewport
        document.addEventListener('mouseout', function (event) {
            if (!event.relatedTarget && !isFullscreen) {
                hideTop();
            }
        });
    }, 5000); // Delay 5 seconds before initial hide happens

    // Add CSS for smooth transition
    var css = `
        ytd-app {
            transition: margin-top 0.3s ease;
        }
    `;

    var style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    window.addEventListener('resize', checkFullscreen);
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('msfullscreenchange', checkFullscreen);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'F' || event.detail === 2) {
            isLeavingFullscreen = true;
            setTimeout(checkFullscreen, 0);
        }
    });
})();
