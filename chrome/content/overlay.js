// http://www.sitepoint.com/ten-tips-firefox-extensions/
/*
window.addEventListener('DOMAttrModified', function(e)  
{  
  if(e.attrName == 'active')  
  {  
    if(e.newValue == 'true')  
    {  
      //window has gained the focus  
    }  
    else  
    {  
      //window has lost the focus  
    }  
  }  
}, false);
*/

// https://developer.mozilla.org/en/JavaScript_code_modules
// http://hg.mozdev.org/jsmodules/summary
// https://developer.mozilla.org/en/Code_snippets/Preferences
// LightweightThemeManager.jsm

// https://addons.mozilla.org/en-US/firefox/pages/appversions/

// "import" for jslint
Components.utils["import"]
    ("resource://gre/modules/LightweightThemeManager.jsm");
Components.utils["import"]
    ("resource://LWTS/PersonaSwitcher.jsm");

PersonaSwitcher.XULNS =
    "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

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
    PersonaSwitcher.logger.log();

    var existing = doc.getElementById ("PersonaSwitcher.defaultPersonaKey");
    var parent = existing.parentNode;
    var grandParent = parent.parentNode;

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
        if (keys[key][2] == '') continue;

        var newKey = PersonaSwitcher.makeKey (doc, keys[key][0], keys[key][1],
            keys[key][2], keys[key][3]);

        keyset.appendChild (newKey);
    }

    grandParent.appendChild (keyset);
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Keyboard_Shortcuts#Assigning_a_keyboard_shortcut_on_a_menu

PersonaSwitcher.activateMenu = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    var doc = PersonaSwitcher.activeWindow.document;

    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
    {
        var menu = doc.getElementById ("personaswitcher-main-menubar");

        menu.open = true;
    }
    else if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
    {
        var toolsMenu = PersonaSwitcher.getToolsMenu (doc);
        var subMenu = doc.getElementById ("personaswitcher-tools-submenu");

        if (toolsMenu && subMenu)
        {
            toolsMenu.open = true;
            subMenu.open = true;
        }
    }
    else
    {
        PersonaSwitcher.logger.log ("no menus");
    }
}

// called from PersonaSwitcher.jsm when a perference changes.
PersonaSwitcher.setKeysets = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.setKeyset (doc);
    }
}

PersonaSwitcher.setToolboxMinheight = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log();

    if (PersonaSwitcher.XULAppInfo.name == "Thunderbird") return;

    var minheight =
        parseInt (PersonaSwitcher.prefs.getCharPref ("toolbox-minheight"));
    var maxheight =
        parseInt (PersonaSwitcher.prefs.getCharPref ("toolbox-maxheight"));

    PersonaSwitcher.logger.log (minheight);
    PersonaSwitcher.logger.log (maxheight);

    if (isNaN (minheight)) minheight = 0;
    else if (minheight < 0) minheight = 0;
    else if (minheight > maxheight) minheight = maxheight;

    var nt = doc.getElementById ("navigator-toolbox");

    if (nt !== null)
        doc.getElementById ("navigator-toolbox").minHeight = minheight;
}

PersonaSwitcher.setToolboxMinheights = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    if (PersonaSwitcher.XULAppInfo.name == "Thunderbird") return;

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.setToolboxMinheight (doc);
    }
}

/*
** menus have menupopups which have menuitems.
*/

