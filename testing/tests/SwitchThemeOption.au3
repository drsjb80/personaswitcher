#include "..\library\_PSTestingLibrary.au3"
;-----------------------------------------------------------------------------;

Local $testName = "Switch Theme Option"
Local $tests[7]

; start Firefox and setup for tests
InitializeFirefox()

; run tests and store results
$tests[0] = SwitchTheme()
$tests[1] = NoSwitch()
$tests[2] = SwitchThemeOneMin()
$tests[3] = SwitchThemeOneMinWithKeys()
$tests[4] = SwitchThemeHappyValue()
$tests[5] = SwitchThemeMinValue()
$tests[6] = SwitchThemeMaxValue()

; save results to file
SaveResultsToFile($tests, $testName)

; reset preferences
ResetPersonaSwitcherPrefs()

; disconnect and close from Firefox
EndFirefox()

;------------------------------------ tests ----------------------------------;
; Testing that the theme changes when the "Switch every __ minutes"
; preference is enabled
Func SwitchTheme()
   Local $testResults

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; Enable switch theme preference
   SetPsOption("auto", True)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
      $testResults = "TEST FAILED: the theme did not change as soon as the preference was enabled"
   Else
      $testResults = "TEST PASSED: the theme changed as soon as the preference was enabled"
   EndIf

   ResetPsOption("auto")
   Return $testResults
EndFunc

;******************************************************************************
; Testing that the theme does not change when the "Switch every __ minutes"
; preference goes from enabled to disabled
Func NoSwitch()
   Local $testResults

   ; Enable switch theme preference
   SetPsOption("auto", True)

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; Disable Switch Theme preference
   SetPsOption("auto", False)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
      $testResults = "TEST PASSED: the theme stayed the same after disabling the preference"
   Else
      $testResults = "TEST FAILED: the theme changed after disabling the preference"
   EndIf

   ResetPsOption("auto")
   Return $testResults
EndFunc

;******************************************************************************
; Testing that the theme changes after 1 minute when the "Switch every __ minutes"
; preference is enabled and set to 1 minute
Func SwitchThemeOneMin()
   Local $testResults

   ; Enable switch theme preference and to 1 min
   SetPsOption("auto", True)
   SetPsOption("autominutes", "1")

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   Sleep(60000)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
      $testResults = "TEST FAILED: the theme was not changed in 1 minute"
   Else
      $testResults = "TEST PASSED: the theme was changed in 1 minute"
   EndIf

   ResetPsOption("auto")
   ResetPsOption("autominutes")
   Return $testResults
EndFunc
;******************************************************************************
; Testing that the theme changes when "Switch every __ minutes" preference is
; enabled through the shortcut key (default = ctrl + alt + a) and also changes
; again after 1 minute
Func SwitchThemeOneMinWithKeys()
   Local $testResults
   Local $noThemeChange = false

   ; Enable switch theme preference and to 1 min
   SetPsOption("auto", True)
   SetPsOption("autominutes", "1")

   ; get the current theme
   Local $firstTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; Disable switch theme preference
   SetPsOption("auto", False)

   Sleep(500)
   Send("^!a")

   ; get the current theme
   Local $secondTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   Sleep(60000)

   ; check that theme changed when we enabled the preference with the shortcut key
   If $firstTheme == $secondTheme Then
	  $noThemeChange = true;
   EndIf

    ; check that theme changed after 1 min
   If $secondTheme == _FFPrefGet("lightweightThemes.selectedThemeID") OR $noThemeChange Then
      $testResults = "TEST FAILED: the theme did not change after enabling with shortcut key or after 1 minute"
   Else
      $testResults = "TEST PASSED: the theme was changed after enabling with shortcut key and also after in 1 minute"
   EndIf

   ResetPsOption("auto")
   ResetPsOption("autominutes")
   Return $testResults
EndFunc
;******************************************************************************
; Testing that the "happy path" value (1 - 999) of the preference is valid.
Func SwitchThemeHappyValue()
   Local $testResults

   ; Update preference value to 50 min
   Local $valueCopy = SetPsOption("autominutes", "50", True)

   ; check that value is set to the value entered
   If $valueCopy == 50 Then
      $testResults = "TEST PASSED: the value 50 was accepted because it is a valid value"
   Else
      $testResults = "TEST FAILED: the value 50 was not accepted"
   EndIf

   ResetPsOption("autominutes")
   Return $testResults
EndFunc
;******************************************************************************
; Testing that the min value of the preference is 1 and nothing less can be entered.
Func SwitchThemeMinValue()
   Local $testResults

   SetPsOption("auto", True)

   ; Update preference value to 0 min
   Local $valueCopy = SetPsOption("autominutes", "0", True)

   ; check that value is set to the min
   If $valueCopy == 1 Then
      $testResults = "TEST PASSED: the value 0 was not accepted because the min is 1"
   Else
      $testResults = "TEST FAILED: the value 0 was accepted even thought the min is 1"
   EndIf

   ResetPsOption("autominutes")
   Return $testResults
EndFunc
;******************************************************************************
; Testing that the max value of the preference is 999 and nothing larger
; can be entered.
Func SwitchThemeMaxValue()
   Local $testResults

   Local $valueCopy = SetPsOption("autominutes", 1000, True)

   ; Close preferences
   Send("{TAB 10}")
   Sleep(500)
   Send("{ENTER}")

   ; check that value is set to the max
   If $valueCopy == 999 Then
      $testResults = "TEST PASSED: the value 1000 was not accepted because the max is 999"
   Else
      $testResults = "TEST FAILED: the value 1000 was accepted even thought the max is 999"
   EndIf

   ResetPsOption("autominutes")
   Return $testResults
EndFunc