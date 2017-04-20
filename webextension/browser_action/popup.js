
const MIDDLE_BUTTON = 1;
var backgroundPage;
function appendMenu(page) 
{
    backgroundPage = page;
    var getPreferences = Promise.all([
        browser.storage.local.get("staticMenus"),
        browser.runtime.sendMessage({command: "Get-Current-Index"})
        ]);
    getPreferences.then((results) => 
    {
        backgroundPage.logger.log("Creating a new menu:" + !results[0].staticMenus);
        if(false === results[0].staticMenus) 
        {
            var gettingMenuData = backgroundPage.getMenuData();
            gettingMenuData
            .then(backgroundPage.buildMenu)
            .then(() => 
            {
                document.body.appendChild(backgroundPage.browserActionMenu);
                backgroundPage.setCurrentTheme(results[1].current);
            })
            .catch(backgroundPage.handleError);
        } 
        else 
        {
            document.body.appendChild(backgroundPage.browserActionMenu);
            backgroundPage.setCurrentTheme(results[1].current);
        }
    });
}

function removeMenu() 
{
    document.body.removeChild(backgroundPage.browserActionMenu);
    //The ownerDocument is set as the last DOM that the element was assigned to.
    //If the menu's ownerDocument remains this window, it will be marked as a 
    //deadObject when this window finishes unloading. Since we don't want to 
    //have to rebuild it, we need to assign it to a window that isn't going to
    //be closed.
    backgroundPage.document.body.appendChild(backgroundPage.browserActionMenu);
}

var gettingBackgroundPage = browser.runtime.getBackgroundPage();
gettingBackgroundPage.then(appendMenu);
window.addEventListener("unload", removeMenu);