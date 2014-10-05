//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/XUL_Reference

// https://developer.mozilla.org/en/JavaScript_code_modules/Using_JavaScript_code_modules

Components.utils["import"]
    ("resource://gre/modules/LightweightThemeManager.jsm");

var EXPORTED_SYMBOLS = [ "PersonaSwitcher" ];

var PersonaSwitcher = new Object();

PersonaSwitcher.prefs =
    Components.classes["@mozilla.org/preferences-service;1"].
        getService (Components.interfaces.nsIPrefService).
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
    if (! PersonaSwitcher.prefs.getBoolPref ("debug"))
        return;

    var message = "";

    try
    {
        this.undef();
    }
    catch (e)
    {
        var frames = e.stack.split ("\n");
        message += frames[1].replace ('()@resource://', '') + ": ";
    }

    for (var i = 0; i < arguments.length; i++)
    {
        message += arguments[i];
    }

    dump (message + '\n');
}

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
}

// https://developer.mozilla.org/en-US/docs/Debugging_JavaScript
PersonaSwitcher.consoleLogger = null

try          // check to see if there is console logging available
{
    PersonaSwitcher.consoleLogger = Components.utils["import"]
        ("resource://gre/modules/devtools/Console.jsm", {}).console;
}
catch (e)   // nope, log to terminal
{
    PersonaSwitcher.consoleLogger = new Object();
    PersonaSwitcher.consoleLogger.log = PersonaSwitcher.log;
}

PersonaSwitcher.nullLogger = new Object();
PersonaSwitcher.nullLogger.log = function (s) { return; }
PersonaSwitcher.logger = null;

// ---------------------------------------------------------------------------

PersonaSwitcher.firstTime = true;
PersonaSwitcher.activeWindow = null;
PersonaSwitcher.previewWhich = null;
PersonaSwitcher.addonManager = false;
PersonaSwitcher.extensionManager = null;
PersonaSwitcher.defaultTheme = null;

PersonaSwitcher.PersonasPlusPresent = true;
try
{
    Components.utils.import ("resource://personas/modules/service.js");
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

        if (topic != "nsPref:changed")
        {
            return;
        }

        switch (data)
        {
            case "debug":
            {
                PersonaSwitcher.setLogger();
            }
            case "toolbox-minheight":
            {
                PersonaSwitcher.setToolboxMinheights();
                break;
            }
            case "preview":
            {
                // regenerate menus based on new setting
                PersonaSwitcher.changePersonaMenus();
                break;
            }
            case "startup-switch":
            {
                break; // nothing to do as the value is queried elsewhere
            }
            case "fastswitch":
            {
                PersonaSwitcher.startTimer();
            }
            case "auto":
            {
                if (PersonaSwitcher.prefs.getBoolPref ("auto"))
                {
                    PersonaSwitcher.startTimer();
                    PersonaSwitcher.rotate();
                }
                else
                {
                    PersonaSwitcher.stopTimer();
                }
                break;
            }
            case "autominutes":
            {
                PersonaSwitcher.startTimer();
                break;
            }
            case "main-menubar": case "tools-submenu":
            {
                PersonaSwitcher.logger.log
                    (PersonaSwitcher.prefs.getBoolPref (data));

                if (PersonaSwitcher.prefs.getBoolPref (data))
                {
                    PersonaSwitcher.showMenus (data);
                }
                else
                {
                    PersonaSwitcher.hideMenus (data);
                }

                break;
            }
            case "defshift": case "defalt": case "defcontrol":
            case "defmeta": case "defkey":
            case "rotshift": case "rotalt": case "rotcontrol":
            case "rotmeta": case "rotkey":
            case "autoshift": case "autoalt": case "autocontrol":
            case "autometa": case "autokey":
            case "activateshift": case "activatealt": case "activatecontrol":
            case "activatemeta": case "activatekey":
            {
                PersonaSwitcher.setKeysets();
                break;
            }
            case "accesskey":
            {
                if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
                {
                    // FIXME
                    PersonaSwitcher.hideMenus ("main-menubar");
                    PersonaSwitcher.createMenus ("main-menubar");
                }
            }
            case "preview-delay":
            {
                var delay  = parseInt (PersonaSwitcher.prefs.getIntPref
                    ("preview-delay"));

                delay = delay < 0 ? 0 : delay > 10000 ? 10000 : delay;
                PersonaSwitcher.prefs.setIntPref ("preview-delay", delay);
            }
            default:
            {
                PersonaSwitcher.logger.log (data);
                break;
            }
        }
    }
}

