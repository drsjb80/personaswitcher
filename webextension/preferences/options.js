/* global browser */

var preferences = ["defaultKeyShift", "defaultKeyControl", "defaultKeyAlt",
                    "defaultKeyMeta", "defaultKeyAccel", "defaultKeyOS",
                    "defaultKey", "rotateKeyShift", "rotateKeyControl",
                    "rotateKeyAlt", "rotateKeyMeta", "rotateKeyAccel",
                    "rotateKeyOS", "rotateKey", "autoKeyShift", 
					"autoKeyControl", "autoKeyAlt", "autoKeyMeta", 
					"autoKeyAccel", "autoKeyOS", "autoKey", "accessKey", 
					"activateKeyShift", "activateKeyControl", 
					"activateKeyAlt", "activateKeyMeta",
                    "activateKeyAccel", "activateKeyOs", "activateKey",
                    "toolsKeyShift", "toolsKeyControl", "toolsKeyAlt",
                    "toolsKeyMeta", "toolsKeyAccel", "toolsKeyOs", "toolsKey",
                    "auto", "autoMinutes", "random", "startupSwitch", "preview",
                    "previewDelay", "iconPreview", "toolboxMinHeight", 
					"toolsMenu", "mainMenuBar", "debug", "fastSwitch", 
					"staticMenus", "toolboxMaxHeight"];

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
var toolsKeyShiftObject = document.querySelector("#tools-key-shift");
var toolsKeyControlObject = document.querySelector("#tools-key-control");
var toolsKeyAltObject = document.querySelector("#tools-key-alt");
var toolsKeyMetaObject = document.querySelector("#tools-key-meta");
var toolsKeyAccelObject = document.querySelector("#tools-key-accel");
var toolsKeyOSObject = document.querySelector("#tools-key-os");
var toolsKeyObject = document.querySelector("#tools-key");
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
var debugObject = document.querySelector("#debug");
var fastSwitchObject = document.querySelector("#fast-switch");
var staticMenusObject = document.querySelector("#static-menus");
var toolboxMaxHeightObject = document.querySelector("#toolbox-maxheight");

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
            toolsKeyShift: toolsKeyShiftObject.checked,
            toolsKeyControl: toolsKeyControlObject.checked,
            toolsKeyAlt: toolsKeyAltObject.checked,
            toolsKeyMeta: toolsKeyMetaObject.checked,
            toolsKeyAccel: toolsKeyAccelObject.checked,
            toolsKeyOs: toolsKeyOSObject.checked,
            toolsKey: toolsKeyObject.value,
            auto: autoObject.checked,
            autoMinutes: parseInt(autoMinutesObject.value),
            random: randomObject.checked,
            startupSwitch: startupSwitchObject.checked,
            preview: previewObject.checked,
            previewDelay: parseInt(previewDelayObject.value),
            iconPreview: iconPreviewObject.checked,
            toolboxMinHeight: parseInt(toolboxMinHeightObject.value),
            toolsMenu: toolsMenuObject.checked,
            mainMenuBar: mainMenuBarObject.checked,
            debug: debugObject.checked,
            fastSwitch: fastSwitchObject.checked,
            staticMenus: staticMenusObject.checked,
            toolboxMaxHeight: parseInt(toolboxMaxHeightObject.value)
        });
    setting.catch(onError);

    //Update hint on minimum toolbox height preference
    updateMaxHeight(toolboxMaxHeightObject.value);
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
        toolsKeyShiftObject.checked = result.toolsKeyShift;
        toolsKeyControlObject.checked = result.toolsKeyControl;
        toolsKeyAltObject.checked = result.toolsKeyAlt;
        toolsKeyMetaObject.checked = result.toolsKeyMeta;
        toolsKeyAccelObject.checked = result.toolsKeyAccel;
        toolsKeyOSObject.checked = result.toolsKeyOs;
        toolsKeyObject.value = result.toolsKey;
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
        debugObject.checked = result.debug;
        fastSwitchObject.checked = result.fastSwitch;
        staticMenusObject.checked = result.staticMenus;
        toolboxMaxHeightObject.value = result.toolboxMaxHeight;

        
		//If the two auto preferences don't match, update the WebExtension's preference
        if(results[0].auto !== results[1].auto) 
        {
            browser.storage.local.set({auto: results[1].auto});
        }

        //Update hint on minimum toolbox height preference
        updateMaxHeight(result.toolboxMaxHeight);

        //Update the visibility of the menu shortcut key preferences
        updateToolsMenuShortcutDisplay();
        updateMenuShortcutDisplay();
  }

		//Because the auto preference can be toggled silently in the bootstrap code
		//we need to load the preference from there instead of the WebExtension, and 
		//update the WebExtension's auto preference if necessary.
		var getting = Promise.all([
			browser.storage.local.get(preferences),
			browser.runtime.sendMessage({command: "Return-Pref-Auto"})
        ]);

		getting.then(getCurrentPrefs, onError);
}

