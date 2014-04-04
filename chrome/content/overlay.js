// https://developer.mozilla.org/en/JavaScript_code_modules
// http://hg.mozdev.org/jsmodules/summary
// https://developer.mozilla.org/en/Code_snippets/Preferences
// LightweightThemeManager.jsm

// https://addons.mozilla.org/en-US/firefox/pages/appversions/

// for jslint
Components.utils["import"] ("resource://gre/modules/LightweightThemeManager.jsm");
Components.utils["import"] ("resource://LWTS/PersonaSwitcher.jsm");


PersonaSwitcher.XULNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

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
    PersonaSwitcher.log (which);
    var mods = "";
    var names = ["shift", "control", "alt", "meta"];

    for (var i in names)
    {
        if (PersonaSwitcher.prefs.getBoolPref (which + names[i]))
        {
            mods += names[i] + " ";
        }
    }

    PersonaSwitcher.log (mods);
    return (mods);
}

// http://unixpapa.com/js/key.html
PersonaSwitcher.makeKey = function (doc, id, mods, which, command)
{
    'use strict';
    PersonaSwitcher.log (id);
    PersonaSwitcher.log (mods);
    PersonaSwitcher.log (which);
    PersonaSwitcher.log (command);

    var key = doc.createElement ("key");

    key.setAttribute ("id", id); 
    if (mods !== "")
    {
        key.setAttribute ("modifiers", mods);
    }
    key.setAttribute ("key", which);
    key.setAttribute ("oncommand", command);

    return (key);
}

// http://stackoverflow.com/questions/549650/how-to-dynamically-change-shortcut-key-in-firefox
PersonaSwitcher.setKeyset = function (doc)
{
    'use strict';
    PersonaSwitcher.log (doc);

    var previous = doc.getElementById ("PersonaSwitcher.defaultPersonaKey");
    var parent = previous.parentNode;
    PersonaSwitcher.log (parent.id);
    var grandParent = parent.parentNode;
    PersonaSwitcher.log (grandParent.id);

    grandParent.removeChild (parent);

    var keyset = doc.createElement ("keyset");

    var keys =
    [
        [
            "PersonaSwitcher.defaultPersonaKey",
            PersonaSwitcher.findMods ("def"),
            PersonaSwitcher.prefs.getCharPref ("defkey").
                toUpperCase().charAt (0),
            "PersonaSwitcher.setDefault();"
        ],
        [
            "PersonaSwitcher.rotatePersonaKey",
            PersonaSwitcher.findMods ("rot"),
            PersonaSwitcher.prefs.getCharPref ("rotkey").
                toUpperCase().charAt (0),
            "PersonaSwitcher.rotateKey();"
        ],
        [
            "PersonaSwitcher.autoPersonaKey",
            PersonaSwitcher.findMods ("auto"),
            PersonaSwitcher.prefs.getCharPref ("autokey").
                toUpperCase().charAt (0),
            "PersonaSwitcher.toggleAuto();"
        ]
    ];

    for (var key in keys)
    {
        var newKey = PersonaSwitcher.makeKey (doc, keys[key][0], keys[key][1],
            keys[key][2], keys[key][3]);

        keyset.appendChild (newKey);
    }

    grandParent.appendChild (keyset);
}

// called from PersonaSwitcher.jsm
PersonaSwitcher.setKeysets = function()
{
    'use strict';
    PersonaSwitcher.log();

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.log (doc.id);
        PersonaSwitcher.setKeyset (doc);
    }
}

PersonaSwitcher.setToolboxMinheight = function (doc)
{
    'use strict';

    var minheight = PersonaSwitcher.prefs.getCharPref ("toolbox-minheight");

    if (minheight === "") return;

    doc.getElementById ("navigator-toolbox").minHeight = minheight;
}

PersonaSwitcher.setToolboxMinheights = function()
{
    'use strict';
    PersonaSwitcher.log();

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.setToolboxMinheight (doc);
    }
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
** create a menuitem, possibly creating a preview
*/
PersonaSwitcher.createMenuItem = function (which)
{
    'use strict';
    var item = document.createElementNS (PersonaSwitcher.XULNS, "menuitem");

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
            "DOMMenuItemActive",
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

    PersonaSwitcher.log (menupopup);

    while (menupopup.hasChildNodes())
    {
        PersonaSwitcher.log ("removing child");
        menupopup.removeChild (menupopup.firstChild);
    }

    var arr = PersonaSwitcher.getPersonas();
    PersonaSwitcher.log (arr.length);

    if (arr.length === 0)
    {
        PersonaSwitcher.log ("no themes");

        /*
        ** get the localized message.
        */
        var no = document.createElementNS (PersonaSwitcher.XULNS, "menuitem");

        item.setAttribute ("label",
            PersonaSwitcher.stringBundle.
                GetStringFromName ("personaswitcher.noPersonas"));

        menupopup.appendChild (item);
    }
    else
    {
        var item = document.createElementNS (PersonaSwitcher.XULNS, "menuitem");

        item.setAttribute ("label",
            PersonaSwitcher.stringBundle.
                GetStringFromName ("personaswitcher.default"));
        item.addEventListener
        (
            "command",
            PersonaSwitcher.setDefault,
            false
        );
        menupopup.appendChild (item);

        for (var i = 0; i < arr.length; i++)
        {
            PersonaSwitcher.log ("adding item number " + i);

            item = PersonaSwitcher.createMenuItem (arr[i]);
            menupopup.appendChild (item);
        }
    }
}

