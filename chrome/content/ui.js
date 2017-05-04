/* global PersonaSwitcher: true, Components: false, AddonManager,
LightweightThemeManager, TYPE_THEME*/

// https://developer.mozilla.org/en/JavaScript_code_modules
// http://hg.mozdev.org/jsmodules/summary
// https://developer.mozilla.org/en/Code_snippets/Preferences
// LightweightThemeManager.jsm

// https://addons.mozilla.org/en-US/firefox/pages/appversions/
"use strict";
// Services
Components.utils.import('resource://gre/modules/Services.jsm');
// 'import' for jslint
Components.utils.import('resource://gre/modules/LightweightThemeManager.jsm');

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
    PersonaSwitcher.logger.log(which);
    var mods = '';
    var names = ['shift', 'control', 'alt', 'meta', 'accel', 'os'];

    for (var i in names)
    {
        if (PersonaSwitcher.prefs.getBoolPref(which + names[i]))
        {
            mods += names[i] + ' ';
        }
    }

    PersonaSwitcher.logger.log(mods);
    return (mods);
};

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Keyboard_Shortcuts
// http://unixpapa.com/js/key.html
PersonaSwitcher.makeKey = function (doc, id, mods, which, command)
{
    var key = doc.createElementNS(PersonaSwitcher.XULNS, 'key');

    key.setAttribute('id', id); 
    if ('' !== mods)
    {
        key.setAttribute('modifiers', mods);
    }
    key.setAttribute ('key', which);
    // http://stackoverflow.com/questions/16779316/how-to-set-an-xul-key-dynamically-and-securely
    key.setAttribute('oncommand', "void(0);");
    key.addEventListener('command',
        function(aEvent) 
        { 
            let doc = aEvent.target.ownerDocument; 
            command(doc); 
        },
        false
    );

    return (key);
};

// http://stackoverflow.com/questions/549650/how-to-dynamically-change-shortcut-key-in-firefox
PersonaSwitcher.setKeyset = function (doc)
{
    PersonaSwitcher.logger.log(doc);

    var oldKeyset = doc.getElementById('personaSwitcherKeyset');
    PersonaSwitcher.logger.log(oldKeyset);

    // there are windows/documents that don't have keyset -- e.g.: prefs
    if (null === oldKeyset) return;

    var parent = oldKeyset.parentNode;
    // PersonaSwitcher.logger.log (oldKeyset);

    // remove the old keyset and make a brand new one
    parent.removeChild (oldKeyset);
    var keyset = doc.createElement('keyset');
      keyset.setAttribute("id", "personaSwitcherKeyset");

    var keys =
    [
        [
            'PersonaSwitcher.defaultPersonaKey',
            PersonaSwitcher.findMods('def'),
            PersonaSwitcher.prefs.getCharPref('defkey').
                toUpperCase().charAt (0),
            PersonaSwitcher.setDefault
        ],
        [
            'PersonaSwitcher.rotatePersonaKey',
            PersonaSwitcher.findMods('rot'),
            PersonaSwitcher.prefs.getCharPref('rotkey').
                toUpperCase().charAt(0),
            PersonaSwitcher.rotateKey
        ],
        [
            'PersonaSwitcher.autoPersonaKey',
            PersonaSwitcher.findMods('auto'),
            PersonaSwitcher.prefs.getCharPref('autokey').
                toUpperCase().charAt (0),
            PersonaSwitcher.toggleAuto
        ],
        [
            'PersonaSwitcher.activatePersonaKey',
            PersonaSwitcher.findMods('activate'),
            PersonaSwitcher.prefs.getCharPref('activatekey').
                toUpperCase().charAt(0),
            PersonaSwitcher.activateMenu
        ]
    ];

    for (var key in keys)
    {
        // if no character set
        if ('' === keys[key][2])
        {
            continue;
        }

        var newKey = PersonaSwitcher.makeKey (doc,
            keys[key][0], keys[key][1], keys[key][2], keys[key][3]);

        keyset.appendChild(newKey);
    }

    parent.appendChild(keyset);
};

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Tutorial/Keyboard_Shortcuts#Assigning_a_keyboard_shortcut_on_a_menu
PersonaSwitcher.activateMenu = function(doc)
{
    PersonaSwitcher.logger.log();

    if (PersonaSwitcher.prefs.getBoolPref ('main-menubar'))
    {
        var menu = doc.getElementById ('personaswitcher-main-menubar');

        menu.open = true;
    }
    else if (PersonaSwitcher.prefs.getBoolPref('tools-submenu'))
    {
        // this is one thing i can't name
        var toolsMenu = null;
        switch (PersonaSwitcher.XULAppInfo.name)
        {
            case 'Thunderbird':
            case 'SeaMonkey':
            case 'Icedove':
                toolsMenu = doc.getElementById('tasksMenu');
                break;
            default:
                toolsMenu = doc.getElementById('tools-menu');
                break;
        }

        var subMenu = doc.getElementById('personaswitcher-tools-submenu');

        if (toolsMenu && subMenu)
        {
            toolsMenu.open = true;
            subMenu.open = true;
        }
    }
    else
    {
        PersonaSwitcher.logger.log('no visible menus');
    }
};

