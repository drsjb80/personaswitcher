// https://developer.mozilla.org/en/JavaScript_code_modules
// http://hg.mozdev.org/jsmodules/summary
// https://developer.mozilla.org/en/Code_snippets/Preferences
// LightweightThemeManager.jsm

// https://addons.mozilla.org/en-US/firefox/pages/appversions/

Components.utils.import ("resource://gre/modules/LightweightThemeManager.jsm");
Components.utils.import ("resource://LWTS/PersonaSwitcher.jsm");

const XUL_NS =
    "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

/*
** create a menuitem, possibly creating a preview for mouseover
*/
PersonaSwitcher.createMenuItem = function (which)
{
    var item = document.createElementNS (XUL_NS, "menuitem");

    item.setAttribute ("label", which.name);
    item.addEventListener
    (
        "command",
        function() { PersonaSwitcher.onMenuItemCommand (which); },
        false
    );

    if (PersonaSwitcher.prefs.getBoolPref ("preview"))
    {
        item.addEventListener
        (
            "mouseover",
            function () { LightweightThemeManager.previewTheme (which); },
            false
        );
    }
    return (item);
}

/*
** dump all the properties of an object
*/
PersonaSwitcher.dump = function (object)
{
    for (var property in object)
    {
        PersonaSwitcher.log (property + "=" + object[property]);
    }
}

/*
** dynamically create a menu of installed personas
*/
PersonaSwitcher.createMenuPopup = function (id)
{
    PersonaSwitcher.log (id);

    var menupopup = document.getElementById (id);

    if (menupopup == null)
    {
        PersonaSwitcher.log ("menupopup null!");
        return;
    }

    PersonaSwitcher.log (menupopup.id);

    while (menupopup.hasChildNodes())
    {
        PersonaSwitcher.log ("removing child");
        menupopup.removeChild (menupopup.firstChild);
    }

    var arr = LightweightThemeManager.usedThemes;

    if (arr.length == 0)
    {
        PersonaSwitcher.log ("no themes");

        /*
        ** get the localized message.
        */
        var item = document.createElementNS (XUL_NS, "menuitem");

        item.setAttribute ("label",
            PersonaSwitcher.stringBundle.getString
                ("personaswitcher.noPersonas"));

        menupopup.appendChild (item);
    }
    else
    {
        /*
        ** if we are not previewing, put in the default item.
        */
        if (! PersonaSwitcher.prefs.getBoolPref ("preview"))
        {
            PersonaSwitcher.log ("adding default");

            var item = document.createElementNS (XUL_NS, "menuitem");
            item.setAttribute ("label", "Default");

            item.addEventListener
            (
                "command",
                PersonaSwitcher.setDefault,
                false
            );
            menupopup.appendChild (item);
        }

        for (var i = 0; i < arr.length; i++)
        {
            PersonaSwitcher.log ("adding item number " + i);

            var item = PersonaSwitcher.createMenuItem (arr[i]);
            menupopup.appendChild (item);
        }
    }
}

PersonaSwitcher.buttonPopup = function (event)
{
    PersonaSwitcher.createMenuPopup (event.target.id);
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
    var key = document.createElement ("key");

    key.setAttribute ("id", id); 
    key.setAttribute ("key", which);
    key.setAttribute ("oncommand", command);
    if (mods != "")
        key.setAttribute ("modifiers", mods);

    return (key);
}

PersonaSwitcher.getKeyset = function()
{
    var names = new Array ("mainKeyset", "tasksKeys");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.seachForId (names, types));
}

// http://stackoverflow.com/questions/549650/how-to-dynamically-change-shortcut-key-in-firefox
PersonaSwitcher.setKeyset = function()
{
    var mainKeyset = PersonaSwitcher.getKeyset();

    var keyset = document.getElementById ("personswitcher-keyset");

    if (keyset != null)
    {
        PersonaSwitcher.log ("removing " + keyset.id + " from " +
            mainKeyset.id);

        mainKeyset.removeChild (keyset);
    }

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

    keyset = document.createElement ("keyset");
    keyset.setAttribute ("id", "personswitcher-keyset");

    for (var key in keys)
    {
        keyset.appendChild (PersonaSwitcher.makeKey
            (keys[key][0], keys[key][1], keys[key][2], keys[key][3]));
    }

    PersonaSwitcher.log ("appending " + keyset.id + " to " + mainKeyset.id);
    mainKeyset.appendChild (keyset);
}

PersonaSwitcher.seachForId = function (names, types)
{
    for (var i = 0; i < names.length; i++)
    {
        PersonaSwitcher.log (names[i]);

        var element = document.getElementById (names[i]);

        if (element != null)
        {
            PersonaSwitcher.log (types[i]);
            return (element);
        }
    }

    PersonaSwitcher.log ("couldn't find element");
    return (null);
}