PersonaSwitcher.hideSubMenu = function ()
{
    'use strict';
    PersonaSwitcher.log();

    if (PersonaSwitcher.prefs.getBoolPref ("preview"))
        LightweightThemeManager.resetPreview();
}

/*
** search for the IDs in names in the document, return the related member
** in types if found. helps find the differences between firefox and
** thunderbird.
*/
PersonaSwitcher.searchForId = function (doc, names, types)
{
    'use strict';
    PersonaSwitcher.log (doc);
    PersonaSwitcher.log (names);
    PersonaSwitcher.log (types);

    for (var i = 0; i < names.length; i++)
    {
        PersonaSwitcher.log (names[i]);

        var element = doc.getElementById (names[i]);

        PersonaSwitcher.log (element);

        if (element !== null)
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

    return (PersonaSwitcher.searchForId (doc, names, types));
}

PersonaSwitcher.getMainMenu = function (doc)
{
    'use strict';
    var names = new Array ("main-menubar", "mail-menubar");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.searchForId (doc, names, types));
}

PersonaSwitcher.getToolsMenu = function (doc)
{
    'use strict';
    var names = new Array ("tools-menu", "tasksMenu");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.searchForId (doc, names, types));
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

    if (main === null)
    {
        PersonaSwitcher.log ("main === null");
        return;
    }

    var sub = doc.getElementById ("personaswitcher-" + id);

    PersonaSwitcher.log (main.id);
    PersonaSwitcher.log (sub.id);

    if (sub !== null)
        main.removeChild (sub);
    else
        PersonaSwitcher.log ("sub === null");
}

/*
** remove a particular menu in all windows
*/
PersonaSwitcher.removeMenus = function (which)
{
    'use strict';
    PersonaSwitcher.log (which);

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
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
        return (null);
    }

    var menupopup = doc.getElementById (menupopupId);
    if (menupopup)
    {
        PersonaSwitcher.log ("menupopup already exists!");
        return (null);
    }

    menu = document.createElementNS (PersonaSwitcher.XULNS, "menu");
    menu.setAttribute ("label",
        PersonaSwitcher.stringBundle.
            GetStringFromName ("personaswitcher.label"));
    menu.setAttribute ("id", menuId);

    menupopup = document.createElementNS (PersonaSwitcher.XULNS, "menupopup");
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

    var sub, main;
    if (which == "tools-submenu")
    {
        sub = PersonaSwitcher.createMenuAndPopup (doc, menuId, menupopupId);
        main = PersonaSwitcher.getToolsMenuPopup (doc);

        main.appendChild (sub);
    }
    else if (which == "main-menubar")
    {
        sub = PersonaSwitcher.createMenuAndPopup (doc, menuId, menupopupId);
        main = PersonaSwitcher.getMainMenu (doc);
        var where = PersonaSwitcher.getToolsMenu (doc).nextSibling;

        main.insertBefore (sub, where);
    }
    else
    {
        PersonaSwitcher.log ("unknown menu");
    }
}

// called by toolbar and onWindowLoad
PersonaSwitcher.createButtonPopup = function (menupopup)
{
    'use strict';
    PersonaSwitcher.log();

    if (menupopup === null)
    {
        PersonaSwitcher.log ("menupopup null!");
        return;
    }

    PersonaSwitcher.createMenuPopup (menupopup);
}

// called by toolbar
PersonaSwitcher.buttonPopup = function (event)
{
    'use strict';
    PersonaSwitcher.log (event.target.id);

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
    {
        PersonaSwitcher.log();

        var doc = enumerator.getNext().document;
        var menupopup = (doc.getElementById (event.target.id));
        PersonaSwitcher.createButtonPopup (menupopup);
    }
}

/*
** create a particular menu in all windows
*/
PersonaSwitcher.createMenus = function (which)
{
    'use strict';
    PersonaSwitcher.log (which);

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.log();
        PersonaSwitcher.createMenu (doc, which);
    }
}

PersonaSwitcher.onWindowLoad = function()
{
    'use strict';

    PersonaSwitcher.setKeyset (this.document);
    PersonaSwitcher.setToolboxMinheight (this.document);

    if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
        PersonaSwitcher.createMenu (this.document, "tools-submenu");
    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
        PersonaSwitcher.createMenu (this.document, "main-menubar");

    PersonaSwitcher.createButtonPopup
        (document.getElementById ("personaswitcher-addon"));

    if (PersonaSwitcher.firstTime)
    {
        PersonaSwitcher.firstTime = false;

        PersonaSwitcher.startTimer();
        // PersonaSwitcher.migratePrefs();

        if (PersonaSwitcher.prefs.getBoolPref ("startup-switch"))
        {
            PersonaSwitcher.rotate();
        }
    }
}

window.addEventListener ("load", PersonaSwitcher.onWindowLoad, false);

/*
window.addEventListener ("activate", PersonaSwitcher.startTimer, false);
window.addEventListener ("deactivate", PersonaSwitcher.stopTimer, false);
*/

