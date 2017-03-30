const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Cu.import("resource://gre/modules/Console.jsm");

var stringBundle = Services.strings.createBundle('chrome://personaswitcher/locale/personaswitcher.properties?' + Math.random());
var styleSheetService = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
var uri = Services.io.newURI("chrome://personaswitcher/skin/toolbar-button.css", null, null);

function startup(data, reason) {	
	//https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/Appendix_D:_Loading_Scripts
  //load preferences
  Services.scriptloader.loadSubScript('chrome://personaswitcher/content/prefs.js', {
    pref: setDefaultPref  });
		
  Cu.import('chrome://personaswitcher/content/PersonaSwitcher.jsm');
	
  //https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/mozIJSSubScriptLoader
  let context = this;
  Services.scriptloader.loadSubScript('chrome://personaswitcher/content/ui.js',
                                    context, "UTF-8" /* The script's encoding */);


  //https://blog.mozilla.org/addons/2014/03/06/australis-for-add-on-developers-2/
  //Loading the stylesheet into all windows is a noticable hit on performance but is necessary for Thunderbird compatibility
  styleSheetService.loadAndRegisterSheet(uri, styleSheetService.USER_SHEET);

																		
	data.webExtension.startup().then(api => {
    const {browser} = api;
    browser.runtime.onMessage.addListener(messageHandler);
  });
  
  forEachOpenWindow(loadIntoWindow);
  Services.wm.addListener(WindowListener);  
	
}

function shutdown(data, reason) {

  //Clears the cache on disable so reloading the addon when debugging works properly
  //http://stackoverflow.com/questions/24711069/firefox-restartless-bootstrap-extension-script-not-reloading
  if (reason == ADDON_DISABLE) {
    Services.obs.notifyObservers(null, "startupcache-invalidate", null);
  }
	
  forEachOpenWindow(unloadFromWindow);
	PersonaSwitcher.prefs.removeObserver ('', PersonaSwitcher.prefsObserver);
  Services.wm.removeListener(WindowListener);
	Cu.unload('chrome://personaswitcher/content/PersonaSwitcher.jsm');	
  
  if (styleSheetService.sheetRegistered(uri, styleSheetService.USER_SHEET)) {
    styleSheetService.unregisterSheet(uri, styleSheetService.USER_SHEET);
  }
  
	//https://developer.mozilla.org/en-US/Add-ons/How_to_convert_an_overlay_extension_to_restartless#Step_10_Bypass_cache_when_loading_properties_files/
  // HACK WARNING: The Addon Manager does not properly clear all addon related caches on update;
  //               in order to fully update images and locales, their caches need clearing here
  Services.obs.notifyObservers(null, 'chrome-flush-caches', null);
}

function install(data, reason) {
	//install stuff here
}

function uninstall(data, reason) {
		removeUserPrefs();
}

function loadIntoWindow(window) {		
	let doc = window.document;
	
	injectMainMenu(doc);
	injectSubMenu(doc);
	//injectButton(doc);
	addKeyset(doc);	
	PersonaSwitcher.onWindowLoad(doc);
}

function unloadFromWindow(window) {
	let doc = window.document;
	let menu_personaswitcher = doc.getElementById("personaswitcher-main-menubar");	
	let subMenu_personaswitcher = doc.getElementById("personaswitcher-tools-submenu");
	//let button = doc.getElementById("personaswitcher-button");
	let keySet = doc.getElementById("personaSwitcherKeyset");

	if(menu_personaswitcher !== null) {
		menu_personaswitcher.parentNode.removeChild(menu_personaswitcher);		
	}
	if (subMenu_personaswitcher !== null) {
		subMenu_personaswitcher.parentNode.removeChild(subMenu_personaswitcher);		
	}
	/*if(button !== null){
		button.parentNode.removeChild(button);		
	}*/
	if(keySet !== null) {
		keySet.parentNode.removeChild(keySet);
	}
}

function forEachOpenWindow(applyThisFunc) // Apply a function to all open browser windows
{
	PersonaSwitcher.allWindows(applyThisFunc);
}

var WindowListener = {
  onOpenWindow: function (xulWindow)
  {
    var window = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
    function onWindowLoad()
    {
      window.removeEventListener('load', onWindowLoad);
      if (window.document.documentElement.getAttribute('windowtype') == 'navigator:browser')
      loadIntoWindow(window);
    }
    window.addEventListener('load', onWindowLoad);
  },
  onCloseWindow: function (xulWindow) {
  },
  onWindowTitleChange: function (xulWindow, newTitle) {
  }
};

