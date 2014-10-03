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
};

//https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Keyboard_Shortcuts
// http://unixpapa.com/js/key.html
PersonaSwitcher.makeKey = function (doc, id, mods, which, command)
{
    'use strict';

    var key = doc.createElement ("key");

    key.setAttribute ("id", id); 
    if (mods !== "")
    {
        key.setAttribute ("modifiers", mods);
    }
    key.setAttribute ("key", which);
    key.setAttribute ("oncommand", command);

    return (key);
};

// http://stackoverflow.com/questions/549650/how-to-dynamically-change-shortcut-key-in-firefox
PersonaSwitcher.setKeyset = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log();

    var existing = doc.getElementById ("PersonaSwitcher.defaultPersonaKey");

    // there are windows/documents that don't have keyset -- e.g.: prefs
    if (existing === null) return;

    var parent = existing.parentNode;
    var grandParent = parent.parentNode;

    // remove the existing keyset and make a brand new one
    grandParent.removeChild (parent);
    var keyset = doc.createElement ("keyset");

            // "PersonaSwitcher.logger.log(); gFindBar.open();"
            // "PersonaSwitcher.logger.log(); gFindBar.close();"
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
        if (keys[key][2] === '') continue;

        var newKey = PersonaSwitcher.makeKey (doc,
            keys[key][0], keys[key][1], keys[key][2], keys[key][3]);

        keyset.appendChild (newKey);
    }

    grandParent.appendChild (keyset);
    PersonaSwitcher.logger.log 
        (doc.getElementById ("PersonaSwitcher.defaultPersonaKey"));
};

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Keyboard_Shortcuts#Assigning_a_keyboard_shortcut_on_a_menu

PersonaSwitcher.activateMenu = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
    {
        var menu = document.getElementById ("personaswitcher-main-menubar");

        menu.open = true;
    }
    else if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
    {
        var toolsMenu = PersonaSwitcher.getToolsMenu (document);
        var subMenu = document.getElementById ("personaswitcher-tools-submenu");

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
};

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
};

PersonaSwitcher.setToolboxMinheight = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log();

    if (PersonaSwitcher.XULAppInfo.name === "Thunderbird") return;

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
};

PersonaSwitcher.setToolboxMinheights = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    if (PersonaSwitcher.XULAppInfo.name === "Thunderbird") return;

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.setToolboxMinheight (doc);
    }
};

PersonaSwitcher.changePersonaMenus = function()
{
    if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
    {
        PersonaSwitcher.createMenus ("tools-submenu");
    }
    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
    {
        PersonaSwitcher.createMenus ("main-menubar");
    }
    PersonaSwitcher.toolbarPopup();
};

PersonaSwitcher.AddonListener =
{
    onInstalled: function (addon)
    {
        PersonaSwitcher.logger.log (addon.type);
        
        if (addon.type === "theme")
        {
            PersonaSwitcher.changePersonaMenus();
        }
    }
    /*
    onDownloadStarted: function (addon)
    {
        PersonaSwitcher.logger.log (addon.type);
    },
    onDownloadEnded: function (addon)
    {
        PersonaSwitcher.logger.log (addon.type);
    },
    onInstallsCompleted: function()
    {
        PersonaSwitcher.logger.log();
    },
    onInstallStarted: function (addon)
    {
        PersonaSwitcher.logger.log (addon.type);
    },
    onInstallEnded: function (addon, status)
    {
        PersonaSwitcher.logger.log (addon.type);

        if (addon.type === PersonaSwitcher.extensionManager.TYPE_THEME)
        {
            PersonaSwitcher.changePersonaMenus();
        }
    }
    */
};

// https://developer.mozilla.org/en-US/Add-ons/Add-on_Manager
// https://developer.mozilla.org/en-US/Add-ons/Add-on_Manager/AddonListener

// http://www.oxymoronical.com/experiments/apidocs/interface/nsIExtensionManager
// http://www.oxymoronical.com/experiments/apidocs/interface/nsIAddonInstallListener

try
{
    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    AddonManager.addAddonListener (PersonaSwitcher.AddonListener);
    PersonaSwitcher.addonManager = true;
}
catch (e) {}; 

try
{
    PersonaSwitcher.extensionManager = 
        Components.classes['@mozilla.org/extensions/manager;1']
            .getService(Components.interfaces.nsIExtensionManager);
}
catch (e) {}; 

/*
let tmp = {};
Components.utils.import("resource://gre/modules/AddonManager.jsm", tmp);
let AddonManager = tmp.AddonManager;
AddonManager.addAddonListener (PersonaSwitcher.AddonListener);
let AddonManagerPrivate = tmp.AddonManagerPrivate;
AddonManagerPrivate.addAddonListener (PersonaSwitcher.AddonListener);
*/

