#include "..\library\PSTestingLibrary.au3"

;---------------------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's menu shortcut
; keys preferences

Local $testName = "Menu Shortcut Preferences Tests" ;
Local $tests[5]

InitializeFirefox()

; run tests and store results
$tests[0] = MainMenuShortCutKey()
$tests[1] = ChangedMainMenuShortCutKeyValue()
$tests[2] = SpecialKeyPSwitcherMenuShortcutKey()
$tests[3] = CombinationPSwitcherMenuShortcutKey()
$tests[4] = DisableMenuShortcut()

SaveResultsToFile($tests, $testName)
EndFirefox()
Exit(0)

;------------------------------------ tests ----------------------------------;
; testing that the default Main menu shortcut key opens the dropdown menu
Func MainMenuShortCutKey()
   Local $sDescription
   Local $testPassed = False

   ResetToDefaultTheme()

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   SetPsOption('main-menubar', True)

   ; testing the default keyvalue for the main menu dropdown menu ("Alt + P")
   ; by selecting a different theme to verify that such menu exists
   Sleep(500)
   Send("!P")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $sDescription = "theme was not changed through the Main Menu Shortcut Key: Alt + P"
   Else
	  $sDescription = "theme was changed through the the Main Menu Shortcut Key: Alt + P"
	  $testPassed = True
   EndIf
   Return FormatTestString($testPassed, $sDescription)
EndFunc

;******************************************************************************
; Testing that the change of the keyvalue in the Main menu shorcut key will dropdown
; the menu and will change the theme
Func ChangedMainMenuShortCutKeyValue()
   Local $sDescription
   Local $testPassed = False

   ResetToDefaultTheme()
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")
   SetPsOption('accesskey', "L")

   ; testing if the Main Menu will open with the new shortcut key
   Sleep(500)
   Send("!L")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $sDescription = "theme was not changed through the Modified Main Menu Shorcut Key: Alt + L"
   Else
	  $sDescription = "theme was changed through the Modified Main Menu Shortcut Key: Alt + L"
	  $testPassed = True
   EndIf
   Return FormatTestString($testPassed, $sDescription)
EndFunc

;******************************************************************************
; Testing that the new special key combinations will activate the dropdown menu
; from the PSwitcher menu as they become the new shortcut key, the test will try
; to change the theme through the PSwitcher menu
Func SpecialKeyPSwitcherMenuShortcutKey()
   Local $sDescription
   Local $testPassed = False

   ResetToDefaultTheme()
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; changing the value of the special keys for the PSwitcher menu shortcut keys

   SetPsOption('activateshift', True)
   SetPsOption('activatecontrol', False)
   SetPsOption('activatealt', True)

   ; Trying to open the PSwitchermenu through the new shortcut
   Sleep(500)
   Send("+!P")
   Sleep(500)
   Send("{DOWN 2}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $sDescription = "theme was not changed through the Modified Special key combination in the PSwitcher menu Shorcut Key: Shift + Alt + P"
   Else
	  $sDescription = "theme was changed through the Modified Special key combination in the PSwitcher menu Shorcut Key: Shift + Alt + P"
	  $testPassed = True
   EndIf
   Return FormatTestString($testPassed, $sDescription)
EndFunc

;******************************************************************************
; Testing that the new special keys and the key combinations will activate
; the dropdown menu from the PSwitcher, the test will try to
; change the theme to a different one through the PSwitcher menu
Func CombinationPSwitcherMenuShortcutKey()
   Local $sDescription
   Local $testPassed = False

   ResetToDefaultTheme()
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; changing the value of the special keys for the PSwitcher menu shortcut keys
   SetPsOption('activateshift', True)
   SetPsOption('activatecontrol', True)
   SetPsOption('activatealt', True)
   SetPsOption('activatekey', 'W')

   ; Trying to open the PSwitchermenu through the new shortcut
   Sleep(500)
   Send("+^!W")
   Sleep(500)
   Send("{DOWN 2}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $sDescription = "theme was not changed through the Modified Special key combination in the PSwitcher menu Shorcut Key: Shift + Alt + CTRL + W"
   Else
	  $sDescription = "theme was changed through the Modified Special key combination in the PSwitcher menu Shorcut Key: Shift + Alt + CTRL + W"
	  $testPassed = True
   EndIf
   Return FormatTestString($testPassed, $sDescription)
EndFunc

;******************************************************************************
; tests a theme change through the personaswitcher toolbar menu to check if the
; Menu shortcut "CTRL+ALT+ P" changes the theme when the Main Menu bar is disabled
Func DisableMenuShortcut()
   Local $sDescription
   Local $testPassed = False

   ResetToDefaultTheme()
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; changing the value of the special keys for the PSwitcher menu shortcut keys
   SetPsOption('activateshift', False)
   SetPsOption('activatecontrol', True)
   SetPsOption('activatealt', True)
   SetPsOption('activatekey', 'p')

   ; Opening the dropdown throught the shortcut
   Sleep(500)
   Send("^!p")
   Sleep(500)

   ; Choosing a different theme
   Send("{RIGHT}")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $sDescription = "theme was not changed through the Disabled Main Menu Bar Shortcut"
   Else
	  $sDescription = "theme was changed through the Disabled Main Menu Bar Shortcut"
	  $testPassed = True
   EndIf
   Return FormatTestString($testPassed, $sDescription)
EndFunc
