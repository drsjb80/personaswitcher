//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/XUL_Reference

// https://developer.mozilla.org/en/JavaScript_code_modules/Using_JavaScript_code_modules

// no space between comment delimiters. really.
/*global Components*/
/*jslint vars: false*/

Components.utils["import"]
    ("resource://gre/modules/LightweightThemeManager.jsm");

var EXPORTED_SYMBOLS = [ "PersonaSwitcher" ];

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
            createBundle("chrome://personaswitcher/locale/personaswitcher.properties");

// needed for addObserver
PersonaSwitcher.prefs.QueryInterface (Components.interfaces.nsIPrefBranch2);

// ---------------------------------------------------------------------------

PersonaSwitcher.log = function()
{
    'use strict';
    if (! PersonaSwitcher.prefs.getBoolPref ('debug')) { return; }

    var message = "";

    // create a stack frame via an exception
    try { this.undef(); }
    catch (e)
    {
        var frames = e.stack.split ('\n');
        message += frames[1].replace ('()@resource://', '') + ': ';
    }

    for (var i = 0; i < arguments.length; i++)
    {
        message += arguments[i];
    }

    dump (message + '\n');
};

PersonaSwitcher.setLogger = function()
{
    'use strict';

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
    // check to see if there is console logging available
    PersonaSwitcher.consoleLogger = Components.utils["import"]
        ("resource://gre/modules/devtools/Console.jsm", {}).console;
}
catch (e)
{
    // nope, log to terminal
    PersonaSwitcher.consoleLogger = {};
    PersonaSwitcher.consoleLogger.log = PersonaSwitcher.log;
}

PersonaSwitcher.nullLogger = {};
PersonaSwitcher.nullLogger.log = function (s) { 'use strict'; return; };
PersonaSwitcher.logger = null;

// ---------------------------------------------------------------------------

PersonaSwitcher.firstTime = true;
PersonaSwitcher.activeWindow = null;
PersonaSwitcher.previewWhich = null;
PersonaSwitcher.staticPopups = false;

PersonaSwitcher.defaultTheme = null
PersonaSwitcher.defaultThemeId = '{972ce4c6-7e08-4474-a285-3208198ce6fd}';

PersonaSwitcher.addonManager = false;
PersonaSwitcher.extensionManager = null;

PersonaSwitcher.currentThemes = null;
PersonaSwitcher.currentIndex = 0;
PersonaSwitcher.savedMenuPopup = null;

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
        'use strict';
        // PersonaSwitcher.logger.log (subject);
        PersonaSwitcher.logger.log (topic);
        PersonaSwitcher.logger.log (data);

        if ('nsPref:changed' !== topic) { return; }

        switch (data)
        {
            case 'debug':
                PersonaSwitcher.setLogger();
                break;
            case 'toolbox-minheight':
                PersonaSwitcher.allDocuments
                    (PersonaSwitcher.setToolboxMinheight);
                break;
            case 'static-popups':
                if (PersonaSwitcher.prefs.getBoolPref ('static-popups'))
                {
                    PersonaSwitcher.allDocuments
                        (PersonaSwitcher.createStaticPopups);
                }
                else
                {
                    PersonaSwitcher.allDocuments
                        (PersonaSwitcher.removeStaticPopups);
                }
                break;
            case 'preview':
                // regenerate all the popups
                /*
                if (PersonaSwitcher.prefs.getBoolPref ('static-popups'))
                {
                */
                    PersonaSwitcher.allDocuments
                        (PersonaSwitcher.createStaticPopups);
                /*
                }
                */
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
                var delay  = parseInt
                    (PersonaSwitcher.prefs.getIntPref ("preview-delay"));

                delay = delay < 0 ? 0 : delay > 10000 ? 10000 : delay;
                PersonaSwitcher.prefs.setIntPref ("preview-delay", delay);
                break;
            default:
                PersonaSwitcher.logger.log (data);
                break;
        }
    }
};

PersonaSwitcher.prefs.addObserver ('', PersonaSwitcher.prefsObserver, false);