PersonaSwitcher.previewTimer = Components.classes["@mozilla.org/timer;1"].
    createInstance(Components.interfaces.nsITimer);

PersonaSwitcher.previewObserver =
{
    observe: function (subject, topic, data)
    {
        'use strict';

        PersonaSwitcher.logger.log();
        LightweightThemeManager.previewTheme (PersonaSwitcher.previewWhich);
    }
};

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

    if (which === null || typeof which.name === 'undefined') return (null);

    var item = document.createElementNS (PersonaSwitcher.XULNS, "menuitem");

    item.setAttribute ("label", which.name);
    item.addEventListener
    (
        "command",
        function()
        {
            PersonaSwitcher.onMenuItemCommand (which);
        },
        false
    );

    /*
    ** persona previews don't work in Thunderbird from the toolbar
    */
    if (toolbar && PersonaSwitcher.XULAppInfo.name === "Thunderbird")
        return (item);

    // create method and pass in item and which
    if (PersonaSwitcher.prefs.getBoolPref ("preview"))
    {
// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIXULRuntime
// https://developer.mozilla.org/en-US/docs/Web/Events/DOMMenuItemInactive
// https://bugzilla.mozilla.org/show_bug.cgi?id=420033
        // var darwin = PersonaSwitcher.XULRuntime.OS == "Darwin";
        var delay = PersonaSwitcher.prefs.getIntPref ("preview-delay");

        if (delay === 0)
        {
            item.addEventListener
            (
                "DOMMenuItemActive",
                function (event)
                {
                    PersonaSwitcher.logger.log (which.name + " Active");
                    LightweightThemeManager.previewTheme (which);
                }
            );
        }
        else
        {
            // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Events
            item.addEventListener
            (
                "DOMMenuItemActive",
                function (event)
                {
                    PersonaSwitcher.previewTimer.cancel();
                    PersonaSwitcher.previewWhich = which;
                    PersonaSwitcher.previewTimer.init
                    (
                        PersonaSwitcher.previewObserver, delay,
                        Components.interfaces.nsITimer.TYPE_ONE_SHOT
                    );
                }
            );
        }
        /*
        item.addEventListener
        (
            "DOMMenuItemInactive",
            function (event)
            {
                // if (event) event.stopPropagation();
                PersonaSwitcher.logger.log (which + " Inactive");
            },
            false
        )
        */
    }
    return (item);
};

PersonaSwitcher.createMenuItems = function (menupopup, toolbar, arr)
{
    PersonaSwitcher.logger.log (menupopup);
    PersonaSwitcher.logger.log (toolbar);

    var item;

    /*
    var item = document.createElementNS (PersonaSwitcher.XULNS, "menuitem");

    item.setAttribute ("label",
        PersonaSwitcher.stringBundle.
            GetStringFromName ("personaswitcher.default"));
    item.addEventListener
    (
        "command",
        PersonaSwitcher.setDefault(),
        false
    );
    item.addEventListener
    (
        "DOMMenuItemActive",
        function (event)
        {
            if (event) event.stopPropagation();
            PersonaSwitcher.logger.log ("Default menu item Active");
            PersonaSwitcher.popupHidden();
        },
        true
    );
    item.addEventListener
    (
        "DOMMenuItemInactive",
        function (event)
        {
            if (event) event.stopPropagation();
            PersonaSwitcher.logger.log ("Default menu item Inactive");
        },
        true
    );
    */

    /*
    var item = PersonaSwitcher.createMenuItem
        (PersonaSwitcher.defaultTheme, toolbar);

    if (item)
    {
        menupopup.appendChild (item);
    }
    */

    // sort here
    for (var i = 0; i < arr.length; i++)
    {
        PersonaSwitcher.logger.log ("adding item number " + i);

        if (toolbar && "Default" === arr[i].name &&
            "Pale moon" === PersonaSwitcher.XULAppInfo.name)
        {
            continue;
        }

        item = PersonaSwitcher.createMenuItem (arr[i], toolbar)
        if (item)
        {
            menupopup.appendChild (item);
        }
    }
};

