/* global browser, logger, stopRotateAlarm, startRotateAlarm, switchTheme,
   setCurrentTheme, startThemePreview, endThemePreview,
   updateBrowserActionSelection, updateToolsMenuSelection */


var previewAlarmListener;

var clickListener = function(theTheme, theIndex) 
{ 
    return function() 
    {
        stopRotateAlarm(); 
        browser.storage.local.get("current").then((result) => 
            {
                logger.log(`Switching from ${result.current} to ${theIndex}`);
                switchTheme(theTheme.id, result.current);
                setCurrentTheme(theIndex, result.current);
                updateBrowserActionSelection(theIndex, result.current);
                updateToolsMenuSelection(theIndex, result.current);
            });
        startRotateAlarm(); 
    };
};

var mouseEnterListener = function(theTheme, previewDelay) 
{
    const MS_TO_MINUTE_CONVERSION = 60000;
    return function() 
    { 
        const delayInMinutes = previewDelay/MS_TO_MINUTE_CONVERSION;
        var innerAlarmListener = function(alarmInfo) 
        {
            startThemePreview(theTheme);
        };
        previewAlarmListener = innerAlarmListener;
        browser.alarms.create("previewAlarm", {delayInMinutes});
        browser.alarms.onAlarm.addListener(previewAlarmListener);
    };
};

var mouseLeaveListener = function(elementClass, preview) 
{ 
    return function() 
    { 
        if(preview)
        {
            browser.alarms.clear("previewAlarm");
            browser.alarms.onAlarm.removeListener(previewAlarmListener);
            if('browserActionMenu' === elementClass)
            {
                endThemePreview();
            } 
        }
    };
};