/*
** create a menuitem, possibly creating a preview
*/
PersonaSwitcher.createMenuItem = function (which, toolbar)
{
    'use strict';
    PersonaSwitcher.logger.log (which);
    PersonaSwitcher.logger.log (toolbar);

    var item = document.createElementNS (PersonaSwitcher.XULNS, "menuitem");

    item.setAttribute ("label", which.name);
    item.addEventListener
    (
        "command",
        function() { PersonaSwitcher.onMenuItemCommand (which); },
        false
    );

    /*
    ** persona previews don't work in Thunderbird from the toolbar
    */
    if (toolbar && PersonaSwitcher.XULAppInfo.name == "Thunderbird")
        return (item);

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

PersonaSwitcher.createAllMenuPopups = function (menupopup, toolbar, arr)
{
    PersonaSwitcher.logger.log (menupopup);
    PersonaSwitcher.logger.log (toolbar);

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

    // sort here
    for (var i = 0; i < arr.length; i++)
    {
        PersonaSwitcher.logger.log ("adding item number " + i);

        item = PersonaSwitcher.createMenuItem (arr[i], toolbar);
        menupopup.appendChild (item);
    }
}

PersonaSwitcher.createMenuPopup = function (menupopup, toolbar)
{
    'use strict';
    PersonaSwitcher.logger.log (menupopup.id);

    var arr = PersonaSwitcher.getPersonas();
    PersonaSwitcher.logger.log (arr.length);

    if (arr.length === 0)
    {
        PersonaSwitcher.logger.log ("no themes");

        /*
        ** get the localized message.
        */
        var item = document.createElementNS (PersonaSwitcher.XULNS, "menuitem");

        item.setAttribute ("label",
            PersonaSwitcher.stringBundle.
                GetStringFromName ("personaswitcher.noPersonas"));

        menupopup.appendChild (item);
        return;
    }

    var previousMenupopup =
        PersonaSwitcher.previousMenupopup[menupopup.id];
    var previousMenupopupArray =
        PersonaSwitcher.previousMenupopupArray[menupopup.id];

    if (previousMenupopup !== null &&
        PersonaSwitcher.arrayEquals (previousMenupopupArray, arr))
    {
        PersonaSwitcher.logger.log ("arrays identical");
        menupopup = previousMenupopup;
    }
    else
    {
        while (menupopup.hasChildNodes())
        {
            PersonaSwitcher.logger.log ("removing child");
            menupopup.removeChild (menupopup.firstChild);
        }

        PersonaSwitcher.createAllMenuPopups (menupopup, toolbar, arr);
        PersonaSwitcher.previousMenupopup[menupopup.id] = menupopup;
        PersonaSwitcher.previousMenupopupArray[menupopup.id] = arr;
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
** the next three functions find the correct name for various elements in
** firefox and thunderbird.
*/
PersonaSwitcher.getToolsMenuPopup = function (doc)
{
    'use strict';

    var mapping =
    {
        "Firefox":      "menu_ToolsPopup",
        "Iceweasel":    "menu_ToolsPopup",
        "Pale Moon":    "menu_ToolsPopup",
        "SeaMonkey":    "taskPopup",
        "Thunderbird":  "taskPopup"
    };

    PersonaSwitcher.logger.log (PersonaSwitcher.XULAppInfo.name);
    PersonaSwitcher.logger.log (mapping[PersonaSwitcher.XULAppInfo.name]);
    return (doc.getElementById (mapping[PersonaSwitcher.XULAppInfo.name]));
}

PersonaSwitcher.getMainMenu = function (doc)
{
    'use strict';

    var mapping = 
    {
        "Firefox":      "main-menubar",
        "Iceweasel":    "main-menubar",
        "Pale Moon":    "main-menubar",
        "SeaMonkey":    "main-menubar",
        "Thunderbird":  "mail-menubar"
    };

    PersonaSwitcher.logger.log (PersonaSwitcher.XULAppInfo.name);
    PersonaSwitcher.logger.log (mapping[PersonaSwitcher.XULAppInfo.name]);
    return (doc.getElementById (mapping[PersonaSwitcher.XULAppInfo.name]));
}

PersonaSwitcher.getToolsMenu = function (doc)
{
    'use strict';

    var mapping = 
    {
        "Firefox":      "tools-menu",
        "Iceweasel":    "tools-menu",
        "Pale Moon":    "tools-menu",
        "SeaMonkey":    "tasksMenu",
        "Thunderbird":  "tasksMenu"
    };

    PersonaSwitcher.logger.log (PersonaSwitcher.XULAppInfo.name);
    PersonaSwitcher.logger.log (mapping[PersonaSwitcher.XULAppInfo.name]);
    return (doc.getElementById (mapping[PersonaSwitcher.XULAppInfo.name]));
}

/*
** remove a particular menu, if it exists, from either the main menubar or
** the tools submenu
*/
PersonaSwitcher.removeMenu = function (doc, which)
{
    'use strict';
    PersonaSwitcher.logger.log (doc);
    PersonaSwitcher.logger.log (which);

    var main;

    if (which == "tools-submenu")
    {
        main = PersonaSwitcher.getToolsMenuPopup (doc);
    }
    else if (which == "main-menubar")
    {
        main = PersonaSwitcher.getMainMenu (doc);
    }
    else
    {
        PersonaSwitcher.logger.log ("unknown menu");
        return;
    }

    if (main === null)
    {
        PersonaSwitcher.logger.log ("main === null");
        return;
    }

    var sub = doc.getElementById ("personaswitcher-" + which);

    PersonaSwitcher.logger.log (main.id);
    PersonaSwitcher.logger.log (sub.id);

    if (sub !== null)
    {
        main.removeChild (sub);
    }
    else
    {
        PersonaSwitcher.logger.log ("sub === null");
    }
}

/*
** remove a particular menu in all windows
*/
PersonaSwitcher.removeMenus = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.logger.log();
        PersonaSwitcher.removeMenu (doc, which);
    }
}

/*
** create a specific menu in a doc, called with either "tools-submenu" or
** "main-menubar". n.b.: this does not populate the popup as that is done
** dynamically.
*/
PersonaSwitcher.createMenuAndPopup = function (doc, which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var menuId = "personaswitcher-" + which;
    var menupopupId = "personaswitcher-" + which + "-popup";

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
        rteMenuPopupteMenuPopupteMenuPopupteMenuPopupteMenuPopupeturn (null);
    }

    menu = document.createElementNS (PersonaSwitcher.XULNS, "menu");
    menu.setAttribute ("label",
        PersonaSwitcher.stringBundle.
            GetStringFromName ("personaswitcher.label"));
    menu.setAttribute ("id", menuId);

    var accesskey = PersonaSwitcher.prefs.getCharPref ("accesskey");
    if (which == "main-menubar" && accesskey != "")
    {
        menu.setAttribute ("accesskey", accesskey.toUpperCase().charAt (0));
    }

    menupopup = document.createElementNS (PersonaSwitcher.XULNS, "menupopup");
    menupopup.setAttribute ("id", menupopupId);
    menupopup.addEventListener
    (
        "popupshowing",
        function () { PersonaSwitcher.createMenuPopup (menupopup, false); },
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
    PersonaSwitcher.logger.log (which);

    var sub, main;
    if (which == "tools-submenu")
    {
        sub = PersonaSwitcher.createMenuAndPopup (doc, which);
        main = PersonaSwitcher.getToolsMenuPopup (doc);

        main.appendChild (sub);
    }
    else if (which == "main-menubar")
    {
        sub = PersonaSwitcher.createMenuAndPopup (doc, which);
        main = PersonaSwitcher.getMainMenu (doc);
        var where = PersonaSwitcher.getToolsMenu (doc).nextSibling;

        PersonaSwitcher.logger.log (sub);
        PersonaSwitcher.logger.log (main);
        PersonaSwitcher.logger.log (where);

        main.insertBefore (sub, where);
    }
    else
    {
        PersonaSwitcher.logger.log ("unknown menu");
    }

    return (sub);
}


/*
** create a particular menu in all windows, called only when a preference
** changes.
*/
PersonaSwitcher.createMenus = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.createMenu (doc, which);
    }
}