PersonaSwitcher.createMenuPopup = function (menupopup, toolbar)
{
    'use strict';
    PersonaSwitcher.logger.log (menupopup.id);

    while (menupopup.hasChildNodes())
    {
        PersonaSwitcher.logger.log ("removing child");
        menupopup.removeChild (menupopup.firstChild);
    }

    var arr = PersonaSwitcher.getPersonas();
    PersonaSwitcher.logger.log (arr.length);

    /*
    if (arr.length === 0)
    {
        PersonaSwitcher.logger.log ("no themes");

        // get the localized message.
        var item = document.createElementNS (PersonaSwitcher.XULNS, "menuitem");

        item.setAttribute ("label",
            PersonaSwitcher.stringBundle.
                GetStringFromName ("personaswitcher.noPersonas"));

        PersonaSwitcher.logger.log (item);
        menupopup.appendChild (item);
        return;
    }
    */

    PersonaSwitcher.createMenuItems (menupopup, toolbar, arr);
};

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

    // PersonaSwitcher.logger.log (PersonaSwitcher.XULAppInfo.name);
    // PersonaSwitcher.logger.log (mapping[PersonaSwitcher.XULAppInfo.name]);
    return (doc.getElementById (mapping[PersonaSwitcher.XULAppInfo.name]));
};

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

    // PersonaSwitcher.logger.log (PersonaSwitcher.XULAppInfo.name);
    // PersonaSwitcher.logger.log (mapping[PersonaSwitcher.XULAppInfo.name]);
    return (doc.getElementById (mapping[PersonaSwitcher.XULAppInfo.name]));
};

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

    // PersonaSwitcher.logger.log (PersonaSwitcher.XULAppInfo.name);
    // PersonaSwitcher.logger.log (mapping[PersonaSwitcher.XULAppInfo.name]);
    return (doc.getElementById (mapping[PersonaSwitcher.XULAppInfo.name]));
};

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

    if (which === "tools-submenu")
    {
        main = PersonaSwitcher.getToolsMenuPopup (doc);
    }
    else if (which === "main-menubar")
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
};

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
};

/*
** create a specific menu in a doc, called with either "tools-submenu" or
** "main-menubar". n.b.: this does not populate the popup as that is done
** dynamically.
** https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/PopupGuide/MenuModification
*/
PersonaSwitcher.createMenuAndPopup = function (doc, which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var menuId = "personaswitcher-" + which;
    var menupopupId = "personaswitcher-" + which + "-popup";

    var menu = doc.getElementById (menuId);
    var menupopup = doc.getElementById (menupopupId);

    PersonaSwitcher.logger.log (menu);
    PersonaSwitcher.logger.log (menupopup);

    if (menu && menupopup)
    {
        menu.removeChild (menupopup);
    }

    if (! menu)
    {
        menu = doc.createElementNS (PersonaSwitcher.XULNS, "menu");
        menu.setAttribute ("label",
            PersonaSwitcher.stringBundle.
                GetStringFromName ("personaswitcher.label"));
        menu.setAttribute ("id", menuId);
    }

    if (! menupopup)
    {
        menupopup = doc.createElementNS (PersonaSwitcher.XULNS, "menupopup");
        menupopup.setAttribute ("id", menupopupId);
        /*
        menupopup.setAttribute ("onpopuphidden",
            "PersonaSwitcher.popupHidden();");
        */
    }

    var accesskey = PersonaSwitcher.prefs.getCharPref ("accesskey");
    if (which === "main-menubar" && accesskey !== "")
    {
        menu.setAttribute ("accesskey", accesskey.toUpperCase().charAt (0));
    }

    PersonaSwitcher.createMenuPopup (menupopup, false);

    /*
    menupopup.addEventListener
    (
        "popupshowing",
        PersonaSwitcher.createMenuPopup (menupopup, false),
        false
    );
    */

    menu.appendChild (menupopup);

    return (menu);
};

/*
** menus and menupopups cannot be shared so we must create them for
** each window.
*/
PersonaSwitcher.createMenu = function (doc, which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var sub, main;
    if (which === "tools-submenu")
    {
        var menupopup = doc.getElementById
            ("personaswitcher-tools-submenu-popup");
        if (menupopup)
        {
            PersonaSwitcher.createMenuPopup (menupopup, false);
        }
        else
        {
            PersonaSwitcher.logger.log (which + "not found!");
        }

        /*
        sub = PersonaSwitcher.createMenuAndPopup (doc, which);
        main = PersonaSwitcher.getToolsMenuPopup (doc);

        main.appendChild (sub);
        */
    }
    else if (which === "main-menubar")
    {
        var menupopup = doc.getElementById
            ("personaswitcher-main-menubar-popup");

        if (menupopup)
        {
            PersonaSwitcher.createMenuPopup (menupopup, false);
        }
        else
        {
            PersonaSwitcher.logger.log (which + "not found!");
        }

        /*
        sub = PersonaSwitcher.createMenuAndPopup (doc, which);
        main = PersonaSwitcher.getMainMenu (doc);
        var where = PersonaSwitcher.getToolsMenu (doc).nextSibling;

        PersonaSwitcher.logger.log (sub);
        PersonaSwitcher.logger.log (main);
        PersonaSwitcher.logger.log (where);

        main.insertBefore (sub, where);
        */
    }
    else
    {
        PersonaSwitcher.logger.log ("unknown menu");
    }
};


