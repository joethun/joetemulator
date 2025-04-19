(function () {

    if (window.location.pathname.includes('retroarch') && !window.location.href.includes('core=')) {

        const loc = window.location;
        const separator = loc.search ? '&' : '?';
        const redirectUrl = loc.href + separator + 'core=autodetect';


        window.location.replace(redirectUrl);
    }

    else if (window.location.href.includes('core=')) {

        document.addEventListener('DOMContentLoaded', function () {

            document.title = "retroarch";

            if (window.history && window.history.replaceState) {

                const cleanUrl = window.location.href.split('?')[0];

                window.history.replaceState({}, document.title, cleanUrl);
            }
            const titleObserver = new MutationObserver(function () {
                if (document.title.includes('|')) {
                    const gameName = document.title.split('|')[0].trim();
                    document.title = gameName + ' - retroarch';
                }
            });

            titleObserver.observe(document.querySelector('title'), {
                childList: true,
                characterData: true,
                subtree: true
            });
        });
    }
})();

document.addEventListener('DOMContentLoaded', function () {
const style = document.createElement('style');
style.id = 'force-black-buttons-style';
style.innerHTML = `
    html body #modals #managers #savemanager table.managertableparent tbody.managertable#savetable tr td span[data-action="download"],
    html body #modals #managers #savemanager table.managertableparent tbody.managertable#savetable tr td span[data-action="delete"] {
        background-color: var(--button-bg-color) !important;
        background: var(--button-bg-color) !important;
        text-transform: lowercase !important;
        color: #f9f9f9 !important;
    }
    span[data-action="download"],
    span[data-action="delete"] {
        background-color: var(--button-bg-color) !important;
        background: var(--button-bg-color) !important;
        text-transform: lowercase !important;
        color: #f9f9f9 !important;
    }
    
    html body #modals #managers #keybindmanager #savekeybinds,
    html body #modals #managers #keybindmanager #resetkeybinds {
        background-color: var(--button-bg-color) !important;
        background: var(--button-bg-color) !important;
        text-transform: lowercase !important;
        color: #f9f9f9 !important;
        border-color: var(--button-border-color) !important;
    }
    #savekeybinds,
    #resetkeybinds {
        background-color: var(--button-bg-color) !important;
        background: var(--button-bg-color) !important;
        text-transform: lowercase !important;
        color: #f9f9f9 !important;
        border-color: var(--button-border-color) !important;
    }
`;
document.head.appendChild(style);
});

