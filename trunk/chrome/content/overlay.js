// https://developer.mozilla.org/en/JavaScript_code_modules
// http://hg.mozdev.org/jsmodules/summary
// https://developer.mozilla.org/en/Code_snippets/Preferences
// LightweightThemeManager.jsm

// https://addons.mozilla.org/en-US/firefox/pages/appversions/

Components.utils.import ("resource://gre/modules/LightweightThemeManager.jsm");
Components.utils.import ("resource://LWTS/PersonaSwitcher.jsm");

const XUL_NS =
    "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

/*
** create a menuitem, possibly creating a preview for mouseover
*/
PersonaSwitcher.createMenuItem = function (which)
{
    if (document != null)
    {
        var item = document.createElementNS (XUL_NS, "menuitem");
        item.setAttribute ("label", which.name);
        item.addEventListener
        (
            'command',
            function() { PersonaSwitcher.onMenuItemCommand (which); },
            false
        );

        if (PersonaSwitcher.prefs.getBoolPref ("preview"))
        {
            item.addEventListener
            (
                'mouseover',
                function () { LightweightThemeManager.previewTheme (which); },
                false
            );
        }
    }
    else
    {
        alert ("Persona Switcher: document is null!");
        PersonaSwitcher.log (which);
    }

    return (item);
}


PersonaSwitcher.createMenuPopup = function ()
{
    PersonaSwitcher.log ();

    var menupopup = document.createElementNS (XUL_NS, "menupopup");
    var arr = LightweightThemeManager.usedThemes;

    if (arr.length == 0)
    {
        PersonaSwitcher.log ("no themes");

        /*
        ** get the localized message.
        */
        var item = document.createElementNS (XUL_NS, "menuitem");

        item.setAttribute ("label",
            PersonaSwitcher.stringBundle.getString ("noPersonas"));

        menupopup.appendChild (item);
    }
    else
    {
        /*
        ** if we are not previewing, put in the default item.
        */
        if (! PersonaSwitcher.prefs.getBoolPref ("preview"))
        {
            PersonaSwitcher.log ("adding default");

            var item = document.createElementNS (XUL_NS, "menuitem");
            item.setAttribute ("label", "Default");

            item.addEventListener
            (
                'command',
                PersonaSwitcher.setDefault,
                false
            );
            menupopup.appendChild (item);
        }

        for (var i = 0; i < arr.length; i++)
        {
            PersonaSwitcher.log ("adding item number " + i);

            var item = PersonaSwitcher.createMenuItem (arr[i]);
            menupopup.appendChild (item);
        }
    }

    return (menupopup);
}


PersonaSwitcher.hideSubMenu = function ()
{
    if (PersonaSwitcher.prefs.getBoolPref ("preview"))
        LightweightThemeManager.resetPreview();
}

PersonaSwitcher.findMods = function (which)
{
    var mods = "";
    var names = ["shift", "control", "alt", "meta"];

    for (var i in names)
    {
        if (PersonaSwitcher.prefs.getBoolPref (which + names[i]))
        {
            mods += names[i] + " ";
        }
    }

    return (mods);
}

// http://unixpapa.com/js/key.html

PersonaSwitcher.makeKey = function (id, mods, which, command)
{
    var key = document.createElement ("key");

    key.setAttribute ("id", id); 
    if (mods != "") key.setAttribute ("modifiers", mods);
    key.setAttribute ("key", which);
    key.setAttribute ("oncommand", command);

    return (key);
}

// http://stackoverflow.com/questions/549650/how-to-dynamically-change-shortcut-key-in-firefox
PersonaSwitcher.setKeyset = function()
{
    var keyset =
         document.getElementById ("default-persona-key").parentNode;
    PersonaSwitcher.log (keyset);

    var parent = keyset.parentNode;
    PersonaSwitcher.log (parent);

    parent.removeChild (keyset);

    keyset = document.createElement ("keyset");
    PersonaSwitcher.log (keyset);

    var keys =
    [
        [
            "default-persona-key",
            PersonaSwitcher.findMods ("def"),
            PersonaSwitcher.prefs.getCharPref ("defkey").
                toUpperCase().charAt (0),
            "PersonaSwitcher.setDefault();"
        ],
        [
            "rotate-persona-key",
            PersonaSwitcher.findMods ("rot"),
            PersonaSwitcher.prefs.getCharPref ("rotkey").
                toUpperCase().charAt (0),
            "PersonaSwitcher.rotateKey();"
        ],
        [
            "auto-persona-key",
            PersonaSwitcher.findMods ("auto"),
            PersonaSwitcher.prefs.getCharPref ("autokey").
                toUpperCase().charAt (0),
            "PersonaSwitcher.toggleAuto();"
        ]
    ];

    for (var i in keys)
    {
        PersonaSwitcher.log (i);
        keyset.appendChild (PersonaSwitcher.makeKey
            (keys[i][0], keys[i][1], keys[i][2], keys[i][3]));
    }

    parent.appendChild (keyset);
}

PersonaSwitcher.createMenu = function()
{
    var menu = document.createElementNS (XUL_NS, "menu");
    menu.setAttribute ("label", "Personas");

    var menupopup = PersonaSwitcher.createMenuPopup();
    menu.appendChild (menupopup);

    return (menu);
}

var PesonaSwitcherObserver =
{
    register: function()
    {
        PersonaSwitcher.log();

        PersonaSwitcher.stringBundle = document.getElementById 
            ("stringbundle-personaswitcher");

        /*
        ** menus and menupopups cannot be shared
        */
        document.getElementById ("menu_ToolsPopup").appendChild
            (PersonaSwitcher.createMenu());

        document.getElementById ("main-menubar").insertBefore
            (PersonaSwitcher.createMenu(), document.getElementById
                ("windowMenu"));

        PersonaSwitcher.setKeyset();

        var observerService =
            Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService);

        observerService.addObserver(PesonaSwitcherObserver,
            "lightweight-theme-list-changed", false);
    },

    observe: function (subject, topic, data)
    {
        PersonaSwitcher.log ("in observe\n");
        switch (topic)
        {
            case 'lightweight-theme-list-changed':
                PersonaSwitcher.subMenu ("personaswitcher-menupopup");
                break;
        }
    },

    unregister: function()
    {
        var observerService =
            Components.classes["@mozilla.org/observer-service;1"]
            .getService(Components.interfaces.nsIObserverService);

        observerService.removeObserver(PesonaSwitcherObserver,
            "lightweight-theme-list-changed");
    }
}

window.addEventListener("load", PesonaSwitcherObserver.register, false);
window.addEventListener("unload", PesonaSwitcherObserver.unregister, false);

PersonaSwitcher.migratePrefs = function()
{
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
            PersonaSwitcher.prefs.setCharPref (kids[i],
                oldPrefs.getCharPref (kids[i]));
            break;
            case oldPrefs.PREF_INT:
            PersonaSwitcher.prefs.setIntPref (kids[i],
                oldPrefs.getIntPref (kids[i]));
            break;
            case oldPrefs.PREF_BOOL:
            PersonaSwitcher.prefs.setBoolPref (kids[i],
                oldPrefs.getBoolPref (kids[i]));
            break;
        }
    }
    oldPrefs.deleteBranch ("");
}

PersonaSwitcher.startTimer();
PersonaSwitcher.migratePrefs();
