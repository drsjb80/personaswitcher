Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import("resource:///modules/CustomizableUI.jsm");

var stringBundle = Services.strings.createBundle('chrome://personaswitcher/locale/personaswitcher.properties?' + Math.random());

function startup(data, reason) {
  Components.utils.import('chrome://personaswitcher/content/ui.jsm');

   //load preferences
  Services.scriptloader.loadSubScript('chrome://personaswitcher/content/prefs.js', {
    pref: setDefaultPref  });
  
  forEachOpenWindow(loadIntoWindow);
  Services.wm.addListener(WindowListener);
  
}
function shutdown(data, reason) {
  /*if (reason == APP_SHUTDOWN)
  return;*/

  CustomizableUI.destroyWidget('personaswitcher-button');

  forEachOpenWindow(unloadFromWindow);
  Services.wm.removeListener(WindowListener);
  
  // HACK WARNING: The Addon Manager does not properly clear all addon related caches on update;
  //               in order to fully update images and locales, their caches need clearing here
  Services.obs.notifyObservers(null, 'chrome-flush-caches', null);
}
function install(data, reason) {
  //load preferences
  /*Services.scriptloader.loadSubScript('chrome://personaswitcher/content/prefs.js', {
    pref: setDefaultPref
  });*/
}
function uninstall(data, reason) {
}
function loadIntoWindow(window) {		
	let doc = window.document;
	
	injectMainMenu(doc);
	injectSubMenu(doc);
	injectButton(doc);
	loadStyleSheet(window);
	
	//PersonaSwitcher.firstTime = true;
	PersonaSwitcher.onWindowLoad(doc);
}
function unloadFromWindow(window) {
	let doc = window.document;
	let menu_personaswitcher = doc.getElementById("personaswitcher-main-menubar");	
	let subMenu_personaswitcher = doc.getElementById("personaswitcher-tools-submenu");
	let button = doc.getElementById("personaswitcher-button");

	if(menu_personaswitcher !== null) {
		menu_personaswitcher.parentNode.removeChild(menu_personaswitcher);		
	}
	if (subMenu_personaswitcher !== null) {
		subMenu_personaswitcher.parentNode.removeChild(subMenu_personaswitcher);		
	}
	if(button !== null){
		button.parentNode.removeChild(button);		
	}
	
	Components.utils.unload('chrome://personaswitcher/content/ui.jsm');
	
	window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).
	  getInterface(Components.interfaces.nsIDOMWindowUtils).removeSheet(this._uri, 1);

}
function forEachOpenWindow(todo) // Apply a function to all open browser windows
{
  var windows = Services.wm.getEnumerator('navigator:browser');
  while (windows.hasMoreElements())
  todo(windows.getNext().QueryInterface(Components.interfaces.nsIDOMWindow));
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
} 
//UI Injection
function injectMainMenu(doc) {
	let menuBar;
	let menu_tools;
	switch (PersonaSwitcher.XULAppInfo.name)
	{
		case 'Thunderbird':
			menuBar;
			menu_tools;
			break;
		case 'Seamonkey':
			menuBar;
			menu_tools;
			break;
		case 'Icedove':
			menuBar;
			menu_tools;
			break;
		case 'Firefox':
			menuBar = doc.getElementById("main-menubar");			
			menu_tools = doc.getElementById("tools-menu");
			break;
		default:
			//Shouldn't get here
			break;
	}
		
	//PersonaSwitcher menu that is added to the main menubar
	let menu_personaswitcher = doc.createElement("menu");
	menu_personaswitcher.setAttribute("id", "personaswitcher-main-menubar");
	menu_personaswitcher.setAttribute("label", stringBundle.GetStringFromName('personaswitcher.label'));
	menu_personaswitcher.setAttribute("accesskey", 'p');
	let menu_PSPopup = doc.createElement("menupopup");
	menu_PSPopup.setAttribute("id", "personaswitcher-main-menubar-popup");
	menu_PSPopup.setAttribute("onpopuphidden", "PersonaSwitcher.popupHidden();");
	menu_personaswitcher.appendChild(menu_PSPopup);
	menuBar.insertBefore(menu_personaswitcher, menu_tools.nextSibling);
}

function injectSubMenu(doc) {
	let menuPopup;
	let subMenu_prefs;
	switch (PersonaSwitcher.XULAppInfo.name)
	{
		case 'Thunderbird':
			menuPopup;
			subMenu_prefs;
			break;
		case 'Seamonkey':
			menuPopup;
			subMenu_prefs;
			break;
		case 'Icedove':
			menuPopup;
			subMenu_prefs;
			break;
		case 'Firefox':
			menuPopup = doc.getElementById("menu_ToolsPopup");
			subMenu_prefs = doc.getElementById("menu_preferences");
			break;
		default:
			//Shouldn't get here
			break;
	}
	
	//SubMenu that is insterted into the Tools Menu
	let subMenu_personaswitcher = doc.createElement("menu");
	subMenu_personaswitcher.setAttribute("id", "personaswitcher-tools-submenu");
	subMenu_personaswitcher.setAttribute("label", stringBundle.GetStringFromName('personaswitcher.label'));
	let subMenu_PSPopup = doc.createElement("menupopup");
	subMenu_PSPopup.setAttribute("id", "personaswitcher-tools-submenu-popup");
	subMenu_PSPopup.setAttribute("onpopuphidden", "PersonaSwitcher.popupHidden();");
	subMenu_personaswitcher.appendChild(subMenu_PSPopup);
	menuPopup.insertBefore(subMenu_personaswitcher, subMenu_prefs);
}

function injectButton(doc) {
	let toolbox;
	switch (PersonaSwitcher.XULAppInfo.name)
	{
		case 'Thunderbird':
			toolbox;
			break;
		case 'Seamonkey':
			toolbox;
			break;
		case 'Icedove':
			toolbox;
			break;
		case 'Firefox':
			toolbox = doc.getElementById("navigator-toolbox");
			break;
		default:
			//Shouldn't get here
			break;
	}
	//PersonaSwitcher button added to the customize toolbox
	let button = doc.createElement("toolbarbutton");
	button.setAttribute("id", "personaswitcher-button");
	button.setAttribute("label", stringBundle.GetStringFromName('personaswitcher.label'));
	button.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
	button.setAttribute("tooltiptext", stringBundle.GetStringFromName('personaswitcher.tooltip'));
	button.setAttribute("type", "menu");
	let button_PSPopup = doc.createElement("menupopup");
	button_PSPopup.setAttribute("id", "personaswitcher-button-popup");
	button_PSPopup.setAttribute("onpopuphidden", "PersonaSwitcher.popupHidden();");
	button.appendChild(button_PSPopup);
	toolbox.palette.appendChild(button);

	//Move PersonaSwitcher button to the navigation bar
	var navBar = doc.querySelector('#nav-bar');
	navBar.insertItem("personaswitcher-button");
}

function loadStyleSheet(window) {		
	this._uri = Services.io.newURI('chrome://personaswitcher/skin/toolbar-button.css', null, null);
    window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).
	  getInterface(Components.interfaces.nsIDOMWindowUtils).loadSheet(this._uri, 1);
}

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
};
