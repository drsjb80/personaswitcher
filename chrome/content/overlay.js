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

PersonaSwitcher.AddonListener =
{
    onInstalled: function (addon)
    {
        PersonaSwitcher.logger.log (addon.type);
        
        if (addon.type === "theme")
        {
            PersonaSwitcher.createAllMenuPopups();
        }
    }
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
** create a menuitem, possibly creating a preview
*/
PersonaSwitcher.createMenuItem = function (doc, which, toolbar)
{
    'use strict';

    if (null === which || "undefined" === typeof which.name) return (null);

    var item = doc.createElementNS (PersonaSwitcher.XULNS, "menuitem");

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
                },
                false   // 3.6 compatibility
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
                },
                false   // 3.6 compatibility
            );
        }
    }
    return (item);
};

PersonaSwitcher.createMenuItems = function (doc, menupopup, toolbar, arr)
{
    PersonaSwitcher.logger.log (doc);
    PersonaSwitcher.logger.log (menupopup);

    /*
    var item;

    if (PersonaSwitcher.defaultTheme)
    {
        if (toolbar && "Pale moon" === PersonaSwitcher.XULAppInfo.name)
        {
            PersonaSwitcher.logger.log ("skipping default for PM toolbar");
        }
        else
        {
            item = PersonaSwitcher.createMenuItem
                (doc, PersonaSwitcher.defaultTheme, toolbar)
            if (item)
            {
                menupopup.appendChild (item);
            }
        }
    }
    else
    {
        PersonaSwitcher.logger.log ("no default theme found");
    }
    */

    for (var i = 0; i < arr.length; i++)
    {
        PersonaSwitcher.logger.log ("adding item number " + i);

        if (toolbar && "Default" === arr[i].name &&
            "Pale moon" === PersonaSwitcher.XULAppInfo.name)
        {
            PersonaSwitcher.logger.log ("skipping default for PM toolbar");
            continue;
        }

        item = PersonaSwitcher.createMenuItem (doc, arr[i], toolbar)
        if (item)
        {
            menupopup.appendChild (item);
        }
    }
};

PersonaSwitcher.createMenuPopup = function (event)
{
    'use strict';

    PersonaSwitcher.logger.log();

    /*
    var menuId = "personaswitcher-" + which;
    var menupopupId = "personaswitcher-" + which + "-popup";

    var menu = doc.getElementById (menuId);

    if (!menu)
    {
        PersonaSwitcher.logger.log (menuId + " not found");
        return;
    }

    // move to another function so it can be called via prefs
    var accesskey = PersonaSwitcher.prefs.getCharPref ("accesskey");
    if (which == "main-menubar" && accesskey != "")
    {
        menu.setAttribute ("accesskey", accesskey.toUpperCase().charAt (0));
    }
    */

    var menupopup = event.target;
    var doc = event.target.ownerDocument;

    PersonaSwitcher.logger.log (menupopup);
    PersonaSwitcher.logger.log (doc);

    while (menupopup.hasChildNodes())
    {
        menupopup.removeChild (menupopup.firstChild);
    }

    /*
    if (menupopup)
    {
        PersonaSwitcher.logger.log ("removing menupopup");
        menu.removeChild (menupopup);
    }
    else
    {
        PersonaSwitcher.logger.log ("menupopup not found");
    }
    */

    /*
    menupopup = doc.createElementNS (PersonaSwitcher.XULNS, "menupopup");
    menupopup.setAttribute ("id", menupopupId);

    if (PersonaSwitcher.dynamicPopups)
    {
        menupopup.addEventListener
        (
            "popupshowing",
            function (event)
            {
                // PersonaSwitcher.createAllMenuPopups();
                PersonaSwitcher.dump (event);
            },
            false
        );
    }
    menupopup.addEventListener
    (
        "popuphidden",
        function () { PersonaSwitcher.popupHidden(); },
        false
    );
    */

    var arr = PersonaSwitcher.getPersonas();
    var toolbar = "personaswitcher-toolbarbutton-popup" === event.target.id;

    /*
    if (arr.length === 0 && ! PersonaSwitcher.defaultTheme && toolbar &&
        "Pale moon" === PersonaSwitcher.XULAppInfo.name)
    */
    if (0 === arr.length)
    {
        PersonaSwitcher.logger.log ("no themes");

        // get the localized message.
        var item = doc.createElementNS (PersonaSwitcher.XULNS, "menuitem");

        item.setAttribute ("label",
            PersonaSwitcher.stringBundle.
                GetStringFromName ("personaswitcher.noPersonas"));

        PersonaSwitcher.logger.log (item);
        menupopup.appendChild (item);
    }
    else
    {
        PersonaSwitcher.createMenuItems (doc, menupopup, toolbar, arr);
    }

    // menu.appendChild (menupopup);
    // PersonaSwitcher.logger.log (menu);
};

