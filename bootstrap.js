const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Cu.import("resource://gre/modules/Console.jsm");

var stringBundle = Services.strings.createBundle(
    'chrome://personaswitcher/locale/personaswitcher.properties?' + 
        Math.random());
var styleSheetService = Cc["@mozilla.org/content/style-sheet-service;1"].
                            getService(Ci.nsIStyleSheetService);
var uri = Services.io.newURI("chrome://personaswitcher/skin/toolbar-button.css",
                             null, null);

function startup(data, reason) 
{    
    //https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/Appendix_D:_Loading_Scripts
    //load preferences
    Services.scriptloader.
        loadSubScript('chrome://personaswitcher/content/prefs.js',
            { pref: setDefaultPref });
        
    Cu.import('chrome://personaswitcher/content/PersonaSwitcher.jsm');
    
    //https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/mozIJSSubScriptLoader
    let context = this;
    Services.scriptloader.
        loadSubScript('chrome://personaswitcher/content/ui.js',
                      context, "UTF-8" /* The script's encoding */);


    //https://blog.mozilla.org/addons/2014/03/06/australis-for-add-on-developers-2/
    //Loading the stylesheet into all windows is a noticeable hit on performance 
    //but is necessary for Thunderbird compatibility
    styleSheetService.loadAndRegisterSheet(uri, styleSheetService.USER_SHEET);
                                                                        
    data.webExtension.startup().then(api => 
    {
        const {browser} = api;
        browser.runtime.onMessage.addListener(messageHandler);
    });
  
    forEachOpenWindow(loadIntoWindow);
    Services.wm.addListener(WindowListener);    
}

function shutdown(data, reason) 
{
    //Clears the cache on disable so reloading the addon when debugging works
    //properly
    //http://stackoverflow.com/questions/24711069/firefox-restartless-bootstrap-extension-script-not-reloading
    if (reason == ADDON_DISABLE) 
    {
        Services.obs.notifyObservers(null, "startupcache-invalidate", null);
    }
    
    forEachOpenWindow(unloadFromWindow);
    PersonaSwitcher.prefs.removeObserver ('', PersonaSwitcher.prefsObserver);
    Services.wm.removeListener(WindowListener);
    Cu.unload('chrome://personaswitcher/content/PersonaSwitcher.jsm');    
  
    if (styleSheetService.sheetRegistered(uri, styleSheetService.USER_SHEET)) 
    {
        styleSheetService.unregisterSheet(uri, styleSheetService.USER_SHEET);
    }
  
    //https://developer.mozilla.org/en-US/Add-ons/How_to_convert_an_overlay_extension_to_restartless#Step_10_Bypass_cache_when_loading_properties_files/
    // HACK WARNING: The Addon Manager does not properly clear all addon related
    //               caches on update; in order to fully update images and 
    //               locales, their caches need clearing here
    Services.obs.notifyObservers(null, 'chrome-flush-caches', null);
}

function install(data, reason) 
{
    //install stuff here
}

function uninstall(data, reason) 
{
    removeUserPrefs();
}

function loadIntoWindow(window) 
{        
    let doc = window.document;
    
    injectMainMenu(doc);
    injectSubMenu(doc);
    addKeyset(doc);    
    PersonaSwitcher.onWindowLoad(doc);
}

function unloadFromWindow(window) 
{
    let doc = window.document;
    let menuPersonaSwitcher = 
        doc.getElementById("personaswitcher-main-menubar");    
    let submenuPersonaSwitcher = 
        doc.getElementById("personaswitcher-tools-submenu");
    let keySet = doc.getElementById("personaSwitcherKeyset");

    if(menuPersonaSwitcher !== null) 
    {
        menuPersonaSwitcher.parentNode.removeChild(menuPersonaSwitcher);        
    }
    if (submenuPersonaSwitcher !== null) 
    {
        submenuPersonaSwitcher.parentNode.removeChild(submenuPersonaSwitcher);        
    }
    if(keySet !== null) 
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
    onOpenWindow: function (xulWindow)
    {
        var window = 
            xulWindow.
                QueryInterface(Components.interfaces.nsIInterfaceRequestor).
                    getInterface(Components.interfaces.nsIDOMWindow);
        function onWindowLoad()
        {
            window.removeEventListener('load', onWindowLoad);
            if (window.document.documentElement.getAttribute('windowtype') == 
                'navigator:browser')
            {
                loadIntoWindow(window);
            }
        }
        window.addEventListener('load', onWindowLoad);
    },
    onCloseWindow: function (xulWindow) {},
    onWindowTitleChange: function (xulWindow, newTitle) {}
};

