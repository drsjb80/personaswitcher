// https://developer.mozilla.org/en/JavaScript_code_modules
// http://hg.mozdev.org/jsmodules/summary
// https://developer.mozilla.org/en/Code_snippets/Preferences
// LightweightThemeManager.jsm

// https://addons.mozilla.org/en-US/firefox/pages/appversions/

Components.utils.import ("resource://gre/modules/LightweightThemeManager.jsm");
Components.utils.import ("resource://LWTS/PersonaSwitcher.jsm");

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

/*
***************************************************************************
**
** Keyboard section
**
***************************************************************************
*/

PersonaSwitcher.findMods = function (which)
{
    'use strict';
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
    'use strict';
    var key = document.createElement ("key");

    key.setAttribute ("id", id); 
    if (mods != "")
    {
        key.setAttribute ("modifiers", mods);
    }
    key.setAttribute ("key", which);
    key.setAttribute ("oncommand", command);

    return (key);
}

PersonaSwitcher.getKeyset = function (doc)
{
    'use strict';
    var names = new Array ("mainKeyset", "mailKeys");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.seachForId (doc, names, types));
}

// http://stackoverflow.com/questions/549650/how-to-dynamically-change-shortcut-key-in-firefox
PersonaSwitcher.setKeyset = function (doc)
{
    'use strict';
    var mainKeyset = PersonaSwitcher.getKeyset (doc);

    var keyset = document.getElementById ("personswitcher-keyset");

    if (keyset != null)
    {
        PersonaSwitcher.log ("removing " + keyset.id + " from " +
            mainKeyset.id);

        mainKeyset.removeChild (keyset);
    }

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

    keyset = document.createElement ("keyset");
    keyset.setAttribute ("id", "personswitcher-keyset");

    for (var key in keys)
    {
        keyset.appendChild (PersonaSwitcher.makeKey
            (keys[key][0], keys[key][1], keys[key][2], keys[key][3]));
    }

    PersonaSwitcher.log ("appending " + keyset.id + " to " + mainKeyset.id);
    mainKeyset.appendChild (keyset);
}

/*
***************************************************************************
**
** Menu section
**
***************************************************************************
*/

/*
** menus have menupopups which have menuitems.
*/

/*
** create a menuitem, possibly creating a preview for mouseover
*/
PersonaSwitcher.createMenuItem = function (which)
{
    'use strict';
    var item = document.createElementNS (XUL_NS, "menuitem");

    item.setAttribute ("label", which.name);
    item.addEventListener
    (
        "command",
        function() { PersonaSwitcher.onMenuItemCommand (which); },
        false
    );

    if (PersonaSwitcher.prefs.getBoolPref ("preview"))
    {
        item.addEventListener
        (
            "mouseover",
            function () { LightweightThemeManager.previewTheme (which); },
            false
        );
    }
    return (item);
}

/*
** create a menu of installed personas
*/
PersonaSwitcher.createMenuPopup = function (menupopup)
{
    'use strict';

    /*
    var menupopup = document.getElementById (id);

    if (menupopup == null)
    {
        PersonaSwitcher.log ("menupopup null!");
        return;
    }
    */

    while (menupopup.hasChildNodes())
    {
        PersonaSwitcher.log ("removing child");
        menupopup.removeChild (menupopup.firstChild);
    }

    var arr = LightweightThemeManager.usedThemes;
    PersonaSwitcher.log (arr.length);

    if (arr.length == 0)
    {
        PersonaSwitcher.log ("no themes");

        /*
        ** get the localized message.
        */
        var item = document.createElementNS (XUL_NS, "menuitem");

        item.setAttribute ("label",
            PersonaSwitcher.stringBundle.getString
                ("personaswitcher.noPersonas"));

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
            PersonaSwitcher.log (item);
            item.setAttribute ("label",
                PersonaSwitcher.stringBundle.getString
                    ("personaswitcher.default"));

            item.addEventListener
            (
                "command",
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
    return (true);
}

PersonaSwitcher.hideSubMenu = function ()
{
    'use strict';
    if (PersonaSwitcher.prefs.getBoolPref ("preview"))
        LightweightThemeManager.resetPreview();
}

/*
** search for the IDs in names in the document, return the related member
** in types if found. helps find the differences between firefox and
** thunderbird.
*/
PersonaSwitcher.seachForId = function (doc, names, types)
{
    'use strict';
    PersonaSwitcher.log (doc);
    PersonaSwitcher.log (names);
    PersonaSwitcher.log (types);

    for (var i = 0; i < names.length; i++)
    {
        PersonaSwitcher.log (names[i]);

        var element = doc.getElementById (names[i]);

        if (element != null)
        {
            PersonaSwitcher.log (types[i]);
            return (element);
        }
    }

    PersonaSwitcher.log ("couldn't find element");
    return (null);
}

/*
** the next three functions find the correct name for various elements in
** firefox and thunderbird.
*/
PersonaSwitcher.getToolsMenuPopup = function (doc)
{
    'use strict';
    var names = new Array ("menu_ToolsPopup", "taskPopup");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.seachForId (doc, names, types));
}

PersonaSwitcher.getMainMenu = function (doc)
{
    'use strict';
    var names = new Array ("main-menubar", "mail-menubar");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.seachForId (doc, names, types));
}

