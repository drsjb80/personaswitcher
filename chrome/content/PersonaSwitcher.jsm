/* global Components, PersonaService, LightweightThemeManager, nextTheme, 
theme, dump */
/* eslint block-scoped-var: 0 */
/* eslint no-global-assign: 0 */
/* eslint no-native-reassign: 0 */

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/XUL_Reference
// https://developer.mozilla.org/en/JavaScript_code_modules/Using_JavaScript_code_modules

// no space between comment delimiters. really.

Components.utils.
    import("resource://gre/modules/LightweightThemeManager.jsm");

"use strict";
// If this value is changed, it needs to be changed in options.xul as well
const MAX_PREVIEW_DELAY = 10000;
var EXPORTED_SYMBOLS = ["PersonaSwitcher"];

var PersonaSwitcher = {};

PersonaSwitcher.prefs =
    Components.classes["@mozilla.org/preferences-service;1"].
        getService(Components.interfaces.nsIPrefService).
            getBranch ("extensions.personaswitcher.");

PersonaSwitcher.LWThemes =
    Components.classes["@mozilla.org/preferences-service;1"].
        getService(Components.interfaces.nsIPrefService).
            getBranch ("lightweightThemes.");

PersonaSwitcher.windowMediator =
    Components.classes["@mozilla.org/appshell/window-mediator;1"].
        getService(Components.interfaces.nsIWindowMediator);

PersonaSwitcher.XULAppInfo =
    Components.classes["@mozilla.org/xre/app-info;1"].
        getService(Components.interfaces.nsIXULAppInfo); 

PersonaSwitcher.XULRuntime =
    Components.classes["@mozilla.org/xre/app-info;1"].
        getService(Components.interfaces.nsIXULRuntime);

PersonaSwitcher.stringBundle =
    Components.classes["@mozilla.org/intl/stringbundle;1"].
        getService(Components.interfaces.nsIStringBundleService).
            createBundle(
                "chrome://personaswitcher/locale/personaswitcher.properties");

// needed for addObserver
PersonaSwitcher.prefs.QueryInterface (Components.interfaces.nsIPrefBranch2);

// ---------------------------------------------------------------------------