//Message handler for communication with embedded WebExtension
function messageHandler(message, sender, sendResponse) 
{
    switch (message.command)
    {
        case "Return-Theme-List":
            PersonaSwitcher.getPersonas();
            var themeList = PersonaSwitcher.currentThemes;
            var defaultTheme = 
                {
                    id: PersonaSwitcher.defaultTheme.id, 
                    name: PersonaSwitcher.defaultTheme.name, 
                    iconURL: PersonaSwitcher.defaultTheme.iconURL
                };
            themeList.push(defaultTheme);
            sendResponse({themes: themeList});
            break;
        case "Switch-Themes":
            PersonaSwitcher.switchTo(message.theme, message.index);
            break;    
        case "Preview-Theme":
            LightweightThemeManager.previewTheme(message.theme);
            break;
        case "End-Preview":
            LightweightThemeManager.resetPreview();
            break;
        case "Rotate-Theme":
            PersonaSwitcher.rotate();
            break;
        case "Return-Pref-Auto":
            sendResponse({auto: PersonaSwitcher.prefs.getBoolPref ('auto')});
            break;
        case "Get-Current-Index":
            sendResponse({current: PersonaSwitcher.currentIndex});
            break;
        case "Set-Preference":
            setPreference(message.preference, message.value);
            break;
    }
}

//Handles copying the preference values from the webextension to the legacy code
function setPreference(preference, value) 
{
    switch(preference) 
    {
        case 'toolboxMinHeight':
            PersonaSwitcher.prefs.setCharPref("toolbox-minheight", value);
            break;
        case 'iconPreview':
            PersonaSwitcher.prefs.setBoolPref("icon-preview", value);
            break;
        case 'preview':
            PersonaSwitcher.prefs.setBoolPref("preview", value);
            break;
        case 'previewDelay':
            PersonaSwitcher.prefs.setIntPref("preview-delay", parseInt(value));
            break;
        case 'auto':
            PersonaSwitcher.prefs.setBoolPref("auto", value);
            break;
        case 'autoMinutes':
            PersonaSwitcher.prefs.setIntPref("autominutes", parseInt(value));
            break;
        case 'startupSwitch':
            PersonaSwitcher.prefs.setBoolPref("startup-switch", value);
            break;
        case 'mainMenuBar':
            PersonaSwitcher.prefs.setBoolPref("main-menubar", value);
            break;
        case 'toolsMenu':
            PersonaSwitcher.prefs.setBoolPref("tools-submenu", value);
            break;
        case 'random':
            PersonaSwitcher.prefs.setBoolPref("random", value);
            break;
        case 'defaultKeyShift':
            PersonaSwitcher.prefs.setBoolPref("defshift", value);
            break;
        case 'defaultKeyControl':
            PersonaSwitcher.prefs.setBoolPref("defcontrol", value);
            break;
        case 'defaultKeyAlt':
            PersonaSwitcher.prefs.setBoolPref("defalt", value);
            break;
        case 'defaultKeyMeta':
            PersonaSwitcher.prefs.setBoolPref("defmeta", value);
            break;
        case 'defaultKeyAccel':
            PersonaSwitcher.prefs.setBoolPref("defaccel", value);
            break;
        case 'defaultKeyOS':
            PersonaSwitcher.prefs.setBoolPref("defos", value);
            break;
        case 'defaultKey':
            PersonaSwitcher.prefs.setCharPref("defkey", value);
            break;
        case 'rotateKeyShift':
            PersonaSwitcher.prefs.setBoolPref("rotshift", value);
            break;
        case 'rotateKeyControl':
            PersonaSwitcher.prefs.setBoolPref("rotcontrol", value);
            break;
        case 'rotateKeyAlt':
            PersonaSwitcher.prefs.setBoolPref("rotalt", value);
            break;
        case 'rotateKeyMeta':
            PersonaSwitcher.prefs.setBoolPref("rotmeta", value);
            break;
        case 'rotateKeyAccel':
            PersonaSwitcher.prefs.setBoolPref("rotaccel", value);
            break;
        case 'rotateKeyOS':
            PersonaSwitcher.prefs.setBoolPref("rotos", value);
            break;
        case 'rotateKey':
            PersonaSwitcher.prefs.setCharPref("rotkey", value);
            break;
        case 'autoKeyShift':
            PersonaSwitcher.prefs.setBoolPref("autoshift", value);
            break;
        case 'autoKeyControl':
            PersonaSwitcher.prefs.setBoolPref("autocontrol", value);
            break;
        case 'autoKeyAlt':
            PersonaSwitcher.prefs.setBoolPref("autoalt", value);
            break;
        case 'autoKeyMeta':
            PersonaSwitcher.prefs.setBoolPref("autometa", value);
            break;
        case 'autoKeyAccel':
            PersonaSwitcher.prefs.setBoolPref("autoaccel", value);
            break;
        case 'autoKeyOS':
            PersonaSwitcher.prefs.setBoolPref("autoos", value);
            break;
        case 'autoKey':
            PersonaSwitcher.prefs.setCharPref("autokey", value);
            break;
        case 'accessKey':
            PersonaSwitcher.prefs.setCharPref("accesskey", value);
            break;
        case 'activateKeyShift':
            PersonaSwitcher.prefs.setBoolPref("activateshift", value);
            break;
        case 'activateKeyControl':
            PersonaSwitcher.prefs.setBoolPref("activatecontrol", value);
            break;
        case 'activateKeyAlt':
            PersonaSwitcher.prefs.setBoolPref("activatealt", value);
            break;
        case 'activateKeyMeta':
            PersonaSwitcher.prefs.setBoolPref("activatemeta", value);
            break;
        case 'activateKeyAccel':
            PersonaSwitcher.prefs.setBoolPref("activateaccel", value);
            break;
        case 'activateKeyOs':
            PersonaSwitcher.prefs.setBoolPref("activateos", value);
            break;
        case 'activateKey':
            PersonaSwitcher.prefs.setCharPref("activatekey", value);
            break;
        case 'current':
            PersonaSwitcher.currentIndex = parseInt(value);
            PersonaSwitcher.prefs.setIntPref ('current', parseInt(value));
            break;
        case "fastSwitch":
            PersonaSwitcher.prefs.setBoolPref("fastswitch", value);
            break;
    }
}

