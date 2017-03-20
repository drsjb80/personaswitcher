var preferences = [ "defaultKeyShift", "defaultKeyControl", "defaultKeyAlt", "defaultKeyMeta",
					"defaultKeyAccel", "defaultKeyOS", "defaultKey", "rotateKeyShift",
					"rotateKeyControl", "rotateKeyAlt",	"rotateKeyMeta", "rotateKeyAccel",
					"rotateKeyOS", "rotateKey",	"autoKeyShift",	"autoKeyControl", "autoKeyAlt",
					"autoKeyMeta", "autoKeyAccel", "autoKeyOS", "autoKey", "accessKey",
					"activateKeyShift", "activateKeyControl", "activateKeyAlt", "activateKeyMeta",
					"activateKeyAccel", "activateKeyOs", "activateKey", "auto",	"autoMinutes", 
					"random", "startupSwitch", "preview", "previewDelay", "iconPreview", 
					"toolboxMinHeight", "toolsMenu", "mainMenuBar"];

var defaultKeyShift_object = document.querySelector("#default-key-shift");
var defaultKeyControl_object = document.querySelector("#default-key-control");
var defaultKeyAlt_object = document.querySelector("#default-key-alt");
var defaultKeyMeta_object = document.querySelector("#default-key-meta");
var defaultKeyAccel_object = document.querySelector("#default-key-accel");
var defaultKeyOS_object = document.querySelector("#default-key-os");
var defaultKey_object = document.querySelector("#default-key");
var rotateKeyShift_object = document.querySelector("#rotate-key-shift");
var rotateKeyControl_object = document.querySelector("#rotate-key-control");
var rotateKeyAlt_object = document.querySelector("#rotate-key-alt");
var rotateKeyMeta_object = document.querySelector("#rotate-key-meta");
var rotateKeyAccel_object = document.querySelector("#rotate-key-accel");
var rotateKeyOS_object = document.querySelector("#rotate-key-os");
var rotateKey_object = document.querySelector("#rotate-key");
var autoKeyShift_object = document.querySelector("#auto-key-shift");
var autoKeyControl_object = document.querySelector("#auto-key-control");
var autoKeyAlt_object = document.querySelector("#auto-key-alt");
var autoKeyMeta_object = document.querySelector("#auto-key-meta");
var autoKeyAccel_object = document.querySelector("#auto-key-accel");
var autoKeyOS_object = document.querySelector("#auto-key-os");
var autoKey_object = document.querySelector("#auto-key");
var accessKey_object = document.querySelector("#access-key");
var activateKeyShift_object = document.querySelector("#activate-key-shift");
var activateKeyControl_object = document.querySelector("#activate-key-control");
var activateKeyAlt_object = document.querySelector("#activate-key-alt");
var activateKeyMeta_object = document.querySelector("#activate-key-meta");
var activateKeyAccel_object = document.querySelector("#activate-key-accel");
var activateKeyOS_object = document.querySelector("#activate-key-os");
var activateKey_object = document.querySelector("#activate-key");
var auto_object = document.querySelector("#auto");
var autoMinutes_object = document.querySelector("#auto-minutes");
var random_object = document.querySelector("#random");
var startupSwitch_object = document.querySelector("#startup-switch");
var preview_object = document.querySelector("#preview");
var previewDelay_object = document.querySelector("#preview-delay");
var iconPreview_object = document.querySelector("#icon-preview");
var toolboxMinHeight_object = document.querySelector("#toolbox-minheight");
var toolsMenu_object = document.querySelector("#tools-menu");
var mainMenuBar_object = document.querySelector("#main-menubar");

