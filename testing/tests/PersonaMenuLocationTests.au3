#include "..\library\PSTestingLibrary.au3"

;---------------------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's "tools-submenu"
; and "main-menubar" preferences

Local $testName = "Persona Menu Loacations Tests"
Local $tests[4]

InitializeFirefox()

; run tests
$tests[0] = EnableToolMenuPreferenceTest()
$tests[1] = DisableToolMenuPreferenceTest()
$tests[2] = EnableMainMenuPreferenceTest()
$tests[3] = DisableMainMenuPreferenceTest()

SaveResultsToFile($tests, $testName)
ResetPersonaSwitcherPrefs()
EndFirefox()


;---------------------------Tool menu tests----------------------------------;

;~ Test the persona menu locations, tool menu enabled.
;~ Default settings: Tool menu enabled.
;~ Test: Disable the tool menu, then enable in the preferences.
Func EnableToolMenuPreferenceTest()
   Local $sDescription
   Local $testPassed = False

   SetPsOption("tools-submenu", False)
   SetPsOption("tools-submenu", True)

   OpenPersonaSwitcherToolsMenu()
   Sleep(500)
   Local $toolsMenuWasOpened = Not ToolsMenuIsHidden()
   Send("{ESCAPE}")

   ;Check if the popup opened
   If $toolsMenuWasOpened Then
	  $testPassed = True
      $sDescription = "After enabling the tools-submenu preference, the persona switcher tools menu existed."
   Else
	  $sDescription = "After enabling the tools-submenu preference, the persona switcher tools menu did not exist."
   EndIf

   Return FormatTestString($testPassed, $sDescription)

EndFunc


;~ Test the persona menu location, tool menu disabled.
;~ Default settings: Tool menu enabled.
;~ Test: Enable the tool menu in the preferences.
Func DisableToolMenuPreferenceTest()
   Local $sDescription
   Local $testPassed = False

   ResetPersonaSwitcherPrefs()

   SetPsOption("tools-submenu", True)
   SetPsOption("tools-submenu", False)

   OpenPersonaSwitcherToolsMenu()
   Sleep(500)
   Local $toolsMenuWasOpened = Not ToolsMenuIsHidden()
   Send("{ESCAPE}")

   ;Check that the popup was not opened
   If Not $toolsMenuWasOpened Then
	  $testPassed = True
      $sDescription = "After disabling the tools-submenu preference, the persona switcher tools menu did not exist."
   Else
	  $sDescription = "After disabling the tools-submenu preference, the persona switcher tools menu existed."
   EndIf

   Return FormatTestString($testPassed, $sDescription)

EndFunc


;----------------------- -Main menu bar tests--------------------------------;

;~ Test the Persona Switcher menu locations, main menu bar enabled.
;~ Default settings: Main menu bar disabled.
;~ Test: Enable the main menu bar in the preferences.
Func EnableMainMenuPreferenceTest()
   Local $sDescription
   Local $testPassed = False

   ResetPersonaSwitcherPrefs()

   SetPsOption("main-menubar", False)
   SetPsOption("main-menubar", True)

   OpenPersonaSwitcherMenuBar()
   Sleep(500)
   Local $menuBarWasOpened = Not MenuBarIsHidden()
   Send("{ESCAPE}")

   ;Check if the popup opened
   If $menuBarWasOpened Then
	  $testPassed = True
      $sDescription = "After enabling the main-menubar preference, the persona switcher main-menubar existed."
   Else
	  $sDescription = "After enabling the main-menubar preference, the persona switcher main-menubar did not exist."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc


;~ Test the Persona Switcher menu locations, main menu bar disabled.
;~ Default settings: Main menu bar disabled.
;~ Test: Enable and then disable the main menu bar in the preferences.
Func DisableMainMenuPreferenceTest()
   Local $sDescription
   Local $testPassed = False

   ResetPersonaSwitcherPrefs()

   SetPsOption("main-menubar", True)
   SetPsOption("main-menubar", False)

   OpenPersonaSwitcherMenuBar()
   Sleep(500)
   Local $menuBarWasOpened = Not MenuBarIsHidden()
   Send("{ESCAPE}")

   ;Check if the popup opened
   If Not $menuBarWasOpened Then
	  $testPassed = True
      $sDescription = "After disabling the main-menubar preference, the persona switcher main-menubar did not exist."
   Else
	  $sDescription = "After disabling the main-menubar preference, the persona switcher main-menubar existed."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc


;------------------------------------ helper functions ---------------------------------;


Func ToolsMenuIsHidden()
   Return _FFCmd('Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
	  '.getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser")' & _
	  '.document.getElementsByAttribute("id", "personaswitcher-tools-submenu")[0].hidden')
   EndFunc

Func MenubarIsHidden()
   Return _FFCmd('Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
	  '.getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser")' & _
	  '.document.getElementsByAttribute("id", "personaswitcher-main-menubar")[0].hidden')
EndFunc