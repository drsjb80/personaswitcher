#include "_PSTestingLibrary.au3"
;---------------------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's "add icon-preview
; to menu items" preference

Local $testName = "Icon Preview Preferences"
Local $tests[4]

InitializeFirefox()

$tests[0] = Test_IconPreviewEnabledNoRestart()
$tests[1] = Test_IconPreviewDisabledNoRestart()
$tests[2] = Test_IconPreviewEnabledWithRestart()
$tests[3] = Test_IconPreviewDisabledWithRestart()

SaveResultsToFile($tests, $testName)
EndFirefox()
Exit(0)


;---------------------------------------- tests ----------------------------------------;


; Opens Persona Swithcer's preferences, enables the "add icon-preview to menu items"
; preference, then checks that the persona switcher button, tools, and menubar menus
; have icons next to their menu items.
Func Test_IconPreviewEnabledNoRestart()
   ; disable the icon-preview pref and restart firefox before testing enabling it
   _FFPrefSet("extensions.personaswitcher.icon-preview", False)
   _FFPrefSet("extensions.personaswitcher.main-menubar", True)
   RestartFirefox()

   If Not _FFPrefGet("extensions.personaswitcher.icon-preview") Then
	  TogglePsIconPreviewPref()
   EndIf

   Local $sResults = ""
   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if all 3 have icons, test passed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $sResults = "TEST PASSED: After enabling the icon-preview preference," & _
		 " all menus have icons without restarting Firefox."
   Else
	  $sResults = "TEST FAILED: After enabling the icon-preview preference," & _
		 " the following menus were missing icons (Firefox was not restarted):"
	  If Not $psButtonMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Button Menu"
	  EndIf
	  If Not $psToolsMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Tools Menu"
	  EndIf
	  If Not $psMenubarMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Menubar Menu"
	  EndIf
   EndIf

   Return $sResults
EndFunc


; Opens Persona Swithcer's preferences, disables the "add icon-preview to menu items"
; preference, then checks that the persona switcher button, tools, and menubar menus
; do not have icons next to their menu items.
Func Test_IconPreviewDisabledNoRestart()
   ; enable the icon-preview pref and restart firefox before testing disabling it
   _FFPrefSet("extensions.personaswitcher.icon-preview", True)
   _FFPrefSet("extensions.personaswitcher.main-menubar", True)
   RestartFirefox()

   If _FFPrefGet("extensions.personaswitcher.icon-preview") Then
	  TogglePsIconPreviewPref()
   EndIf

   Local $sResults = ""
   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if any 3 have icons, test failed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $sResults = "TEST FAILED: After disabling the icon-preview preference," & _
		 " the following menus still contained icons (Firefox was not restarted):"
	  If $psButtonMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Button Menu"
	  EndIf
	  If $psToolsMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Tools Menu"
	  EndIf
	  If $psMenubarMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Menubar Menu"
	  EndIf
   Else
	  $sResults = "TEST PASSED: After disabling the icon-preview preference," & _
		 " no menus have icons (Firefox was not restarted)."
   EndIf

   Return $sResults
EndFunc


; Opens Persona Swithcer's preferences, enables the "add icon-preview to menu items"
; preference, restarts Firefox, then checks that the persona switcher button, tools,
; and menubar menus have icons next to their menu items.
Func Test_IconPreviewEnabledWithRestart()
   _FFPrefSet("extensions.personaswitcher.main-menubar", True)
   ; enable the icon-preview preference and restart firefox
   If Not _FFPrefGet("extensions.personaswitcher.icon-preview") Then
	  TogglePsIconPreviewPref()
   EndIf
   RestartFirefox()

   Local $sResults = ""
   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if all 3 have icons, test passed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $sResults = "TEST PASSED: After enabling the icon-preview preference and" & _
		 " restarting Firefox, all menus have icons."
   Else
	  $sResults = "TEST FAILED: After enabling the icon-preview preference and" & _
		 " restarting Firefox, the following menus were missing icons:"
	  If Not $psButtonMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "Persona Switcher Button Menu"
	  EndIf
	  If Not $psToolsMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "Persona Switcher Tools Menu"
	  EndIf
	  If Not $psMenubarMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "Persona Switcher Menubar Menu"
	  EndIf
   EndIf

   Return $sResults
EndFunc


; Opens Persona Swithcer's preferences, disables the "add icon-preview to menu items"
; preference, restarts Firefox, then checks that the persona switcher button, tools,
; and menubar menus do not have icons next to their menu items.
Func Test_IconPreviewDisabledWithRestart()
   _FFPrefSet("extensions.personaswitcher.main-menubar", True)
   ; enable the icon-preview preference and restart firefox
   If _FFPrefGet("extensions.personaswitcher.icon-preview") Then
	  TogglePsIconPreviewPref()
   EndIf
   RestartFirefox()

   Local $sResults = ""
   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if any 3 have icons, test failed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $sResults = "TEST FAILED: After disabling the icon-preview preference and" & _
		 " restarting Firefox, the following menus still contained icons:"
	  If $psButtonMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Button Menu"
	  EndIf
	  If $psToolsMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Tools Menu"
	  EndIf
	  If $psMenubarMenuHasIcons Then
		 $sResults = $sResults & @CRLF & "  Persona Switcher Menubar Menu"
	  EndIf
   Else
	  $sResults = "TEST PASSED: After disabling the icon-preview preference and" & _
		 " restarting Firefox, no menus have icons."
   EndIf

   Return $sResults
EndFunc


;------------------------------------ helper functions ---------------------------------;

; checks that an element (by id) has icons next its menu items
Func MenuHasIcons(ByRef $sElementId)
   return MozBindingArrayHasIcons(MozBindingStringToArray($sElementId))
EndFunc

; returns true if every menuitem in an array has icons
Func MozBindingArrayHasIcons(ByRef $sMozBindingArray)
   For $i = 0 To UBound($sMozBindingArray) - 1
	  If Not MozBindingHasIcon($sMozBindingArray[$i]) Then
		 Return False
	  EndIf
   Next

   Return True
EndFunc

; returns true if a MozBinding has an icon flag
Func MozBindingHasIcon(ByRef $sMozBinding)
   Return StringRight($sMozBinding, 6) == "iconic"
EndFunc

; grabs every menu item's MozBinding field and returns it as an array
Func MozBindingStringToArray(ByRef $sElementId)
   Local $sMozBinding = _FFCmd('var srcList = [];' & _
	  'Array.from(Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
	  '.getService(Components.interfaces.nsIWindowMediator)' & _
	  '.getMostRecentWindow("navigator:browser").document' & _
	  '.getElementsByAttribute("id", "' & $sElementId & '")[0].children)' & _
		 '.forEach(function(item) {' & _
			'srcList.push(getComputedStyle(item).MozBinding);' & _
		 '});' & _
	  'srcList.toString();')
   Local $sMozBindingArray = StringSplit($sMozBinding, '"', $STR_NOCOUNT)
   For $i = 0 To UBound($sMozBindingArray) - 1 Step 1
	  _ArrayDelete($sMozBindingArray, $i)
   Next
   return $sMozBindingArray
EndFunc
