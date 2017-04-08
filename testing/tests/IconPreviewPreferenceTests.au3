#include "..\library\PSTestingLibrary.au3"

;---------------------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's "add icon-preview
; to menu items" preference

Local $testName = "Icon Preview Preference Tests"
Local $tests[2]

InitializeFirefox()
SetPsOption("main-menubar", True)

$tests[0] = Test_IconPreviewEnabledNoRestart()
$tests[1] = Test_IconPreviewDisabledNoRestart()
If Not($tests[0] And $tests[1]) Then
   ReDim $tests[4]
   $tests[2] = Test_IconPreviewEnabledWithRestart()
   $tests[3] = Test_IconPreviewDisabledWithRestart()
EndIf

SaveResultsToFile($tests, $testName)
EndFirefox()
Exit(0)


;---------------------------------------- tests ----------------------------------------;


; Opens Persona Swithcer's preferences, enables the "add icon-preview to menu items"
; preference, then checks that the persona switcher button, tools, and menubar menus
; have icons next to their menu items.
Func Test_IconPreviewEnabledNoRestart()
   Local $sDescription
   Local $testPassed = False

   ; disable the icon-preview pref and restart firefox before testing enabling it
   If GetPsOption("icon-preview") Then
	  SetPsOption("icon-preview", False)
	  RestartFirefox()
   EndIf

   SetPsOption("icon-preview", True)

   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if all 3 have icons, test passed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $testPassed = True
	  $sDescription = "After enabling the icon-preview preference," & _
		 " all menus have icons without restarting Firefox."
   Else
	  $sDescription = "After enabling the icon-preview preference," & _
		 " the following menus were missing icons (Firefox was not restarted):"
	  If Not $psButtonMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Button Menu"
	  EndIf
	  If Not $psToolsMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Tools Menu"
	  EndIf
	  If Not $psMenubarMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Menubar Menu"
	  EndIf
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc


; Opens Persona Swithcer's preferences, disables the "add icon-preview to menu items"
; preference, then checks that the persona switcher button, tools, and menubar menus
; do not have icons next to their menu items.
Func Test_IconPreviewDisabledNoRestart()
   Local $sDescription
   Local $testPassed = False

   ; enable the icon-preview pref and restart firefox before testing disabling it
   If Not GetPsOption("icon-preview") Then
	  SetPsOption("icon-preview", False)
	  RestartFirefox()
   EndIf
   SetPsOption("icon-preview", False)

   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if any 3 have icons, test failed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $sDescription = "After disabling the icon-preview preference," & _
		 " the following menus still contained icons (Firefox was not restarted):"
	  If $psButtonMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Button Menu"
	  EndIf
	  If $psToolsMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Tools Menu"
	  EndIf
	  If $psMenubarMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Menubar Menu"
	  EndIf
   Else
	  $testPassed = True
	  $sDescription = "After disabling the icon-preview preference," & _
		 " no menus have icons (Firefox was not restarted)."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc


; Opens Persona Swithcer's preferences, enables the "add icon-preview to menu items"
; preference, restarts Firefox, then checks that the persona switcher button, tools,
; and menubar menus have icons next to their menu items.
Func Test_IconPreviewEnabledWithRestart()
   Local $sDescription
   Local $testPassed = False

   SetPsOption("icon-preview", True)
   RestartFirefox()

   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if all 3 have icons, test passed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $testPassed = True
	  $sDescription = "After enabling the icon-preview preference and" & _
		 " restarting Firefox, all menus have icons."
   Else
	  $sDescription = "After enabling the icon-preview preference and" & _
		 " restarting Firefox, the following menus were missing icons:"
	  If Not $psButtonMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Button Menu"
	  EndIf
	  If Not $psToolsMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Tools Menu"
	  EndIf
	  If Not $psMenubarMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Menubar Menu"
	  EndIf
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc


; Opens Persona Swithcer's preferences, disables the "add icon-preview to menu items"
; preference, restarts Firefox, then checks that the persona switcher button, tools,
; and menubar menus do not have icons next to their menu items.
Func Test_IconPreviewDisabledWithRestart()
   Local $sDescription
   Local $testPassed = False

   SetPsOption("icon-preview", False)
   RestartFirefox()

   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if any 3 have icons, test failed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $sDescription = "After disabling the icon-preview preference and" & _
		 " restarting Firefox, the following menus still contained icons:"
	  If $psButtonMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Button Menu"
	  EndIf
	  If $psToolsMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Tools Menu"
	  EndIf
	  If $psMenubarMenuHasIcons Then
		 $sDescription = $sDescription & @CRLF & "  Persona Switcher Menubar Menu"
	  EndIf
   Else
	  $testPassed = True
	  $sDescription = "After disabling the icon-preview preference and" & _
		 " restarting Firefox, no menus have icons."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
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
