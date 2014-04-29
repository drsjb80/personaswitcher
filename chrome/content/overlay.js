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
    PersonaSwitcher.logger.log (which);
    var mods = "";
    var names = ["shift", "control", "alt", "meta"];

    for (var i in names)
    {
        if (PersonaSwitcher.prefs.getBoolPref (which + names[i]))
        {
            mods += names[i] + " ";
        }
    }

    PersonaSwitcher.logger.log (mods);
    return (mods);
}

//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Keyboard_Shortcuts
// http://unixpapa.com/js/key.html
PersonaSwitcher.makeKey = function (doc, id, mods, which, command)
{
    'use strict';
    PersonaSwitcher.logger.log (id);
    PersonaSwitcher.logger.log (mods);
    PersonaSwitcher.logger.log (which);
    PersonaSwitcher.logger.log (command);

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
    PersonaSwitcher.logger.log (doc);

    var existing = doc.getElementById ("PersonaSwitcher.defaultPersonaKey");

    var parent = existing.parentNode;
    // parent == keyset
    PersonaSwitcher.logger.log (parent.id);

    var grandParent = parent.parentNode;
    // grandParent == overlay
    PersonaSwitcher.logger.log (grandParent.id);

    // remove the existing keyset and make a brand new one
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
        ],
        [
            "PersonaSwitcher.activatePersonaKey",
            PersonaSwitcher.findMods ("activate"),
            PersonaSwitcher.prefs.getCharPref ("activatekey").
                toUpperCase().charAt (0),
            "PersonaSwitcher.activateMenu();"
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

PersonaSwitcher.activateMenu = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
    {
        var menu = document.getElementById ("personaswitcher-main-menubar");
        PersonaSwitcher.logger.log (menu);

        if (menu) menu.open = true;
    }
    else if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
    {
        var toolsMenu = PersonaSwitcher.getToolsMenu (document);
        PersonaSwitcher.logger.log (toolsMenu);
        var subMenu = document.getElementById ("personaswitcher-tools-submenu");
        PersonaSwitcher.logger.log (subMenu);

        if (toolsMenu && subMenu)
        {
            toolsMenu.open = true;
            subMenu.open = true;
        }
    }
}

// called from PersonaSwitcher.jsm
PersonaSwitcher.setKeysets = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.logger.log (doc.id);
        PersonaSwitcher.setKeyset (doc);
    }
}

PersonaSwitcher.setToolboxMinheight = function (doc)
{
    'use strict';

    var minheight =
        parseInt (PersonaSwitcher.prefs.getCharPref ("toolbox-minheight"));
    var maxheight =
        parseInt (PersonaSwitcher.prefs.getCharPref ("toolbox-maxheight"));

    PersonaSwitcher.logger.log (minheight);
    PersonaSwitcher.logger.log (maxheight);

    if (isNaN (minheight)) minheight = 0;
    else if (minheight < 0) minheight = 0;
    else if (minheight > maxheight) minheight = maxheight;

    // PersonaSwitcher.dump (doc.getElementById ("navigator-toolbox"));
    doc.getElementById ("navigator-toolbox").minHeight = minheight;
}

PersonaSwitcher.setToolboxMinheights = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

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

    PersonaSwitcher.logger.log (menupopup);

    while (menupopup.hasChildNodes())
    {
        PersonaSwitcher.logger.log ("removing child");
        menupopup.removeChild (menupopup.firstChild);
    }

    var arr = PersonaSwitcher.getPersonas();
    PersonaSwitcher.logger.log (arr.length);

    if (arr.length === 0)
    {
        PersonaSwitcher.logger.log ("no themes");

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
            PersonaSwitcher.logger.log ("adding item number " + i);

            item = PersonaSwitcher.createMenuItem (arr[i]);
            menupopup.appendChild (item);
        }
    }
}

