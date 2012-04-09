// https://developer.mozilla.org/en/JavaScript_code_modules
// http://hg.mozdev.org/jsmodules/summary
// https://developer.mozilla.org/en/Code_snippets/Preferences
// LightweightThemeManager.jsm

// https://addons.mozilla.org/en-US/firefox/pages/appversions/

Components.utils.import ("resource://gre/modules/LightweightThemeManager.jsm");
Components.utils.import ("resource://LWTS/PersonaSwitcher.jsm");

const XUL_NS =
    "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

PersonaSwitcher.createMenuItem = function (which)
{
    if (PersonaSwitcher.doc != null)
    {
	var item = PersonaSwitcher.doc.createElementNS (XUL_NS, "menuitem");
	item.setAttribute ("label", which.name);
	item.addEventListener
	(
	    'command',
	    function() { PersonaSwitcher.onMenuItemCommand (which); },
	    false
	);

	if (PersonaSwitcher.prefs.getBoolPref ("preview"))
	{
	    item.addEventListener
	    (
		'mouseover',
		function () { LightweightThemeManager.previewTheme (which); },
		false
	    );
	}
    }
    else
    {
        alert ("Persona Switcher: PersonaSwitcher.doc is null!");
        PersonaSwitcher.log (which);
    }

    return (item);
}

// lightweight-theme-list-changed
PersonaSwitcher.subMenu = function (event)
{
    var menupopup = PersonaSwitcher.doc.getElementById
        ("personaswitcher-menupopup");

    if (menupopup != null)
    {
	while (menupopup.hasChildNodes())
	{
	    menupopup.removeChild (menupopup.firstChild);
	}

	if (! PersonaSwitcher.prefs.getBoolPref ("preview"))
	{
	    var item = PersonaSwitcher.doc.createElementNS (XUL_NS, "menuitem");
	    item.setAttribute ("label", "Default");

	    item.addEventListener
	    (
		'command',
		PersonaSwitcher.setDefault,
		false
	    );
	    menupopup.appendChild (item);
	}

	var arr = LightweightThemeManager.usedThemes;

	if (arr.length == 0)
	{
	    var stringBundle = document.getElementById
		("stringbundle_personaswitcher");
	    var changeString = stringBundle.getString ('noPersonas');

	    var item = PersonaSwitcher.doc.createElementNS (XUL_NS, "menuitem");
	    item.setAttribute ("label", changeString);
	    menupopup.appendChild (item);
	}
	else
	{
	    for (var i = 0; i < arr.length; i++)
	    {
		var item = PersonaSwitcher.createMenuItem (arr[i]);
		menupopup.appendChild (item);
	    }
	}
    }
    else
    {
    	PersonaSwitcher.log (event);
    }
}

PersonaSwitcher.hideSubMenu = function ()
{
    if (PersonaSwitcher.prefs.getBoolPref ("preview"))
	LightweightThemeManager.resetPreview();
}

PersonaSwitcher.findMods = function (which)
{
    var mods = "";
    var names = ["shift", "control", "alt", "meta"];

    for (var i in names)
    {
	if (PersonaSwitcher.prefs.getBoolPref (which + names[i]))
	{
	    mods += names[i] + " ";
	}
    }

    return (mods);
}

// http://unixpapa.com/js/key.html

PersonaSwitcher.makeKey = function (id, mods, which, command)
{
    var key = PersonaSwitcher.doc.createElement ("key");
    key.setAttribute ("id", id); 
    if (mods != "")
	key.setAttribute ("modifiers", mods);
    key.setAttribute ("key", which);
    key.setAttribute ("oncommand", command);
    // PersonaSwitcher.doc.addEventListener ("keypress", command, false);
    return (key);
}