PersonaSwitcher.log = function()
{
    if (! PersonaSwitcher.prefs.getBoolPref ('debug')) 
    { 
        return; 
    }

    var message = "";

    // create a stack frame via an exception
    try 
    { 
        this.undef(); 
    }
    catch (e)
    {
        var frames = e.stack.split ('\n');
        message += frames[1].replace (/^.*()@chrome:\/\//, '') + ' ';
    }

    for (var i = 0; i < arguments.length; i++)
    {
        message += arguments[i];
    }

    dump (message + '\n');
};

PersonaSwitcher.setLogger = function()
{
    if (PersonaSwitcher.prefs.getBoolPref ("debug"))
    {
        PersonaSwitcher.logger = PersonaSwitcher.consoleLogger;
    }
    else
    {
        PersonaSwitcher.logger = PersonaSwitcher.nullLogger;
    }
};

// https://developer.mozilla.org/en-US/docs/Debugging_JavaScript
PersonaSwitcher.consoleLogger = null;

try
{
    PersonaSwitcher.consoleLogger = Components.utils.import(
        "resource://devtools/Console.jsm", {}).console;
    dump ("using devtools\n");

}
catch (e)
{
    
}

try
{
    PersonaSwitcher.consoleLogger = Components.utils.import(
        "resource://gre/modules/devtools/Console.jsm", {}).console;
    dump ("using gre\n");
}
catch (e)
{

}

// TBird's and SeaMonkey consoles don't log our stuff
// this is a hack. i need to clean this up...
// http://stackoverflow.com/questions/16686888/thunderbird-extension-console-logging
if (PersonaSwitcher.XULAppInfo.name === 'Thunderbird')
{
    var Application = Components.classes["@mozilla.org/steel/application;1"]
                    .getService(Components.interfaces.steelIApplication);

    PersonaSwitcher.consoleLogger = {};
    PersonaSwitcher.consoleLogger.log = Application.console.log;
} 
else if (PersonaSwitcher.consoleLogger === null ||
            PersonaSwitcher.XULAppInfo.name === 'SeaMonkey') 
{
    // nope, log to terminal
    PersonaSwitcher.consoleLogger = {};
    PersonaSwitcher.consoleLogger.log = PersonaSwitcher.log;
}

PersonaSwitcher.nullLogger = {};
PersonaSwitcher.nullLogger.log = function (s) 
{ 
    'use strict'; 
    return; 
};
PersonaSwitcher.logger = PersonaSwitcher.nullLogger;

// ---------------------------------------------------------------------------

PersonaSwitcher.firstTime = true;
PersonaSwitcher.activeWindow = null;
PersonaSwitcher.previewWhich = null;

// Default theme set to an object with an id property equal to the hard coded 
// default theme id value. Necessary for Icedove compatibility as Icedove's 
// default theme id is not the same, and thus cannot be found using the same 
// defaultThemeId. If Icedove's default theme id can be acquired, defaultTheme
// can be set back to null and the correct id can be queried instead.
PersonaSwitcher.defaultTheme = {id: '{972ce4c6-7e08-4474-a285-3208198ce6fd}'};
PersonaSwitcher.defaultThemeId = '{972ce4c6-7e08-4474-a285-3208198ce6fd}';

PersonaSwitcher.addonManager = false;
PersonaSwitcher.extensionManager = null;

PersonaSwitcher.currentThemes = null;
PersonaSwitcher.currentIndex = 0;

PersonaSwitcher.PersonasPlusPresent = true;
try
{
    Components.utils.import ('resource://personas/modules/service.js');
}
catch (e)
{
    PersonaSwitcher.PersonasPlusPresent = false;
}

PersonaSwitcher.BTPresent = true;
try
{
    Components.utils.import('resource://btpersonas/BTPIDatabase.jsm');

}
catch (e)
{
    PersonaSwitcher.BTPresent = false;
}

// ---------------------------------------------------------------------------

PersonaSwitcher.prefsObserver =
{
    observe: function (subject, topic, data)
    {
        // PersonaSwitcher.logger.log (subject);
        PersonaSwitcher.logger.log (topic);
        PersonaSwitcher.logger.log (data);

        if (topic !== 'nsPref:changed') 
        { 
            return; 
        }

        switch (data)
        {
            case 'debug':
                PersonaSwitcher.setLogger();
                break;
            case 'toolbox-minheight':
                PersonaSwitcher.allDocuments(
                    PersonaSwitcher.setToolboxMinheight);
                break;
            case 'preview':
                PersonaSwitcher.allDocuments(
                    PersonaSwitcher.createStaticPopups);
                PersonaSwitcher.allDocuments(
                    PersonaSwitcher.setCurrentTheme, 
                    PersonaSwitcher.currentIndex);
                break;
            case 'icon-preview':
                PersonaSwitcher.allDocuments(
                    PersonaSwitcher.createStaticPopups);
                PersonaSwitcher.allDocuments(
                    PersonaSwitcher.setCurrentTheme, 
                    PersonaSwitcher.currentIndex);
                break;            
            case 'startup-switch':
                break; // nothing to do as the value is queried elsewhere
            case 'fastswitch':
                PersonaSwitcher.startTimer();
                break;
            case 'auto':
                if (PersonaSwitcher.prefs.getBoolPref ('auto'))
                {
                    PersonaSwitcher.startTimer();
                    PersonaSwitcher.rotate();
                }
                else
                {
                    PersonaSwitcher.stopTimer();
                }
                break;
            case 'autominutes':
                PersonaSwitcher.startTimer();
                break;
            case 'main-menubar': case 'tools-submenu':
                if (PersonaSwitcher.prefs.getBoolPref (data))
                {
                    PersonaSwitcher.showMenus (data);
                }
                else
                {
                    PersonaSwitcher.hideMenus (data);
                }
                break;
            case 'defshift': case 'defalt': case 'defcontrol':
            case 'defmeta': case 'defkey': case 'defaccel': case 'defos':
            case 'rotshift': case 'rotalt': case 'rotcontrol':
            case 'rotmeta': case 'rotkey': case 'rotaccel': case 'rotos':
            case 'autoshift': case 'autoalt': case 'autocontrol':
            case 'autometa': case 'autokey': case 'autoaccel': case 'autoos':
            case 'activateshift': case 'activatealt': case 'activatecontrol':
            case 'activatemeta': case 'activatekey':
            case 'activateaccel': case 'activateos':
                PersonaSwitcher.allDocuments (PersonaSwitcher.setKeyset);
                break;
            case 'accesskey':
                PersonaSwitcher.allDocuments (PersonaSwitcher.setAccessKey);
                break;
            case 'preview-delay':
                var delay = 
                    parseInt(PersonaSwitcher.prefs.getIntPref("preview-delay"));

                delay = delay < 0 ? 
                            0 : 
                            delay > MAX_PREVIEW_DELAY ? 
                                MAX_PREVIEW_DELAY : 
                                delay;
                PersonaSwitcher.prefs.setIntPref ("preview-delay", delay);

                PersonaSwitcher.allDocuments(
                    PersonaSwitcher.createStaticPopups);
                PersonaSwitcher.allDocuments(
                    PersonaSwitcher.setCurrentTheme, 
                    PersonaSwitcher.currentIndex);
                break;
            default:
                PersonaSwitcher.logger.log (data);
                break;
        }
    }
};

PersonaSwitcher.prefs.addObserver ('', PersonaSwitcher.prefsObserver, false);

// call a function passed as a parameter with one document of each window
PersonaSwitcher.allDocuments = function (func, index)
{    
    var enumerator = PersonaSwitcher.windowMediator.
                        getEnumerator (null);
    var aWindow;
    while (enumerator.hasMoreElements())
    {
        aWindow = enumerator.getNext();
        PersonaSwitcher.logger.log ('In allDocuments with ' + aWindow);
        if (typeof(index) !== 'undefined') 
        {
            func(aWindow.document, index);
        }
        else
        {
            func(aWindow.document);
        }
    }
};

// call a function passed as a parameter for each window
PersonaSwitcher.allWindows = function (func)
{
    var enumerator = PersonaSwitcher.windowMediator.
                        getEnumerator (null);
    while (enumerator.hasMoreElements())
    {
        func(enumerator.getNext());
    }
};

PersonaSwitcher.hideMenu = function (doc, which)
{
    var d = doc.getElementById ('personaswitcher-' + which);
    if (d) d.hidden = true;
};

/*
** remove a particular menu in all windows
*/
PersonaSwitcher.hideMenus = function (which)
{
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.hideMenu (doc, which);
    }
};

