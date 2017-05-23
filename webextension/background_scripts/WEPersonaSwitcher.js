/* global browser */
/* eslint no-constant-condition: 0 */
'use strict';

var handleStartup = function() 
{
    let checkDefaultsLoaded = browser.storage.local.get("defaults_loaded");
    checkDefaultsLoaded
        .then(loadDefaultsIfNeeded)
        .then(setLogger)
        .then(startRotateAlarm)
        .then(getMenuData)
        .then(buildMenu)
        .then(rotateOnStartup)
        .then(
            function() 
            {
                return browser.storage
                    .onChanged.addListener(handlePreferenceChange);
            }
        )
        .catch(handleError);
};

// Verify if we need to load the default preferences by checking if the 
// default_loaded flag is undefined. 
var loadDefaultsIfNeeded = function(prefs) 
{
    if ('undefined' === typeof(prefs.defaults_loaded)) 
    {
        return loadDefaults();
    } 
    return Promise.resolve();
};

var loadDefaults = function()
{
    let setting = browser.storage.local.set(
        {
            defaults_loaded: true,

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

            toolsKeyShift: false,
            toolsKeyControl: true,
            toolsKeyAlt: true,
            toolsKeyMeta: false,
            toolsKeyAccel: false,
            toolsKeyOs: false,
            toolsKey: "M",

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
            debug: false,
            fastSwitch: false,
            toolboxMaxHeight: 200,

            // hidden preferences
            current: 0
        }
    );

    return setting.then(
        function() 
        { 
            return Promise.resolve();
        }, 
        handleError
    );
};

var getMenuData = function() 
{
    let menuPreferences = ["iconPreview", "preview", "previewDelay", "current"];
    let getData = Promise.all(
        [
            browser.storage.local.get(menuPreferences),
            browser.runtime.sendMessage({command: "Return-Theme-List"})
        ]
    );
    return Promise.resolve(getData);
};

var currentThemes;
var defaultThemes;
var browserActionMenu;
var buildMenu = function(data) 
{
    logger.log("Menu ", browserActionMenu);

    browserActionMenu = document.createElement("div");
    browserActionMenu.setAttribute("class", "menu");
    currentThemes = data[1].themes;
    defaultThemes = data[1].defaults;

    for (let index = 0; index < currentThemes.length; index++) 
    {        
        browserActionMenu.appendChild (buildMenuItem(
            currentThemes[index], data[0], index));
    }

    insertSeparator();

    for (let index = 0; index < defaultThemes.length; index++) 
    {        
        browserActionMenu.
            appendChild(buildMenuItem(defaultThemes[index], data[0],
                index + (currentThemes.length+1)));
    }

    logger.log("Menu ", browserActionMenu);
}

function buildMenuItem(theme, prefs, theIndex) 
{
    let themeChoice = document.createElement("option");
    themeChoice.setAttribute("class", "button theme");

    let textNode = document.createTextNode(theme.name);
    themeChoice.appendChild(textNode);
    themeChoice.insertBefore(createIcon(theme.iconURL, prefs.iconPreview),
        textNode);

    if (theIndex === prefs.current) 
    {
        themeChoice.selected = true;
    }

    if (true === prefs.preview) 
    {
        themeChoice.addEventListener('mouseover',
            mouseOverListener(theme, prefs.previewDelay));
        themeChoice.addEventListener('mouseout',
            mouseOutListener(theme, prefs.preview));
    }

    themeChoice.addEventListener('click', clickListener(theme, theIndex));
    return themeChoice;
};

var createIcon = function(iconURL, iconPreview) 
{
    let themeImg = document.createElement("img");
    themeImg.setAttribute("class", "button icon");
    themeImg.setAttribute("src", iconURL);

    if (false === iconPreview) 
    {
        themeImg.style.display = "none";
    }    
    return themeImg;
};

var insertSeparator = function() 
{
    let separator = document.createElement("hr");
    separator.setAttribute("class", "menu-separator");
    browserActionMenu.appendChild(separator);
};

var clickListener = function (theTheme, theIndex) 
{ 
    return function() 
    {
        stopRotateAlarm(); 
        browser.storage.local.get("current").then(
            (result) =>
            {
                setCurrentTheme(theIndex, result.current);
            }
        );

        browser.runtime.sendMessage(
            {
                command: "Switch-Themes",
                theme: theTheme,
                index: theIndex
            }
        );

        startRotateAlarm(); 
    };
};

