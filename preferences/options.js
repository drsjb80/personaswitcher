/* global browser */


var preferences = ["auto", "autoMinutes", "random", "startupSwitch", "preview",
                    "previewDelay", "iconPreview", "toolsMenu", "debug", 
                    "fastSwitch"];


var autoObject = document.querySelector("#auto");
var autoMinutesObject = document.querySelector("#auto-minutes");
var randomObject = document.querySelector("#random");
var startupSwitchObject = document.querySelector("#startup-switch");
var previewObject = document.querySelector("#preview");
var previewDelayObject = document.querySelector("#preview-delay");
var iconPreviewObject = document.querySelector("#icon-preview");
var toolsMenuObject = document.querySelector("#tools-menu");
var debugObject = document.querySelector("#debug");
var fastSwitchObject = document.querySelector("#fast-switch");

function saveOptions(e)
{
    e.preventDefault();
    var setting = browser.storage.local.set(
        {
            auto: autoObject.checked,
            autoMinutes: parseInt(autoMinutesObject.value),
            random: randomObject.checked,
            startupSwitch: startupSwitchObject.checked,
            preview: previewObject.checked,
            previewDelay: parseInt(previewDelayObject.value),
            // iconPreview: iconPreviewObject.checked,
            toolsMenu: toolsMenuObject.checked,
            debug: debugObject.checked,
            fastSwitch: fastSwitchObject.checked
        });
    setting.catch(onError);
}

function loadOptions()
{ 
    function updateOptionsDisplay(prefs)
    {        
        autoObject.checked = prefs.auto;
        autoMinutesObject.value = prefs.autoMinutes;
        randomObject.checked = prefs.random;
        startupSwitchObject.checked = prefs.startupSwitch;
        previewObject.checked = prefs.preview;
        previewDelayObject.value = prefs.previewDelay;
        // iconPreviewObject.checked = prefs.iconPreview;
        toolsMenuObject.checked = prefs.toolsMenu;
        debugObject.checked = prefs.debug;
        fastSwitchObject.checked = prefs.fastSwitch;
    }

    var getPrefs = browser.storage.local.get(preferences);    
    getPrefs.then(updateOptionsDisplay, onError);
}

function resetOptions()
{
    var backgroundPage = browser.extension.getBackgroundPage();
    backgroundPage.loadDefaultPrefs().then(function() 
    {  
        loadOptions();
    }); 
}

function reloadThemes()
{
    var backgroundPage = browser.extension.getBackgroundPage();
    backgroundPage.rebuildMenus();
}

function onError(error) 
{
    console.log(`Error: ${error}`);
}

// https://developer.mozilla.org/en-US/docs/Displaying_web_content_in_an_extension_without_security_issues
function localizeHtmlPage()
{
    var objects = document.getElementsByName("i18n");
    for (var j = 0; j < objects.length; j++)
    {    
        var obj = objects[j];
        obj.textContent = browser.i18n.getMessage(obj.id.toString());
    }
}

// Shows or hides the advanced options menu
function displayAdvanced()
{
    var advancedOptionsObject = document.getElementById("advancedOptions");

    if("block" === advancedOptionsObject.style.display)
    {
        advancedOptionsObject.style.display = "none";
    }
    else
    {
        advancedOptionsObject.style.display = "block";
    }
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.addEventListener('DOMContentLoaded', localizeHtmlPage);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
document.getElementById("options_refresh_button").addEventListener("click", reloadThemes);
document.getElementById("options_advanced_options").addEventListener("click", displayAdvanced);
