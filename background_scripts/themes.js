/* global browser, updateBrowserActionSelection, updateToolsMenuSelection,
   logger, handleError */


const APPEARS_HIGHER_IN_LIST = -1;
const SAME = 0;
const APPEARS_LOWER_IN_LIST = 1;
const NUM_DEFAULT_THEMES = 3;

var currentThemeId;
var currentThemes = [];
var defaultThemes = [];
// Legacy default theme ID:
//var defaultTheme = {id: '{972ce4c6-7e08-4474-a285-3208198ce6fd}'};
// TODO: add in logic at startup that assigns the correct default theme id based on FF version
var defaultTheme = {id: 'default-theme@mozilla.org'};

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

function setCurrentTheme(newIndex, oldIndex)
{  
    if(newIndex !== oldIndex)
    {
        updateCurrentThemeId(newIndex);
        updateCurrentIndex(newIndex);
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
        currentThemeId = defaultThemes[newIndex - (currentThemes.length+1)].id;
    }
    browser.storage.local.set({'currentThemeId': currentThemeId})
        .catch(handleError);
}

function updateCurrentIndex(newIndex)
{
    let updatingCurrentIndex = browser.storage.local.set({current: newIndex});
    updatingCurrentIndex.catch(handleError); 
}


function activateDefaultTheme()
{
    logger.log("Activating default theme");
    let index = getDefaultThemeIndex();    
    switchTheme(defaultTheme.id);
    let getOldThemeIndex = browser.storage.local.get("current");
    getOldThemeIndex.then((pref) =>
        {
            setCurrentTheme(index, pref.current);
            updateBrowserActionSelection(index, pref.current);
            updateToolsMenuSelection(index, pref.current);
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
            logger.log(info.name, info.id);
            currentThemes.push(info);            
        }
    }

    logger.log (`Themes found ${currentThemes.length}`);

    currentThemes.
        sort(function (a, b) 
        { 
            return a.name.localeCompare(b.name); 
        });
    extractDefaultThemes();
    logger.log (`User installed themes ${currentThemes.length}`);
}

// Assumes currentThemes and defaultThemes are accurate
// (IE sortThemes has been called previously)
function validateCurrentIndex(current, currentThemeId) 
{
    // On first run, the currentThemeId will be null. The current index skips
    // the index value at currentThemes.length to account for the separator. So,
    // if the current index is equal to currentThemes.length the theme list has
    // changed and the new active theme must be found. Likewise, if the current
    // index is greater than the last possible default theme index, the theme
    // list has changed and the new active theme must be found.
    if('undefined' === typeof(currentThemeId) || 
        null === currentThemeId ||
        currentThemes.length === current ||
        current > currentThemes.length + defaultThemes.length)
    {
        return findActiveTheme();
    }

    let themesToCheck;
    let themeIndex;
    logger.log(`User themes ${currentThemes.length}, Current index ${current}`);
    if(currentThemes.length < current)
    {
        themesToCheck = defaultThemes;
        themeIndex = current - (currentThemes.length + 1);
        logger.log(`Validating default theme ${themeIndex}`);
    }
    else
    {
        themesToCheck = currentThemes;
        themeIndex = current;        
        logger.log(`Validating user installed theme ${themeIndex}`);
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
    var numDefaultsFound = 0;
    var defaultNotFound = true;
    var theme;
    logger.log("Segregating default themes");
    // We do not want to iterate over more of the array than we have to. So we
    // break out once we have found all the pre-installed default themes.
    for(let index = 0; index < currentThemes.length; index++) 
    {
        theme = currentThemes[index];
        if(isDefaultTheme(theme.id)) 
        {
            logger.log(`${theme.name} ${theme.id}`);
            numDefaultsFound += 1;
            defaultThemes.push(theme);
            currentThemes.splice(index, 1);
            index -= 1;
            if(defaultNotFound) 
            {
                defaultNotFound =
                    (SAME !== theme.id.localeCompare("{972ce4c6-7e08-4474-a285-3208198ce6fd}") &&
                     SAME !== theme.id.localeCompare("default-theme@mozilla.org"));
            }
            if(NUM_DEFAULT_THEMES == numDefaultsFound)
            {
                break;
            }
        }
    }

    if(defaultNotFound) 
    {
        defaultThemes.push(defaultTheme);
    }
}

function isDefaultTheme(themeId)
{
    let defaults = ["firefox-compact-dark@mozilla.org@personas.mozilla.org",
    "firefox-compact-light@mozilla.org@personas.mozilla.org",
    "firefox-compact-dark@mozilla.org",
    "firefox-compact-light@mozilla.org",
    "default-theme@mozilla.org",
    "{972ce4c6-7e08-4474-a285-3208198ce6fd}"];
    return defaults.includes(themeId);

    /*
    return "firefox-compact-dark@mozilla.org@personas.mozilla.org"  === themeId 
    || "firefox-compact-light@mozilla.org@personas.mozilla.org" === themeId
    || "firefox-compact-dark@mozilla.org"  === themeId
    || "firefox-compact-light@mozilla.org" === themeId
    || "default-theme@mozilla.org" === themeId
    || "{972ce4c6-7e08-4474-a285-3208198ce6fd}" === themeId; //Legacy default theme uuid for older versions of FF
    */
}

function toolsMenuThemeSelect(index)
{
    logger.log(`Selecting theme ${index}`);
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
            
            setCurrentTheme(index, pref.current);
            updateBrowserActionSelection(index, pref.current);
        });
}
