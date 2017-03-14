#include "..\library\_PSTestingLibrary.au3"

;-----------------------------------------------------------------------------;

Local $testName = "Menu Shortcuts Preferences" ;
Local $tests[5] ; size of array = number of tests

; start Firefox and setup for tests
InitializeFirefox()

; run tests and store results
$tests[0] = MainMenuShortCutKey()
$tests[1] = ChangedMainMenuShortCutKeyValue()
$tests[2] = SpecialKeyPSwitcherMenuShortcutKey()
$tests[3] = CombinationPSwitcherMenuShortcutKey()
$tests[4] = DisableMenuShortcut()

; save results to file
SaveResultsToFile($tests, $testName)

ResetPersonaSwitcherPrefs()

; disconnect and close from Firefox
EndFirefox()


;------------------------------------ tests ----------------------------------;
; testing that the default Main menu shortcut key opens the dropdown menu
Func MainMenuShortCutKey()
	Local $testResults

	ResetToDefaultTheme()

	; get the current theme
	Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

	; opening the preferences menu in personaswitcher addon
	SetPsOption('main-menubar', True)

;-----------------------------------------------------------------------------
	;testing the default keyvalue for the main menu dropdown menu ("Alt + P")
	; by selecting a different theme to verify that such menu exists
	Send("!P")
	Sleep(500)
	Send("{DOWN}")
	Sleep(500)
	Send("{ENTER}")
	Sleep(500)

	; check that theme at the start of the test has been changed
	If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not changed through the Main Menu Shortcut Key: Alt + P"
	Else
	  $testResults = "TEST PASSED: theme was changed through the the Main Menu Shortcut Key: Alt + P"
	EndIf
	Return $testResults
EndFunc

;******************************************************************************
; Testing that the change of the keyvalue in the Main menu shorcut key will dropdown
; the menu and will change the theme
Func ChangedMainMenuShortCutKeyValue()
	Local $testResults

	ResetToDefaultTheme()

	; get the current theme
	Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

	;changing the keyvalue of the main menu
;----------------------------------------------------------------------
	;getting to the addon's preferences	as it is already selected, we only need to press enter
    SetPsOption('accesskey', "L")

	;testing if the Main Menu will open with the new shortcut key
	Send("!L")
	Sleep(500)

	Send("{DOWN}")
	Sleep(500)

	Send("{ENTER}")
	Sleep(500)

	; check that theme at the start of the test has been changed
	If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not changed through the Modified Main Menu Shorcut Key: Alt + L"
	Else
	  $testResults = "TEST PASSED: theme was changed through the Modified Main Menu Shortcut Key: Alt + L"
	EndIf
	Return $testResults
EndFunc

;******************************************************************************
; Testing that the new special key combinations will activate the dropdown menu
; from the PSwitcher menu as they become the new shortcut key, the test will try
; to change the theme through the PSwitcher menu
Func SpecialKeyPSwitcherMenuShortcutKey()
Local $testResults

	ResetToDefaultTheme()

	; get the current theme
	Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

	;changing the value of the special keys for the PSwitcher menu shortcut keys
	;----------------------------------------------------------------
	;getting to the addon's preferences

   SetPsOption('activateshift', True)
   SetPsOption('activatecontrol', False)
   SetPsOption('activatealt', True)

	;Trying to open the PSwitchermenu through the new shortcut
	Send("+!P")
	Sleep(500)

	Send("{DOWN 2}")
	Sleep(500)

	Send("{ENTER}")
	Sleep(500)

	; check that theme at the start of the test has been changed
	If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not changed through the Modified Special key combination in the PSwitcher menu Shorcut Key: Shift + Alt + P"
	Else
	  $testResults = "TEST PASSED: theme was changed through the Modified Special key combination in the PSwitcher menu Shorcut Key: Shift + Alt + P"
	EndIf
	Return $testResults
EndFunc

;******************************************************************************
; Testing that the new special keys and the key combinations will activate
; the dropdown menu from the PSwitcher, the test will try to
; change the theme to a different one through the PSwitcher menu
Func CombinationPSwitcherMenuShortcutKey()
	Local $testResults

    ResetToDefaultTheme()

	; get the current theme
	Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

	;changing the value of the special keys for the PSwitcher menu shortcut keys
	;----------------------------------------------------------------
	;getting to the addon's preferences

   SetPsOption('activateshift', True)
   SetPsOption('activatecontrol', True)
   SetPsOption('activatealt', True)
   SetPsOption('activatekey', 'W')

	;Trying to open the PSwitchermenu through the new shortcut
	Send("+^!W")
	Sleep(500)

	Send("{DOWN 2}")
	Sleep(500)

	Send("{ENTER}")
	Sleep(500)

	; check that theme at the start of the test has been changed
	If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not changed through the Modified Special key combination in the PSwitcher menu Shorcut Key: Shift + Alt + CTRL + W"
	Else
	  $testResults = "TEST PASSED: theme was changed through the Modified Special key combination in the PSwitcher menu Shorcut Key: Shift + Alt + CTRL + W"
	EndIf
	Return $testResults
EndFunc

;******************************************************************************
; tests a theme change through the personaswitcher toolbar menu to check if the
; Menu shortcut "CTRL+ALT+ P" changes the theme when the Main Menu bar is disabled
Func DisableMenuShortcut()
   Local $testResults

   ResetToDefaultTheme()

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

    ;returning the menu back to normal for the disableMenushortcut
	;changing the value of the special keys for the PSwitcher menu shortcut keys
	;----------------------------------------------------------------
	;getting to the addon's preferences

	;Get to the option select
    Send("{ENTER}")
    Sleep(1000)
	;----------------------------------------------------------------

   SetPsOption('activateshift', False)
   SetPsOption('activatecontrol', True)
   SetPsOption('activatealt', True)
   SetPsOption('activatekey', 'p')

	;Opening the dropdown throught the shortcut
	Send("^!p")
	Sleep(500)

	;Choosing a different theme
	Send("{RIGHT}")
	Sleep(500)
	Send("{DOWN}")
	Sleep(500)
	Send("{ENTER}")
	Sleep(500)

	; check that theme at the start of the test has been changed
	If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not changed through the Disabled Main Menu Bar Shortcut"
	Else
	  $testResults = "TEST PASSED: theme was changed through the Disabled Main Menu Bar Shortcut"
	EndIf
   Return $testResults
EndFunc
