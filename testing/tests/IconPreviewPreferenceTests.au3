#include "..\library\PSTestingLibrary.au3"

;---------------------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's "add icon-preview
; to menu items" preference

Local $testName = "Icon Preview Preference Tests"
Local $tests[2]

InitializeFirefox()
SetPsOption("main-menubar", True)

$tests[0] = Test_IconPreviewEnabled()
$tests[1] = Test_IconPreviewDisabled()

SaveResultsToFile($tests, $testName)
EndFirefox()
Exit(0)


;---------------------------------------- tests ----------------------------------------;


; Opens Persona Swithcer's preferences, enables the "add icon-preview to menu items"
; preference, then checks that the persona switcher button, tools, and menubar menus
; have icons next to their menu items.
Func Test_IconPreviewEnabled()
   Local $sDescription
   Local $testPassed = False

   ; disable the icon-preview pref and restart firefox before testing enabling it
   If GetPsOption("icon-preview") Then
	  SetPsOption("icon-preview", False)
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
		 " the following menus were missing icons:"
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
Func Test_IconPreviewDisabled()
   Local $sDescription
   Local $testPassed = False

   ; enable the icon-preview pref and restart firefox before testing disabling it
   If Not GetPsOption("icon-preview") Then
	  SetPsOption("icon-preview", False)
   EndIf
   SetPsOption("icon-preview", False)

   ; check ps button, tools, and menubar for icons, store as booleans
   Local $psButtonMenuHasIcons = MenuHasIcons("personaswitcher-button-popup")
   Local $psToolsMenuHasIcons = MenuHasIcons("personaswitcher-tools-submenu-popup")
   Local $psMenubarMenuHasIcons = MenuHasIcons("personaswitcher-main-menubar-popup")
   ; if any 3 have icons, test failed
   If $psButtonMenuHasIcons And $psToolsMenuHasIcons And $psMenubarMenuHasIcons Then
	  $sDescription = "After disabling the icon-preview preference," & _
		 " the following menus still contained icons:"
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
		 " no menus have icons."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc


;------------------------------------ helper functions ---------------------------------;

; checks that an element (by id) has icons next its menu items
Func MenuHasIcons(ByRef $sElementId)
   Local $themeCount = Int(_FFCmd('document.getElementById("' & $sElementId & '").childElementCount'))

   For $i = 0 To $themeCount - 1
	  If StringLen(_FFCmd('document.getElementById("' & $sElementId & '").childNodes[' & String($i) & '].attributes.image')) == 0 Then
		 Return False
	  EndIf
   Next

   return True
EndFunc