//UI Injection
function injectMainMenu(doc) 
{
    let menuBar;
    let menuTools;
    switch (PersonaSwitcher.XULAppInfo.name)
    {
        case 'Icedove':
        case 'Thunderbird':
        case 'SeaMonkey':
            menuBar = doc.getElementById("main-menubar");            
            menuTools = doc.getElementById("tasksMenu");
            break;
        case 'Firefox':
        default:
            menuBar = doc.getElementById("main-menubar");            
            menuTools = doc.getElementById("tools-menu");
            break;
    }
        
    //PersonaSwitcher menu that is added to the main menubar
    let menuPersonaSwitcher = doc.createElement("menu");
    menuPersonaSwitcher.setAttribute("id", "personaswitcher-main-menubar");
    menuPersonaSwitcher.setAttribute("label",
                stringBundle.GetStringFromName('personaswitcher-menu.label'));
    let menuPSPopup = doc.createElement("menupopup");
    menuPSPopup.setAttribute("id", "personaswitcher-main-menubar-popup");
    menuPSPopup.addEventListener
    (
        'popuphidden',
        function() { PersonaSwitcher.popupHidden(); },
        false
    );
    menuPersonaSwitcher.appendChild(menuPSPopup);
    menuBar.insertBefore(menuPersonaSwitcher, menuTools.nextSibling);
}

function injectSubMenu(doc) 
{
    let menuPopup;
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
    
    //SubMenu that is inserted into the Tools Menu
    let submenuPersonaSwitcher = doc.createElement("menu");
    submenuPersonaSwitcher.setAttribute("id", "personaswitcher-tools-submenu");
    submenuPersonaSwitcher.setAttribute("label", 
        stringBundle.GetStringFromName('personaswitcher-menu.label'));
    let submenuPSPopup = doc.createElement("menupopup");
    submenuPSPopup.setAttribute("id", "personaswitcher-tools-submenu-popup");
    submenuPSPopup.addEventListener
    (
        'popuphidden',
        function() { PersonaSwitcher.popupHidden(); },
        false
    );
    submenuPersonaSwitcher.appendChild(submenuPSPopup);
    menuPopup.appendChild(submenuPersonaSwitcher);
}

function addKeyset(doc) 
{
    //http://forums.mozillazine.org/viewtopic.php?t=2711165
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
    
    let keyset = doc.createElement ('keyset');
    keyset.setAttribute("id", "personaSwitcherKeyset");
    mainWindow.appendChild(keyset);    
}

//https://developer.mozilla.org/en-US/Add-ons/How_to_convert_an_overlay_extension_to_restartless#Step_4_Manually_handle_default_preferences
//Default Preferences Setup
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
    return branch.
        getComplexValue(prefName, Components.interfaces.nsISupportsString).data;
}

function setUCharPref(prefName, text, branch) // Unicode setCharPref
{
    var string = Components.classes['@mozilla.org/supports-string;1'].
        createInstance(Components.interfaces.nsISupportsString);
    string.data = text;
    branch = branch ? branch : Services.prefs;
    branch.setComplexValue( prefName, 
                            Components.interfaces.nsISupportsString,
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
    "accesskey", "auto", "autominutes", "random", "preview", "preview-delay", 
    "icon-preview", "tools-submenu", "main-menubar", "debug", 
    "notification-workaround", "toolbox-minheight", "startup-switch", 
    "fastswitch", "current"];
    
    var userBranch = Components.classes["@mozilla.org/preferences-service;1"].
        getService(Components.interfaces.nsIPrefService).
            getBranch ("extensions.personaswitcher.");
    
    for(var pref of userPreferences) 
    {
        userBranch.clearUserPref(pref);
    }
}