PersonaSwitcher.setToolboxMinheight = function(doc)
{
    var minheight =
        parseInt (PersonaSwitcher.prefs.getCharPref('toolbox-minheight'));
    var maxheight =
        parseInt (PersonaSwitcher.prefs.getCharPref('toolbox-maxheight'));

    if (isNaN (minheight)) 
    {
        minheight = 0; 
    } 
    else if (0 > minheight) 
    {
        minheight = 0;
    }
    else if (minheight > maxheight) 
    {
        minheight = maxheight;
    }

    PersonaSwitcher.logger.log(PersonaSwitcher.XULAppInfo.name);
    PersonaSwitcher.logger.log(PersonaSwitcher.XULRuntime.OS);

    var nt = null;
    switch (PersonaSwitcher.XULAppInfo.name)
    {
        // can't figure out how to use 'browser-panel'
        case 'Thunderbird':
        case 'Icedove':
            nt = 'Linux' === PersonaSwitcher.XULRuntime.OS ?
                doc.getElementById('navigation-toolbox') :
                doc.getElementById('titlebar');
            break;
        default:
            nt = doc.getElementById('navigator-toolbox');
            break;
    }

    if (null !== nt)
    {
        nt.minHeight = minheight;
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
        if('undefined' === typeof(PersonaSwitcher)) 
        {
            return;
        }

        PersonaSwitcher.logger.log (addon.type);
        PersonaSwitcher.logger.log (addon.name);
        
        if ('theme' === addon.type)
        {
            PersonaSwitcher.updateIndexOnAdd(addon.name);
            PersonaSwitcher.allDocuments(PersonaSwitcher.createStaticPopups);
        }
    },
    onUninstalled: function (addon)
    {
        if('undefined' === typeof(PersonaSwitcher)) 
        {
            return;
        }

        var currentThemeName;
        var currentIndex = PersonaSwitcher.prefs.getIntPref('current');

        if(PersonaSwitcher.currentThemes.length > currentIndex) 
        { 
            currentThemeName = PersonaSwitcher.currentThemes[currentIndex].name;
        } 
        else 
        {
            currentIndex -= PersonaSwitcher.currentThemes.length;
            currentThemeName = PersonaSwitcher.defaultThemes[currentIndex].name;
        }
        PersonaSwitcher.logger.log (addon.type);
        PersonaSwitcher.logger.log (addon.name);
        
        if ('theme' === addon.type)
        {
            PersonaSwitcher.updateIndexOnRemove(addon.name, currentThemeName);
            PersonaSwitcher.allDocuments(PersonaSwitcher.createStaticPopups);
        }
    }
};

PersonaSwitcher.ExtensionListener =
{
    // onEnabled and onDisabled are called when interacting with add on
    // pane and don't need to be monitored
    onInstallEnded: function (addon, status)
    {
        PersonaSwitcher.logger.log(addon.type);
        PersonaSwitcher.logger.log(addon.name);
        
        if (TYPE_THEME === addon.type)
        {
            PersonaSwitcher.allDocuments(PersonaSwitcher.createStaticPopups);
        }
    }
};

