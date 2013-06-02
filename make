rm personaswitcher.xpi

zip personaswitcher.xpi \
    make \
    install.rdf \
    chrome.manifest \
    chrome/content/about.xul \
    chrome/content/overlay-fx.xul \
    chrome/content/overlay-tb.xul \
    chrome/content/overlay.js \
    chrome/content/options.xul \
    chrome/locale/ \
    chrome/locale/en-US/ \
    chrome/locale/en-US/about.dtd \
    chrome/locale/en-US/options.dtd \
    chrome/locale/en-US/overlay.dtd \
    chrome/locale/en-US/personaswitcher.properties \
    chrome/locale/zh-TW/ \
    chrome/locale/zh-TW/about.dtd \
    chrome/locale/zh-TW/options.dtd \
    chrome/locale/zh-TW/overlay.dtd \
    chrome/locale/zh-TW/personaswitcher.properties \
    chrome/skin/PersonaSwitcher16.png \
    chrome/skin/PersonaSwitcher24.png \
    chrome/skin/PersonaSwitcher32.png \
    chrome/skin/PersonaSwitcher48.png \
    chrome/skin/PersonaSwitcher64.png \
    chrome/skin/toolbar-button.css \
    defaults/preferences/prefs.js \
    LWTS/PersonaSwitcher.jsm