PersonaSwitcher.showMenu = function (doc, which)
{
    var d = doc.getElementById ('personaswitcher-' + which);
    if (d) d.hidden = false;
};

PersonaSwitcher.showMenus = function (which)
{
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.showMenu (doc, which);
    }
};

// ---------------------------------------------------------------------------

/*
** must be defined before referenced in the timer function in older
** versions of JavaScript
*/
PersonaSwitcher.rotate = function()
{
    PersonaSwitcher.logger.log("in rotate");

    var newIndex = PersonaSwitcher.currentIndex;
    if (PersonaSwitcher.currentThemes.length <= 1) return;

    if (PersonaSwitcher.prefs.getBoolPref ('random'))
    {
        var prevIndex = newIndex;
        // pick a number between 1 and the end until a new index is found
        while(newIndex === prevIndex || PersonaSwitcher.isBlackListed(newIndex)) 
        {
            newIndex = Math.floor ((Math.random() *
            (PersonaSwitcher.currentThemes.length-1)) + 1);
        }
    }
    else
    {
        do {
            newIndex = (newIndex + 1) % PersonaSwitcher.currentThemes.length;
        } while (PersonaSwitcher.isBlackListed(newIndex));
    }
    
    PersonaSwitcher.logger.log (newIndex);
    PersonaSwitcher.switchTo(PersonaSwitcher.currentThemes[newIndex], newIndex);
};

PersonaSwitcher.isBlackListed = function(index) {
    var themeName = PersonaSwitcher.currentThemes[index].name;
    return  "Compact Dark"  === themeName || 
            "Compact Light" === themeName || 
            "Default"       === themeName;
};

// ---------------------------------------------------------------------------

PersonaSwitcher.timer = Components.classes['@mozilla.org/timer;1'].
    createInstance(Components.interfaces.nsITimer);

PersonaSwitcher.timerObserver =
{
    observe: function (subject, topic, data)
    {
        PersonaSwitcher.rotate();
    }
};

PersonaSwitcher.startTimer = function()
{
    if (! PersonaSwitcher.prefs.getBoolPref ('auto')) return;

    // in case the amount of time has changed
    PersonaSwitcher.stopTimer();

    var minutes = PersonaSwitcher.prefs.getIntPref ('autominutes');
    PersonaSwitcher.logger.log (minutes);

    if (minutes > 0)
    {
        PersonaSwitcher.timer.init(
            PersonaSwitcher.timerObserver,
            PersonaSwitcher.prefs.getBoolPref ('fastswitch') ? 10000 :
                1000 * 60 * minutes,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK
        );
    }
};

PersonaSwitcher.stopTimer = function()
{
    PersonaSwitcher.timer.cancel();
};

// ---------------------------------------------------------------------------

PersonaSwitcher.toggleAuto = function()
{
    // just set the pref, the prefs observer does the work.
    PersonaSwitcher.prefs.setBoolPref ('auto',
        ! PersonaSwitcher.prefs.getBoolPref ('auto'));
};

// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Alerts_and_Notifications#Using_notification_box
PersonaSwitcher.removeNotification = function (win)
{
    var notificationBox = null;
    var name = PersonaSwitcher.XULAppInfo.name;

    if (name === 'Firefox' || name === 'SeaMonkey' || name === 'Pale Moon')
    {
        if (typeof (win.getBrowser) === 'function')
        {
            var browser = win.getBrowser();
            if (browser)
            {
                notificationBox = browser.getNotificationBox();
            }
        }
    }
    else if (name === 'Thunderbird')
    {
        notificationBox = 
            win.document.getElementById ('mail-notification-box');
    }

    if (notificationBox !== null)
    {
        var notification = notificationBox.getNotificationWithValue(
            'lwtheme-install-notification');

        if (notification !== null)
        {
            notificationBox.removeNotification (notification);
        }
    }
};

PersonaSwitcher.switchTo = function (toWhich, index)
{
    PersonaSwitcher.logger.log (toWhich);
    PersonaSwitcher.allDocuments(PersonaSwitcher.setCurrentTheme, index);

    PersonaSwitcher.currentIndex = typeof(index) !== 'undefined' ? 
                                            index :
                                            PersonaSwitcher.currentIndex;
    
    PersonaSwitcher.prefs.setIntPref ('current', PersonaSwitcher.currentIndex);

    /*
    ** if it's there, use it
    */
    if (PersonaSwitcher.PersonasPlusPresent)
    {
        PersonaSwitcher.logger.log ('using PP');

        if (toWhich.id === '{gh y972ce4c6-7e08-4474-a285-3208198ce6fd}')
        {
            PersonaService.changeToDefaultPersona();
        }
        else if (toWhich.id === 1)
        {
            PersonaService.changeToPersona (PersonaService.customPersona);
        }
        else
        {
            PersonaService.changeToPersona (toWhich);
        }
    } 
    else 
    {
        PersonaSwitcher.logger.log ('using themeChanged');

        if (typeof(toWhich) === 'undefined' || toWhich === null) 
        {
            LightweightThemeManager.themeChanged(null);
        } 
        else if(toWhich.id === '{972ce4c6-7e08-4474-a285-3208198ce6fd}') 
        {
            LightweightThemeManager.themeChanged(null);
        } 
        else 
        {
            LightweightThemeManager.themeChanged(toWhich);
        }
    }
};

PersonaSwitcher.setCurrentTheme = function (doc, index)
{
    var menus = ['personaswitcher-main-menubar-popup',
        'personaswitcher-tools-submenu-popup'];

    for (var aMenu in menus)
    {
        var menu = doc.getElementById(menus[aMenu]);

        // not all windows have this menu
        if (menu)
        {
            var themes =  menu.children;
            if(themes[PersonaSwitcher.currentIndex])
            {
                // Because Linux is layering the icon on top of the check mark,
                // special handling needs to be provided for Linux users.  
                // To remain as consistent as possible, the icon for the
                // currently selected theme is turned off in Linux allowing the 
                // check mark to be displayed. This is similar to Windows which
                // simply displays the check mark over the theme's icon.

                if (PersonaSwitcher.XULRuntime.OS === "Linux") 
                {
                    var value = themes[PersonaSwitcher.currentIndex].value;
                    if(typeof(value) !== 'undefined' && value !== null) 
                    {
                        themes[PersonaSwitcher.currentIndex].
                            setAttribute('image', value);
                    }
                    themes[index].removeAttribute('image');
                }

                themes[PersonaSwitcher.currentIndex].removeAttribute("checked");
                themes[index].setAttribute("checked", "true");
            }
        }
    }

    var buttonMenu = 
            PersonaSwitcher.getButtonPopup(doc, 'personaswitcher-button');
    if (buttonMenu !== null)
    {        
        themes =  buttonMenu.children;

        PersonaSwitcher.logger.log(PersonaSwitcher.currentIndex);
        if(themes[PersonaSwitcher.currentIndex])
        {
            PersonaSwitcher.logger.log(themes[PersonaSwitcher.currentIndex]);
            if (PersonaSwitcher.XULRuntime.OS === "Linux") 
            {
                value = themes[PersonaSwitcher.currentIndex].value;
                if(typeof(value) !== 'undefined' && value !== null) 
                {
                    themes[PersonaSwitcher.currentIndex].
                        setAttribute('image', value);
                }
                themes[index].removeAttribute('image');
            }
            themes[PersonaSwitcher.currentIndex].removeAttribute("checked");
        }
        if(themes[index])
        {
            PersonaSwitcher.logger.log(themes[index]);
            theme = themes[index];
            if (PersonaSwitcher.XULRuntime.OS === "Linux") 
            {
                theme.removeAttribute('image');
            }
            theme.setAttribute("checked", "true");
            // This is a simple hack to ensure that the theme is redrawn in
            // certain versions of Thunderbird while being run on a Mac.
            // http://stackoverflow.com/questions/8840580/force-dom-redraw-refresh-on-chrome-mac
            nextTheme = theme.nextSibling;
            buttonMenu.removeChild(theme);
            buttonMenu.insertBefore(theme, nextTheme);
        }
    }
};