PersonaSwitcher.themeMonitor = function()
{
    PersonaSwitcher.logger.log("trying addonManager");
    try
    {
        Components.utils.import('resource://gre/modules/AddonManager.jsm');
        PersonaSwitcher.addonManager = true;
        PersonaSwitcher.logger.log('using AddonManager');

        AddonManager.addAddonListener(PersonaSwitcher.AddonListener);
    }
    catch (e1)
    {
    // http://mxr.mozilla.org/firefox/source/toolkit/mozapps/extensions/public/nsIExtensionManager.idl
    // http://www.oxymoronical.com/experiments/apidocs/interface/nsIExtensionManager
    // http://www.oxymoronical.com/experiments/apidocs/interface/nsIAddonInstallListener
    // https://github.com/ehsan/mozilla-cvs-history/blob/master/toolkit/mozapps/extensions/public/nsIExtensionManager.idl

    // 550   const unsigned long TYPE_THEME = 0x04;
    // 559   readonly attribute long type;

    // can we pretend add-ons aren't removed until reboot because there is no
    // listener?
        PersonaSwitcher.logger.log('trying ExtensionManager');
        try
        {
            PersonaSwitcher.extensionManager =
                Components.classes['@mozilla.org/extensions/manager;1']
                    .getService(Components.interfaces.nsIExtensionManager);
            PersonaSwitcher.logger.log('using ExtensionManager');
            PersonaSwitcher.extensionManager.addInstallListener(
                PersonaSwitcher.ExtensionListener);
        }
        catch (e2)
        {
            PersonaSwitcher.logger.log('completely failed');
        }
    }
};

PersonaSwitcher.previewTimer = Components.classes['@mozilla.org/timer;1'].
    createInstance(Components.interfaces.nsITimer);

PersonaSwitcher.previewObserver =
{
    observe: function (subject, topic, data)
    {
        PersonaSwitcher.logger.log();
        LightweightThemeManager.previewTheme(PersonaSwitcher.previewWhich);
    }
};

PersonaSwitcher.insertSeparator = function(doc, menupopup) 
{
    var separator = doc.createElement("menuseparator");
    menupopup.appendChild(separator);
};

/*
** create a menuitem, possibly creating a preview
*/
PersonaSwitcher.createMenuItem = function (doc, which, index)
{
    if (null === which || 'undefined' === typeof which.name)
        return (null);

    var item = doc.createElementNS(PersonaSwitcher.XULNS, 'menuitem');

    item.setAttribute('label', which.name);
    item.setAttribute('class', 'menuitem-iconic');
  
    if(PersonaSwitcher.prefs.getIntPref('current') === index) 
    {
        item.setAttribute("checked", "true"); 
    }

    item.addEventListener(
        'command',
        function() 
        { 
            PersonaSwitcher.onMenuItemCommand(which, index); 
        },
        false
    );

    if (PersonaSwitcher.prefs.getBoolPref('icon-preview'))
    {
        PersonaSwitcher.logger.log (which.iconURL);
        if (null !== which.iconURL)
        {
            item.setAttribute('image', which.iconURL);
            if ("Linux" === PersonaSwitcher.XULRuntime.OS)
            {
                item.setAttribute('value', which.iconURL);
            }
        }
    }

    // create method and pass in item and which
    PersonaSwitcher.logger.log(PersonaSwitcher.prefs.getBoolPref ('preview'));
    if (PersonaSwitcher.prefs.getBoolPref('preview'))
    {
// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIXULRuntime
// https://developer.mozilla.org/en-US/docs/Web/Events/DOMMenuItemInactive
// https://bugzilla.mozilla.org/show_bug.cgi?id=420033
// var darwin = PersonaSwitcher.XULRuntime.OS == 'Darwin';

        var delay = PersonaSwitcher.prefs.getIntPref('preview-delay');

        if (0 === delay)
        {
            item.addEventListener('DOMMenuItemActive',
                function (event)
                {
                    PersonaSwitcher.logger.log(which.name + ' Active');
                    LightweightThemeManager.previewTheme(which);
                },
                false   // 3.6 compatibility
            );
        }
        else
        {
            // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Events
            item.addEventListener('DOMMenuItemActive',
                function (event)
                {
                    PersonaSwitcher.previewTimer.cancel();
                    PersonaSwitcher.previewWhich = which;
                    PersonaSwitcher.previewTimer.init(
                        PersonaSwitcher.previewObserver, delay,
                        Components.interfaces.nsITimer.TYPE_ONE_SHOT
                    );
                },
                false   // 3.6 compatibility
            );
        }
        // 'DOMMenuItemInactive' doesn't work, who knew?
        item.addEventListener('DOMMenuItemInactive',
            function (event)
            {
                PersonaSwitcher.logger.log(which.name + ' Inactive');
                LightweightThemeManager.resetPreview();
            },
            false   // 3.6 compatibility
        );
    }
    return (item);
};

