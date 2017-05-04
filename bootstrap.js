/* global Components, Services, PersonaSwitcher, ADDON_UNINSTALL, ADDON_DISABLE */
'use strict';

const {
    classes: Cc,
    interfaces: Ci,
    utils: Cu
} = Components;
Cu.import('resource://gre/modules/Services.jsm');
const MIDDLE_BUTTON = 1;

var stringBundle =
    Services.strings.createBundle(
        'chrome://personaswitcher/locale/personaswitcher.properties?' +
        Math.random());
var styleSheetService = Cc["@mozilla.org/content/style-sheet-service;1"].
    getService(Ci.nsIStyleSheetService);

var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var uri = ios.newURI("chrome://personaswitcher/skin/toolbar-button.css",
    null, null);

// var uri = Services.io.
//              newURI("chrome://personaswitcher/skin/toolbar-button.css", 
//                      null, null);

var firstRun = false;

function startup(data, reason) 
{
    // https://blog.mozilla.org/addons/2014/03/06/australis-for-add-on-developers-2/
    // Loading the stylesheet into all windows is a noticeable hit on
    // performance but is necessary for Thunderbird compatibility
    if (!styleSheetService.sheetRegistered(uri, 
        styleSheetService.AUTHOR_SHEET)) 
    {
        styleSheetService.
        loadAndRegisterSheet(uri, styleSheetService.AUTHOR_SHEET);
    }

    // https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/Appendix_D:_Loading_Scripts
    // load preferences
    Services.scriptloader.
    loadSubScript('chrome://personaswitcher/content/prefs.js', 
        {pref: setDefaultPref});

    Cu.import('chrome://personaswitcher/content/PersonaSwitcher.jsm');

    // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/mozIJSSubScriptLoader
    let context = this;
    Services.scriptloader.loadSubScript(
        'chrome://personaswitcher/content/ui.js',
        context, "UTF-8" /* The script's encoding */);

    forEachOpenWindow(loadIntoWindow);
    Services.wm.addListener(WindowListener);
    firstRun = false;
}

function shutdown(data, reason) 
{
    // Clears the cache on disable so reloading the addon when debugging works 
    // properly
    // http://stackoverflow.com/questions/24711069/firefox-restartless-bootstrap-extension-script-not-reloading
    if (reason == ADDON_DISABLE) 
    {
        Services.obs.notifyObservers(null, "startupcache-invalidate", null);
    }

    forEachOpenWindow(unloadFromWindow);
    PersonaSwitcher.prefs.removeObserver('', PersonaSwitcher.prefsObserver);
    Services.wm.removeListener(WindowListener);
    Cu.unload('chrome://personaswitcher/content/PersonaSwitcher.jsm');

    if (styleSheetService.sheetRegistered(uri, styleSheetService.AUTHOR_SHEET)) 
    {
        styleSheetService.unregisterSheet(uri, styleSheetService.AUTHOR_SHEET);
    }

    // https://developer.mozilla.org/en-US/Add-ons/How_to_convert_an_overlay_extension_to_restartless#Step_10_Bypass_cache_when_loading_properties_files/
    // HACK WARNING: 
    // The Addon Manager does not properly clear all addon related caches on 
    // update; in order to fully update images and locales, their caches need 
    // clearing here
    Services.obs.notifyObservers(null, 'chrome-flush-caches', null);
}

function install(data, reason) 
{
    firstRun = true;
}

function uninstall(data, reason) 
{
    if(ADDON_UNINSTALL === reason) 
    {
        removeUserPrefs();
    }
}

function loadIntoWindow(window) 
{
    let doc = window.document;

    injectMainMenu(doc);
    injectSubMenu(doc);
    injectButton(window);
    addKeyset(doc);
    PersonaSwitcher.onWindowLoad(doc);
}

function unloadFromWindow(window) 
{
    let doc = window.document;
    let menu_personaswitcher =
        doc.getElementById("personaswitcher-main-menubar");
    let subMenu_personaswitcher =
        doc.getElementById("personaswitcher-tools-submenu");
    let button = doc.getElementById("personaswitcher-button");
    let keySet = doc.getElementById("personaSwitcherKeyset");

    if (null !== menu_personaswitcher) 
    {
        menu_personaswitcher.parentNode.removeChild(menu_personaswitcher);
    }
    if (null !== subMenu_personaswitcher) 
    {
        subMenu_personaswitcher.parentNode.removeChild(subMenu_personaswitcher);
    }
    if (null !== button) 
    {
        button.parentNode.removeChild(button);
    }
    if (null !== keySet) 
    {
        keySet.parentNode.removeChild(keySet);
    }
}

function forEachOpenWindow(applyThisFunc) 
{
    PersonaSwitcher.allWindows(applyThisFunc);
}

var WindowListener = 
{
    onOpenWindow: function(xulWindow) 
    {
        var window = xulWindow.
        QueryInterface(Components.interfaces.nsIInterfaceRequestor).
        getInterface(Components.interfaces.nsIDOMWindow);

        function onWindowLoad() 
        {
            window.removeEventListener('load', onWindowLoad);
            loadIntoWindow(window);
        }
        window.addEventListener('load', onWindowLoad);
    },
    onCloseWindow: function(xulWindow) 
    {
        
    },
    onWindowTitleChange: function(xulWindow, newTitle) 
    {
        
    }
};

