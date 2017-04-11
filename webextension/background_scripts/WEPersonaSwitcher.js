function handleStartup() 
{
    var checkDefaultsLoaded = browser.storage.local.get("defaults_loaded");
    checkDefaultsLoaded
    .then(loadDefaultsIfNeeded)
    .then(setLogger)
    .then(startRotateAlarm)
    .then(getMenuData)
    .then(buildMenu)
    .then(rotateOnStartup)
    .then(function() 
    {
        return browser.storage.onChanged.addListener(handlePreferenceChange);
    })
    .catch(handleError);
}

// Verify if we need to load the default preferences by checking if the 
// default_loaded flag is undefined. 
function loadDefaultsIfNeeded(prefs) {
        if (undefined === prefs.defaults_loaded) 
        {
            return loadDefaults();
        } 
        else 
        {
            return Promise.resolve();
        }
}

function loadDefaults()
{
    var setting = browser.storage.local.set(
        {
            default_loaded: true,

            defaultKeyShift: false,
            defaultKeyControl: true,
            defaultKeyAlt: true,
            defaultKeyMeta: false,
            defaultKeyAccel: false,
            defaultKeyOS: false,
            defaultKey: "D",

            rotateKeyShift: false,
            rotateKeyControl: true,
            rotateKeyAlt: true,
            rotateKeyMeta: false,
            rotateKeyAccel: false,
            rotateKeyOS: false,
            rotateKey: "R",

            autoKeyShift: false,
            autoKeyControl: true,
            autoKeyAlt: true,
            autoKeyMeta: false,
            autoKeyAccel: false,
            autoKeyOS: false,
            autoKey: "A",

            accessKey: "P",

            activateKeyShift: false,
            activateKeyControl: true,
            activateKeyAlt: true,
            activateKeyMeta: false,
            activateKeyAccel: false,
            activateKeyOs: false,
            activateKey: "P",

            auto: false,
            autoMinutes: 30,
            random: false,
            startupSwitch: false,
            preview: false,
            previewDelay: 0,
            iconPreview: true,
            toolboxMinHeight: 0,
            toolsMenu: true,
            mainMenuBar: false,

            //hidden preferences
            debug: false,
            toolboxMaxHeight: 200,
            fastSwitch: false,
            staticMenus: true,
            current: 0
        });
    return setting.then( function() { return Promise.resolve(); }, handleError);
}

function getMenuData() 
{
    var menuPreferences = ["iconPreview", "preview", "previewDelay"];
    var getData = Promise.all([
        browser.storage.local.get(menuPreferences),
        browser.runtime.sendMessage({command: "Return-Theme-List"})
    ]);
    return getData;
}

var currentThemes;
var browserActionMenu;
function buildMenu(data) 
{
    logger.log("Menu ", browserActionMenu);
    browserActionMenu = document.createElement("div");
    browserActionMenu.setAttribute("class", "menu");
    currentThemes = data[1].themes;
    for (var index = 0; index < currentThemes.length; index++) 
    {        
        browserActionMenu.
            appendChild(buildMenuItem(currentThemes[index], data[0], index));
    }
    logger.log("Menu ", browserActionMenu);
}

function buildMenuItem(theme, prefs, theIndex) 
{
    var themeChoice = document.createElement("div");
    themeChoice.setAttribute("class", "button theme");
    var textNode = document.createTextNode(theme.name);
    themeChoice.appendChild(textNode);
    themeChoice.insertBefore(createIcon(theme.iconURL, prefs.iconPreview),
                             textNode);
    if (true === prefs.preview) 
    {
        themeChoice.addEventListener('mouseover',
                        mouseOverListener(theme, prefs.previewDelay));
        themeChoice.addEventListener('mouseout',
                        mouseOutListener(theme, prefs.preview));
    }
    themeChoice.addEventListener('click', clickListener(theme, theIndex));
    return themeChoice;
}

    
function createIcon(iconURL, iconPreview) 
{
    var themeImg = document.createElement("img");
    themeImg.setAttribute("class", "button icon");
    themeImg.setAttribute("src", iconURL);

    if (false === iconPreview) 
    {
        themeImg.style.display = "none";
    }    
    return themeImg;
}

var clickListener = function(theTheme, theIndex) 
{ 
    return function() 
    {
        stopRotateAlarm(); 
        setCurrentTheme(theIndex);
        browser.runtime.sendMessage({command: "Switch-Themes",
                                     theme: theTheme,
                                     index: theIndex});
        startRotateAlarm(); 
    };
}