PersonaSwitcher.createMenuItems = function (doc, menupopup, arr, indexOffset)
{
    PersonaSwitcher.logger.log(menupopup.id);
    indexOffset = 'undefined' === typeof(indexOffset) ? 0 : indexOffset;

    var popup = 'personaswitcher-button-popup' === menupopup.id;

    var item = null;

    for (var i = 0; i < arr.length; i++)
    {
        PersonaSwitcher.logger.log (i);
        PersonaSwitcher.logger.log (arr[i]);
        item = PersonaSwitcher.createMenuItem(doc, arr[i], i + indexOffset);
        if (item)
        {
            menupopup.appendChild(item);
        }
    }
};

PersonaSwitcher.createMenuPopupWithDoc = function (doc, menupopup)
{
    PersonaSwitcher.logger.log(doc);
    PersonaSwitcher.logger.log(menupopup);

    while (menupopup.hasChildNodes())
    {
        PersonaSwitcher.logger.log("removeChild");
        menupopup.removeChild(menupopup.firstChild);
    }

    var themes = PersonaSwitcher.currentThemes;
    var defaults = PersonaSwitcher.defaultThemes;
    var indexOffset = PersonaSwitcher.currentThemes.length+1;

    if (0 === themes.length)
    {
        PersonaSwitcher.logger.log('no themes');

        var item = doc.createElementNS(PersonaSwitcher.XULNS, 'menuitem');

        // get the localized message.
        item.setAttribute('label', PersonaSwitcher.stringBundle.
            GetStringFromName('personaswitcher.noPersonas'));

        PersonaSwitcher.logger.log(item);
        menupopup.appendChild(item);
    }
    else
    {
        PersonaSwitcher.createMenuItems(doc, menupopup, themes);
        PersonaSwitcher.insertSeparator(doc, menupopup);
        PersonaSwitcher.createMenuItems(doc, menupopup, defaults, indexOffset);
    }
};

PersonaSwitcher.createMenuPopup = function (event)
{
    PersonaSwitcher.logger.log();

    var menupopup = event.target;
    var doc = event.target.ownerDocument;

    PersonaSwitcher.logger.log(menupopup);
    PersonaSwitcher.logger.log(doc);
    
    PersonaSwitcher.createMenuPopupWithDoc(doc, menupopup);
};

PersonaSwitcher.popupHidden = function()
{
    PersonaSwitcher.logger.log("in popuphidden");

    if (PersonaSwitcher.prefs.getBoolPref('preview'))
    {
        if (0 < PersonaSwitcher.prefs.getIntPref('preview-delay'))
        {
            PersonaSwitcher.previewTimer.cancel();
        }

        LightweightThemeManager.resetPreview();
    }
};

PersonaSwitcher.setAccessKey = function (doc)
{
    var accesskey = PersonaSwitcher.prefs.getCharPref('accesskey');
    if ('' !== accesskey)
    {
        var menu = doc.getElementById('personaswitcher-main-menubar');
        if(menu)
        {
            menu.setAttribute('accesskey', accesskey.toUpperCase().charAt(0));
        }
    }
};

PersonaSwitcher.createStaticPopups = function (doc)
{
    PersonaSwitcher.logger.log('in createStaticPopups');

    PersonaSwitcher.getPersonas();

    var popups = ['personaswitcher-main-menubar-popup',
        'personaswitcher-tools-submenu-popup'];

    for (var popup in popups)
    {
        var item = doc.getElementById(popups[popup]);
        PersonaSwitcher.logger.log(popups[popup]);
        PersonaSwitcher.logger.log(item);

        // not all windows have this popup
        if (item)
        {
            PersonaSwitcher.createMenuPopupWithDoc(doc, item);
        }
    }

    var buttonPopup = 
            PersonaSwitcher.getButtonPopup(doc, 'personaswitcher-button');
    if (null !== buttonPopup)
    {        
        PersonaSwitcher.createMenuPopupWithDoc(doc, buttonPopup);
    }
};