PersonaSwitcher.createMenuPopups = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.createMenuPopup (doc, which, false)
    }
};

PersonaSwitcher.createAllMenuPopups = function (doc)
{
    PersonaSwitcher.logger.log();

    // if we don't have a doc, create them all. called thusly on preference
    // changes and additions.
    if ('undefined' === typeof doc)
    {
        PersonaSwitcher.createMenuPopups ("tools-submenu");
        PersonaSwitcher.createMenuPopups ("main-menubar");
        PersonaSwitcher.toolbarPopups();
    }
    else
    {
        PersonaSwitcher.createMenuPopup (doc, "tools-submenu", false);
        PersonaSwitcher.createMenuPopup (doc, "main-menubar", false);
        PersonaSwitcher.toolbarPopups (doc);
    }
};

PersonaSwitcher.hideMenu = function (doc, which)
{
    var d = doc.getElementById ("personaswitcher-" + which);
    if (d) d.hidden = true;
};

/*
** remove a particular menu in all windows
*/
PersonaSwitcher.hideMenus = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.hideMenu (doc, which);
    }
};

PersonaSwitcher.showMenu = function (doc, which)
{
    var d = doc.getElementById ("personaswitcher-" + which);
    if (d) d.hidden = false;
};

PersonaSwitcher.showMenus = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        var doc = enumerator.getNext().document;
        PersonaSwitcher.showMenu (doc, which);
    }
};

PersonaSwitcher.toolbarPopup = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log();

    PersonaSwitcher.createMenuPopup (doc, "button", true);
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

PersonaSwitcher.popupHidden = function()
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
    
    /*
    if (PersonaSwitcher.XULRuntime.OS === "Darwin")
    {
        var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

        while (enumerator.hasMoreElements())
        {
            var doc = enumerator.getNext().document;
            var menupopup = doc.getElementById
                ('personaswitcher-tools-submenu-popup');

            if (menupopup)
            {
                PersonaSwitcher.logger.log();
                menupopup.addEventListener
                (
                    "popuphidden",
                    function () { PersonaSwitcher.popupHidden(); },
                    false
                );
            }

            menupopup = doc.getElementById
                ('personaswitcher-main-menubar-popup');

            if (menupopup)
            {
                PersonaSwitcher.logger.log();
                menupopup.addEventListener
                (
                    "popuphidden",
                    function () { PersonaSwitcher.popupHidden(); },
                    false
                );
            }
        }
    }
    */
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

        if (PersonaSwitcher.addonManager)
        {
            // asynchronous
            AddonManager.getAddonsByTypes
            (
                ["theme"],
                function (themes) { PersonaSwitcher.defaultTheme = themes[0]; }
            );
        }
    }

    PersonaSwitcher.setKeyset (this.document);
    PersonaSwitcher.setToolboxMinheight (this.document);

    if (! PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
    {
        PersonaSwitcher.logger.log ("hiding main-menubar");
        PersonaSwitcher.hideMenu (this.document, "main-menubar");
    }
    if (! PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
    {
        PersonaSwitcher.logger.log ("hiding tools-submenu");
        PersonaSwitcher.hideMenu (this.document, "tools-submenu");
    }

    /*
    PersonaSwitcher.logger.log (gFindBar);
    PersonaSwitcher.logger.log (gFindBar.hidden);
    gFindBar.open();
    PersonaSwitcher.logger.log (gFindBar.hidden);
    gFindBar.close();
    PersonaSwitcher.logger.log (gFindBar.hidden);
    */
};

// leave the false for 3.6 compatibility
window.addEventListener ("load", PersonaSwitcher.onWindowLoad, false);

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