window.addEventListener('load', function () {
    setTimeout(function () {
        const themes = {
            default: {
                backgroundColor: "#00070a",
                buttonBorderColor: "#1aafff",
                buttonBackgroundColor: "#00141f",
                articleBackgroundColor: "#00141f",
                boxBackgroundColor: "#00141f",
                boxBorderColor: "#1aafff",
                textColor: "#1aafff",
            },
            pink: {
                backgroundColor: "#080203",
                buttonBorderColor: "#e37383",
                buttonBackgroundColor: "#190508",
                articleBackgroundColor: "#190508",
                boxBackgroundColor: "#190508",
                boxBorderColor: "#e37383",
                textColor: "#e37383",
            },
            green: {
                backgroundColor: "#020802",
                buttonBorderColor: "#32cd32",
                buttonBackgroundColor: "#061906",
                articleBackgroundColor: "#061906",
                boxBackgroundColor: "#061906",
                boxBorderColor: "#32cd32",
                textColor: "#32cd32",
            },
            purple: {
                backgroundColor: "#050308",
                buttonBorderColor: "#7842bd",
                buttonBackgroundColor: "#0e0817",
                articleBackgroundColor: "#0e0817",
                boxBackgroundColor: "#0e0817",
                boxBorderColor: "#7842bd",
                textColor: "#7842bd",
            },
            yellow: {
                backgroundColor: "#090701",
                buttonBorderColor: "#eac456",
                buttonBackgroundColor: "#1b1503",
                articleBackgroundColor: "#1b1503",
                boxBackgroundColor: "#1b1503",
                boxBorderColor: "#eac456",
                textColor: "#eac456",
            },
            orange: {
                backgroundColor: "#0a0600",
                buttonBorderColor: "#F28500",
                buttonBackgroundColor: "#1f1100",
                articleBackgroundColor: "#1f1100",
                boxBackgroundColor: "#1f1100",
                boxBorderColor: "#F28500",
                textColor: "#F28500",
            },
            rose: {
                backgroundColor: '#090402',
                buttonBorderColor: '#ec7c42',
                buttonBackgroundColor: '#1c0b04',
                articleBackgroundColor: '#1c0b04',
                boxBackgroundColor: '#1c0b04',
                boxBorderColor: '#ec7c42',
                textColor: '#ec7c42'
            },
            amber: {
                backgroundColor: '#0a0800',
                buttonBorderColor: '#f9c200',
                buttonBackgroundColor: '#1f1800',
                articleBackgroundColor: '#1f1800',
                boxBackgroundColor: '#1f1800',
                boxBorderColor: '#f9c200',
                textColor: '#f9c200'
            },
            lime: {
                backgroundColor: '#060901',
                buttonBorderColor: '#99e619',
                buttonBackgroundColor: '#131c03',
                articleBackgroundColor: '#131c03',
                boxBackgroundColor: '#131c03',
                boxBorderColor: '#99e619',
                textColor: '#99e619'
            },
            teal: {
                backgroundColor: '#010806',
                buttonBorderColor: '#26bd99',
                buttonBackgroundColor: '#031713',
                articleBackgroundColor: '#031713',
                boxBackgroundColor: '#031713',
                boxBorderColor: '#26bd99',
                textColor: '#26bd99'
            },
            lavender: {
                backgroundColor: '#030509',
                buttonBorderColor: '#4979de',
                buttonBackgroundColor: '#070e1b',
                articleBackgroundColor: '#070e1b',
                boxBackgroundColor: '#070e1b',
                boxBorderColor: '#4979de',
                textColor: '#4979de'
            },
            magenta: {
                backgroundColor: '#070306',
                buttonBorderColor: '#ae5bb0',
                buttonBackgroundColor: '#140710',
                articleBackgroundColor: '#140710',
                boxBackgroundColor: '#140710',
                boxBorderColor: '#ae5bb0',
                textColor: '#ae5bb0'
            },
            bw: {
                backgroundColor: '#000000',
                buttonBorderColor: '#f9f9f9',
                buttonBackgroundColor: '#111111',
                articleBackgroundColor: '#111111',
                boxBackgroundColor: '#111111',
                boxBorderColor: '#f9f9f9',
                textColor: '#f9f9f9'
            },
            beige: {
                backgroundColor: '#060504',
                buttonBorderColor: '#d2b48c',
                buttonBackgroundColor: '#1a140d',
                articleBackgroundColor: '#1a140d',
                boxBackgroundColor: '#1a140d',
                boxBorderColor: '#d2b48c',
                textColor: '#d2b48c'
            }
        };

        const savedTheme = localStorage.getItem("theme") || "default";
        const selectedTheme = themes[savedTheme];

        if (selectedTheme) {
            document.documentElement.style.setProperty('--body-bg-color', selectedTheme.backgroundColor);
            document.documentElement.style.setProperty('--menu-bg-color', selectedTheme.backgroundColor);
            document.documentElement.style.setProperty('--popup-bg-color', selectedTheme.backgroundColor);
            document.documentElement.style.setProperty('--button-bg-color', selectedTheme.buttonBackgroundColor);
            document.documentElement.style.setProperty('--button-border-color', selectedTheme.buttonBorderColor);
            document.documentElement.style.setProperty('--scrollbar-track-color', selectedTheme.backgroundColor);
            document.documentElement.style.setProperty('--scrollbar-thumb-color', selectedTheme.buttonBorderColor);

            const isLightTheme = ['bw'].includes(savedTheme);
            document.documentElement.style.setProperty('--button-text-color', isLightTheme ? '#000' : selectedTheme.buttonBorderColor);
            document.documentElement.style.setProperty('--text-color', '#f9f9f9');

            document.body.style.backgroundColor = selectedTheme.backgroundColor;
        }

        const keybindsButton = document.getElementById('keybindsbutton');
        if (keybindsButton) {
            keybindsButton.textContent = 'keybinds';

            const managerTitleObserver = new MutationObserver(function () {
                const managerTitle = document.getElementById('managertitle');
                if (managerTitle) {
                    if (managerTitle.textContent === 'Keybinds') {
                        managerTitle.textContent = 'keybinds';
                    }
                    else if (managerTitle.textContent === 'Saves & States') {
                        managerTitle.textContent = 'saves/states';

                        setTimeout(function () {
                            const buttonBgColor = getComputedStyle(document.documentElement).getPropertyValue('--button-bg-color').trim() || '#00141f';
                            const buttonBorderColor = getComputedStyle(document.documentElement).getPropertyValue('--button-border-color').trim() || '#1aafff';
                            const buttonTextColor = getComputedStyle(document.documentElement).getPropertyValue('--button-text-color').trim() || '#fff';
                            const savedTheme = localStorage.getItem("theme") || "default";
                            const isLightTheme = ['bw'].includes(savedTheme);

                            const actionSpans = document.querySelectorAll('span[data-action]');
                            actionSpans.forEach(function (span) {
                                if (span.getAttribute('data-action') === 'download' ||
                                    span.getAttribute('data-action') === 'delete') {
                                    span.classList.add('theme-styled-button');
                                }
                            });
                        }, 1);
                    }
                }
            });

            managerTitleObserver.observe(document.body, { childList: true, subtree: true });
        }

        const screenshotsButton = document.querySelector('li a#screenshotsbutton');
        if (screenshotsButton && screenshotsButton.parentNode) {
            screenshotsButton.parentNode.remove();
        }

        function processKeybindLabels(cell) {
            if (cell.textContent.includes('player1_')) {
                cell.textContent = cell.textContent.replace('player1_', '');
            }

            if (cell.textContent.includes('l_')) {
                cell.textContent = cell.textContent.replace('l_', 'left ');
            }
            if (cell.textContent.includes('l3_btn')) {
                cell.textContent = cell.textContent.replace('l3_btn', 'left stick: button');
            }
            if (cell.textContent.includes('l2')) {
                cell.textContent = cell.textContent.replace('l2', 'left trigger');
            }
            if (cell.textContent === 'l') {
                cell.textContent = 'left bumper';
            } else if (cell.textContent.match(/\bl\b/)) {
                cell.textContent = cell.textContent.replace(/\bl\b/, 'left');
            }

            if (cell.textContent === 'left x_minus') {
                cell.textContent = 'left stick: left';
            }
            if (cell.textContent === 'left x_plus') {
                cell.textContent = 'left stick: right';
            }
            if (cell.textContent === 'left y_minus') {
                cell.textContent = 'left stick: down';
            }
            if (cell.textContent === 'left y_plus') {
                cell.textContent = 'left stick: up';
            }

            if (cell.textContent.includes('r_')) {
                cell.textContent = cell.textContent.replace('r_', 'right ');
            }
            if (cell.textContent.includes('r3_btn')) {
                cell.textContent = cell.textContent.replace('r3_btn', 'right stick: button');
            }
            if (cell.textContent.includes('r2')) {
                cell.textContent = cell.textContent.replace('r2', 'right trigger');
            }
            if (cell.textContent === 'r') {
                cell.textContent = 'right bumper';
            } else if (cell.textContent === 'staright bumpert') {
                cell.textContent = 'start';
            } else if (cell.textContent === 'seleft bumperect') {
                cell.textContent = 'select';
            } else if (cell.textContent.match(/\br\b/)) {
                cell.textContent = cell.textContent.replace(/\br\b/, 'right');
            }

            if (cell.textContent === 'right x_minus') {
                cell.textContent = 'right stick: left';
            }
            if (cell.textContent === 'right x_plus') {
                cell.textContent = 'right stick: right';
            }
            if (cell.textContent === 'right y_minus') {
                cell.textContent = 'right stick: down';
            }
            if (cell.textContent === 'right y_plus') {
                cell.textContent = 'right stick: up';
            }

            if (cell.textContent.includes('_')) {
                cell.textContent = cell.textContent.replace(/_/g, ' ');
            }
        }

        function hideHiddenRows(keybindTable) {
            Array.from(keybindTable.rows).forEach(row => {
                const firstCell = row.cells[0];
                if (firstCell && (
                    firstCell.textContent.includes('grab_mouse_toggle') ||
                    firstCell.textContent.includes('game_focus_toggle') ||
                    firstCell.textContent.includes('screenshot')
                )) {
                    row.style.display = 'none';
                }
            });
        }

        function processNulCells(keybindTable) {
            const allCells = keybindTable.querySelectorAll('td');
            allCells.forEach(function (cell) {
                if (cell.textContent === 'nul') {
                    cell.textContent = 'none';
                }
            });
        }

        function fixKeybindTable(keybindTable) {
            if (!keybindTable) return;

            hideHiddenRows(keybindTable);

            const cells = keybindTable.querySelectorAll('td:first-child');
            cells.forEach(processKeybindLabels);

            processNulCells(keybindTable);

            const managerTitle = document.getElementById('managertitle');
            if (managerTitle && managerTitle.textContent === 'Keybinds') {
                managerTitle.textContent = 'keybinds';
            }
        }

        function fixKeyBindLabels() {
            try {
                const keybindTable = document.getElementById('keybindtable');
                fixKeybindTable(keybindTable);
            } catch (e) {
            }
        }

        const originalSetupKeybindPage = window.setupKeybindPage;
        if (typeof originalSetupKeybindPage === 'function') {
            window.setupKeybindPage = function () {
                originalSetupKeybindPage.apply(this, arguments);

                setTimeout(function () {
                    const keybindTable = document.getElementById('keybindtable');
                    fixKeybindTable(keybindTable);
                    setTimeout(fixKeyBindLabels, 50);
                }, 50);
            };
        }

        const keybindTable = document.getElementById('keybindtable');
        if (keybindTable) {
            const keybindObserver = new MutationObserver(function () {
                fixKeybindTable(keybindTable);
            });

            keybindObserver.observe(keybindTable, { childList: true, subtree: true });
        }

        if (window.sidealert) {
            const originalSidealert = window.sidealert;
            window.sidealert = function () {
                return originalSidealert.apply(this, arguments);
            };
        }

        const sideAlertHolder = document.getElementById('sidealertholder');
        if (sideAlertHolder) {
            const sideAlertObserver = new MutationObserver(mutations => {
            });

            sideAlertObserver.observe(sideAlertHolder, { childList: true, subtree: true });
        }

        const disabledEmptyLinks = document.querySelectorAll('li.disabled a[href=""]');
        disabledEmptyLinks.forEach(function (link) {
            if (link.parentNode && link.style.display === 'none') {
                link.parentNode.remove();
            }
        });

        document.body.style.color = '#fff';

        const ffdDiv = document.getElementById('ffd');
        if (ffdDiv) {
            ffdDiv.style.backgroundColor = 'transparent';
            ffdDiv.style.border = 'none';
            ffdDiv.style.boxShadow = 'none';
            ffdDiv.style.padding = '0';
            ffdDiv.style.overflow = 'visible';
        }

        const coreSelectArea = document.getElementById('coreselectarea');
        if (coreSelectArea) {
            coreSelectArea.style.overflow = 'visible';

            const coreListUl = coreSelectArea.querySelector('.corelistul');
            if (coreListUl) {
                coreListUl.style.display = 'grid';
                coreListUl.style.gridTemplateColumns = 'repeat(3, 1fr)';
                coreListUl.style.gridGap = '5px';
                coreListUl.style.maxHeight = '300px';
                coreListUl.style.overflow = 'visible';
                coreListUl.style.paddingLeft = '0';

                const listItems = coreListUl.querySelectorAll('li, span > a');
                listItems.forEach(function (item) {
                    if (item.tagName === 'LI') {
                        item.style.listStyle = 'none';
                        item.style.margin = '3px';
                        item.style.whiteSpace = 'nowrap';
                    } else {
                        item.style.textDecoration = 'none';
                        item.style.color = '#ccc';
                    }
                });
            }
        }

        const textElements = document.querySelectorAll('.enhanced-container h1, .enhanced-container h3, .enhanced-container label');
        textElements.forEach(function (el) {
            el.style.color = '#fff';
        });

        const originalDocumentTitleSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'title').set;
        Object.defineProperty(document, 'title', {
            set: function (newTitle) {
                if (newTitle.includes('|')) {
                    const gameName = newTitle.split('|')[0].trim();
                    newTitle = gameName + ' - retroarch';
                }
                originalDocumentTitleSetter.call(document, newTitle);
            }
        });

        document.addEventListener('fullscreenchange', adjustMenuPosition);
        document.addEventListener('webkitfullscreenchange', adjustMenuPosition);
        document.addEventListener('mozfullscreenchange', adjustMenuPosition);
        document.addEventListener('MSFullscreenChange', adjustMenuPosition);

        window.addEventListener('resize', function () {
            const isFullScreen = window.innerHeight === screen.height && window.innerWidth === screen.width;

            if ((isFullScreen && !document.body.classList.contains('is-fullscreen')) ||
                (!isFullScreen && document.body.classList.contains('is-fullscreen'))) {
                handleFullscreenChange(isFullScreen);
            }
        });

        function handleFullscreenChange(isFullScreen) {
            const menubar = document.getElementById('menubar');
            if (!menubar) return;

            if (isFullScreen) {
                menubar.style.marginTop = '0px';
                menubar.style.marginLeft = '0px';
                document.body.classList.add('is-fullscreen');

                const savedTheme = localStorage.getItem("theme") || "default";
                const themeColor = themes[savedTheme]?.backgroundColor || '#00070a';
                document.documentElement.style.backgroundColor = themeColor;
                document.body.style.backgroundColor = themeColor;
            } else {
                menubar.style.marginTop = '-8px';
                menubar.style.marginLeft = '-8px';
                document.body.classList.remove('is-fullscreen');

                const savedTheme = localStorage.getItem("theme") || "default";
                const themeColor = themes[savedTheme]?.backgroundColor || '#00070a';
                document.body.style.backgroundColor = themeColor;
            }
        }

        function adjustMenuPosition() {
            const isInFullscreen = document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement;

            handleFullscreenChange(!!isInFullscreen);
        }

        const fullscreenButton = document.getElementById('fullscreenbutton');
        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                setTimeout(adjustMenuPosition, 100);
            });
        }


        const homeButton = document.getElementById('homebutton');
        if (homeButton) {
            homeButton.addEventListener('click', function () {
                window.location.href = 'index';
            });
        }

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => {
                    })
                    .catch(err => {
                    });
            });
        }
    });
})