// UI Injection
function injectMainMenu(doc) 
{
    let menuBar;
    let menu_tools;
    switch (PersonaSwitcher.XULAppInfo.name) 
    {
        case 'Icedove':
        case 'Thunderbird':
            menuBar = doc.getElementById("mail-menubar");
            menu_tools = doc.getElementById("tasksMenu");
            break;
        case 'SeaMonkey':
            menuBar = doc.getElementById("main-menubar");
            menu_tools = doc.getElementById("tasksMenu");
            break;
        case 'Firefox':
        default:
            menuBar = doc.getElementById("main-menubar");
            menu_tools = doc.getElementById("tools-menu");
            break;
    }

    if (null === menuBar) 
    {
        return;
    }

    // PersonaSwitcher menu that is added to the main menubar
    let menu_personaswitcher = doc.createElement("menu");
    menu_personaswitcher.setAttribute("id", "personaswitcher-main-menubar");
    menu_personaswitcher.setAttribute("label",
        stringBundle.GetStringFromName('personaswitcher-menu.label'));
    let menu_PSPopup = doc.createElement("menupopup");
    menu_PSPopup.setAttribute("id", "personaswitcher-main-menubar-popup");
    menu_PSPopup.addEventListener(
        'popuphidden',
        function() 
        {
            PersonaSwitcher.popupHidden();
        },
        false
    );
    menu_personaswitcher.appendChild(menu_PSPopup);
    
    if (null === menu_tools) 
    {
        menuBar.appendChild(menu_personaswitcher);
    } 
    else 
    {
        menuBar.insertBefore(
            menu_personaswitcher, menu_tools.nextSibling);        
    }
}

function injectSubMenu(doc) 
{
    let menuPopup;
    let subMenu_prefs;
    switch (PersonaSwitcher.XULAppInfo.name) 
    {
        case 'Icedove':
        case 'Thunderbird':
        case 'SeaMonkey':
            menuPopup = doc.getElementById("taskPopup");
            break;
        case 'Firefox':
        default:
            menuPopup = doc.getElementById("menu_ToolsPopup");
            break;
    }

    if (null === menuPopup) 
    {
        return;
    }

    // SubMenu that is insterted into the Tools Menu
    let subMenu_personaswitcher = doc.createElement("menu");
    subMenu_personaswitcher.setAttribute("id", "personaswitcher-tools-submenu");
    subMenu_personaswitcher.setAttribute("label",
        stringBundle.GetStringFromName('personaswitcher-menu.label'));
    let subMenu_PSPopup = doc.createElement("menupopup");
    subMenu_PSPopup.setAttribute("id", "personaswitcher-tools-submenu-popup");
    subMenu_PSPopup.addEventListener(
        'popuphidden',
        function() 
        {
            PersonaSwitcher.popupHidden();
        },
        false
    );
    subMenu_personaswitcher.appendChild(subMenu_PSPopup);
    menuPopup.appendChild(subMenu_personaswitcher);
}

function injectButton(window) 
{
    let doc = window.document;
    let toolbox;
    let toolbar;
    switch (PersonaSwitcher.XULAppInfo.name) 
    {
        case 'Icedove':
        case 'Thunderbird':
            toolbox = doc.getElementById("mail-toolbox");
            toolbar = doc.getElementById('tabbar-toolbar');
            break;
        case 'SeaMonkey':
        case 'Firefox':
        default:
            toolbox = doc.getElementById("navigator-toolbox");
            toolbar = doc.querySelector('#nav-bar');
            break;
    }

    if (null === toolbox) 
    {
        return;
    }

    function openOptions(event) 
    {
        var features = "chrome,titlebar,toolbar,centerscreen";
        window.openDialog("chrome://personaswitcher/content/options.xul",
            "Preferences", features);
        event.stopImmediatePropagation();
    }

    // PersonaSwitcher button added to the customize toolbox
    let button = doc.createElement("toolbarbutton");
    button.setAttribute("id", "personaswitcher-button");
    button.setAttribute("label",
        stringBundle.GetStringFromName('personaswitcher-button.label'));
    button.setAttribute("class", "toolbarbutton-1");
    button.setAttribute("tooltiptext",
        stringBundle.GetStringFromName('personaswitcher.tooltip'));
    button.setAttribute("type", "menu");
    button.setAttribute("context", "");
    button.addEventListener("contextmenu", openOptions, true);
    button.addEventListener("click", function(e) 
        {
            if(e.button === MIDDLE_BUTTON) PersonaSwitcher.setDefault();
        });

    let button_PSPopup = doc.createElement("menupopup");
    button_PSPopup.setAttribute("id", "personaswitcher-button-popup");
    button_PSPopup.addEventListener(
        'popuphidden',
        function() 
        {
            PersonaSwitcher.popupHidden();
        },
        false
    );
    button.appendChild(button_PSPopup);

    if (!existsIn(toolbox.palette.children, button)) 
    {
        toolbox.palette.appendChild(button);
    }

    moveButtonToToolbar(doc, toolbar, button);
}