// Send a request message to the background script to reload and store the  
// default prefs. After a response message is received, reload the prefs on the 
//menu.
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

// Shows or hides the advanced options menu
function displayAdvanced()
{
	var advancedOptionsObject = document.getElementById("advancedOptions");

	if(advancedOptionsObject.style.display === "block")
	{
		advancedOptionsObject.style.display = "none";
	}
	else
	{
		advancedOptionsObject.style.display = "block";
	}
}

function updateMaxHeight(value)
{
        toolboxMinHeightObject.max = value;
        var maxHeightHintObject = document.getElementById("maxHeight");
        maxHeightHintObject.innerHTML = toolboxMinHeightObject.max;
}

function updateToolsMenuShortcutDisplay()
{
    if(toolsMenuObject.checked)
    {
        document.getElementById("options_kbshortcuts_tools").
			style.color = "black";
        document.getElementById("toolsMenuShortcutOptions").
			style.color = "black";
        toolsKeyShiftObject.disabled = false;
        toolsKeyControlObject.disabled = false;
        toolsKeyAltObject.disabled = false;
        toolsKeyMetaObject.disabled = false;
        toolsKeyAccelObject.disabled = false;
        toolsKeyOSObject.disabled = false;
        toolsKeyObject.disabled = false;
    }
    else
    {
        document.getElementById("options_kbshortcuts_tools").
			style.color = "gray";
        document.getElementById("toolsMenuShortcutOptions").
			style.color = "gray";
        toolsKeyShiftObject.disabled = true;
        toolsKeyControlObject.disabled = true;
        toolsKeyAltObject.disabled = true;
        toolsKeyMetaObject.disabled = true;
        toolsKeyAccelObject.disabled = true;
        toolsKeyOSObject.disabled = true;
        toolsKeyObject.disabled = true;
    }
}

function updateMenuShortcutDisplay()
{
    if(mainMenuBarObject.checked)
    {
        document.getElementById("options_kbshortcuts_access").
			style.color = "black";
        document.getElementById("options_kbshortcuts_activate").
			style.color = "black";
        document.getElementById("menuShortcutOptions").
			style.color = "black";
        accessKeyObject.disabled = false;
        activateKeyShiftObject.disabled = false;
        activateKeyControlObject.disabled = false;
        activateKeyAltObject.disabled = false;
        activateKeyMetaObject.disabled = false;
        activateKeyAccelObject.disabled = false;
        activateKeyOSObject.disabled = false;
        activateKeyObject.disabled = false;
    }
    else
    {
        document.getElementById("options_kbshortcuts_access").
			style.color = "gray";
        document.getElementById("options_kbshortcuts_activate").
			style.color = "gray";
        document.getElementById("menuShortcutOptions").
			style.color = "gray";
        accessKeyObject.disabled = true;
        activateKeyShiftObject.disabled = true;
        activateKeyControlObject.disabled = true;
        activateKeyAltObject.disabled = true;
        activateKeyMetaObject.disabled = true;
        activateKeyAccelObject.disabled = true;
        activateKeyOSObject.disabled = true;
        activateKeyObject.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.addEventListener('DOMContentLoaded', localizeHtmlPage);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
document.getElementById("advancedButton").addEventListener(
	"click", displayAdvanced);
document.getElementById("main-menubar").addEventListener(
	"change", updateMenuShortcutDisplay);
document.getElementById("tools-menu").addEventListener(
	"change", updateToolsMenuShortcutDisplay);