PersonaSwitcher.updateIndexOnRemove = function(newTheme, currentTheme) {
    const APPEARS_HIGHER_IN_LIST = -1;
    const SAME = 0;
    const APPEARS_LOWER_IN_LIST = 1;

    PersonaSwitcher.logger.log(newTheme + " " + currentTheme);
    switch(newTheme.localeCompare(currentTheme)) 
    {
        case APPEARS_HIGHER_IN_LIST:
            var index = PersonaSwitcher.prefs.getIntPref('current');
            index--;
            PersonaSwitcher.prefs.setIntPref('current', index);
            PersonaSwitcher.currentIndex = index;
            break;
        case SAME:
            // If the current theme is the one that gets removed, the theme is
            // set to the default.
            PersonaSwitcher.prefs.setIntPref('current', PersonaSwitcher.currentThemes.length);
            PersonaSwitcher.currentIndex = PersonaSwitcher.currentThemes.length;
            PersonaSwitcher.logger.log("New Index: " + PersonaSwitcher.currentIndex);
            break;
        case APPEARS_LOWER_IN_LIST:
            //No need to change,
            break;
        default:
            break;
    }
};

PersonaSwitcher.updateIndexOnAdd = function(newTheme, currentTheme) {
    const APPEARS_HIGHER_IN_LIST = -1;

    var index;
    for (index = 0; index < PersonaSwitcher.currentThemes.length; index++) {
        if(APPEARS_HIGHER_IN_LIST === newTheme.localeCompare(PersonaSwitcher.currentThemes[index].name)) {
            PersonaSwitcher.prefs.setIntPref('current', index);
            PersonaSwitcher.currentIndex = index;
            return;
        }
        //Otherwise the new theme will be at the bottom of the list
        PersonaSwitcher.prefs.setIntPref('current', index);
        PersonaSwitcher.currentIndex = index;

    }
};

PersonaSwitcher.getPersonas = function()
{
    PersonaSwitcher.currentThemes = LightweightThemeManager.usedThemes;
    PersonaSwitcher.logger.log (PersonaSwitcher.currentThemes.length);

    if (PersonaSwitcher.PersonasPlusPresent)
    {
        PersonaSwitcher.logger.log (PersonaService.favorites);
        if (PersonaService.favorites)
        {
            PersonaSwitcher.currentThemes = PersonaSwitcher.currentThemes.
                concat (PersonaService.favorites);
        }
    }
    PersonaSwitcher.currentThemes.sort(
        function (a, b) 
        { 
            return a.name.localeCompare(b.name); 
        });
    PersonaSwitcher.logger.log (PersonaSwitcher.currentThemes.length);
};

/*
** if the user pressed the rotate keyboard command
*/
PersonaSwitcher.rotateKey = function()
{
    PersonaSwitcher.logger.log("in rotateKey");

    PersonaSwitcher.rotate();
    PersonaSwitcher.startTimer();
};

PersonaSwitcher.setDefault = function()
{
    PersonaSwitcher.logger.log("in setDefault");
    var indexOfDefault = PersonaSwitcher.currentThemes.length;
    PersonaSwitcher.switchTo (PersonaSwitcher.defaultTheme, indexOfDefault);
    PersonaSwitcher.stopTimer();
};

PersonaSwitcher.onMenuItemCommand = function (which, index)
{
    PersonaSwitcher.logger.log("in onMenuItemCommand");

    PersonaSwitcher.switchTo(which, index);
    PersonaSwitcher.startTimer();
};

/*
** dump all the properties of an object
*/
PersonaSwitcher.dump = function (object, max)
{
    if (typeof max === 'undefined') 
    {
        max = 1;
    }

    if (max === 0) 
    {
        return;
    }

    for (var property in object)
    {
        try
        {
            PersonaSwitcher.logger.log (property + '=' + object[property]);

            if (object[property] !== null &&
                typeof object[property] === 'object')
            {
                PersonaSwitcher.dump (object[property], max-1);
            }
        }
        catch (e)
        {
            PersonaSwitcher.logger.log (e);
        }
    }
};
