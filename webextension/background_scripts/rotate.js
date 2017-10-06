/* global browser, logger, handleError, currentThemes, switchTheme,
   setCurrentTheme, updateBrowserActionSelection, updateToolsMenuSelection */


var rotateAlarmListener;

function startRotateAlarm() 
{    
    const THREE_SECONDS = (3.0/60.0);
    var checkRotatePref = browser.storage.local.
                            get(["auto", "autoMinutes", "fastSwitch"]);
    return checkRotatePref.then((prefs) => 
    { 
        if (true === prefs.auto || true === prefs.fastSwitch) 
        {    
            logger.log("Starting Rotate Alarm");
            const periodInMinutes = prefs.fastSwitch ? THREE_SECONDS :
                                                         prefs.autoMinutes;
            var innerAlarmListener = function(alarmInfo) 
            {
                if ("rotateAlarm" === alarmInfo.name) 
                {
                    autoRotate();
                } 
            };
            rotateAlarmListener = innerAlarmListener;
            browser.alarms.create("rotateAlarm", {periodInMinutes});
            browser.alarms.onAlarm.addListener(rotateAlarmListener);
        }
        return Promise.resolve();
    });
}

function stopRotateAlarm() 
{
    if ('undefined' !== typeof(rotateAlarmListener)) 
    {
        logger.log("Stopping Rotate Alarm");
        browser.alarms.clear("rotateAlarm");
        browser.alarms.onAlarm.removeListener(rotateAlarmListener);        
    }
}

function rotateOnStartup() 
{
    var checkRotateOnStartup = browser.storage.local.get("startupSwitch");
    checkRotateOnStartup.then((pref) => 
    {
        if(true === pref.startupSwitch) 
        {
            logger.log("Rotating on Startup");
            rotate();
        }
    });
}

function autoRotate() 
{
    var checkRotatePref = browser.storage.local.get(["auto", "fastSwitch"]);    
        
    checkRotatePref.then((prefs) => 
    {
        if (true === prefs.auto || true === prefs.fastSwitch) 
        {
            rotate();
        }
    }, handleError);
}

function rotate() 
{
    if (1 >= currentThemes.length) return;

    var getRotatePref = browser.storage.local.get(["random", "current"]);
    getRotatePref.then((prefs) => 
    {
        logger.log (`Current index before rotate ${prefs.current}`);
        var newIndex = prefs.current;
        if (true === prefs.random)
        {
            var prevIndex = newIndex;
            // pick a number between 1 and the end until a new index is found
            while(newIndex === prevIndex) 
            {
                newIndex = Math.floor ((Math.random() *
                        (currentThemes.length-1)) + 1);
            }
        }
        // If a default theme is active, rotate to the first non-default 
        // theme
        else if(newIndex > currentThemes.length-1) 
        {
            newIndex = 0;
        } 
        else 
        {
            newIndex = (newIndex + 1) % currentThemes.length;
        }

        logger.log (`Current index after rotate ${newIndex}`);
        switchTheme(currentThemes[newIndex].id);
        setCurrentTheme(newIndex, prefs.current);
        updateBrowserActionSelection(newIndex, prefs.current);
        updateToolsMenuSelection(newIndex, prefs.current);
    });    
}
