/* global browser */
"use strict";

const APPEARS_HIGHER_IN_LIST = -1;
const SAME = 0;
const APPEARS_LOWER_IN_LIST = 1;

var currentThemeId;
var currentThemes = [];
var defaultThemes = [];
var defaultTheme = {id: '{972ce4c6-7e08-4474-a285-3208198ce6fd}'};

function switchTheme(newId)
{
    browser.management.setEnabled(newId, true);
}

function startThemePreview(theme) 
{
    switchTheme(theme.id);
}

function endThemePreview() 
{    
    switchTheme(currentThemeId);
}

function setCurrentTheme(newIndex, oldIndex, updateToolsMenu)
{  
    if(newIndex !== oldIndex)
    {
        updateCurrentThemeId(newIndex);
        updateCurrentIndex(newIndex);        
        updateBrowserActionSelection(newIndex, oldIndex);

        if(true === updateToolsMenu)
        {            
            updateToolsMenuSelection(newIndex, oldIndex);            
        }
    }
}

function updateCurrentThemeId(newIndex) 
{
    if(newIndex < currentThemes.length) 
    {
        currentThemeId = currentThemes[newIndex].id;
    }
    else
    {
        logger.log(newIndex, newIndex - (currentThemes.length+1));
        currentThemeId = defaultThemes[newIndex - (currentThemes.length+1)].id;
    }
    browser.storage.local.set({'currentThemeId': currentThemeId})
        .catch(handleError);
}

function updateCurrentIndex(newIndex)
{
    var updatingCurrentIndex = browser.storage.local.set({current: newIndex});
    updatingCurrentIndex.catch(handleError); 
}


function activateDefaultTheme()
{
    logger.log("In activateDefaultTheme");
    let index = getDefaultThemeIndex();    
    switchTheme(defaultTheme.id);
    var getOldThemeIndex = browser.storage.local.get("current");
    getOldThemeIndex.then((pref) =>
        {
            setCurrentTheme(index, pref.current, true);
        }
    );
}

function getDefaultThemeIndex()
{
    let index;
    for(index = 0; index < defaultThemes.length; index++)
    {
        if(defaultTheme.id === defaultThemes[index].id)
        {
            index = index + currentThemes.length + 1;
            break;
        }
    }
    return index;
}

function sortThemes(addonInfos) 
{
    currentThemes = [];
    for(let info of addonInfos) 
    {
        if("theme" === info.type) 
        {
            logger.log(info.name, info);
            currentThemes.push(info);            
        }
    }

    logger.log ("Themes found", " " + currentThemes.length);

    currentThemes.
        sort(function (a, b) 
        { 
            return a.name.localeCompare(b.name); 
        });
    extractDefaultThemes();
    logger.log ("User installed themes", " " + currentThemes.length);
}

// Assumes currentThemes and defaultThemes are accurate
// (IE sortThemes has been called previously)
function validateCurrentIndex(current, currentThemeId) 
{
    // On first run, the currentThemeId will be null. 
    if('undefined' === typeof(currentThemeId) || null === currentThemeId)
    {
        return findActiveTheme();
    }

    let themesToCheck;
    let themeIndex;
    if(currentThemes.length < current)
    {
        themesToCheck = defaultThemes;
        themeIndex = current - (currentThemes.length + 1);
    }
    else
    {
        themesToCheck = currentThemes;
        themeIndex = current;
    }

    if(true === themesToCheck[themeIndex].enabled)
    {
        return current;
    }
    
    return findActiveTheme();
        
}

function findActiveTheme()
{
    for(let index = 0; index < currentThemes.length; index++)
    {
        if(true === currentThemes[index].enabled)
        {            
            updateCurrentIndex(index);
            return index;
        }
    }

    for(let index = 0; index < defaultThemes.length; index++)
    {
        if(true === defaultThemes[index].enabled)
        {
            index = index + currentThemes.length + 1;
            updateCurrentIndex(index);
            return index;
        }
    }
    return false;
}

function extractDefaultThemes() 
{
    defaultThemes = [];
    var defaultNotFound = true;
    var theme;
    logger.log("Segregating default themes");
    // We do not want to iterate over the array backwards as that would
    // necessitate evaluation of a majority of the array and we want to make
    // this as quick as possible. As such, we account for the removal of items
    // while iterating over the array by decrementing the index to compensate.
    for(let index = 0; index < currentThemes.length; index++) 
    {
        theme = currentThemes[index];
        if(APPEARS_HIGHER_IN_LIST === theme.name.localeCompare("Compact Dark")) 
        {
            continue;
        }
        else if(isDefaultTheme(theme.name)) 
        {
            logger.log(theme.name, " " + theme.id);
            defaultThemes.push(theme);
            currentThemes.splice(index, 1);
            index -= 1; // ESLint set to no unary operators?
            if(defaultNotFound) 
            {
                defaultNotFound = SAME !== theme.name.localeCompare("Default");
            }
        }
        else if(APPEARS_LOWER_IN_LIST === theme.name.localeCompare("Light")) 
        {
            break;
        }
    }

    if(defaultNotFound) 
    {
        defaultThemes.push(defaultTheme);
    }
}

function isDefaultTheme(themeName)
{
    return  "Compact Dark"  === themeName || 
            "Compact Light" === themeName || 
            "Dark"          === themeName || 
            "Light"         === themeName ||
            "Default"       === themeName;
}

function toolsMenuThemeSelect(index)
{
    logger.log("Context menu id:", index);
    let themeId;
    if(index < currentThemes.length)
    {
        themeId = currentThemes[index].id;
    }
    else
    {
        themeId = defaultThemes[index-(currentThemes.length+1)].id;
    }
    switchTheme(themeId);

    browser.storage.local.get("current").then((pref) =>
        {
            // Because Mozilla automatically separates the the items above
            // and below a separator into distinct groups, when switching
            // from a default theme to a user installed, or vice versa, the
            // old group's radio button must be disabled manually 
            if((pref.current < currentThemes.length  &&
                index > currentThemes.length) ||
               (pref.current > currentThemes.length  &&
                index < currentThemes.length))
            {
                let updateToolMenu = browser.menus
                      .update(String(pref.current), {checked: false});
                updateToolMenu.catch(handleError);
            }
            
            setCurrentTheme(index, pref.current, false);
        });
}
