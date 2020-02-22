/* global browser, logger, sortThemes, validateCurrentIndex, currentThemes,
   defaultThemes, mouseLeaveListener, currentThemeId, handleError,
   mouseEnterListener, mouseLeaveListener, clickListener */

var browserActionMenu;
var loadedThemes;

function getMenuData() 
{
    var menuPreferences = ["iconPreview", "preview", "previewDelay", "current",
                            "currentThemeId"];
    var getData = Promise.all([
        browser.storage.local.get(menuPreferences),
        browser.management.getAll()
    ]);
    return Promise.resolve(getData);
}

function buildBrowserActionMenu(data) 
{
    let prefs = data[0];
    let themes = data[1];  
    logger.log("Start building BAMenu");

    sortThemes(themes);
    prefs.current = validateCurrentIndex(prefs.current, prefs.currentThemeId);
    browserActionMenu = document.createElement("div");
    browserActionMenu.setAttribute("class", "menu");
    for (let index = 0; index < currentThemes.length; index++) 
    {        
        browserActionMenu.
            appendChild(buildMenuItem(currentThemes[index], prefs, index));
    }

    insertSeparator();

    // Skip one index value between current and default themes to make it
    // map easier to the index values of the children of browserActionMenu where  
    // the skipped index corresponds to the separator child node between theme 
    // types
    var indexOffset = currentThemes.length+1;
    for (let index = 0; index < defaultThemes.length; index++) 
    {        
        browserActionMenu.
            appendChild(buildMenuItem(defaultThemes[index], prefs,
                                                    index + indexOffset));
    }

    browserActionMenu.addEventListener('mouseleave',
                    mouseLeaveListener('browserActionMenu', prefs.preview));
    loadedThemes = browserActionMenu.children;
    logger.log("End building BAMenu");
    return prefs.current;
}

function buildMenuItem(theme, prefs, theIndex) 
{
    var themeChoice = document.createElement("option");
    themeChoice.setAttribute("class", "button theme");
    themeChoice.setAttribute("id", theme.id);
    var textNode = document.createTextNode(theme.name);
    themeChoice.appendChild(textNode);

    // Cannot access theme icons at present. Uncomment when the management API 
    // is updated.
    /* themeChoice.insertBefore(createIcon(theme.icons[0].url, prefs.iconPreview),
                             textNode);*/

    if (theIndex === prefs.current) 
    {
        themeChoice.selected = true;
        let currentThemeId = theme.id;
        if(prefs.currentThemeId !== currentThemeId)
        {
            browser.storage.local.set({"currentThemeId": currentThemeId})
                .catch(handleError);
        }
    }

    if (true === prefs.preview) 
    {
        themeChoice.addEventListener('mouseenter',
                        mouseEnterListener(theme, prefs.previewDelay));
        themeChoice.addEventListener('mouseleave',
                        mouseLeaveListener('button theme', prefs.preview));
    }
    themeChoice.addEventListener('click', clickListener(theme, theIndex));
    return themeChoice;
}

// Function is unused at present. Uncomment for use when the management API is
// developed sufficiently to allow the addition of icons to the menu   
/* function createIcon(iconURL, iconPreview) 
{
    var themeImg = document.createElement("img");
    themeImg.setAttribute("class", "button icon");
    themeImg.setAttribute("src", iconURL);

    if (false === iconPreview) 
    {
        themeImg.style.display = "none";
    }    
    return themeImg;
}*/

function insertSeparator() 
{
    var separator = document.createElement("hr");
    separator.setAttribute("class", "menu-separator");
    browserActionMenu.appendChild(separator);
}

// Function is unused at present. Uncomment for use when the management API is
// developed sufficiently to allow the addition of icons to the menu   
/* function toggleMenuIcons(iconsShown) 
{
    var displayValue;
    if (true === iconsShown) 
    {
        displayValue = "inline";
    } 
    else 
    {
        displayValue = "none";
    }        
    
    var icons = browserActionMenu.querySelectorAll(".icon");
    for (let index = 0; index < icons.length; index++) 
    {
        logger.log("Icon Node", icons[index]);
        icons[index].style.display = displayValue;
    }
}*/

function buildToolsSubmenu(current) 
{
    browser.storage.local.get("toolsMenu").then((pref) =>
    {
        if(true === pref.toolsMenu)
        {
            for(let index = 0; index < currentThemes.length; index++) 
            {
                browser.menus.create({
                  id: String(index),
                  type: 'radio',
                  checked: current === index,
                  title: currentThemes[index].name,
                  contexts: ["tools_menu"]// ,
                  // icons: {
                  // '16': currentThemes[index].icons[0].url}
                });
            }

            browser.menus.create({
                  id: "separator",
                  type: 'separator',
                  contexts: ["tools_menu"]
                });

            for(let index = 0; index < defaultThemes.length; index++) 
            {
                browser.menus.create({
                  id: String(index + currentThemes.length + 1),
                  type: 'radio',
                  checked: (current - (currentThemes.length + 1)) === index,
                  title: defaultThemes[index].name,
                  contexts: ["tools_menu"]// ,
                  // icons: {
                  // '16': defaultThemes[index].icons[0].url}
                });
            }
        }
    });    
}

function removeToolsSubmenu() 
{
    // Because menus.remove is limited to one item at a time and is asynchronous
    // it is currently quicker to simply remove all items and then replace the
    // context menu Options Page and Reload Themes items. If more items are 
    // added to the context menu later, this may need to be changed to removing 
    // all the tools menu items individually.
    return browser.menus.removeAll().then(buildContextMenu);
}

function buildContextMenu() 
{ 
    browser.menus.create(
    {
          id: "TMOptions",
          title: "Thematic Options",
          contexts: ["browser_action"]
    });
    browser.menus.create(
    {
          id: "ReloadThemes",
          title: "Refresh Thematic Themes",
          contexts: ["browser_action"]
    });
}


function updateBrowserActionSelection(newIndex, oldIndex)
{
    if('undefined' !== typeof(oldIndex) && oldIndex < loadedThemes.length) 
        {
            loadedThemes[oldIndex].selected = false;
        }
        loadedThemes[newIndex].selected = true;  
}

function updateToolsMenuSelection(newIndex, oldIndex)
{
    browser.storage.local.get("toolsMenu").then((pref) =>
        {
            if(true === pref.toolsMenu) 
            {
                logger.log(`Setting tools menu selection to ${newIndex}`);
                // ...??? The manual update of checked: true correctly updating
                // the newly checked item and unchecking the old only works
                // when the new item appears after the old checked item in the
                // context menu. Currently the best work around is simply to
                // always uncheck the old item.                
                let updateToolMenu = browser.menus
                          .update(String(oldIndex), {checked: false});
                updateToolMenu.catch(handleError);

                updateToolMenu = browser.menus
                           .update(String(newIndex), {checked: true});
                updateToolMenu.catch(handleError);
            }
        }); 
}

function rebuildMenus() 
{
    removeToolsSubmenu().then(getMenuData)
                        .then(buildBrowserActionMenu)
                        .then(buildToolsSubmenu)
                        .catch(handleError);
}
