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
  
	CustomizableUI.createWidget({
		id: 'personaswitcher-button',
		defaultArea: CustomizableUI.AREA_NAVBAR,
		label: stringBundle.GetStringFromName('personaswitcher.label'),
		type: 'view',
		viewId: "personaswitcher-view-panel",
		tooltiptext: stringBundle.GetStringFromName('personaswitcher.tooltip'),
		onViewShowing: function(aEvent) {
			
		},
		onViewHiding: function(aEvent) {
			
		}
	});
}
function shutdown(data, reason) {
  /*if (reason == APP_SHUTDOWN)
  return;*/

  CustomizableUI.destroyWidget('personaswitcher-button');

  forEachOpenWindow(unloadFromWindow);
  Services.wm.removeListener(WindowListener);
	
  //Components.utils.unload('chrome://personaswitcher/content/ui.jsm');
  
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
	switch (PersonaSwitcher.XULAppInfo.name)
        {
            case 'Thunderbird':
				injectIntoThunderbird(window);
				break;
			case 'Seamonkey':
				injectIntoSeamonkey(window);
				break;
            case 'Icedove':
                injectIntoIcedove(window);
                break;
			case 'Firefox':
				injectIntoFirefox(window);
				break;
            default:
                //Shouldn't get here
                break;
        }
	
	//PersonaSwitcher.firstTime = true;
	PersonaSwitcher.onWindowLoad(window.document);
	
	this._uri = Services.io.newURI('chrome://personaswitcher/skin/toolbar-button.css', null, null);
    window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).
	  getInterface(Components.interfaces.nsIDOMWindowUtils).loadSheet(this._uri, 1);
}
function unloadFromWindow(window) {
	let doc = window.document;
    let panel = doc.getElementById("personaswitcher-view-panel");
	let menu_personaswitcher = doc.getElementById("personaswitcher-main-menubar");	
	let subMenu_personaswitcher = doc.getElementById("personaswitcher-tools-submenu");

    panel.parentNode.removeChild(panel);
	menu_personaswitcher.parentNode.removeChild(menu_personaswitcher);
	subMenu_personaswitcher.parentNode.removeChild(subMenu_personaswitcher);
	
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
function injectIntoFirefox(window)
{
	let doc = window.document;
	
	//Panel for the CustomizableUI.jsm implementation of the PersonaSwitcher button
	let panel = doc.createElement("panelView");
	panel.setAttribute("id", "personaswitcher-view-panel");
	let item = doc.createElementNS ('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menuitem');
	item.setAttribute("label", "Item");
	panel.appendChild(item);
	doc.getElementById("PanelUI-multiView").appendChild(panel);
	
	//SubMenu that is insterted into the Tools Menu
	let subMenu_personaswitcher = doc.createElement("menu");
	subMenu_personaswitcher.setAttribute("id", "personaswitcher-tools-submenu");
	subMenu_personaswitcher.setAttribute("label", stringBundle.GetStringFromName('personaswitcher.label'));
	let subMenu_PSPopup = doc.createElement("menupopup");
	subMenu_PSPopup.setAttribute("id", "personaswitcher-tools-submenu-popup");
	subMenu_PSPopup.setAttribute("onpopuphidden", "PersonaSwitcher.popupHidden();");
	let item2 = doc.createElementNS ('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menuitem');
	item2.setAttribute("label", "Item");
	subMenu_PSPopup.appendChild(item2);
	subMenu_personaswitcher.appendChild(subMenu_PSPopup);
	let subMenu_prefs = doc.getElementById("menu_preferences");
	doc.getElementById("menu_ToolsPopup").insertBefore(subMenu_personaswitcher, subMenu_prefs);
	
	//PersonaSwitcher menu that is added to the main menubar
	let menu_personaswitcher = doc.createElement("menu");
	menu_personaswitcher.setAttribute("id", "personaswitcher-main-menubar");
	menu_personaswitcher.setAttribute("label", stringBundle.GetStringFromName('personaswitcher.label'));
	menu_personaswitcher.setAttribute("accesskey", 'p');
	let menu_PSPopup = doc.createElement("menupopup");
	menu_PSPopup.setAttribute("id", "personaswitcher-main-menubar-popup");
	menu_PSPopup.setAttribute("onpopuphidden", "PersonaSwitcher.popupHidden();");
	let item3 = doc.createElementNS ('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'menuitem');
	item3.setAttribute("label", "Item");
	menu_PSPopup.appendChild(item3);
	menu_personaswitcher.appendChild(menu_PSPopup);
	let menu_tools = doc.getElementById("tools-menu");
	doc.getElementById("main-menubar").insertBefore(menu_personaswitcher, menu_tools.nextSibling);
	
}

function injectIntoThunderbird(window) {
	//Not implemented yet
}

function injectIntoSeamonkey(window) {
	//Not implemented yet
}

function injectIntoIcedove(window) {
	//Not implemented yet
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
