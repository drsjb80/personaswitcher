// https://developer.mozilla.org/en/JavaScript_code_modules/Using_JavaScript_code_modules

Components.utils.import ("resource://gre/modules/LightweightThemeManager.jsm");

var EXPORTED_SYMBOLS = [ "PersonaSwitcher" ];

var PersonaSwitcher = new Object();

PersonaSwitcher.firstTime = true;
PersonaSwitcher.stringBundle;   // set in overlay.js

PersonaSwitcher.prefs =
    Components.classes["@mozilla.org/preferences-service;1"].
        getService (Components.interfaces.nsIPrefService).
            getBranch ("extensions.personaswitcher.");

PersonaSwitcher.windowMediator =
    Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);

PersonaSwitcher.XULAppInfo =
    Components.classes["@mozilla.org/xre/app-info;1"].
        getService(Components.interfaces.nsIXULAppInfo); 

// needed for addObserver
PersonaSwitcher.prefs.QueryInterface (Components.interfaces.nsIPrefBranch2);

/*
** an observer for changing perferences.
*/
PersonaSwitcher.myObserver =
{
    observe: function (subject, topic, data)
    {
        'use strict';
        PersonaSwitcher.log (subject);
        PersonaSwitcher.log (topic);
        PersonaSwitcher.log (data);

        if (topic != "nsPref:changed")
            return;

        switch (data)
        {
            case "auto": case "preview":
            {
                break; // nothing to do as the value is queried elsewhere
            }
            case "autominutes":
            {
                PersonaSwitcher.startTimer();
                break;
            }
            case "main-menubar": case "tools-submenu":
            {
                if (PersonaSwitcher.prefs.getBoolPref (data))
                {
                    PersonaSwitcher.createMenus (data);
                }
                else
                {
                    PersonaSwitcher.removeMenus (data);
                }

                break;
            }
            case "defshift": case "defalt": case "defcontrol":
            case "defmeta": case "defkey":
            case "rotshift": case "rotalt": case "rotcontrol":
            case "rotmeta": case "rotkey":
            case "autoshift": case "autoalt": case "autocontrol":
            case "autometa": case "autokey":
            {
                PersonaSwitcher.setKeysets();
                break;
            }
            default:
            {
                PersonaSwitcher.log (data);
            }
        }
    }
}

PersonaSwitcher.prefs.addObserver ("", PersonaSwitcher.myObserver, false);

PersonaSwitcher.timer = Components.classes["@mozilla.org/timer;1"]
    .createInstance(Components.interfaces.nsITimer);

PersonaSwitcher.startTimer = function()
{
    'use strict';

    // double check
    PersonaSwitcher.log (PersonaSwitcher.prefs.getBoolPref ("auto"));
    if (! PersonaSwitcher.prefs.getBoolPref ("auto"))
        return;

    PersonaSwitcher.timer.cancel();

    var minutes = PersonaSwitcher.prefs.getIntPref ("autominutes");
    PersonaSwitcher.log (minutes);

    if (minutes > 0)
    {
        PersonaSwitcher.timer.init
        (
            PersonaSwitcher.rotate,
            1000 * 60 * minutes,
            Components.interfaces.nsITimer.TYPE_REPEATING_SLACK
        );
    }
}

PersonaSwitcher.autoOff = function()
{
    'use strict';
    PersonaSwitcher.log();

    PersonaSwitcher.timer.cancel();
    PersonaSwitcher.prefs.setBoolPref ("auto", 0);
}

PersonaSwitcher.autoOn = function()
{
    'use strict';
    PersonaSwitcher.log ();

    PersonaSwitcher.prefs.setBoolPref ("auto", 1);
    PersonaSwitcher.startTimer();

    PersonaSwitcher.rotate();
}

PersonaSwitcher.toggleAuto = function()
{
    'use strict';
    PersonaSwitcher.log();

    if (PersonaSwitcher.prefs.getBoolPref ("auto"))
    {
        PersonaSwitcher.autoOff();
    }
    else
    {
        PersonaSwitcher.autoOn();
    }
}

PersonaSwitcher.switchTo = function (toWhich)
{
    'use strict';
    PersonaSwitcher.log();

    if (toWhich != null)
        PersonaSwitcher.log (toWhich.name);
    else
        PersonaSwitcher.log (toWhich);

    /*
    ** http://www.idealog.us/2007/02/check_if_a_java.html
    */
    if (typeof LightweightThemeManager.themeChanged != 'function')
    {
        LightweightThemeManager.currentTheme = toWhich;
    }
    else
    {
        // 3.* compatability
        LightweightThemeManager.themeChanged (toWhich);
    }

    if (PersonaSwitcher.prefs.getBoolPref ("notification-workaround"))
    {
        PersonaSwitcher.log (PersonaSwitcher.XULAppInfo.name);

        let notificationBox = null;
        if (PersonaSwitcher.XULAppInfo.name == "Firefox" ||
            PersonaSwitcher.XULAppInfo.name == "SeaMonkey")
        {
            notificationBox = PersonaSwitcher.windowMediator.
                getMostRecentWindow("navigator:browser").
                getBrowser().getNotificationBox();
        }
        else if (PersonaSwitcher.XULAppInfo.name == "Thunderbird")
        {
            notificationBox = PersonaSwitcher.windowMediator.
                getMostRecentWindow("mail:3pane").
                document.getElementById("mail-notification-box");
        }

        if (notificationBox != null)
        {
            notificationBox.removeCurrentNotification();
        }
    }
}

PersonaSwitcher.rotate = function()
{
    'use strict';
    PersonaSwitcher.log();

    var arr = LightweightThemeManager.usedThemes;

    PersonaSwitcher.log(arr.length);

    if (arr.length <= 1) return;

    if (PersonaSwitcher.prefs.getBoolPref ("random"))
    {
        // pick a number between 1 and the end
        var number = Math.floor ((Math.random() * (arr.length-1)) + 1);
        // PersonaSwitcher.log (number);
        PersonaSwitcher.switchTo (arr[number]);
    }
    else
    {
        // switch to the last one
        PersonaSwitcher.switchTo (arr[arr.length-1]);
    }
}

PersonaSwitcher.previous = function()
{
    'use strict';
    PersonaSwitcher.log();

    var arr = LightweightThemeManager.usedThemes;

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
    PersonaSwitcher.log();

    PersonaSwitcher.rotate();
    // if (PersonaSwitcher.prefs.getBoolPref ("auto"))
        PersonaSwitcher.startTimer();
}

PersonaSwitcher.setDefault = function()
{
    'use strict';
    PersonaSwitcher.log();

    PersonaSwitcher.switchTo (null);
    PersonaSwitcher.autoOff();
}

PersonaSwitcher.onMenuItemCommand = function (which)
{
    'use strict';
    PersonaSwitcher.log();

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

    if (kids.length == 0) return;

    for (var i in kids)
    {
        var type = oldPrefs.getPrefType (kids[i]);
        PersonaSwitcher.log (kids[i]);

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
PersonaSwitcher.dump = function (object)
{
    'use strict';
    for (var property in object)
    {
        PersonaSwitcher.log (property + "=" + object[property]);
    }
}

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

    for (var a in arguments)
    {
        message += arguments[a];
    }

    dump (message + '\n');
}
