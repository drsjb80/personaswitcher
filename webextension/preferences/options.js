var preferences = [ "defaultKeyShift", "defaultKeyControl", "defaultKeyAlt", 
					"defaultKeyMeta", "defaultKeyAccel", "defaultKeyOS", 
					"defaultKey", "rotateKeyShift",	"rotateKeyControl",
					"rotateKeyAlt",	"rotateKeyMeta", "rotateKeyAccel",
					"rotateKeyOS", "rotateKey",	"autoKeyShift",
					"autoKeyControl", "autoKeyAlt",	"autoKeyMeta",
					"autoKeyAccel", "autoKeyOS", "autoKey", "accessKey",
					"activateKeyShift", "activateKeyControl", "activateKeyAlt",
					"activateKeyMeta", "activateKeyAccel",  "activateKeyOs",
					"activateKey", "auto",	"autoMinutes", "random",
					"startupSwitch", "preview", "previewDelay", "iconPreview", 
					"toolboxMinHeight", "toolsMenu", "mainMenuBar"];

var defaultKeyShiftObject = document.querySelector("#default-key-shift");
var defaultKeyControlObject = document.querySelector("#default-key-control");
var defaultKeyAltObject = document.querySelector("#default-key-alt");
var defaultKeyMetaObject = document.querySelector("#default-key-meta");
var defaultKeyAccelObject = document.querySelector("#default-key-accel");
var defaultKeyOSObject = document.querySelector("#default-key-os");
var defaultKeyObject = document.querySelector("#default-key");
var rotateKeyShiftObject = document.querySelector("#rotate-key-shift");
var rotateKeyControlObject = document.querySelector("#rotate-key-control");
var rotateKeyAltObject = document.querySelector("#rotate-key-alt");
var rotateKeyMetaObject = document.querySelector("#rotate-key-meta");
var rotateKeyAccelObject = document.querySelector("#rotate-key-accel");
var rotateKeyOSObject = document.querySelector("#rotate-key-os");
var rotateKeyObject = document.querySelector("#rotate-key");
var autoKeyShiftObject = document.querySelector("#auto-key-shift");
var autoKeyControlObject = document.querySelector("#auto-key-control");
var autoKeyAltObject = document.querySelector("#auto-key-alt");
var autoKeyMetaObject = document.querySelector("#auto-key-meta");
var autoKeyAccel_object = document.querySelector("#auto-key-accel");
var autoKeyOSObject = document.querySelector("#auto-key-os");
var autoKeyObject = document.querySelector("#auto-key");
var accessKeyObject = document.querySelector("#access-key");
var activateKeyShiftObject = document.querySelector("#activate-key-shift");
var activateKeyControlObject = document.querySelector("#activate-key-control");
var activateKeyAltObject = document.querySelector("#activate-key-alt");
var activateKeyMetaObject = document.querySelector("#activate-key-meta");
var activateKeyAccelObject = document.querySelector("#activate-key-accel");
var activateKeyOSObject = document.querySelector("#activate-key-os");
var activateKeyObject = document.querySelector("#activate-key");
var autoObject = document.querySelector("#auto");
var autoMinutesObject = document.querySelector("#auto-minutes");
var randomObject = document.querySelector("#random");
var startupSwitchObject = document.querySelector("#startup-switch");
var previewObject = document.querySelector("#preview");
var previewDelayObject = document.querySelector("#preview-delay");
var iconPreviewObject = document.querySelector("#icon-preview");
var toolboxMinHeightObject = document.querySelector("#toolbox-minheight");
var toolsMenuObject = document.querySelector("#tools-menu");
var mainMenuBarObject = document.querySelector("#main-menubar");