function existsIn(list, desiredItem) 
{
    for (var index = 0; index < list.length; index++) 
    {
        if (list[index].id === desiredItem.id) 
        {
            return true;
        }
    }

    return false;
}

// http://blog.salsitasoft.com/adding-a-toolbar-button-in-a-bootstrapped-firefox-extension/
function moveButtonToToolbar(doc, toolbar, button) 
{
    var currentset = toolbar.getAttribute("currentset").split(",");
    var index = currentset.indexOf(button.id);
    if (-1 == index) 
    {
        if (firstRun) 
        {
            // No button yet so add it to the toolbar.
            toolbar.insertItem(button.id);
            toolbar.setAttribute("currentset", toolbar.currentSet);
            doc.persist(toolbar.id, "currentset");
        }
    } 
    else 
    {
        // The id is in the currentset, so find the position and
        // insert the button there.
        var before = null;

        for (var i = index + 1; i < currentset.length; i++) 
        {
            before = doc.getElementById(currentset[i]);
            if (before) 
            {
                toolbar.insertItem(button.id, before);
                break;
            }
        }

        if (!before) 
        {
            toolbar.insertItem(button.id);
        }
    }
}

function addKeyset(doc) 
{
    // http://forums.mozillazine.org/viewtopic.php?t=2711165
    var mainWindow;
    switch (PersonaSwitcher.XULAppInfo.name) 
    {
        case 'Icedove':
        case 'Thunderbird':
            mainWindow = doc.getElementById('messengerWindow');
            break;
        case 'SeaMonkey':
        case 'Firefox':
        default:
            mainWindow = doc.getElementById('main-window');
            break;
    }

    if (null === mainWindow) 
    {
        return;
    }

    let keyset = doc.createElement('keyset');
    keyset.setAttribute("id", "personaSwitcherKeyset");
    mainWindow.appendChild(keyset);
}

// https://developer.mozilla.org/en-US/Add-ons/How_to_convert_an_overlay_extension_to_restartless#Step_4_Manually_handle_default_preferences
// Default Preferences Setup
function getGenericPref(branch, prefName) 
{
    switch (branch.getPrefType(prefName)) 
    {
        default:
            case 0:
            return undefined; // PREF_INVALID
        case 32:
                return getUCharPref(prefName, branch); // PREF_STRING
        case 64:
                return branch.getIntPref(prefName); // PREF_INT
        case 128:
                return branch.getBoolPref(prefName); // PREF_BOOL
    }
}

function setGenericPref(branch, prefName, prefValue) 
{
    switch (typeof prefValue) 
    {
        case 'string':
            setUCharPref(prefName, prefValue, branch);
            return;
        case 'number':
            branch.setIntPref(prefName, prefValue);
            return;
        case 'boolean':
            branch.setBoolPref(prefName, prefValue);
            return;
    }
}

function setDefaultPref(prefName, prefValue) 
{
    var defaultBranch = Services.prefs.getDefaultBranch(null);
    setGenericPref(defaultBranch, prefName, prefValue);
}

function getUCharPref(prefName, branch) // Unicode getCharPref
{
    branch = branch ? branch : Services.prefs;
    return branch.getComplexValue(
        prefName, Components.interfaces.nsISupportsString).data;
}

function setUCharPref(prefName, text, branch) // Unicode setCharPref
{
    var string = Components.classes['@mozilla.org/supports-string;1'].
    createInstance(Components.interfaces.nsISupportsString);
    string.data = text;
    branch = branch ? branch : Services.prefs;
    branch.setComplexValue(prefName, Components.interfaces.nsISupportsString,
        string);
}

function removeUserPrefs() 
{
    var userPreferences = [
    "defshift", "defcontrol", "defalt", "defmeta", "defaccel", "defos", 
    "defkey", "rotshift", "rotcontrol", "rotalt", "rotmeta", "rotaccel", 
    "rotos", "rotkey", "autoshift", "autocontrol", "autoalt", "autometa", 
    "autoaccel", "autoos", "autokey", "activateshift", "activatecontrol", 
    "activatealt", "activatemeta", "activateaccel", "activateos", "activatekey",
    "toolsshift", "toolscontrol", "toolsalt", "toolsmeta", "toolsaccel",
    "toolsos", "toolskey", "accesskey", "auto", "autominutes", "random", 
    "preview", "preview-delay", "icon-preview", "tools-submenu",
    "main-menubar", "debug", "notification-workaround", "toolbox-minheight",
    "startup-switch", "fastswitch", "current"];
    
    var userBranch = Components.classes["@mozilla.org/preferences-service;1"].
        getService(Components.interfaces.nsIPrefService).
            getBranch ("extensions.personaswitcher.");
    
    for(var pref of userPreferences) 
    {
        userBranch.clearUserPref(pref);
    }
}
