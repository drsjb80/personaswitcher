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

PersonaSwitcher.defaultTheme = {};
PersonaSwitcher.defaultTheme.name = '';
PersonaSwitcher.defaultTheme.id = '{972ce4c6-7e08-4474-a285-3208198ce6fd}';

PersonaSwitcher.addonManager = false;
PersonaSwitcher.extensionManager = null;

PersonaSwitcher.PersonasPlusPresent = true;
try
{
    Components.utils.import ('resource://personas/modules/service.js');
}
catch (e)
{
    PersonaSwitcher.PersonasPlusPresent = false;
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
                if (PersonaSwitcher.prefs.getBoolPref ('static-popups'))
                {
                    PersonaSwitcher.allDocuments
                        (PersonaSwitcher.createStaticPopups);
                }
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
            case 'defmeta': case 'defkey':
            case 'rotshift': case 'rotalt': case 'rotcontrol':
            case 'rotmeta': case 'rotkey':
            case 'autoshift': case 'autoalt': case 'autocontrol':
            case 'autometa': case 'autokey':
            case 'activateshift': case 'activatealt': case 'activatecontrol':
            case 'activatemeta': case 'activatekey':
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
    PersonaSwitcher.logger.log();

    var arr = PersonaSwitcher.getPersonas();

    PersonaSwitcher.logger.log (arr.length);

    if (arr.length < 1) { return; }

    if (PersonaSwitcher.prefs.getBoolPref ('random'))
    {
        // pick a number between 1 and the end
        var number = Math.floor ((Math.random() * (arr.length-1)) + 1);
        // PersonaSwitcher.logger.log (number);
        PersonaSwitcher.switchTo (arr[number]);
    }
    else
    {
        // switch to the last one
        PersonaSwitcher.switchTo (arr[arr.length-1]);
    }
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

    if (! PersonaSwitcher.prefs.getBoolPref ('auto')) { return; }

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
    if (PersonaSwitcher.prefs.getBoolPref ('auto'))
    {
        PersonaSwitcher.prefs.setBoolPref ('auto', false);
    }
    else
    {
        PersonaSwitcher.prefs.setBoolPref ('auto', true);
    }
};

// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Alerts_and_Notifications#Using_notification_box
PersonaSwitcher.removeNotifications = function()
{
    'use strict';

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var win = enumerator.getNext();
        var notificationBox = null;
        var name = PersonaSwitcher.XULAppInfo.name;

        if ('Firefox' === name || 'SeaMonkey' === name || 'Pale Moon' === name)
        {
            if ('function' !== typeof (win.getBrowser))
                continue;

            notificationBox = win.getBrowser().getNotificationBox();
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
        PersonaSwitcher.removeNotifications();
    }
};

PersonaSwitcher.merge = function (array1, array2)
{
    // clone the first one
    var ret = array1.slice (0);
    var length = ret.length;

    for (var i = 0; i < array2.length; i++)
    {
        var same = false;

        for (var j = 0; j < array1.length; j++)
        {
            if (array1[j].id === array2[i].theme.id)
            {
                same = true;
            }
        }

        if (!same)
        {
            ret.push (array2[i].theme);
        }
    }

    return (ret);
};

PersonaSwitcher.getPersonas = function()
{
    'use strict';
    
    var arr = LightweightThemeManager.usedThemes;
    PersonaSwitcher.logger.log (arr.length);

    if (PersonaSwitcher.PersonasPlusPresent)
    {
        var favs = PersonaService.favorites;

        if (null !== favs)
        {
            PersonaSwitcher.logger.log (favs.length);
            arr = PersonaSwitcher.merge (arr, favs);
        }
    }

    PersonaSwitcher.logger.log (arr.length);

    // PM
    /*
    for (var i = 0; i < arr.length; i++)
    {
        PersonaSwitcher.logger.log (i);
        PersonaSwitcher.logger.log (arr.length);

        if (PersonaSwitcher.defaultThemeID === arr[i].id)
        {
            PersonaSwitcher.logger.log ('removing a default, item: ' + i);
            arr.splice (i, 1);
        }
    }
    */

    return (arr);
};

PersonaSwitcher.previous = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    var arr = PersonaSwitcher.getPersonas();

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
    PersonaSwitcher.logger.log();

    PersonaSwitcher.rotate();
    PersonaSwitcher.startTimer();
};

PersonaSwitcher.setDefault = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    PersonaSwitcher.switchTo (PersonaSwitcher.defaultTheme);
    PersonaSwitcher.stopTimer();
};

PersonaSwitcher.onMenuItemCommand = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log();

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

PersonaSwitcher.arrayEquals = function (array1, array2) {
    PersonaSwitcher.logger.log (array1);
    PersonaSwitcher.logger.log (array2);

    if (null === array1)
    {
        PersonaSwitcher.logger.log ('array1 is null');
        return false;
    }

    if (null === array2)
    {
        PersonaSwitcher.logger.log ('array2 is null');
        return false;
    }

    if (!array1 || !array2)
    {
        PersonaSwitcher.logger.log ('one is not an array');
        return false;
    }

    if (array1.length !== array2.length)
    {
        PersonaSwitcher.logger.log ('both are not the same length');
        return false;
    }

    for (var i = 0; i < array1.length; i++)
    {
        // Q&D comparison because we know they're in JSON format
        // PersonaSwitcher.logger.log (JSON.stringify(array1));
        // PersonaSwitcher.logger.log (JSON.stringify(array2));

        if (JSON.stringify(array1) !== JSON.stringify(array2))
            return (false);
    }       
    return true;
};