document.addEventListener('DOMContentLoaded', function () {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);

        document.addEventListener(eventName, function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
    });

    document.addEventListener('dragover', function (e) {
        e.dataTransfer.dropEffect = 'none';
        e.dataTransfer.effectAllowed = 'none';
    }, true);

    document.addEventListener('drop', function (e) {
        e.dataTransfer.dropEffect = 'none';
        e.dataTransfer.effectAllowed = 'none';
    }, true);

    window.addEventListener('load', function () {
        if (window.handleFileSelect) window.handleFileSelect = function () { return false; };
        if (window.handleDragOver) window.handleDragOver = function () { return false; };
        if (window.processROM) window.processROM = function () { return false; };

        setTimeout(function () {
            if (window.handleFileSelect) window.handleFileSelect = function () { return false; };
            if (window.handleDragOver) window.handleDragOver = function () { return false; };
            if (window.processROM) window.processROM = function () { return false; };
        }, 1);
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        div#menubar,
        div#menubar *,
        ul#menu,
        ul#menu > li,
        .menuhiderlabel,
        .menuhiderlabel::before,
        .menuhiderlabel::after {
            background: none !important;
            background-color: rgba(0,0,0,0) !important;
            background-image: none !important;
        }
        
        ul#menu li ul,
        ul#menu li ul li {
            background-color: var(--menu-bg-color, #00070a) !important;
        }
    `;
    document.head.appendChild(styleEl);

    setTimeout(function () {
        document.querySelectorAll('#menubar, #menu, #menu > li, .menuhiderlabel').forEach(el => {
            el.style.setProperty('background', 'none', 'important');
            el.style.setProperty('background-color', 'rgba(0,0,0,0)', 'important');
            el.style.setProperty('background-image', 'none', 'important');
            el.style.setProperty('backdrop-filter', 'none', 'important');
            el.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            el.style.setProperty('border', 'none', 'important');
            el.style.setProperty('box-shadow', 'none', 'important');
        });
    }, 1);
});