PersonaSwitcher.getToolsMenuPopup = function()
{
    var names = new Array ("menu_ToolsPopup", "taskPopup");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.seachForId (names, types));
}

PersonaSwitcher.getMainMenu = function()
{
    var names = new Array ("main-menubar", "mail-menubar");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.seachForId (names, types));
}

PersonaSwitcher.getToolsMenu = function()
{
    var names = new Array ("tools-menu", "tasksMenu");
    var types = new Array ("firefox", "thunderbird");

    return (PersonaSwitcher.seachForId (names, types));
}

/*
** remove a particular menu, if it exists
*/
PersonaSwitcher.removeMenu = function (id)
{
    PersonaSwitcher.log (id);

    if (id == "tools-submenu")
        var main = PersonaSwitcher.getToolsMenuPopup();
    else if (id == "main-menubar")
        var main = PersonaSwitcher.getMainMenu();
    else
    {
        PersonaSwitcher.log ("unknown id");
        return;
    }

    if (main == null)
    {
        PersonaSwitcher.log ("main == null");
        return;
    }

    var sub = document.getElementById ("personaswitcher-" + id + "-menu");

    PersonaSwitcher.log (main.id);
    PersonaSwitcher.log (sub.id);

    if (sub != null)
        main.removeChild (sub);
    else
        PersonaSwitcher.log ("sub == null");
}

/*
** remove menus that aren't supposed to be visible
*/
PersonaSwitcher.removeMenus = function ()
{
    PersonaSwitcher.log();

    if (! PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
        PersonaSwitcher.removeMenu ("tools-submenu");

    if (! PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
        PersonaSwitcher.removeMenu ("main-menubar")
}

/*
** create a specific menu
*/
PersonaSwitcher.createMenuAndPopup = function (id)
{
    PersonaSwitcher.log (id);

    var menu = document.createElementNS (XUL_NS, "menu");
    menu.setAttribute ("label", "Personas");
    menu.setAttribute ("id", "personaswitcher-" + id + "-menu");

    var menupopup = document.createElementNS (XUL_NS, "menupopup");
    menupopup.setAttribute ("id", "personaswitcher-" + id + "-menupopup");
    menu.appendChild (menupopup);

    PersonaSwitcher.log (menu.id);
    PersonaSwitcher.log (menupopup.id);

    menupopup.addEventListener
    (
        "popupshowing",
        function () { PersonaSwitcher.createMenuPopup
            ("personaswitcher-" + id + "-menupopup"); },
        false
    );
    menupopup.addEventListener
    (
        "popuphidden",
        PersonaSwitcher.hideSubMenu,
        false
    );

    return (menu);
}

/*
** menus and menupopups cannot be shared so we must create them for
** each.
*/
PersonaSwitcher.createMenu = function (which)
{
    PersonaSwitcher.log (which);

    if (document.getElementById ("personaswitcher-" + which + "-menu") != null)
    {
        PersonaSwitcher.log ("already exists");
        return;
    }

    if (which == "tools-submenu")
    {
        var main = PersonaSwitcher.getToolsMenuPopup()
        var sub = PersonaSwitcher.createMenuAndPopup (which);

        PersonaSwitcher.log (main.id);
        PersonaSwitcher.log (sub.id);

        main.appendChild (sub);
    }
    else if (which == "main-menubar")
    {
        var main = PersonaSwitcher.getMainMenu()
        var sub = PersonaSwitcher.createMenuAndPopup (which);
        var where = PersonaSwitcher.getToolsMenu();

        PersonaSwitcher.log (main.id);
        PersonaSwitcher.log (sub.id);
        PersonaSwitcher.log (where.id);

        where = where.nextSibling;
        PersonaSwitcher.log (where.id);

        main.insertBefore (sub, where);
    }
    else
        PersonaSwitcher.log ("unknown menu");
}

PersonaSwitcher.onWindowLoad = function()
{
    PersonaSwitcher.stringBundle = document.getElementById 
        ("stringbundle-personaswitcher");

    PersonaSwitcher.setKeyset();

    if (PersonaSwitcher.prefs.getBoolPref ("tools-submenu"))
        PersonaSwitcher.createMenu ("tools-submenu");
    if (PersonaSwitcher.prefs.getBoolPref ("main-menubar"))
        PersonaSwitcher.createMenu ("main-menubar");
}

window.addEventListener("load", PersonaSwitcher.onWindowLoad, false);

PersonaSwitcher.startTimer();
PersonaSwitcher.migratePrefs();