// http://stackoverflow.com/questions/549650/how-to-dynamically-change-shortcut-key-in-firefox
PersonaSwitcher.setKeyset = function()
{
    PersonaSwitcher.log();

    var keyset = PersonaSwitcher.doc.getElementById ("default-persona-key").
        parentNode;
    PersonaSwitcher.log(keyset);
    var parent = keyset.parentNode;

    parent.removeChild (keyset);

    keyset = PersonaSwitcher.doc.createElement ("keyset");

    var keys =
    [
	[
	    "default-persona-key",
	    PersonaSwitcher.findMods ("def"),
	    PersonaSwitcher.prefs.getCharPref ("defkey").
	        toUpperCase().charAt (0),
 	    "PersonaSwitcher.setDefault();"
	],
	[
	    "rotate-persona-key",
	    PersonaSwitcher.findMods ("rot"),
	    PersonaSwitcher.prefs.getCharPref ("rotkey").
	        toUpperCase().charAt (0),
	    "PersonaSwitcher.rotateKey();"
	],
	[
	    "auto-persona-key",
	    PersonaSwitcher.findMods ("auto"),
	    PersonaSwitcher.prefs.getCharPref ("autokey").
	        toUpperCase().charAt (0),
	    "PersonaSwitcher.toggleAuto();"
	]
    ];

    for (var i in keys)
    {
	keyset.appendChild (PersonaSwitcher.makeKey
	    (keys[i][0], keys[i][1], keys[i][2], keys[i][3]));
    }

    parent.appendChild (keyset);
}

// can't call this before window is loaded
PersonaSwitcher.onload = function()
{
    PersonaSwitcher.log(window.onload);
    PersonaSwitcher.log();
    PersonaSwitcher.doc = window.document;

    if (PersonaSwitcher.doc != null)
    {
        var element = PersonaSwitcher.doc.getElementById
	    ("personaswitcher-menupopup")
	if (element != null)
	{
	    element.addEventListener ("popupshowing",
	        PersonaSwitcher.subMenu, false);
	    element.addEventListener ("popuphidden",
	        PersonaSwitcher.hideSubMenu, false);
	    PersonaSwitcher.log("added two");
	}
	else
	{
	    PersonaSwitcher.log("element==null");
	}
    }
    else
    {
        alert ("PersonaSwitcher.doc is null!");
        PersonaSwitcher.log ("PersonaSwitcher.doc is null!");
    }

    /*
    var item = PersonaSwitcher.doc.createElementNS (XUL_NS, "menuseparator");
    PersonaSwitcher.doc.getElementById ("contentAreaContextMenu").appendChild (item);

    item = PersonaSwitcher.doc.createElementNS (XUL_NS, "menuitem");
    item.setAttribute ("label", "Previous persona");
    item.addEventListener ('command', PersonaSwitcher.previous, false);
    PersonaSwitcher.doc.getElementById ("contentAreaContextMenu").appendChild (item);

    item = PersonaSwitcher.doc.createElementNS (XUL_NS, "menuitem");
    item.setAttribute ("label", "Next persona");
    item.addEventListener ('command', PersonaSwitcher.rotate, false);
    PersonaSwitcher.doc.getElementById ("contentAreaContextMenu").
        appendChild (item);
    */

    PersonaSwitcher.setKeyset();
}

window.addEventListener ("load", PersonaSwitcher.onload, false);

PersonaSwitcher.migratePrefs = function()
{
    var oldPrefs =
        Components.classes["@mozilla.org/preferences-service;1"].
	    getService (Components.interfaces.nsIPrefService).
	    getBranch ("extensions.themeswitcher.");

    var kids = oldPrefs.getChildList ("", {});
    PersonaSwitcher.log (kids.length);

    if (kids.length == 0)
    {
        return;
    }

    for (var i in kids)
    {
	var type = oldPrefs.getPrefType (kids[i]);
	PersonaSwitcher.log (kids[i]);

	switch (type)
	{
	    case oldPrefs.PREF_STRING:
		PersonaSwitcher.prefs.setCharPref (kids[i],
		    oldPrefs.getCharPref (kids[i]));
		break;
	    case oldPrefs.PREF_INT:
		PersonaSwitcher.prefs.setIntPref (kids[i],
		    oldPrefs.getIntPref (kids[i]));
		break;
	    case oldPrefs.PREF_BOOL:
		PersonaSwitcher.prefs.setBoolPref (kids[i],
		    oldPrefs.getBoolPref (kids[i]));
		break;
	}
    }
    oldPrefs.deleteBranch ("");
}

// can call this before window is loaded so it's only called once
if (PersonaSwitcher.firstTime)
{
    PersonaSwitcher.log("firstTime");
    PersonaSwitcher.doAuto();
    PersonaSwitcher.migratePrefs();
    PersonaSwitcher.firstTime = false;
}