/*
** create a particular menu in all windows
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
};

PersonaSwitcher.toolbarPopup = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log();

    var menupopup = (doc.getElementById ("personaswitcher-addon"));
    if (menupopup)
    {
        PersonaSwitcher.createMenuPopup (menupopup, true);
    }
};

PersonaSwitcher.toolbarPopups = function()
{
    'use strict';
    PersonaSwitcher.logger.log();

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        PersonaSwitcher.toolbarPopup (enumerator.getNext().document);
    }
};

PersonaSwitcher.popupHidden = function ()
{
    'use strict';
    PersonaSwitcher.logger.log();

    if (PersonaSwitcher.prefs.getBoolPref ("preview"))
    {
        if (PersonaSwitcher.prefs.getIntPref ("preview-delay") > 0)
        {
            PersonaSwitcher.previewTimer.cancel();
        }

        LightweightThemeManager.resetPreview();
    }
};

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/window
PersonaSwitcher.onWindowLoad = function (event)
{
    'use strict';

    if (PersonaSwitcher.firstTime)
    {
        PersonaSwitcher.firstTime = false;
        PersonaSwitcher.setLogger();
        PersonaSwitcher.startTimer();
        // PersonaSwitcher.activeWindow = this;

        if (PersonaSwitcher.prefs.getBoolPref ("startup-switch"))
        {
            PersonaSwitcher.rotate();
        }

        /*
        AddonManager.getAllAddons
        (
            function (addons)
            {
                for (var addon in addons)
                {
                    PersonaSwitcher.logger.log (addon);
                }
            }
        );
        */

        if (PersonaSwitcher.addonManager)
        {
            // asynchronous
            AddonManager.getAddonsByTypes
            (
                ["theme"],
                function (themes)
                {
                    for (var theme in themes)
                    {
                        PersonaSwitcher.logger.log (themes[theme].name);
                    }

                    PersonaSwitcher.defaultTheme = themes[0];
                    PersonaSwitcher.logger.log
                        (PersonaSwitcher.defaultTheme.name);

                    // have to wait for default to be located before making
                    // menus
                    if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
                    {
                        PersonaSwitcher.createMenus ("tools-submenu");
                    }
                    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
                    {
                        PersonaSwitcher.createMenus ("main-menubar");
                    }
                    PersonaSwitcher.toolbarPopups();
                }
            );
        }

        PersonaSwitcher.logger.log (PersonaSwitcher.extensionManager);

        if (PersonaSwitcher.extensionManager)
        {
            var count = {};
            var items = {};
            var shit = PersonaSwitcher.extensionManager.getItemList (4, count, items);
            PersonaSwitcher.logger.log (count);
            PersonaSwitcher.logger.log (items);
            PersonaSwitcher.logger.log (shit);
        }
        else
        {
            PersonaSwitcher.logger.log ("No extension manager");
        }
    }

    PersonaSwitcher.logger.log (this.document);
    PersonaSwitcher.setKeyset (this.document);
    PersonaSwitcher.setToolboxMinheight (this.document);
    this.document.getElementById ("personaswitcher-main-menubar").hidden = true;

    /*
    PersonaSwitcher.logger.log (gFindBar);
    PersonaSwitcher.logger.log (gFindBar.hidden);
    gFindBar.open();
    PersonaSwitcher.logger.log (gFindBar.hidden);
    gFindBar.close();
    PersonaSwitcher.logger.log (gFindBar.hidden);
    */
};

window.addEventListener ("load", PersonaSwitcher.onWindowLoad);

// getMostRecentWindow returns the newest one created, not the one on top
// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Events#Window_events
// Gecko 1.9.2 => FF3.6 and TB3.1
/*
PersonaSwitcher.onWindowActivate = function()
{
    'use strict';
    // PersonaSwitcher.logger.log();

    PersonaSwitcher.activeWindow = this;
};

PersonaSwitcher.onWindowDeactivate = function()
{
    'use strict';
    // PersonaSwitcher.logger.log();

    PersonaSwitcher.activeWindow = null;
};

window.addEventListener
    ("activate", PersonaSwitcher.onWindowActivate, false);
window.addEventListener
    ("deactivate", PersonaSwitcher.onWindowDeactivate, false);
*/
