rm personaswitcher.xpi

zip personaswitcher.xpi \
	webextension/manifest.json \
	webextension/_locales/en_US/messages.json \
	webextension/_locales/zh_TW/messages.json \
	webextension/_locales/zh_CN/messages.json \
	webextension/_locales/de/messages.json \
	webextension/_locales/it/messages.json \
	webextension/background_scripts/WEPersonaSwitcher.js \
	webextension/browser_action/popup.css \
	webextension/browser_action/popup.html \
	webextension/browser_action/popup.js \
	webextension/icons/PersonaSwitcher16.png \
	webextension/icons/PersonaSwitcher24.png \
	webextension/icons/PersonaSwitcher32.png \
	webextension/icons/PersonaSwitcher48.png \
	webextension/icons/PersonaSwitcher64.png \
	webextension/preferences/options.html \
	webextension/preferences/options.js
