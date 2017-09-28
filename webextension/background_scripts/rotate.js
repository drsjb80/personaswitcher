/* global browser */
"use strict";

var rotateAlarmListener;

function startRotateAlarm() 
{    
    const THREE_SECONDS = (3.0/60.0);
    logger.log("In Rotate Alarm");
    var checkRotatePref = browser.storage.local.
                            get(["auto", "autoMinutes", "fastSwitch"]);
    return checkRotatePref.then((results) => 
    { 
        if (true === results.auto || true === results.fastSwitch) 
        {    
            const periodInMinutes = results.fastSwitch ? THREE_SECONDS :
                                                         results.autoMinutes;
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
        browser.alarms.clear("rotateAlarm");
        browser.alarms.onAlarm.removeListener(rotateAlarmListener);        
    }
}

function rotateOnStartup() 
{
    logger.log("Rotate on Startup");
    var checkRotateOnStartup = browser.storage.local.get("startupSwitch");
    checkRotateOnStartup.then((prefs) => 
    {
        if(true === prefs.startupSwitch) 
        {
            rotate();
        }
    });
}

function autoRotate() 
{
    var checkRotatePref = browser.storage.local.get(["auto", "fastSwitch"]);    
        
    checkRotatePref.then((results) => 
    {
        if (true === results.auto || true === results.fastSwitch) 
        {
            rotate();
        }
    }, handleError);
}

function rotate() 
{
    if (1 >= currentThemes.length) return;

    var getRotatePref = browser.storage.local.get(["random", "current"]);
    getRotatePref.then((results) => 
    {
        logger.log ("Current index before ", results.current);
        var newIndex = results.current;
        if (true === results.random)
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

        logger.log ("Current index after ", newIndex);
        switchTheme(currentThemes[newIndex].id);
        setCurrentTheme(newIndex, results.current, true);
    });    
}