// ---------------------------------------------------------------------------

/*
** must be defined before referenced in the timer function in older
** versions of JavaScript
*/
PersonaSwitcher.rotate = function()
{
    'use strict';
    PersonaSwitcher.logger.log("in rotate");

    if (PersonaSwitcher.currentThemes.length <= 1) { return; }

    var which;
    if (PersonaSwitcher.prefs.getBoolPref ('random'))
    {
        // pick a number between 1 and the end
        which = Math.floor ((Math.random() *
            (PersonaSwitcher.currentThemes.length-1)) + 1);
    }
    else
    {
        which = (PersonaSwitcher.currentIndex + 1) %
            PersonaSwitcher.currentThemes.length;
    }

    PersonaSwitcher.logger.log(which);
    PersonaSwitcher.switchTo (PersonaSwitcher.currentThemes[which]);
};

// ---------------------------------------------------------------------------

PersonaSwitcher.timer = Components.classes['@mozilla.org/timer;1'].
    createInstance(Components.interfaces.nsITimer);

PersonaSwitcher.timerObserver =
{
    observe: function (subject, topic, data)
    {
        'use strict';

        PersonaSwitcher.rotate();
    }
};

PersonaSwitcher.startTimer = function()
{
    'use strict';

    if (! PersonaSwitcher.prefs.getBoolPref ('auto')) return;

    // in case the amount of time has changed
    PersonaSwitcher.stopTimer();

    var minutes = PersonaSwitcher.prefs.getIntPref ('autominutes');
    PersonaSwitcher.logger.log (minutes);

    if (minutes > 0)
    {
        PersonaSwitcher.timer.init
        (
            PersonaSwitcher.timerObserver,
            PersonaSwitcher.prefs.getBoolPref ('fastswitch') ? 10000 :
                1000 * 60 * minutes,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK
        );
    }
};

PersonaSwitcher.stopTimer = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    PersonaSwitcher.timer.cancel();
};

// ---------------------------------------------------------------------------

PersonaSwitcher.toggleAuto = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    /*
    ** just set the pref, the prefs observer does the work.
    */
    PersonaSwitcher.prefs.setBoolPref ('auto',
        ! PersonaSwitcher.prefs.getBoolPref (auto));
};

// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Alerts_and_Notifications#Using_notification_box
PersonaSwitcher.removeNotification = function (win)
{
    'use strict';

    var notificationBox = null;
    var name = PersonaSwitcher.XULAppInfo.name;

    if ('Firefox' === name || 'SeaMonkey' === name || 'Pale Moon' === name)
    {
        if ('function' === typeof (win.getBrowser))
        {
            var browser = win.getBrowser();
            if (browser)
            {
                notificationBox = browser.getNotificationBox();
            }
        }
    }
    else if ('Thunderbird' === name)
    {
        notificationBox = 
            win.document.getElementById ('mail-notification-box');
    }

    if (null !== notificationBox)
    {
        var notification = notificationBox.getNotificationWithValue
            ('lwtheme-install-notification');

        if (null !== notification)
        {
            notificationBox.removeNotification (notification);
        }
    }
};