PersonaSwitcher.getToolsMenu = function (doc)
{
    'use strict';
    var names = new Array ("tools-menu", "tasksMenu");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.seachForId (doc, names, types));
}

/*
** remove a particular menu, if it exists, from either the main menubar or
** the tools submenu
*/
PersonaSwitcher.removeMenu = function (doc, id)
{
    'use strict';
    PersonaSwitcher.log (doc);
    PersonaSwitcher.log (id);

    var main;

    if (id == "tools-submenu")
    {
        main = PersonaSwitcher.getToolsMenuPopup (doc);
    }
    else if (id == "main-menubar")
    {
        main = PersonaSwitcher.getMainMenu (doc);
    }
    else
    {
        PersonaSwitcher.log ("unknown id");
        return;
    }

    if (main == null)
    {
        PersonaSwitcher.log ("main == null");
        return;
    }

    var sub = doc.getElementById ("personaswitcher-" + id);

    PersonaSwitcher.log (main.id);
    PersonaSwitcher.log (sub.id);

    if (sub != null)
        main.removeChild (sub);
    else
        PersonaSwitcher.log ("sub == null");
}

/*
** remove a particular menu in all windows
*/
PersonaSwitcher.removeMenus = function (which)
{
    'use strict';
    PersonaSwitcher.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator
        ("navigator:browser");

    while(enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.log();
        PersonaSwitcher.removeMenu (doc, which);
    }
}

/*
** create a specific menu
*/
PersonaSwitcher.createMenuAndPopup = function (doc, menuId, menupopupId)
{
    'use strict';
    PersonaSwitcher.log (doc);
    PersonaSwitcher.log (menuId);
    PersonaSwitcher.log (menupopupId);

    var menu = doc.getElementById (menuId);
    if (menu)
    {
        PersonaSwitcher.log ("menu already exists!");
        return;
    }

    var menupopup = doc.getElementById (menupopupId);
    if (menupopup)
    {
        PersonaSwitcher.log ("menupopup already exists!");
        return;
    }

    menu = document.createElementNS (XUL_NS, "menu");
    menu.setAttribute ("label",
        PersonaSwitcher.stringBundle.getString ("personaswitcher.label"));
    menu.setAttribute ("id", menuId);

    menupopup = document.createElementNS (XUL_NS, "menupopup");
    menupopup.setAttribute ("id", menupopupId);
    menupopup.addEventListener
    (
        "popupshowing",
        function () { PersonaSwitcher.createMenuPopup (menupopup); },
        false
    );
    menupopup.addEventListener
    (
        "popuphidden",
        PersonaSwitcher.hideSubMenu,
        false
    );

    menu.appendChild (menupopup);
    return (menu);
}

/*
** menus and menupopups cannot be shared so we must create them for
** each window.
*/
PersonaSwitcher.createMenu = function (doc, which)
{
    'use strict';
    PersonaSwitcher.log (doc);
    PersonaSwitcher.log (which);

    var menuId = "personaswitcher-" + which;
    var menupopupId = "personaswitcher-" + which + "-popup";

    if (which == "tools-submenu")
    {
        var sub = PersonaSwitcher.createMenuAndPopup (doc, menuId, menupopupId);
        var main = PersonaSwitcher.getToolsMenuPopup (doc);

        // PersonaSwitcher.log (main.id);
        // PersonaSwitcher.log (sub.id);

        main.appendChild (sub);
    }
    else if (which == "main-menubar")
    {
        var sub = PersonaSwitcher.createMenuAndPopup (doc, menuId, menupopupId);
        var main = PersonaSwitcher.getMainMenu (doc);
        var where = PersonaSwitcher.getToolsMenu (doc).nextSibling;

        // PersonaSwitcher.log (main.id);
        // PersonaSwitcher.log (sub.id);
        // PersonaSwitcher.log (where.id);

        main.insertBefore (sub, where);
    }
    else
    {
        PersonaSwitcher.log ("unknown menu");
    }
}

/*
** create a particular menu in all windows
*/
PersonaSwitcher.createMenus = function (which)
{
    'use strict';
    PersonaSwitcher.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator
        ("navigator:browser");

    while(enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.log();
        PersonaSwitcher.createMenu (doc, which);
    }
}

PersonaSwitcher.onWindowLoad = function()
{
    'use strict';

    // PersonaSwitcher.log (this);
    // PersonaSwitcher.log (this.document);

    PersonaSwitcher.stringBundle = document.getElementById 
        ("stringbundle-personaswitcher");

    PersonaSwitcher.setKeyset (this.document);

    if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
        PersonaSwitcher.createMenu (this.document, "tools-submenu");
    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
        PersonaSwitcher.createMenu (this.document, "main-menubar");
}

PersonaSwitcher.log ();
window.addEventListener("load", PersonaSwitcher.onWindowLoad, false);

if (PersonaSwitcher.firstTime)
{
    PersonaSwitcher.firstTime = false;
    PersonaSwitcher.startTimer();
    PersonaSwitcher.migratePrefs();
}
