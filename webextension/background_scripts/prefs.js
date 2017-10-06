/* global browser, getMenuData, buildBrowserActionMenu, handleError, setLogger,
   stopRotateAlarm, startRotateAlarm, buildToolsSubmenu, removeToolsSubmenu */


function handlePrefChange(changes, area) 
{ 
      var changedPrefs = Object.keys(changes);
 
      for (let pref of changedPrefs) 
      {
        if ('undefined' !== typeof(changes[pref].newValue) && 
            changes[pref].oldValue !== changes[pref].newValue &&
            'local' === area) 
        {
            reactToPrefChange(pref, changes[pref]);
        }
    }
}

function reactToPrefChange(prefName, prefData) 
{
    switch (prefName) 
    {
        case 'iconPreview':
            // Function is unused at present. Uncomment for use when the
            // management API is developed sufficiently to allow the addition   
            // of icons to the menu 
            // toggleMenuIcons(prefData.newValue);
            break;
        case 'preview': // falls through to previewDelay
        case 'previewDelay':
            getMenuData().then(buildBrowserActionMenu, handleError);
            break;
        case 'debug':
            setLogger();
            break;
        case 'autoMinutes':
            var getAutoSwitch = browser.storage.local.get("auto");
            getAutoSwitch.then((pref) =>
            {
                if(true === pref.auto)
                {
                    stopRotateAlarm();
                    startRotateAlarm();                        
                }
            });
            break;
        case 'fastSwitch': // falls through to auto
        case 'auto':
            if(true === prefData.newValue) 
            {
                startRotateAlarm();                
            }
            else 
            {
                stopRotateAlarm();                
            }
            break;
        case 'toolsMenu':
            if(true === prefData.newValue) 
            {
                var getCurrentIndex = browser.storage.local.get("current");
                getCurrentIndex.then((pref) =>
                {
                    buildToolsSubmenu(pref.current);                    
                });
            } 
            else
            {
                removeToolsSubmenu();
            }
            break;
        default:
            // ignore the others
    }
}