PersonaSwitcher.prefs.addObserver ("", PersonaSwitcher.prefsObserver, false);

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

    if (arr.length < 1) return;

    if (PersonaSwitcher.prefs.getBoolPref ("random"))
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
}

// ---------------------------------------------------------------------------

/*
PersonaSwitcher.previewTimer = Components.classes["@mozilla.org/timer;1"].
    createInstance(Components.interfaces.nsITimer);

PersonaSwitcher.previewObserver =
{
    which: null,

    setWhich: function (which)
    {
        'use strict';

        PersonaSwitcher.logger.log (which);
        this.which = which;
    },

    observe: function (subject, topic, data)
    {
        'use strict';

        PersonaSwitcher.logger.log();
        LightweightThemeManager.previewTheme (which);
    }
}
*/

PersonaSwitcher.timer = Components.classes["@mozilla.org/timer;1"].
    createInstance(Components.interfaces.nsITimer);

PersonaSwitcher.timerObserver =
{
    observe: function (subject, topic, data)
    {
        'use strict';

        PersonaSwitcher.rotate();
    }
}

PersonaSwitcher.startTimer = function()
{
    'use strict';

    if (! PersonaSwitcher.prefs.getBoolPref ("auto"))
        return;

    PersonaSwitcher.stopTimer();

    var minutes = PersonaSwitcher.prefs.getIntPref ("autominutes");
    PersonaSwitcher.logger.log (minutes);

    if (minutes > 0)
    {
        PersonaSwitcher.timer.init
        (
            PersonaSwitcher.timerObserver,
            PersonaSwitcher.prefs.getBoolPref ("fastswitch") ? 10000 :
                1000 * 60 * minutes,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK
        );
    }
}

PersonaSwitcher.stopTimer = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    PersonaSwitcher.timer.cancel();
}

// ---------------------------------------------------------------------------

PersonaSwitcher.toggleAuto = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    /*
    ** just set the pref, the prefs observer does the work.
    */
    if (PersonaSwitcher.prefs.getBoolPref ("auto"))
    {
        PersonaSwitcher.prefs.setBoolPref ("auto", false);
    }
    else
    {
        PersonaSwitcher.prefs.setBoolPref ("auto", true);
    }
}

// https://developer.mozilla.org/en-US/Add-ons/Code_snippets/Alerts_and_Notifications#Using_notification_box
PersonaSwitcher.removeNotifications = function()
{
    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var win = enumerator.getNext();
        var notificationBox = null;
        var name = PersonaSwitcher.XULAppInfo.name;

        if (name == "Firefox" || name == "SeaMonkey" || name == "Pale Moon")
        {
            if (typeof (win.getBrowser) != "function")
                continue;

            notificationBox = win.getBrowser().getNotificationBox();
        }
        else if (name == "Thunderbird")
        {
            notificationBox = 
                win.document.getElementById ("mail-notification-box");
        }

        if (notificationBox !== null)
        {
            var notification = notificationBox.getNotificationWithValue
                ("lwtheme-install-notification");

            if (notification !== null)
            {
                notificationBox.removeNotification (notification);
            }
        }
    }
}

