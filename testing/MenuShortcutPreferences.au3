#include "PS Testing Library.au3"

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
; testing the that the default Main menu shortcut key opens the dropdown menu
Func MainMenuShortCutKey()
	Local $testResults
	
	SelectingDefaultTheme()
	
	; get the current theme
	Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")
	
	; opening the preferences menu in personaswitcher addon
	OpenPersonaSwitcherPrefs()
	
	Send("{TAB 39}")
	Sleep(1000)
	
	Send("{SPACE}")
	Sleep(1000)
	
	Send("{TAB}")
	Sleep(1000)
	
	Send("{ENTER}")
	Sleep(1000)
;-----------------------------------------------------------------------------	
	;testing the default keyvalue for the main menu dropdown menu ("Alt + P")
	; by selecting a different theme to verify that such menu exists
	Send("!P")
	Sleep(100)
	Send("{DOWN}")
	Sleep(100)
	Send("{ENTER}")
	Sleep(100)
	
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
	
	SelectingDefaultTheme()

	; get the current theme
	Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")
	
	;changing the keyvalue of the main menu
;----------------------------------------------------------------------
	;getting to the addon's preferences	as it is already selected, we only need to press enter
    Send("{ENTER}")
    Sleep(1000)
;----------------------------------------------------------------	
	Send("{TAB 21}")
	Sleep(100)
	
	;changing the keyvalue to L
	Send("L")
	Sleep(500)
	
	;Exit the preferences menu
	Send("{TAB 19}")
	Sleep(500)
	Send("{ENTER}")
	Sleep(500)
	
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
	
	SelectingDefaultTheme()
	
	; get the current theme
	Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

	;changing the value of the special keys for the PSwitcher menu shortcut keys
	;----------------------------------------------------------------	
	;getting to the addon's preferences
	
    Send("{ENTER}")
    Sleep(1000)
	;----------------------------------------------------------------	
	
	Send("{TAB 22}")
	Sleep(500)
	
	Send("{SPACE}")
	Sleep(500)
	
	Send("{TAB}")
	Sleep(500)
	
	Send("{Space}")
	Sleep(500)
	
	;ask if someone can test that the shift alt ctrl plus P changes
	Send("{TAB 17}")
	Sleep(500)
	
	Send("{ENTER}")
	Sleep(500)
	
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
	
    SelectingDefaultTheme()

	; get the current theme
	Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

	;changing the value of the special keys for the PSwitcher menu shortcut keys
	;----------------------------------------------------------------	
	;getting to the addon's preferences
	
	;Get to the option select
    Send("{ENTER}")
    Sleep(1000)
	;----------------------------------------------------------------	
	
	Send("{TAB 23}")
	Sleep(500)
	
	Send("{SPACE}")
	Sleep(500)
	
	Send("{TAB 5}")
	Sleep(500)
	
	Send("W")
	Sleep(500)
	
	;ask if someone can test that the shift alt ctrl plus P changes
	Send("{TAB 17}")
	Sleep(500)
	
	Send("{ENTER}")
	Sleep(500)
	
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

   SelectingDefaultTheme()

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
	
	Send("{TAB 22}")
	Sleep(500)
	
	Send("{SPACE}")
	Sleep(500)
	
	Send("{TAB 6}")
	Sleep(500)
	
	Send("P")
	Sleep(500)
	
	Send("{TAB 11}")
	Sleep(500)
	
	;Disabling the Menu from the Main bar
	;Moving the mouse to the options button of persona and clicking it
	Send("{SPACE}")
	Sleep(500)
	
	Send("{TAB}")
	Sleep(500)
	
	Send("{ENTER}")
	Sleep(500)
	
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
;---------------------------------------------------
Func SelectingDefaultTheme()
	Send("{f10}")
	Sleep(1000)
	Send("t")
	Sleep(1000)
	Send("p")
	Sleep(1000)
	Send("{ENTER}")
	Sleep(1000)
EndFunc