//Message handler for communication with embedded WebExtension
function messageHandler(message, sender, sendResponse) {
	 switch (message.command)
   {
	   case "Return-Theme-List":
       PersonaSwitcher.getPersonas();
		   var themeList = PersonaSwitcher.currentThemes;
		   themeList.sort (function (a, b) { return a.name.localeCompare (b.name); });
		   var defaultTheme = {id: PersonaSwitcher.defaultTheme.id, name: PersonaSwitcher.defaultTheme.name, iconURL: PersonaSwitcher.defaultTheme.iconURL};
		   themeList.push(defaultTheme);
		   sendResponse({themes: themeList});
       break;
		case "Switch-Themes":
			 PersonaSwitcher.switchTo(message.theme);
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
function setPreference(preference, value) {
	switch(preference) {
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
function injectMainMenu(doc) {
	let menuBar;
	let menu_tools;
	switch (PersonaSwitcher.XULAppInfo.name)
	{
		case 'Icedove':
		case 'Thunderbird':
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
		
	//PersonaSwitcher menu that is added to the main menubar
	let menu_personaswitcher = doc.createElement("menu");
	menu_personaswitcher.setAttribute("id", "personaswitcher-main-menubar");
	menu_personaswitcher.setAttribute("label", stringBundle.GetStringFromName('personaswitcher-menu.label'));
	let menu_PSPopup = doc.createElement("menupopup");
	menu_PSPopup.setAttribute("id", "personaswitcher-main-menubar-popup");
	menu_PSPopup.addEventListener
    (
        'popuphidden',
        function() { PersonaSwitcher.popupHidden(); },
        false
    );
	menu_personaswitcher.appendChild(menu_PSPopup);
	menuBar.insertBefore(menu_personaswitcher, menu_tools.nextSibling);
}

function injectSubMenu(doc) {
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
	
	//SubMenu that is insterted into the Tools Menu
	let subMenu_personaswitcher = doc.createElement("menu");
	subMenu_personaswitcher.setAttribute("id", "personaswitcher-tools-submenu");
	subMenu_personaswitcher.setAttribute("label", stringBundle.GetStringFromName('personaswitcher-menu.label'));
	let subMenu_PSPopup = doc.createElement("menupopup");
	subMenu_PSPopup.setAttribute("id", "personaswitcher-tools-submenu-popup");
	subMenu_PSPopup.addEventListener
    (
        'popuphidden',
        function() { PersonaSwitcher.popupHidden(); },
        false
    );
	subMenu_personaswitcher.appendChild(subMenu_PSPopup);
	menuPopup.appendChild(subMenu_personaswitcher);
}

function injectButton(doc) {
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
	//PersonaSwitcher button added to the customize toolbox
	let button = doc.createElement("toolbarbutton");
	button.setAttribute("id", "personaswitcher-button");
	button.setAttribute("label", stringBundle.GetStringFromName('personaswitcher-button.label'));
	button.setAttribute("class", "toolbarbutton-1");
	button.setAttribute("tooltiptext", stringBundle.GetStringFromName('personaswitcher.tooltip'));
	button.setAttribute("type", "menu");
	let button_PSPopup = doc.createElement("menupopup");
	button_PSPopup.setAttribute("id", "personaswitcher-button-popup");
	button_PSPopup.addEventListener
    (
        'popuphidden',
        function() { PersonaSwitcher.popupHidden(); },
        false
    );
	button.appendChild(button_PSPopup);
	toolbox.palette.appendChild(button);

	moveButtonToToolbar(doc);
}

function moveButtonToToolbar(doc) {
	switch (PersonaSwitcher.XULAppInfo.name)
	{
		case 'Icedove':
		case 'Thunderbird':
			var tabbar = doc.getElementById('tabbar-toolbar');
			tabbar.insertItem("personaswitcher-button");
			break;
		case 'SeaMonkey':
		case 'Firefox':
		default:
			var navBar = doc.querySelector('#nav-bar');
			navBar.insertItem("personaswitcher-button");
			break;
	}
}

function addKeyset(doc) {
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
  return branch.getComplexValue(prefName, Components.interfaces.nsISupportsString).data;
}

function setUCharPref(prefName, text, branch) // Unicode setCharPref
{
  var string = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
  string.data = text;
  branch = branch ? branch : Services.prefs;
  branch.setComplexValue(prefName, Components.interfaces.nsISupportsString, string);
}

function removeUserPrefs() 
{
	var userPreferences = [
	"defshift", "defcontrol", "defalt", "defmeta", "defaccel", "defos", "defkey",
	"rotshift", "rotcontrol", "rotalt", "rotmeta", "rotaccel", "rotos", "rotkey",
	"autoshift", "autocontrol", "autoalt", "autometa", "autoaccel", "autoos", "autokey",
	"activateshift", "activatecontrol", "activatealt", "activatemeta", "activateaccel", "activateos", "activatekey",
	"accesskey", "auto", "autominutes", "random", "preview", "preview-delay", "icon-preview",
	"tools-submenu", "main-menubar", "debug", "notification-workaround", "toolbox-minheight",
	"startup-switch", "fastswitch", "current"];
	
	var userBranch = Components.classes["@mozilla.org/preferences-service;1"].
        getService(Components.interfaces.nsIPrefService).
            getBranch ("extensions.personaswitcher.");
	
	for(var pref of userPreferences) {
		userBranch.clearUserPref(pref);
	}
}