PersonaSwitcher.getButtonPopup =  function(doc, id) 
{
    let toolbox;
    switch (PersonaSwitcher.XULAppInfo.name)
    {
        case 'Icedove':
        case 'Thunderbird':
            toolbox = doc.getElementById("mail-toolbox");
            break;
        case 'SeaMonkey':
        case 'Firefox':
        default:
            toolbox = doc.getElementById("navigator-toolbox");
            break;
    }

    // Check the toolbar palette first. For some reason elements in the palette
    // cannot be retrieved from the document using getElementById, so we do it
    // the hard way 
    if (null !== toolbox)
    {
        var list = toolbox.palette.children;
        for(var index = 0; index < list.length; index++)
        {
            if(list[index].id === id)
            {
                return list[index].firstChild;
            }
        }
    }
    // If it's not in the palette it should be attached to the menu and is
    // accessible from the document
    return doc.getElementById('personaswitcher-button-popup');
};

PersonaSwitcher.setDefaultTheme = function (resolve, reject)
{
    PersonaSwitcher.logger.log('in setDefaultTheme');

    if (PersonaSwitcher.addonManager)
    {
        PersonaSwitcher.logger.log(PersonaSwitcher.defaultThemeId);
        AddonManager.getAddonByID(
            PersonaSwitcher.defaultThemeId,
            function (theme)
            {
                PersonaSwitcher.logger.log(theme);
                if (null !== theme)
                {
                    PersonaSwitcher.defaultTheme = theme;
                }
                resolve();
            }
        );
    }
    else if (null !== PersonaSwitcher.extensionManager)
    {
        var theme = PersonaSwitcher.extensionManager.getItemForID(
            PersonaSwitcher.defaultThemeId);

        if (null !== theme)
        {
            PersonaSwitcher.defaultTheme = theme;
        }
        resolve();
    }
};

// https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/window
PersonaSwitcher.onWindowLoad = function (doc)
{
    if (PersonaSwitcher.firstTime)
    {
        PersonaSwitcher.firstTime = false;

        // PersonaSwitcher.activeWindow = this;
        PersonaSwitcher.setLogger();
        PersonaSwitcher.logger.log ('first time');
        PersonaSwitcher.startTimer();
        PersonaSwitcher.themeMonitor();

        var retrieveDefaultTheme = new Promise(PersonaSwitcher.setDefaultTheme);

        retrieveDefaultTheme.then(() => 
        {
            PersonaSwitcher.createStaticPopups(doc);
            PersonaSwitcher.currentIndex =
                PersonaSwitcher.prefs.getIntPref ("current");

            if (PersonaSwitcher.prefs.getBoolPref ('startup-switch'))
            {
                PersonaSwitcher.rotate();
            } 
            else 
            {
                PersonaSwitcher.switchTo(
                    PersonaSwitcher.currentThemes[PersonaSwitcher.currentIndex],
                    PersonaSwitcher.currentIndex);
            }
        });
    }
    else
    {
        // we already should have the default theme at this point, crosses
        // fingers
        PersonaSwitcher.createStaticPopups (doc); 
        PersonaSwitcher.currentIndex =
            PersonaSwitcher.prefs.getIntPref ("current");
        PersonaSwitcher.switchTo(
            PersonaSwitcher.currentThemes[PersonaSwitcher.currentIndex],
            PersonaSwitcher.currentIndex);
    }
    
    PersonaSwitcher.setKeyset(doc);
    PersonaSwitcher.setAccessKey(doc);
    PersonaSwitcher.setToolboxMinheight(doc);
        
    if (! PersonaSwitcher.prefs.getBoolPref('main-menubar'))
    {
        PersonaSwitcher.logger.log('hiding main-menubar');
        PersonaSwitcher.hideMenu(doc, 'main-menubar');
    }
    if (! PersonaSwitcher.prefs.getBoolPref('tools-submenu'))
    {
        PersonaSwitcher.logger.log('hiding tools-submenu');
        PersonaSwitcher.hideMenu(doc, 'tools-submenu');
    }
};