PersonaSwitcher.switchTo = function (toWhich)
{
    'use strict';
    PersonaSwitcher.logger.log (toWhich);

    /*
    ** if it's there, use it
    */
    if (PersonaSwitcher.PersonasPlusPresent)
    {
        PersonaSwitcher.logger.log ('using PP');

        if ('{972ce4c6-7e08-4474-a285-3208198ce6fd}' === toWhich.id)
        {
            PersonaService.changeToDefaultPersona();
        }
        else if (1 === toWhich.id)
        {
            PersonaSwitcher.logger.log();
            PersonaService.changeToPersona (PersonaService.customPersona);
        }
        else
        {
            PersonaSwitcher.logger.log();
            PersonaService.changeToPersona (toWhich);
        }
    }
    /*
    ** http://www.idealog.us/2007/02/check_if_a_java.html
    */
    else if ('function' !== typeof LightweightThemeManager.themeChanged)
    {
        // 3.* compatability
        PersonaSwitcher.logger.log ('using currentTheme');

        if ('{972ce4c6-7e08-4474-a285-3208198ce6fd}' === toWhich.id)
        {
            LightweightThemeManager.currentTheme = null;
        }
        else
        {
            LightweightThemeManager.currentTheme = toWhich;
        }
    }
    else
    {
        // FF 4+
        PersonaSwitcher.logger.log ('using themeChanged');
        LightweightThemeManager.themeChanged (toWhich);
    }

    // PersonaSwitcher.logger.log (LightweightThemeManager.currentTheme);

    if (PersonaSwitcher.PersonasPlusPresent && 
        PersonaSwitcher.prefs.getBoolPref ('notification-workaround'))
    {
        PersonaSwitcher.allWindows (PersonaSwitcher.removeNotification);
    }
};

PersonaSwitcher.getPersonas = function()
{
    'use strict';
    
    PersonaSwitcher.currentThemes = LightweightThemeManager.usedThemes;
    PersonaSwitcher.logger.log (PersonaSwitcher.currentThemes);

    if (PersonaSwitcher.PersonasPlusPresent)
    {
        PersonaSwitcher.currentThemes = 
            PersonaSwitcher.currentThemes.
                concat (PersonaService.favorites);
    }
};

PersonaSwitcher.previous = function()
{
    'use strict';
    PersonaSwitcher.logger.log ("in previous");

    var arr = PersonaSwitcher.currentThemes;

    if (arr.length <= 1) return;

    PersonaSwitcher.switchTo (arr[1]);
};

/*
** if the user pressed the rotate keyboard command, rotate and
** reset the timer.
*/
PersonaSwitcher.rotateKey = function()
{
    'use strict';
    PersonaSwitcher.logger.log("in rotateKey");

    PersonaSwitcher.rotate();
    PersonaSwitcher.startTimer();
};

PersonaSwitcher.setDefault = function()
{
    'use strict';
    PersonaSwitcher.logger.log("in setDefault");

    PersonaSwitcher.switchTo (PersonaSwitcher.defaultTheme);
    PersonaSwitcher.stopTimer();
};

PersonaSwitcher.onMenuItemCommand = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log("in onMenuItemCommand");

    PersonaSwitcher.switchTo (which);
    PersonaSwitcher.startTimer();
};

PersonaSwitcher.migratePrefs = function()
{
    'use strict';
    var oldPrefs =
        Components.classes['@mozilla.org/preferences-service;1'].
        getService (Components.interfaces.nsIPrefService).
            getBranch ('extensions.themeswitcher.');

    var kids = oldPrefs.getChildList ('', {});

    if (0 === kids.length) return;

    for (var i in kids)
    {
        var type = oldPrefs.getPrefType (kids[i]);
        PersonaSwitcher.logger.log (kids[i]);

        switch (type)
        {
            case oldPrefs.PREF_STRING:
            {
                PersonaSwitcher.prefs.setCharPref (kids[i],
                    oldPrefs.getCharPref (kids[i]));
                break;
            }
            case oldPrefs.PREF_INT:
            {
                PersonaSwitcher.prefs.setIntPref (kids[i],
                    oldPrefs.getIntPref (kids[i]));
                break;
            }
            case oldPrefs.PREF_BOOL:
            {
                PersonaSwitcher.prefs.setBoolPref (kids[i],
                    oldPrefs.getBoolPref (kids[i]));
                break;
            }
        }
    }
    oldPrefs.deleteBranch ('');
};

/*
** dump all the properties of an object
*/
PersonaSwitcher.dump = function (object, max)
{
    'use strict';

    if ('undefined' === typeof max) max = 1;

    if (0 === max) return;

    for (var property in object)
    {
        try
        {
            PersonaSwitcher.logger.log (property + '=' + object[property]);

            if (null !== object[property] &&
                'object' === typeof object[property])
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