var previewAlarmListener;
var mouseOverListener = function(theTheme, previewDelay) 
{
    const MS_TO_MINUTE_CONVERSION = 60000;
    return function() 
    { 
        const delayInMinutes = previewDelay/MS_TO_MINUTE_CONVERSION;
        let innerAlarmListener = function(alarmInfo) 
        {
            browser.runtime.sendMessage(
                {
                    command: "Preview-Theme",
                    theme: theTheme
                }
            ); 
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
        browser.runtime.sendMessage(
            {
                command: "End-Preview",
                theme: theTheme
            }
        ); 
    };
};

var toggleMenuIcons = function (iconsShown) 
{
    let displayValue;
    if (true === iconsShown) 
    {
        displayValue = "inline";
    } 
    else 
    {
        displayValue = "none";
    }        

    let icons = browserActionMenu.querySelectorAll(".icon");
    for (let index = 0; index < icons.length; index++) 
    {
        logger.log("Icon Node", icons[index]);
        icons[index].style.display = displayValue;
    }
};

var rotateAlarmListener;
var startRotateAlarm = function() 
{    
    logger.log("In Rotate Alarm");

    const ONE_SECOND = (1.0/60.0);
    var checkRotatePref = browser.storage.local.
        get(["auto", "autoMinutes", "fastSwitch"]);

    return checkRotatePref.then(
        (results) =>
        {
            // Because the WebExtension can't be notified to turn on/off
            // the rotate when the associated shortcut is pressed and
            // processed in the bootstrap code, we have to run the alarm
            // constantly. When the shortcuts are migrated over to the
            // WebExtension replace the if(true) with if(true ===
            // results.auto)

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
        }
    );
};

var stopRotateAlarm = function() 
{
    if ('undefined' !== typeof(rotateAlarmListener)) 
    {
        browser.alarms.clear("rotateAlarm");
        browser.alarms.onAlarm.removeListener(rotateAlarmListener);        
    }
};

// Because the legacy bootstrap code cannot initiate contact with the
// embedded WebExtension, and because the shortcuts are still handled by
// the bootstrap code, when the shortcut to toggle autoswitching is pressed
// the WebExtension is unable to react. Thus, we have to check the
// bootstrap autoswitch preference before we rotate to make sure that the
// preference is still true. Likewise, even if the preference in the
// WebExtension code is false, it may have been toggled on by a shortcut
// key press in the bootstrap code. Thus we have to leave the periodic
// timer continually running and only respond when the bootstrap code's
// auto preference is true. This is not optimal from a performance
// standpoint but is necessary until the shortcuts can be migrated to the
// WebExtension code.
var autoRotate = function() 
{
    let checkRotatePref = Promise.all(
        [
            browser.storage.local.get("auto"),
            browser.runtime.sendMessage({command: "Return-Pref-Auto"})
        ]
    );    

    checkRotatePref.then(
        (results) => 
        {
            if (true === results[1].auto) 
            {
                rotate();
            }

            // If the two preferences don't match, update the
            // WebExtension's pref
            if(results[0].auto !== results[1].auto) 
            {
                browser.storage.local.set({auto: results[1].auto});
            }

        }, handleError);
};

var rotate = function() 
{
    if (1 >= currentThemes.length) return;

    // Because the shortcuts are still handled by the bootstrap code the  
    // currentIndex in the bootstrap code is always as (or more) accurate than 
    // the currentIndex stored in the Webextension due to use of the rotate 
    // shortcut. 
    let getRotatePref = Promise.all(
        [
            browser.storage.local.get(["random", "current"]),
            browser.runtime.sendMessage({command: "Get-Current-Index"})
        ]
    );

    getRotatePref.then(
        (results) => 
        {
            logger.log ("Current index before ", results[1].current);
            let newIndex = results[1].current;

            if (true === results[0].random)
            {
                let prevIndex = newIndex;
                // pick a number between 1 and the end until a new index is
                // found
                while (newIndex === prevIndex) 
                {
                    newIndex = Math.floor ((Math.random() *
                        (currentThemes.length-1)) + 1);
                }
            }
            else
            {
                // If a default theme is active, rotate to the first
                // non-default theme
                if (newIndex > currentThemes.length-1) 
                {
                    newIndex = 0;
                } 
                else 
                {
                    newIndex = (newIndex + 1) % currentThemes.length;
                }
            }

            logger.log ("Current index after ", newIndex);
            setCurrentTheme(newIndex, results[0].current);
            browser.runtime.sendMessage(
                {
                    command: "Switch-Themes",
                    theme: currentThemes[newIndex],
                    index: newIndex
                }
            );
        }
    );    
};

var rotateOnStartup = function() 
{
    logger.log("Rotate on Startup");

    let checkRotateOnStartup = browser.storage.local.get("startupSwitch");
    checkRotateOnStartup.then(
        (prefs) => 
        {
            if(true === prefs.startupSwitch) 
            {
            rotate();
            }
        }
    );
};

var setCurrentTheme = function(newIndex, oldIndex)
{
    let themes = browserActionMenu.children;
    themes[oldIndex].selected = false;
    themes[newIndex].selected = true;

    if(newIndex !== oldIndex)
    {
        let updatingCurrentIndex = browser.storage.local.
            set({current: newIndex});
        updatingCurrentIndex.catch(handleError);  
    }
};

var handlePreferenceChange = function(changes, area) 
{ 
    let changedPrefs = Object.keys(changes);

    for (let pref of changedPrefs) 
    {
        if ('undefined' !== typeof(changes[pref].newValue) && 
            changes[pref].oldValue !== changes[pref].newValue) 
        {
            reactToPrefChange(pref, changes[pref]);
        }
    }
};

var reactToPrefChange = function(prefName, prefData) 
{
    switch (prefName) 
    {
        case 'iconPreview':
            browser.runtime.sendMessage(
                {
                    command: "Set-Preference",
                    preference: prefName,
                    value: prefData.newValue
                }
            );
            toggleMenuIcons(prefData.newValue);
            break;
        case 'preview':
        case 'previewDelay':
            browser.runtime.sendMessage(
                {
                    command: "Set-Preference",
                    preference: prefName,
                    value: prefData.newValue
                }
            );
            getMenuData().then(buildMenu, handleError);
            break;
        case 'debug':
            browser.runtime.sendMessage(
                {
                    command: "Set-Preference",
                    preference: prefName,
                    value: prefData.newValue
                }
            );
            setLogger();
            break;
        case 'autoMinutes':
            browser.runtime.sendMessage(
                {
                    command: "Set-Preference",
                    preference: prefName,
                    value: prefData.newValue
                }
            );
            stopRotateAlarm();
            startRotateAlarm();
            break;
        case 'fastSwitch':
        case 'auto':
            // When the shortcuts are migrated to the WebExtension code, 
            // turn off/on the rotate timer here.
            stopRotateAlarm();
            startRotateAlarm();
            // falls through
        case 'toolboxMinHeight':    // falls through
        case 'startupSwitch':       // falls through
        case 'random':              // falls through
        case 'mainMenuBar':         // falls through
        case 'toolsMenu':           // falls through

        case 'defaultKeyShift':     // falls through
        case 'defaultKeyControl':   // falls through
        case 'defaultKeyAlt':       // falls through
        case 'defaultKeyMeta':      // falls through
        case 'defaultKeyAccel':     // falls through
        case 'defaultKeyOS':        // falls through
        case 'defaultKey':          // falls through

        case 'rotateKeyShift':      // falls through
        case 'rotateKeyControl':    // falls through
        case 'rotateKeyAlt':        // falls through
        case 'rotateKeyMeta':       // falls through
        case 'rotateKeyAccel':      // falls through
        case 'rotateKeyOS':         // falls through
        case 'rotateKey':           // falls through

        case 'autoKeyShift':        // falls through
        case 'autoKeyControl':      // falls through
        case 'autoKeyAlt':          // falls through
        case 'autoKeyMeta':         // falls through
        case 'autoKeyAccel':        // falls through
        case 'autoKeyOS':           // falls through
        case 'autoKey':             // falls through

        case 'accessKey':           // falls through

        case 'activateKeyShift':    // falls through
        case 'activateKeyControl':  // falls through
        case 'activateKeyAlt':      // falls through
        case 'activateKeyMeta':     // falls through
        case 'activateKeyAccel':    // falls through
        case 'activateKeyOs':       // falls through
        case 'activateKey':         // falls through

        case 'toolsKeyShift':       // falls through
        case 'toolsKeyControl':     // falls through
        case 'toolsKeyAlt':         // falls through
        case 'toolsKeyMeta':        // falls through
        case 'toolsKeyAccel':       // falls through
        case 'toolsKeyOs':          // falls through
        case 'toolsKey':            // falls through

        case 'current':             // falls through
        case 'toolboxMaxHeight':
            browser.runtime.sendMessage(
                {
                    command: "Set-Preference",
                    preference: prefName,
                    value: prefData.newValue
                }
            );
            break;
        default:
            logger.log(prefName, " " + prefData.newValue);
    }
};

browser.contextMenus.create(
    {
        id: "PSOptions",
        title: "Persona Switcher Options",
        contexts: ["browser_action"]
    }
);

browser.contextMenus.onClicked.addListener(
    (info) => 
    {
        browser.runtime.openOptionsPage(); 
    }
);

var logger;
var nullLogger = {};
nullLogger.log = function (s) 
{ 
    return; 
};

var setLogger = function() 
{
    let checkIfDebugging = browser.storage.local.get("debug");
    return checkIfDebugging.then(
        (result) => 
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
        }
    );
};

var handleError = function(error) 
{
    logger.log(`Error: ${error}`);
};

handleStartup();
