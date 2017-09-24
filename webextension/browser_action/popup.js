/* global browser */

var backgroundPage;
function appendMenu(page) 
{
    backgroundPage = page;
    document.body.appendChild(backgroundPage.browserActionMenu);
}

function removeMenu() 
{
    // The ownerDocument is set as the last DOM that the element was assigned to.
    // If the menu's ownerDocument remains this window, it will be marked as a 
    // deadObject when this window finishes unloading. Since we don't want to 
    // have to rebuild it, we need to assign it to a window that isn't going to
    // be closed.
    backgroundPage.document.body.appendChild(backgroundPage.browserActionMenu);
}

var gettingBackgroundPage = browser.runtime.getBackgroundPage();
gettingBackgroundPage.then(appendMenu);
window.addEventListener("unload", removeMenu);
window.addEventListener("click", function(clickEvent) 
{
    window.close();
});