PersonaSwitcher.switchTo = function (toWhich)
{
    'use strict';
    PersonaSwitcher.logger.log (toWhich);

    /*
    ** if it's there, use it
    */
    if (PersonaSwitcher.PersonasPlusPresent)
    {
        PersonaSwitcher.logger.log();

        if (toWhich.name === "Default")
        {
            PersonaService.changeToDefaultPersona();
        }
        else if (toWhich.id == 1)
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
    else if (typeof LightweightThemeManager.themeChanged != 'function')
    {
        LightweightThemeManager.currentTheme = toWhich;
    }
    else
    {
        // 3.* compatability
        LightweightThemeManager.themeChanged (toWhich);
    }

    PersonaSwitcher.logger.log (LightweightThemeManager.currentTheme);

    if (PersonaSwitcher.PersonasPlusPresent && 
        PersonaSwitcher.prefs.getBoolPref ("notification-workaround"))
    {
        PersonaSwitcher.removeNotifications();
    }
}

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
            if (array1[j].id == array2[i].theme.id)
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
}

PersonaSwitcher.getPersonas = function()
{
    'use strict';

    var arr = LightweightThemeManager.usedThemes;
    PersonaSwitcher.logger.log (arr.length);

    if (PersonaSwitcher.PersonasPlusPresent)
    {
        var favs = PersonaService.favorites;

        if (favs !== null)
        {
            PersonaSwitcher.logger.log (favs.length);
            arr = PersonaSwitcher.merge (arr, favs);
        }
    }

    PersonaSwitcher.logger.log (arr.length);
    return (arr);
}

PersonaSwitcher.previous = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    var arr = PersonaSwitcher.getPersonas();

    if (arr.length <= 1) return;

    PersonaSwitcher.switchTo (arr[1]);
}

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
}

PersonaSwitcher.setDefault = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    PersonaSwitcher.switchTo (PersonaSwitcher.defaultTheme);
    PersonaSwitcher.stopTimer();
}

PersonaSwitcher.onMenuItemCommand = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log();

    PersonaSwitcher.switchTo (which);
    PersonaSwitcher.startTimer();
}

PersonaSwitcher.migratePrefs = function()
{
    'use strict';
    var oldPrefs =
        Components.classes["@mozilla.org/preferences-service;1"].
        getService (Components.interfaces.nsIPrefService).
        getBranch ("extensions.themeswitcher.");

    var kids = oldPrefs.getChildList ("", {});

    if (kids.length === 0) return;

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
    oldPrefs.deleteBranch ("");
}

/*
** dump all the properties of an object
*/
PersonaSwitcher.dump = function (object, max)
{
    'use strict';

    if (typeof max === 'undefined') max = 1;

    if (max === 0) return;

    for (var property in object)
    {
        try
        {
            PersonaSwitcher.logger.log (property + "=" + object[property]);

            if (object[property] !== null &&
                typeof object[property] == "object")
            {
                PersonaSwitcher.dump (object[property], max-1);
            }
        }
        catch (e)
        {
            PersonaSwitcher.logger.log (e);
        }
    }
}

PersonaSwitcher.arrayEquals = function (array1, array2) {
    PersonaSwitcher.logger.log (array1);
    PersonaSwitcher.logger.log (array2);

    if (array1 === null)
    {
        PersonaSwitcher.logger.log ("array1 is null");
        return false;
    }

    if (array2 === null)
    {
        PersonaSwitcher.logger.log ("array2 is null");
        return false;
    }

    if (!array1 || !array2)
    {
        PersonaSwitcher.logger.log ("one isn't an array");
        return false;
    }

    if (array1.length != array2.length)
    {
        PersonaSwitcher.logger.log ("both aren't the same length");
        return false;
    }

    for (var i = 0; i < array1.length; i++)
    {
        // Q&D comparison because we know they're in JSON format
        PersonaSwitcher.logger.log (JSON.stringify(array1));
        PersonaSwitcher.logger.log (JSON.stringify(array2));

        if (JSON.stringify(array1) !== JSON.stringify(array2))
            return (false);
    }       
    return true;
}