PersonaSwitcher.buttonPopup = function (event)
{
    'use strict';
    PersonaSwitcher.logger.log (event.target.id);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        var menupopup = (doc.getElementById (event.target.id));
        if (menupopup)
        {
            PersonaSwitcher.createMenuPopup (menupopup, true);
        }
    }
}

PersonaSwitcher.onWindowLoad = function()
{
    'use strict';

    if (PersonaSwitcher.firstTime)
    {
        PersonaSwitcher.firstTime = false;
        PersonaSwitcher.setLogger();
        PersonaSwitcher.startTimer();

        if (PersonaSwitcher.prefs.getBoolPref ("startup-switch"))
        {
            PersonaSwitcher.rotate();
        }
    }

    PersonaSwitcher.logger.log();

    PersonaSwitcher.setKeyset (this.document);
    PersonaSwitcher.setToolboxMinheight (this.document);

    if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
    {
        PersonaSwitcher.createMenu (this.document, "tools-submenu");
    }
    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
    {
        PersonaSwitcher.createMenu (this.document, "main-menubar");
    }
}

// getMostRecentWindow returns the newest one created, not the one on top
// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Events#Window_events
PersonaSwitcher.onWindowActivate = function()
{
    'use strict';
    // PersonaSwitcher.logger.log();

    PersonaSwitcher.activeWindow = this;
}

PersonaSwitcher.onWindowDeactivate = function()
{
    'use strict';
    // PersonaSwitcher.logger.log();

    PersonaSwitcher.activeWindow = null;
}

window.addEventListener ("load", PersonaSwitcher.onWindowLoad, false);

window.addEventListener
    ("activate", PersonaSwitcher.onWindowActivate, false);
window.addEventListener
    ("deactivate", PersonaSwitcher.onWindowDeactivate, false);
