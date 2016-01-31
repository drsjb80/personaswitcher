// https://developer.mozilla.org/en/JavaScript_code_modules
// http://hg.mozdev.org/jsmodules/summary
// https://developer.mozilla.org/en/Code_snippets/Preferences
// LightweightThemeManager.jsm

// https://addons.mozilla.org/en-US/firefox/pages/appversions/

// 'import' for jslint
Components.utils['import']
    ('resource://gre/modules/LightweightThemeManager.jsm');
Components.utils['import']
    ('resource://LWTS/PersonaSwitcher.jsm');

PersonaSwitcher.XULNS =
    'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

/*
***************************************************************************
**
** Keyboard section
**
***************************************************************************
*/

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Attribute/modifiers
PersonaSwitcher.findMods = function (which)
{
    'use strict';
    PersonaSwitcher.logger.log (which);
    var mods = '';
    var names = ['shift', 'control', 'alt', 'meta', 'accel', 'os'];

    for (var i in names)
    {
        if (PersonaSwitcher.prefs.getBoolPref (which + names[i]))
        {
            mods += names[i] + ' ';
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

    var key = doc.createElement ('key');

    key.setAttribute ('id', id); 
    if (mods !== '')
    {
        key.setAttribute ('modifiers', mods);
    }
    key.setAttribute ('key', which);
    key.setAttribute ('oncommand', command);

    return (key);
};

// http://stackoverflow.com/questions/549650/how-to-dynamically-change-shortcut-key-in-firefox
PersonaSwitcher.setKeyset = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log (doc);

    var existing = doc.getElementById ('PersonaSwitcher.keyBreadCrumb');
    PersonaSwitcher.logger.log (existing);

    // there are windows/documents that don't have keyset -- e.g.: prefs
    if (null === existing) return;

    var parent = existing.parentNode;
    // PersonaSwitcher.logger.log (parent);
    var grandParent = parent.parentNode;
    // PersonaSwitcher.logger.log (grandParent);

    // remove the existing keyset and make a brand new one
    grandParent.removeChild (parent);
    var keyset = doc.createElement ('keyset');

    // a way to find the keyset no matter what.
    var breadCrumb = doc.createElement ('key');
    breadCrumb.setAttribute ('id', 'PersonaSwitcher.keyBreadCrumb'); 
    keyset.appendChild (breadCrumb);

    var keys =
    [
        [
            'PersonaSwitcher.defaultPersonaKey',
            PersonaSwitcher.findMods ('def'),
            PersonaSwitcher.prefs.getCharPref ('defkey').
                toUpperCase().charAt (0),
            'PersonaSwitcher.setDefault();'
        ],
        [
            'PersonaSwitcher.rotatePersonaKey',
            PersonaSwitcher.findMods ('rot'),
            PersonaSwitcher.prefs.getCharPref ('rotkey').
                toUpperCase().charAt (0),
            'PersonaSwitcher.rotateKey();'
        ],
        [
            'PersonaSwitcher.autoPersonaKey',
            PersonaSwitcher.findMods ('auto'),
            PersonaSwitcher.prefs.getCharPref ('autokey').
                toUpperCase().charAt (0),
            'PersonaSwitcher.toggleAuto();'
        ],
        [
            'PersonaSwitcher.activatePersonaKey',
            PersonaSwitcher.findMods ('activate'),
            PersonaSwitcher.prefs.getCharPref ('activatekey').
                toUpperCase().charAt (0),
            'PersonaSwitcher.activateMenu();'
        ]
    ];

    for (var key in keys)
    {
        // if no character set
        if ('' === keys[key][2]) continue;

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

    if (PersonaSwitcher.prefs.getBoolPref ('main-menubar'))
    {
        var menu = document.getElementById ('personaswitcher-main-menubar');

        menu.open = true;
    }
    else if (PersonaSwitcher.prefs.getBoolPref ('tools-submenu'))
    {
        var toolsMenu = PersonaSwitcher.getToolsMenu (document);
        var subMenu = document.getElementById ('personaswitcher-tools-submenu');

        if (toolsMenu && subMenu)
        {
            toolsMenu.open = true;
            subMenu.open = true;
        }
    }
    else
    {
        PersonaSwitcher.logger.log ('no visible menus');
    }
};

PersonaSwitcher.setToolboxMinheight = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log();

    var minheight =
        parseInt (PersonaSwitcher.prefs.getCharPref ('toolbox-minheight'));
    var maxheight =
        parseInt (PersonaSwitcher.prefs.getCharPref ('toolbox-maxheight'));

    if (isNaN (minheight)) minheight = 0;
    else if (minheight < 0) minheight = 0;
    else if (minheight > maxheight) minheight = maxheight;

    PersonaSwitcher.logger.log (PersonaSwitcher.XULAppInfo.name);
    PersonaSwitcher.logger.log (PersonaSwitcher.XULRuntime.OS);

    var nt = null;
    switch (PersonaSwitcher.XULAppInfo.name)
    {
        // can't figure out how to use 'browser-panel'
        case 'Thunderbird':
        case 'Icedove':
            nt = 'Linux' === PersonaSwitcher.XULRuntime.OS ?
                doc.getElementById ('navigation-toolbox') :
                doc.getElementById ('titlebar');
            break;
        default:
            nt = doc.getElementById ('navigator-toolbox');
            break;
    }

    // PersonaSwitcher.logger.log (nt);
    if (null !== nt)
    {
        nt.minHeight = minheight;
        // PersonaSwitcher.logger.log ("height = " + nt.height);
        // PersonaSwitcher.logger.log ("minHeight = " + nt.minHeight);
        // PersonaSwitcher.logger.log ("maxHeight = " + nt.maxHeight);
    }
};

// getAddonsByTypes (["theme"]
// https://developer.mozilla.org/en-US/Add-ons/Add-on_Manager
// https://developer.mozilla.org/en-US/Add-ons/Add-on_Manager/AddonManager
// https://developer.mozilla.org/en-US/Add-ons/Add-on_Manager/AddonListener
PersonaSwitcher.AddonListener =
{
    // onEnabled and onDisabled are called when interacting with add on
    // pane and don't need to be monitored
    onInstalled: function (addon)
    {
        PersonaSwitcher.logger.log (addon.type);
        PersonaSwitcher.logger.log (addon.name);
        
        if ('theme' === addon.type)
        {
            PersonaSwitcher.allDocuments (PersonaSwitcher.createStaticPopups);
        }
    },
    onUninstalled: function (addon)
    {
        PersonaSwitcher.logger.log (addon.type);
        PersonaSwitcher.logger.log (addon.name);
        
        if ('theme' === addon.type)
        {
            PersonaSwitcher.allDocuments (PersonaSwitcher.createStaticPopups);
        }
    }
};

PersonaSwitcher.ExtensionListener =
{
    // onEnabled and onDisabled are called when interacting with add on
    // pane and don't need to be monitored
    onInstallEnded: function (addon, status)
    {
        PersonaSwitcher.logger.log (addon.type);
        PersonaSwitcher.logger.log (addon.name);
        
        if (TYPE_THEME === addon.type)
        {
            PersonaSwitcher.allDocuments (PersonaSwitcher.createStaticPopups);
        }
    }
};

PersonaSwitcher.themeMonitor = function()
{
    PersonaSwitcher.logger.log ("trying addonManager");
    try
    {
        Components.utils.import ('resource://gre/modules/AddonManager.jsm');
        PersonaSwitcher.addonManager = true;
        PersonaSwitcher.logger.log ('using AddonManager');

        AddonManager.addAddonListener (PersonaSwitcher.AddonListener);
    }
    catch (e1)
    {
    // http://mxr.mozilla.org/firefox/source/toolkit/mozapps/extensions/public/nsIExtensionManager.idl
    // http://www.oxymoronical.com/experiments/apidocs/interface/nsIExtensionManager
    // http://www.oxymoronical.com/experiments/apidocs/interface/nsIAddonInstallListener
    // https://github.com/ehsan/mozilla-cvs-history/blob/master/toolkit/mozapps/extensions/public/nsIExtensionManager.idl

// 550   const unsigned long TYPE_THEME       = 0x04;
// 559   readonly attribute long type;

// can we pretend add-ons aren't removed until reboot because there is no
// listener?
        PersonaSwitcher.logger.log ('trying ExtensionManager');
        try
        {
            PersonaSwitcher.extensionManager =
                Components.classes['@mozilla.org/extensions/manager;1']
                    .getService(Components.interfaces.nsIExtensionManager);
            PersonaSwitcher.logger.log ('using ExtensionManager');
            PersonaSwitcher.extensionManager.addInstallListener
                (PersonaSwitcher.ExtensionListener);
        }
        catch (e2)
        {
            PersonaSwitcher.logger.log ('completely failed');
        }
    }
}

PersonaSwitcher.previewTimer = Components.classes['@mozilla.org/timer;1'].
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
PersonaSwitcher.createMenuItem = function (doc, which)
{
    'use strict';

    if (null === which || 'undefined' === typeof which.name)
        return (null);

    var item = doc.createElementNS (PersonaSwitcher.XULNS, 'menuitem');

    item.setAttribute ('label', which.name);
    item.addEventListener
    (
        'command',
        function() { PersonaSwitcher.onMenuItemCommand (which); },
        false
    );

    if (PersonaSwitcher.prefs.getBoolPref ('icon-preview'))
    {
        // PersonaSwitcher.logger.log (which.iconURL);
        if (null !== which.iconURL)
        {
            item.setAttribute ('class', 'menuitem-iconic');
            item.setAttribute ('image', which.iconURL);
        }
    }

    // create method and pass in item and which
    if (PersonaSwitcher.prefs.getBoolPref ('preview'))
    {
// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIXULRuntime
// https://developer.mozilla.org/en-US/docs/Web/Events/DOMMenuItemInactive
// https://bugzilla.mozilla.org/show_bug.cgi?id=420033
// var darwin = PersonaSwitcher.XULRuntime.OS == 'Darwin';

        var delay = PersonaSwitcher.prefs.getIntPref ('preview-delay');

        if (0 === delay)
        {
            item.addEventListener
            (
                'DOMMenuItemActive',
                function (event)
                {
                    PersonaSwitcher.logger.log (which.name + ' Active');
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
                'DOMMenuItemActive',
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
        // 'DOMMenuItemInactive' doesn't work, who knew?
        item.addEventListener
        (
            'DOMMenuItemInactive',
            function (event)
            {
                PersonaSwitcher.logger.log (which.name + ' Inactive');
                LightweightThemeManager.resetPreview();
            },
            false   // 3.6 compatibility
        );
    }
    return (item);
};

PersonaSwitcher.createMenuItems = function (doc, menupopup, arr)
{
    PersonaSwitcher.logger.log (menupopup.id);

    var popup = 'personaswitcher-button-popup' ===  menupopup.id;
    // PersonaSwitcher.logger.log (popup);

    /*
    // the bad two cases when having a default messes with the menu
    // if it's thunderbird and we stretched the top
    var TBird = 'Thunderbird' === PersonaSwitcher.XULAppInfo.name;
    var chars = PersonaSwitcher.prefs.getCharPref ('toolbox-minheight');
    var height = parseInt (chars);
    height = isNaN (height) ? 0 : height;
    var stretched = 0 !== height;

    var TB = TBird && stretched && popup;
    PersonaSwitcher.logger.log (TB);

    // it's pale moon, a menubar, and preview is set
    var PM = 'personaswitcher-button-popup' ===  menupopup.id &&
        'Pale Moon' === PersonaSwitcher.XULAppInfo.name &&
        PersonaSwitcher.prefs.getBoolPref ('preview');
    PersonaSwitcher.logger.log (PM);
    */

    var item = null;
    // if (!PM && !TB && null !== PersonaSwitcher.defaultTheme)
    // {
        item = PersonaSwitcher.createMenuItem
            (doc, PersonaSwitcher.defaultTheme);
        if (item)
        {
            menupopup.appendChild (item);
        }
    // }

    // arr.sort (function (a, b) { return a.name.localeCompare (b.name); });

    for (var i = 0; i < arr.length; i++)
    {
        PersonaSwitcher.logger.log (i);
        PersonaSwitcher.logger.log (arr[i]);
        item = PersonaSwitcher.createMenuItem (doc, arr[i]);
        if (item)
        {
            menupopup.appendChild (item);
        }
    }
};

PersonaSwitcher.createMenuPopupWithDoc = function (doc, menupopup)
{
    PersonaSwitcher.logger.log (doc);
    PersonaSwitcher.logger.log (menupopup);

    while (menupopup.hasChildNodes())
    {
        menupopup.removeChild (menupopup.firstChild);
    }

    var arr = PersonaSwitcher.currentThemes;

    if (0 === arr.length)
    {
        PersonaSwitcher.logger.log ('no themes');

        var item = doc.createElementNS (PersonaSwitcher.XULNS, 'menuitem');

        // get the localized message.
        item.setAttribute ('label', PersonaSwitcher.stringBundle.
            GetStringFromName ('personaswitcher.noPersonas'));

        PersonaSwitcher.logger.log (item);
        menupopup.appendChild (item);
    }
    else
    {
        PersonaSwitcher.createMenuItems (doc, menupopup, arr);
    }
};

PersonaSwitcher.createMenuPopup = function (event)
{
    'use strict';

    PersonaSwitcher.logger.log();

    var menupopup = event.target;
    var doc = event.target.ownerDocument;

    PersonaSwitcher.logger.log (menupopup);
    PersonaSwitcher.logger.log (doc);

    var menupopup = event.target;
    
    PersonaSwitcher.createMenuPopupWithDoc (doc, menupopup);
};

PersonaSwitcher.hideMenu = function (doc, which)
{
    var d = doc.getElementById ('personaswitcher-' + which);
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
    var d = doc.getElementById ('personaswitcher-' + which);
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

PersonaSwitcher.popupShowing = function (event)
{
    'use strict';
    PersonaSwitcher.logger.log ("in popupShowing");
    PersonaSwitcher.logger.log (event);
    PersonaSwitcher.logger.log (event.target);

    var menupopup = event.target;
    var doc = event.target.ownerDocument;

    // have to something to the menu in order for the onpopuphidden to
    // work. don't ask me why.
    var item = doc.createElementNS (PersonaSwitcher.XULNS, 'menuitem');
    menupopup.appendChild (item);
    menupopup.removeChild (item);
}

PersonaSwitcher.popupHidden = function()
{
    'use strict';
    PersonaSwitcher.logger.log ("in popuphidden");

    if (PersonaSwitcher.prefs.getBoolPref ('preview'))
    {
        if (PersonaSwitcher.prefs.getIntPref ('preview-delay') > 0)
        {
            PersonaSwitcher.previewTimer.cancel();
        }

        LightweightThemeManager.resetPreview();
    }
};

PersonaSwitcher.setAccessKey = function (doc)
{
    var accesskey = PersonaSwitcher.prefs.getCharPref ('accesskey');
    if (accesskey !== '')
    {
        var menu = doc.getElementById ('personaswitcher-main-menubar');
        menu.setAttribute ('accesskey', accesskey.toUpperCase().charAt (0));
    }
};

// call a function passed as a parameter with one document of each window
PersonaSwitcher.allDocuments = function (func)
{
    'use strict';
    PersonaSwitcher.logger.log();

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        func (enumerator.getNext().document);
    }
};

// call a function passed as a parameter for each window
PersonaSwitcher.allWindows = function (func)
{
    'use strict';
    PersonaSwitcher.logger.log();

    var enumerator = PersonaSwitcher.windowMediator.getEnumerator (null);

    while (enumerator.hasMoreElements())
    {
        func (enumerator.getNext());
    }
};

PersonaSwitcher.createStaticPopups = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log ('in createStaticPopups');

    PersonaSwitcher.getPersonas();

    var popups = ['personaswitcher-main-menubar-popup',
        'personaswitcher-tools-submenu-popup',
        'personaswitcher-button-popup'];

    for (var popup in popups)
    {
        var item = doc.getElementById (popups[popup]);

        // not all windows have this popup
        if (item)
        {
            PersonaSwitcher.createMenuPopupWithDoc (doc, item);
            // item.removeAttribute ('onpopupshowing');
        }
    }
};

PersonaSwitcher.removeStaticPopups = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log ('in removeStaticPopups');

    var popups = ['personaswitcher-main-menubar-popup',
        'personaswitcher-tools-submenu-popup',
        'personaswitcher-button-popup'];

    for (var popup in popups)
    {
        var item = doc.getElementById (popups[popup]);

        // not all windows have this popup
        if (item)
        {
            item.setAttribute ('onpopupshowing',
                'PersonaSwitcher.createMenuPopup (event);');
        }
    }
};

PersonaSwitcher.setDefaultTheme = function (doc)
{
    'use strict';
    PersonaSwitcher.logger.log ('in setDefaultTheme');

    if (PersonaSwitcher.addonManager)
    {
        PersonaSwitcher.logger.log (PersonaSwitcher.defaultThemeId);
        AddonManager.getAddonByID
        (
            PersonaSwitcher.defaultThemeId,
            function (theme)
            {
                PersonaSwitcher.logger.log (theme);
                if (null !== theme)
                {
                    PersonaSwitcher.defaultTheme = theme;
                    PersonaSwitcher.createStaticPopups (doc);
                }
            }
        );
    }
    else if (null !== PersonaSwitcher.extensionManager)
    {
        var theme = PersonaSwitcher.extensionManager.getItemForID
            (PersonaSwitcher.defaultThemeId);

        if (null !== theme)
        {
            PersonaSwitcher.defaultTheme = theme;
            PersonaSwitcher.createStaticPopups (doc);
        }
    }
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/window
PersonaSwitcher.onWindowLoad = function (event)
{
    'use strict';

    if (PersonaSwitcher.firstTime)
    {
        PersonaSwitcher.firstTime = false;

        // PersonaSwitcher.activeWindow = this;
        PersonaSwitcher.setLogger();
        PersonaSwitcher.logger.log ('first time');
        PersonaSwitcher.startTimer();
        PersonaSwitcher.getPersonas();
        PersonaSwitcher.themeMonitor();

        // this also sets up the menus as there is an asynchronous call to
        // addon manager. bleah.
        PersonaSwitcher.setDefaultTheme (this.document);

        PersonaSwitcher.currentIndex =
            PersonaSwitcher.prefs.getIntPref ("current");
        PersonaSwitcher.switchTo 
            (PersonaSwitcher.currentThemes[PersonaSwitcher.currentIndex]);

        if (PersonaSwitcher.prefs.getBoolPref ('startup-switch'))
        {
            PersonaSwitcher.rotate();
        }
    }
    else
    {
        // we already should have the default theme at this point, crosses
        // fingers
        PersonaSwitcher.createStaticPopups (this.document);
    }

    PersonaSwitcher.setKeyset (this.document);
    PersonaSwitcher.setAccessKey (this.document);
    PersonaSwitcher.setToolboxMinheight (this.document);

    if (! PersonaSwitcher.prefs.getBoolPref ('main-menubar'))
    {
        PersonaSwitcher.logger.log ('hiding main-menubar');
        PersonaSwitcher.hideMenu (this.document, 'main-menubar');
    }
    if (! PersonaSwitcher.prefs.getBoolPref ('tools-submenu'))
    {
        PersonaSwitcher.logger.log ('hiding tools-submenu');
        PersonaSwitcher.hideMenu (this.document, 'tools-submenu');
    }
};

// leave the false for 3.6 compatibility
window.addEventListener ('load', PersonaSwitcher.onWindowLoad, false);

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
    ('activate', PersonaSwitcher.onWindowActivate, false);
window.addEventListener
    ('deactivate', PersonaSwitcher.onWindowDeactivate, false);
*/