function saveOptions(e)
{
	e.preventDefault();
	var setting = browser.storage.local.set(
		{
			defaultKeyShift: defaultKeyShiftObject.checked,
			defaultKeyControl: defaultKeyControlObject.checked,
			defaultKeyAlt: defaultKeyAltObject.checked,
			defaultKeyMeta: defaultKeyMetaObject.checked,
			defaultKeyAccel: defaultKeyAccelObject.checked,
			defaultKeyOS: defaultKeyOSObject.checked,
			defaultKey: defaultKeyObject.value,
			rotateKeyShift: rotateKeyShiftObject.checked,
			rotateKeyControl: rotateKeyControlObject.checked,
			rotateKeyAlt: rotateKeyAltObject.checked,
			rotateKeyMeta: rotateKeyMetaObject.checked,
			rotateKeyAccel: rotateKeyAccelObject.checked,
			rotateKeyOS: rotateKeyOSObject.checked,
			rotateKey: rotateKeyObject.value,
			autoKeyShift: autoKeyShiftObject.checked,
			autoKeyControl: autoKeyControlObject.checked,
			autoKeyAlt: autoKeyAltObject.checked,
			autoKeyMeta: autoKeyMetaObject.checked,
			autoKeyAccel: autoKeyAccel_object.checked,
			autoKeyOS: autoKeyOSObject.checked,
			autoKey: autoKeyObject.value,
			accessKey: accessKeyObject.value,
			activateKeyShift: activateKeyShiftObject.checked,
			activateKeyControl: activateKeyControlObject.checked,
			activateKeyAlt: activateKeyAltObject.checked,
			activateKeyMeta: activateKeyMetaObject.checked,
			activateKeyAccel: activateKeyAccelObject.checked,
			activateKeyOs: activateKeyOSObject.checked,
			activateKey: activateKeyObject.value,
			auto: autoObject.checked,
			autoMinutes: parseInt(autoMinutesObject.value),
			random: randomObject.checked,
			startupSwitch: startupSwitchObject.checked,
			preview: previewObject.checked,
			previewDelay: parseInt(previewDelayObject.value),
			iconPreview: iconPreviewObject.checked,
			toolboxMinHeight: parseInt(toolboxMinHeightObject.value),
			toolsMenu: toolsMenuObject.checked,
			mainMenuBar: mainMenuBarObject.checked
		});
	setting.catch(onError);
}

function loadOptions()
{
 
  function getCurrentPrefs(results)
  {
		var result = results[0];
		defaultKeyShiftObject.checked = result.defaultKeyShift;
		defaultKeyControlObject.checked = result.defaultKeyControl;
		defaultKeyAltObject.checked = result.defaultKeyAlt;
		defaultKeyMetaObject.checked = result.defaultKeyMeta;
		defaultKeyAccelObject.checked = result.defaultKeyAccel;
		defaultKeyOSObject.checked = result.defaultKeyOS;
		defaultKeyObject.value = result.defaultKey;
		rotateKeyShiftObject.checked = result.rotateKeyShift;
		rotateKeyControlObject.checked = result.rotateKeyControl;
		rotateKeyAltObject.checked = result.rotateKeyAlt;
		rotateKeyMetaObject.checked = result.rotateKeyMeta;
		rotateKeyAccelObject.checked = result.rotateKeyAccel;
		rotateKeyOSObject.checked = result.rotateKeyOS;
		rotateKeyObject.value = result.rotateKey;
		autoKeyShiftObject.checked = result.autoKeyShift;
		autoKeyControlObject.checked = result.autoKeyControl;
		autoKeyAltObject.checked = result.autoKeyAlt;
		autoKeyMetaObject.checked = result.autoKeyMeta;
		autoKeyAccel_object.checked = result.autoKeyAccel;
		autoKeyOSObject.checked = result.autoKeyOS;
		autoKeyObject.value = result.autoKey;
		accessKeyObject.value = result.accessKey;
		activateKeyShiftObject.checked = result.activateKeyShift;
		activateKeyControlObject.checked = result.activateKeyControl;
		activateKeyAltObject.checked = result.activateKeyAlt;
		activateKeyMetaObject.checked = result.activateKeyMeta;
		activateKeyAccelObject.checked = result.activateKeyAccel;
		activateKeyOSObject.checked = result.activateKeyOs;
		activateKeyObject.value = result.activateKey;
		//Load the auto value from the bootstrap pref until shortcuts are migrated
		autoObject.checked = results[1].auto;
		autoMinutesObject.value = result.autoMinutes;
		randomObject.checked = result.random;
		startupSwitchObject.checked = result.startupSwitch;
		previewObject.checked = result.preview;
		previewDelayObject.value = result.previewDelay;
		iconPreviewObject.checked = result.iconPreview;
		toolboxMinHeightObject.value = result.toolboxMinHeight;
		toolsMenuObject.checked = result.toolsMenu;
		mainMenuBarObject.checked = result.mainMenuBar;
		
		//If the two auto preferences don't match, update the WebExtension's preference
		if(results[0].auto !== results[1].auto) {
			browser.storage.local.set({auto: results[1].auto});
		}
  }

	//Because the auto preference can be toggled silently in the bootstrap code we
	//need to load the preference from there instead of the WebExtension, and update
	//the WebExtension's auto preference if necessary.
  var getting = Promise.all([
		browser.storage.local.get(preferences),
		browser.runtime.sendMessage({command: "Return-Pref-Auto"})
	]);
  getting.then(getCurrentPrefs, onError);
}

// Send a request message to the background script to reload and store the default 
// prefs. After a response message is received, reload the prefs on the menu.
function resetOptions()
{
	var backgroundPage = browser.extension.getBackgroundPage();
	backgroundPage.loadDefaults().then(function() 
	{  
		loadOptions();
	}); 
}

function onError(error) 
{
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