PersonaSwitcher.hideSubMenu = function ()
{
    'use strict';
    PersonaSwitcher.logger.log();

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
    PersonaSwitcher.logger.log (doc);
    PersonaSwitcher.logger.log (names);
    PersonaSwitcher.logger.log (types);

    for (var i = 0; i < names.length; i++)
    {
        PersonaSwitcher.logger.log (names[i]);

        var element = doc.getElementById (names[i]);

        PersonaSwitcher.logger.log (element);

        if (element !== null)
        {
            PersonaSwitcher.logger.log (types[i]);
            return (element);
        }
    }

    PersonaSwitcher.logger.log ("couldn't find element");
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
    PersonaSwitcher.logger.log (doc);
    PersonaSwitcher.logger.log (id);

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
        PersonaSwitcher.logger.log ("unknown id");
        return;
    }

    if (main === null)
    {
        PersonaSwitcher.logger.log ("main === null");
        return;
    }

    var sub = doc.getElementById ("personaswitcher-" + id);

    PersonaSwitcher.logger.log (main.id);
    PersonaSwitcher.logger.log (sub.id);

    if (sub !== null)
        main.removeChild (sub);
    else
        PersonaSwitcher.logger.log ("sub === null");
}

/*
** remove a particular menu in all windows
*/
PersonaSwitcher.removeMenus = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.logger.log();
        PersonaSwitcher.removeMenu (doc, which);
    }
}

/*
** create a specific menu in a doc, called with either
**  "personaswitcher-tools-submenu" and "personaswitcher-tools-submenu-popup" or
**  "personaswitcher-main-menubar" and "personaswitcher-main-menubar-popup"
*/
PersonaSwitcher.createMenuAndPopup = function (doc, menuId, menupopupId)
{
    'use strict';
    PersonaSwitcher.logger.log (doc);
    PersonaSwitcher.logger.log (menuId);
    PersonaSwitcher.logger.log (menupopupId);

    var menu = doc.getElementById (menuId);
    if (menu)
    {
        PersonaSwitcher.logger.log ("menu already exists!");
        return (null);
    }

    var menupopup = doc.getElementById (menupopupId);
    if (menupopup)
    {
        PersonaSwitcher.logger.log ("menupopup already exists!");
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
    PersonaSwitcher.logger.log (doc);
    PersonaSwitcher.logger.log (which);

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
        PersonaSwitcher.logger.log ("unknown menu");
    }
}

// called by toolbar and onWindowLoad
PersonaSwitcher.createButtonPopup = function (menupopup)
{
    'use strict';
    PersonaSwitcher.logger.log();

    if (menupopup === null)
    {
        PersonaSwitcher.logger.log ("menupopup null!");
        return;
    }

    PersonaSwitcher.createMenuPopup (menupopup);
}

// called by toolbar
PersonaSwitcher.buttonPopup = function (event)
{
    'use strict';
    PersonaSwitcher.logger.log (event.target.id);

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
    {
        PersonaSwitcher.logger.log();

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
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.
        getEnumerator ("navigator:browser");

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.logger.log();
        PersonaSwitcher.createMenu (doc, which);
    }
}

PersonaSwitcher.onWindowLoad = function()
{
    'use strict';

    if (PersonaSwitcher.firstTime)
    {
        PersonaSwitcher.firstTime = false;

        if (PersonaSwitcher.prefs.getBoolPref ("debug"))
        {
            PersonaSwitcher.logger = PersonaSwitcher.consoleLogger;
        }
        else
        {
            PersonaSwitcher.logger = PersonaSwitcher.nullLogger;
        }

        PersonaSwitcher.startTimer();

        if (PersonaSwitcher.prefs.getBoolPref ("startup-switch"))
        {
            PersonaSwitcher.rotate();
        }
    }

    PersonaSwitcher.setKeyset (this.document);
    PersonaSwitcher.setToolboxMinheight (this.document);

    if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
        PersonaSwitcher.createMenu (this.document, "tools-submenu");
    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
        PersonaSwitcher.createMenu (this.document, "main-menubar");

    PersonaSwitcher.createButtonPopup
        (document.getElementById ("personaswitcher-addon"));
}

window.addEventListener ("load", PersonaSwitcher.onWindowLoad, false);

/*
window.addEventListener ("activate", PersonaSwitcher.startTimer, false);
window.addEventListener ("deactivate", PersonaSwitcher.stopTimer, false);
*/

