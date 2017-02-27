#cs ----------------------------------------------------------------------------

 AutoIt Version: 3.3.14.2
 Author:         Jim Kim

 Script Function:
	Testing Persona Switcher preferences, Persona menu locations, Tools menu.

#ce --------------------------------------------------------------------------;

#include "PS Testing Library.au3"
;-----------------------------------------------------------------------------;

Local $testName = "Persona Menu Loacations Tests"
Local $tests[4]

InitializeFirefox()

;ResetPersonaSwitcherPrefs()

; run tests
$tests[0] = EnableToolMenuPreferenceTest()
$tests[1] = DisableToolMenuPreferenceTest()
$tests[2] = EnableMainMenuPreferenceTest()
$tests[3] = DisableMainMenuPreferenceTest()

SaveResultsToFile($tests, $testName)

ResetPersonaSwitcherPrefs()

EndFirefox()


;---------------------------Global functions---------------------------------;
Func SelectTheme()
   Send("{f10}")
   Sleep(300)
   Send("t")
   Sleep(300)
   Send("p")
   Sleep(300)
   Send("{ENTER}")
EndFunc

Func CloseAddOnWindow()
   Send("^w")
   Sleep(300)
EndFunc


;----------------Functions for tool menu preference tests--------------------;
Func GetToTheToolMenu()
   Send("{TAB 38}")
   Sleep(300)
EndFunc

Func SaveChangesToolMenu()
   Send("{TAB 2}")
   Sleep(300)
   Send("{ENTER}")
   Sleep(300)
EndFunc

Func NavigateToToolMenu()
   Send("{f10}")
   Sleep(300)
   Send("t")
   Sleep(300)
   Send("{UP}")
   Sleep(300)
   Send("{RIGHT}")
   Sleep(300)

EndFunc

Func ChangeTheme()
   Send("{DOWN}")
   Sleep(300)
   Send("{ENTER}")
   Sleep(300)
EndFunc


;--------------Functions for main menu preference tests----------------------;
Func NavigateToMainMenuChangeTheme()
   Send("{f10}")
   Sleep(300)
   Send("p")
   Sleep(300)
   Send("{DOWN}")
   Sleep(300)
   Send("{ENTER}")
EndFunc

Func GetToTheMainMenuBar()
   Send("{TAB 39}")
   Sleep(300)
EndFunc

Func SaveChangesMainMenu()
   Send("{TAB}")
   Sleep(300)
   Send("{ENTER}")
   Sleep(300)
EndFunc


;---------------------------Tool menu tests----------------------------------;

;~ Test the persona menu locations, tool menu enabled.
;~ Default settings: Tool menu enabled.
;~ Test: Disable the tool menu, then enable in the preferences.
Func EnableToolMenuPreferenceTest()
   Local $testResults

   Call(SelectTheme)

   ;Get the current theme.
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")
   OpenPersonaSwitcherPrefs()
   Call(GetToTheToolMenu)

   ;Unselect and select tool menu.
   Sleep(1200)
   Send("{SPACE}")
   Sleep(1000)
   Send("{SPACE}")
   Sleep(300)

   Call(SaveChangesToolMenu)
   Sleep(300)
   Call(NavigateToToolMenu)
   Call(ChangeTheme)
   Call(CloseAddOnWindow)
   ;Check if the tool menu is enabled.
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then

      $testResults = "Test description: Tools menu disabled then enabled and test to see that the tools menu exist. | Expected result: Pass | Actual Result: TEST FAILED: Tools menu not operational."

   Else
	  $testResults = "Test description: Tools menu disabled then enabled and test to see that the tools menu exist. | Expected result: Pass | Actual Result: TEST PASSED: Tools menu operational."

   EndIf

   Return $testResults

EndFunc


;~ Test the persona menu location, tool menu disabled.
;~ Default settings: Tool menu enabled.
;~ Test: Enable the tool menu in the preferences.
Func DisableToolMenuPreferenceTest()
   Local $testResults

   Call(SelectTheme)

   ;Get the current theme.
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   OpenPersonaSwitcherPrefs()
   Call(GetToTheToolMenu)

   ;Unselect tool menu.
   Sleep(1200)
   Send("{SPACE}")
   Sleep(300)

   Call(SaveChangesToolMenu)
   Call(NavigateToToolMenu)
   Call(ChangeTheme)

   ;Needed in order to close a window since tool menu is disabled.
   Sleep(300)
   Send("^w")
   Sleep(300)

   Call(CloseAddOnWindow)

   ;Check if the tool menu is disabled.
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then

      $testResults = "Test description: Tools menu disabled and test to see that the tools menu does not exist. | Expected result: Fail | Actual Result: TEST FAILED: Tools menu not operational."
   Else
      $testResults = "Test description: Tools menu disabled and test to see that the tools menu does not exist. | Expected result: Fail | Actual Result: TEST PASSED: Tools menu operational."
   EndIf

   Return $testResults

EndFunc


;----------------------- -Main menu bar tests--------------------------------;

;~ Test the Persona Switcher menu locations, main menu bar enabled.
;~ Default settings: Main menu bar disabled.
;~ Test: Enable the main menu bar in the preferences.
Func EnableMainMenuPreferenceTest()
   Local $testResults
   ResetPersonaSwitcherPrefs()

   Call(SelectTheme)

   ;Get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   OpenPersonaSwitcherPrefs()

   Call(GetToTheMainMenuBar)

   ;Select main menu bar
   Sleep(1200)
   Send("{SPACE}")
   Sleep(300)

   Call(SaveChangesMainMenu)
   Call(NavigateToMainMenuChangeTheme)
   Call(CloseAddOnWindow)

   ;Check if the main menu bar is enabled.
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then

      $testResults = "Test description: Main menu bar enabled and test to see that the main menu bar exist.| Expected result: Pass | Actual Result: TEST FAILED: Main menu bar not operational."
   Else
      $testResults = "Test description: Main menu bar enabled and test to see that the main menu bar exist.| Expected result: Pass | Actual Result: TEST PASSED: Main menu bar operational."
   EndIf

   Return $testResults
EndFunc


;~ Test the Persona Switcher menu locations, main menu bar disabled.
;~ Default settings: Main menu bar disabled.
;~ Test: Enable and then disable the main menu bar in the preferences.
Func DisableMainMenuPreferenceTest()
   Local $testResults
   ResetPersonaSwitcherPrefs()

   Call(SelectTheme)

   ;Get the current theme.
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   OpenPersonaSwitcherPrefs()

   Call(GetToTheMainMenuBar)

   ;Select and unselect main menu bar.
   Sleep(1200)
   Send("{SPACE}")
   Sleep(1000)
   Send("{SPACE}")
   Sleep(300)

   Call(SaveChangesMainMenu)
   Call(NavigateToMainMenuChangeTheme)

   ;Needed in order to not disable addon since the Main Menu Bar is disabled.
   Send("{TAB}")
   Sleep(300)
   Send("e")
   Sleep(300)

   Call(CloseAddOnWindow)

   ;Check if the main menu bar is disabled.
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then

      $testResults = "Test description: Main menu bar enabled then disabled and test to see that the main menu bar does not exist.| Expected result: Fail | Actual Result: TEST FAILED: Main menu bar not operational."
   Else
      $testResults = "Test description: Main menu bar enabled then disabled and test to see that the main menu bar does not exist.| Expected result: Fail | Actual Result: TEST PASSED: Main menu bar operational."
   EndIf

   Return $testResults

EndFunc