var previewAlarmListener;
var mouseOverListener = function(theTheme, previewDelay) 
{
    const MS_TO_MINUTE_CONVERSION = 60000;
    return function() 
    { 
        const delayInMinutes = previewDelay/MS_TO_MINUTE_CONVERSION;
        var innerAlarmListener = function(alarmInfo) 
        {
            browser.runtime.sendMessage({command: "Preview-Theme",
                                         theme: theTheme}); 
        };
        previewAlarmListener = innerAlarmListener;
        browser.alarms.create("previewAlarm", {delayInMinutes});
        browser.alarms.onAlarm.addListener(previewAlarmListener);
    };
};

var mouseOutListener = function(theTheme) 
{ 
    return function() 
    { 
        browser.alarms.clear("previewAlarm");
        browser.alarms.onAlarm.removeListener(previewAlarmListener);
        browser.runtime.sendMessage({command: "End-Preview", theme: theTheme}); 
    };
};

function toggleMenuIcons(iconsShown) 
{
    var displayValue;
    if (true === iconsShown) 
    {
        displayValue = "inline";
    } 
    else 
    {
        displayValue = "none";
    }        
    
    var icons = browserActionMenu.querySelectorAll(".icon");
    for (var index = 0; index < icons.length; index++) 
    {
        logger.log("Icon Node", icons[index]);
        icons[index].style.display = displayValue;
    }
}

var rotateAlarmListener;
function startRotateAlarm() {    
    const ONE_SECOND = (1.0/60.0);
    logger.log("In Rotate Alarm");
    var checkRotatePref = browser.storage.local.
                            get(["auto", "autoMinutes", "fastSwitch"]);
    return checkRotatePref.then(results => 
    { 
        //Because the WebExtension can't be notified to turn on/off the rotate
        //when the associated shortcut is pressed and processed in the bootstrap 
        //code, we have to run the alarm constantly. When the shortcuts are
        //migrated over to the WebExtension replace the if(true) with 
        //if(true === results.auto)
        if (true) 
        {    
            const periodInMinutes = results.fastSwitch ? ONE_SECOND :
                                                         results.autoMinutes;
            var innerAlarmListener = function(alarmInfo) 
            {
                if ("rotateAlarm" === alarmInfo.name) 
                {
                    autoRotate();
                } 
            };
            rotateAlarmListener = innerAlarmListener;
            browser.alarms.create("rotateAlarm", {periodInMinutes});
            browser.alarms.onAlarm.addListener(rotateAlarmListener);
        }
        return Promise.resolve();
    });
}

function stopRotateAlarm() 
{
    if (undefined !== rotateAlarmListener) 
    {
        browser.alarms.clear("rotateAlarm");
        browser.alarms.onAlarm.removeListener(rotateAlarmListener);        
    }
}

//Because the legacy bootstrap code cannot initiate contact with the embedded 
//WebExtension, and because the shortcuts are still handled by the bootstrap 
//code, when the shortcut to toggle autoswitching is pressed the WebExtension is 
//unable to react. Thus, we have to check the bootstrap autoswitch preference 
//before we rotate to make sure that the preference is still true. Likewise, 
//even if the preference in the WebExtension code is false, it may have been 
//toggled on by a shortcut key press in the bootstrap code. Thus we have to 
//leave the periodic timer continually running and only respond when the 
//bootstrap code's auto preference is true. This is not optimal from a 
//performance standpoint but is necessary until the shortcuts can be migrated to 
//the WebExtension code.
function autoRotate() 
{
    var checkRotatePref = Promise.all([
            browser.storage.local.get("auto"),
            browser.runtime.sendMessage({command: "Return-Pref-Auto"})
        ]);    
        
    checkRotatePref.then(results => 
    {
        if (true === results[1].auto) 
        {
            rotate();
        }
        
        //If the two preferences don't match, update the WebExtension's pref
        if(results[0].auto !== results[1].auto) 
        {
            browser.storage.local.set({auto: results[1].auto});
        }
    }, handleError);
}

function rotate() 
{
    if (currentThemes.length <= 1) return;

    //Because the shortcuts are still handled by the bootstrap code the  
    //currentIndex in the bootstrap code is always as (or more) accurate than 
    //the currentIndex stored in the Webextension due to use of the rotate 
    //shortcut. 
    var getRotatePref = Promise.all([
            browser.storage.local.get("random"),
            browser.runtime.sendMessage({command: "Get-Current-Index"})
        ]);
    getRotatePref.then( results => 
    {
        logger.log ("Current index before ", results[1].current);
        var newIndex = results[1].current;
        if (true === results[0].random)
        {
            var prevIndex = newIndex;
            // pick a number between 1 and the end until a new index is found
            while(newIndex === prevIndex) 
            {
                newIndex = Math.floor ((Math.random() *
                        (currentThemes.length-1)) + 1);
            }
        }
        else
        {
            newIndex = (newIndex + 1) %
                    currentThemes.length;
        }

        logger.log ("Current index after ", newIndex);
        setCurrentTheme(newIndex);
        browser.runtime.sendMessage({command: "Switch-Themes",
                                     theme: currentThemes[newIndex],
                                     index: newIndex});
    });    
}