function saveOptions(e){
	e.preventDefault();
	var setting = browser.storage.local.set(
		{
			defaultKeyShift: defaultKeyShift_object.checked,
			defaultKeyControl: defaultKeyControl_object.checked,
			defaultKeyAlt: defaultKeyAlt_object.checked,
			defaultKeyMeta: defaultKeyMeta_object.checked,
			defaultKeyAccel: defaultKeyAccel_object.checked,
			defaultKeyOS: defaultKeyOS_object.checked,
			defaultKey: defaultKey_object.value,
			rotateKeyShift: rotateKeyShift_object.checked,
			rotateKeyControl: rotateKeyControl_object.checked,
			rotateKeyAlt: rotateKeyAlt_object.checked,
			rotateKeyMeta: rotateKeyMeta_object.checked,
			rotateKeyAccel: rotateKeyAccel_object.checked,
			rotateKeyOS: rotateKeyOS_object.checked,
			rotateKey: rotateKey_object.value,
			autoKeyShift: autoKeyShift_object.checked,
			autoKeyControl: autoKeyControl_object.checked,
			autoKeyAlt: autoKeyAlt_object.checked,
			autoKeyMeta: autoKeyMeta_object.checked,
			autoKeyAccel: autoKeyAccel_object.checked,
			autoKeyOS: autoKeyOS_object.checked,
			autoKey: autoKey_object.value,
			accessKey: accessKey_object.value,
			activateKeyShift: activateKeyShift_object.checked,
			activateKeyControl: activateKeyControl_object.checked,
			activateKeyAlt: activateKeyAlt_object.checked,
			activateKeyMeta: activateKeyMeta_object.checked,
			activateKeyAccel: activateKeyAccel_object.checked,
			activateKeyOs: activateKeyOS_object.checked,
			activateKey: activateKey_object.value,
			auto: auto_object.checked,
			autoMinutes: autoMinutes_object.value,
			random: random_object.checked,
			startupSwitch: startupSwitch_object.checked,
			preview: preview_object.checked,
			previewDelay: previewDelay_object.value,
			iconPreview: iconPreview_object.checked,
			toolboxMinHeight: toolboxMinHeight_object.value,
			toolsMenu: toolsMenu_object.checked,
			mainMenuBar: mainMenuBar_object.checked
		});
	setting.catch(onError);
}

function loadOptions(){
 
  function getCurrentPrefs(result) {
  	defaultKeyShift_object.checked = result.defaultKeyShift;
  	defaultKeyControl_object.checked = result.defaultKeyControl;
  	defaultKeyAlt_object.checked = result.defaultKeyAlt;
  	defaultKeyMeta_object.checked = result.defaultKeyMeta;
  	defaultKeyAccel_object.checked = result.defaultKeyAccel;
  	defaultKeyOS_object.checked = result.defaultKeyOS;
    defaultKey_object.value = result.defaultKey;
    rotateKeyShift_object.checked = result.rotateKeyShift;
	rotateKeyControl_object.checked = result.rotateKeyControl;
	rotateKeyAlt_object.checked = result.rotateKeyAlt;
	rotateKeyMeta_object.checked = result.rotateKeyMeta;
	rotateKeyAccel_object.checked = result.rotateKeyAccel;
	rotateKeyOS_object.checked = result.rotateKeyOS;
	rotateKey_object.value = result.rotateKey;
	autoKeyShift_object.checked = result.autoKeyShift;
	autoKeyControl_object.checked = result.autoKeyControl;
	autoKeyAlt_object.checked = result.autoKeyAlt;
	autoKeyMeta_object.checked = result.autoKeyMeta;
	autoKeyAccel_object.checked = result.autoKeyAccel;
	autoKeyOS_object.checked = result.autoKeyOS;
	autoKey_object.value = result.autoKey;
	accessKey_object.value = result.accessKey;
	activateKeyShift_object.checked = result.activateKeyShift;
	activateKeyControl_object.checked = result.activateKeyControl;
	activateKeyAlt_object.checked = result.activateKeyAlt;
	activateKeyMeta_object.checked = result.activateKeyMeta;
	activateKeyAccel_object.checked = result.activateKeyAccel;
	activateKeyOS_object.checked = result.activateKeyOs;
	activateKey_object.value = result.activateKey;
	auto_object.checked = result.auto;
	autoMinutes_object.value = result.autoMinutes;
	random_object.checked = result.random;
	startupSwitch_object.checked = result.startupSwitch;
	preview_object.checked = result.preview;
	previewDelay_object.value = result.previewDelay;
	iconPreview_object.checked = result.iconPreview;
	toolboxMinHeight_object.value = result.toolboxMinHeight;
	toolsMenu_object.checked = result.toolsMenu;
	mainMenuBar_object.checked = result.mainMenuBar;
  }

  var getting = browser.storage.local.get(preferences);
  getting.then(getCurrentPrefs, onError);
}

// Send a request message to the background script to reload and store the default 
// prefs. After a response message is received, reload the prefs on the menu.
function reloadDefaultPreferences(){
	var sending = browser.runtime.sendMessage({message: "load defaults"});
	sending.then(result => { if("defaults loaded" === result.response) {
								loadOptions();
							}else{
								onError(result.error);
							}});
}

function resetOptions(){
	var clearStorage = browser.storage.local.clear();
	clearStorage.then(reloadDefaultPreferences, onError); 
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function localizeHtmlPage()
{
    var objects = document.getElementsByName("i18n");
    for (var j = 0; j < objects.length; j++)
    {	
        var obj = objects[j];
		obj.innerHTML = browser.i18n.getMessage(obj.id.toString());
    }
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.addEventListener('DOMContentLoaded', localizeHtmlPage);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