function rotateOnStartup() 
{
    logger.log("Rotate on Startup");
    var checkRotateOnStartup = browser.storage.local.get("startupSwitch");
    checkRotateOnStartup.then( prefs => 
    {
        if(true === prefs.startupSwitch) 
        {
            rotate();
        }
    });
}

function setCurrentTheme(index)
{
    var themes = browserActionMenu.children;
    var getCurrentIndex = browser.storage.local.get("current");
    getCurrentIndex.then((result) => 
    {
        themes[result.current].style.backgroundColor = "inherit";
        themes[index].style.backgroundColor = "LightSteelBlue";
        if(index !== result.current)
        {
            var updatingCurrentIndex = browser.storage.local.
                                            set({current: index});
            updatingCurrentIndex.catch(handleError);  
        }        
    });
};

function handlePreferenceChange(changes, area) 
{ 
      var changedPrefs = Object.keys(changes);
 
      for (var pref of changedPrefs) 
      {
        if (undefined !== changes[pref].newValue && 
            changes[pref].oldValue !== changes[pref].newValue) 
        {
            reactToPrefChange(pref, changes[pref]);
        }
    }
}

function reactToPrefChange(prefName, prefData) 
{
    switch (prefName) 
    {
        case 'iconPreview':
            browser.runtime.sendMessage({
                                            command: "Set-Preference",
                                             preference: prefName,
                                             value: prefData.newValue
                                        });
            toggleMenuIcons(prefData.newValue);
            break;
        case 'preview':
        case 'previewDelay':
            browser.runtime.sendMessage({
                                            command: "Set-Preference",
                                             preference: prefName,
                                             value: prefData.newValue
                                        });
            getMenuData().then(buildMenu, handleError);
            break;
        case 'debug':
            browser.runtime.sendMessage({
                                            command: "Set-Preference",
                                             preference: prefName,
                                             value: prefData.newValue
                                        });
            setLogger();
            break;
        case 'autoMinutes':
            browser.runtime.sendMessage({
                                            command: "Set-Preference",
                                             preference: prefName,
                                             value: prefData.newValue
                                        });
            stopRotateAlarm();
            startRotateAlarm();
            break;
        case 'auto':
            //When the shortcuts are migrated to the WebExtension code, 
            //turn off/on the rotate timer here.
        case 'toolboxMinHeight':
        case 'startupSwitch':
        case 'random':
        case 'mainMenuBar':
        case 'toolsMenu':
        case 'defaultKeyShift':
        case 'defaultKeyControl':
        case 'defaultKeyAlt':
        case 'defaultKeyMeta':
        case 'defaultKeyAccel':
        case 'defaultKeyOS':
        case 'defaultKey':
        case 'rotateKeyShift':
        case 'rotateKeyControl':
        case 'rotateKeyAlt':
        case 'rotateKeyMeta':
        case 'rotateKeyAccel':
        case 'rotateKeyOS':
        case 'rotateKey':
        case 'autoKeyShift':
        case 'autoKeyControl':
        case 'autoKeyAlt':
        case 'autoKeyMeta':
        case 'autoKeyAccel':
        case 'autoKeyOS':
        case 'autoKey':
        case 'accessKey':
        case 'activateKeyShift':
        case 'activateKeyControl':
        case 'activateKeyAlt':
        case 'activateKeyMeta':
        case 'activateKeyAccel':
        case 'activateKeyOs':
        case 'activateKey':
        case 'current':
        case 'fastSwitch':
            browser.runtime.sendMessage({
                                            command: "Set-Preference",
                                             preference: prefName,
                                             value: prefData.newValue
                                        });
            break;
        default:
            logger.log(prefName, " " + prefData.newValue);
    }
}

browser.contextMenus.create(
{
      id: "PSOptions",
      title: "Persona Switcher Options",
      contexts: ["browser_action"]
});

browser.contextMenus.onClicked.addListener((info) => 
    {
        browser.runtime.openOptionsPage(); 
    });

var logger;
var nullLogger = {};
nullLogger.log = function (s) { 'use strict'; return; };
function setLogger() 
{
    var checkIfDebugging = browser.storage.local.get("debug");
    return checkIfDebugging.then(result => 
    {
        if (true === result.debug) 
        {
            logger = console;
        } 
        else 
        {
            logger = nullLogger;
        }        
        return Promise.resolve();
    });
}

function handleError(error) 
{
    logger.log(`Error: ${error}`);
}

handleStartup();
