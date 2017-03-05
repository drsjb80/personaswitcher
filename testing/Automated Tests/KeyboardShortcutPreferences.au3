#include "_PSTestingLibrary.au3"
;-----------------------------------------------------------------------------;

Local $testName = "Keyboard Shortcut Preferences"
Local $tests[9]

; start Firefox and setup for tests
InitializeFirefox()
Local $themeList = GetListOfThemeIds()

; run tests and store results
$tests[0] = DefaultPersona_DifferentKeyAndChar()
$tests[1] = DefaultPersona_ExtraKey()
$tests[2] = RotatePersona_RotateAll($themeList)
$tests[3] = RotatePersona_DifferentKeyAndChar($themeList)
$tests[4] = RotatePersona_ExtraKey($themeList)
$tests[5] = AutoSwitch_DifferentKeyAndChar()
$tests[6] = AutoSwitch_ExtraKey()
$tests[7] = AutoSwitch_DoublePress()
$tests[8] = AutoSwitch_Disable()

; save results to file
SaveResultsToFile($tests, $testName)

ResetPersonaSwitcherPrefs()

; disconnect and close from Firefox
EndFirefox()
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Default Persona
; shortcut will change the theme back to default.
; Changed Ctrl + Alt + D to Shift + Alt + W
Func DefaultPersona_DifferentKeyAndChar()
   Local $testResults
   Local $defaultThemeId
   Local $isDefault = False

   ; Grab default theme
   If (ResetToDefaultTheme()) Then
	  Local $defaultThemeId = _FFPrefGet("lightweightThemes.selectedThemeID")
   EndIf

   ; Select any other theme except default
   SelectTheme()
   Local $selectedTheme =  _FFPrefGet("lightweightThemes.selectedThemeID")

   OpenPersonaSwitcherPrefs()
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB}")
   Sleep(500)
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB 5}")
   Sleep(500)
   Send("W")
   Sleep(500)
   Send("{TAB 34}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; use the new key combination to reset the theme to default
   Send("+!w")
   Sleep(500)

   ; check if the theme is actually the default theme after the shortcut key
   If $defaultThemeId == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	   $isDefault = True
   EndIf

   ; Check if selected theme was changed to default after the shortcut key
   If $selectedTheme ==  $defaultThemeId AND Not $isDefault Then
      $testResults = "TEST FAILED: the default persona shortcut did not change the theme to default theme with the new combination : Shift + Alt + W"
   Else
      $testResults = "TEST PASSED: the default persona shortcut changed the theme to the default with the new combination : Shift + Alt + W"
   EndIf

   _FFPrefReset("extensions.personaswitcher.defcontrol") ; ctrl
   _FFPrefReset("extensions.personaswitcher.defshift") ; shift
   _FFPrefReset("extensions.personaswitcher.defkey") ; key

   Return $testResults
 EndFunc
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Default Persona
; shortcut will change the theme back to default.
; Changed Ctrl + Alt + D to Shift + Ctrl + Alt + D
Func DefaultPersona_ExtraKey()
   Local $testResults
   Local $defaultThemeId
   Local $isDefault = False

   ; Grab default theme
   If (ResetToDefaultTheme()) Then
	  Local $defaultThemeId = _FFPrefGet("lightweightThemes.selectedThemeID")
   EndIf

   ; Select any other theme except default
   SelectTheme()
   Local $selectedTheme =  _FFPrefGet("lightweightThemes.selectedThemeID")

   OpenPersonaSwitcherPrefs()
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB 40}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; use the new key combination to reset the theme to default
   Send("+^!d")
   Sleep(500)

   ; check if the theme is actually the default theme after the shortcut key
   If $defaultThemeId == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	   $isDefault = True
   EndIf

   ; Check if selected theme was changed to default after the shortcut key
   If $selectedTheme ==  $defaultThemeId AND Not $isDefault Then
      $testResults = "TEST FAILED: the default persona shortcut did not change the theme to default theme with the new combination : Shift + Ctrl + Alt + D"
   Else
      $testResults = "TEST PASSED: the default persona shortcut changed the theme to the default with the new combination : Shift + Ctrl + Alt + D"
   EndIf

   _FFPrefReset("extensions.personaswitcher.defshift") ; shift

   Return $testResults
EndFunc
;------------------------------------------------------------------------------
; Testing that Rotate Persona shortcut will rotate through the themes in the
; correct order.
Func RotatePersona_RotateAll($themeList)
   Local $testResults

   ; Select the first theme
   SelectTheme()
   Local $firstTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   For $i = 0 To UBound($themeList)
	  ; grabbing the id of the next theme
	  Local $nextThemeId = GetNextThemeId($themeList)

	  Send("^!r")
	  Sleep(500)

	  Local $currentTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

	  ; ensure the current theme is actually the next theme in the list
	  If $currentTheme == $nextThemeId Then
		 $result = True
	  ElseIf $nextThemeId == $firstTheme Then
		 ; this means we have cycled through them all
		 $result = True
		 ResetRotateCurrentPref(UBound($themeList))
		 ExitLoop
	  Else
		 $result = False
		 ExitLoop
	  EndIf
   Next

   If $result Then
	 $testResults = "TEST PASSED: Rotated through all the personas successfully with the rotate persona shortcut"
   Else
     $testResults = "TEST FAILED: Did not rotate through all the personas successfully wih the rotate persona shortcut"
   EndIf
   Return $testResults
EndFunc
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Rotate Persona
; shortcut will change the theme to the next theme on the rotate list.
; Changed Ctrl + Alt + R to Shift + Alt + W
Func RotatePersona_DifferentKeyAndChar($themeList)
   Local $testResults

   ; Select the first theme
   SelectTheme()

   ; grabbing the id of the next theme
   Local $nextThemeId = GetNextThemeId($themeList)

   OpenPersonaSwitcherPrefs()
   Send("{TAB 7}")
   Sleep(500)
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB}")
   Sleep(500)
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB 5}")
   Sleep(500)
   Send("W")
   Sleep(500)
   Send("{TAB 27}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; use the new key combination to change to the next theme
   Send("+!w")
   Sleep(500)

   Local $currentTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; ensure the current theme is actually the next theme in the list
   If $currentTheme == $nextThemeId Then
	  $testResults = "TEST PASSED: the rotate persona shortcut changed the theme to the next theme on the list with the new combination : Shift + Alt + W"
   Else
      $testResults = "TEST FAILED: the rotate persona shortcut did not change the theme to the next theme on the list with the new combination : Shift + Alt + W"
   EndIF

   _FFPrefReset("extensions.personaswitcher.rotcontrol") ;ctrl
   _FFPrefReset("extensions.personaswitcher.rotshift") ;shift
   _FFPrefReset("extensions.personaswitcher.rotkey") ;key
   ResetRotateCurrentPref(UBound($themeList))

   Return $testResults

EndFunc
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Rotate Persona
; shortcut will change the theme to the next theme on the rotate list.
; Changed Ctrl + Alt + R to Shift + Ctrl + Alt + R
Func RotatePersona_ExtraKey($themeList)
   Local $testResults

   ; Select the first theme
   SelectTheme()

   ; grabbing the id of the next theme
   Local $nextThemeId = GetNextThemeId($themeList)

   OpenPersonaSwitcherPrefs()
   Send("{TAB 7}")
   Sleep(500)
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB 33}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; use the new key combination to change to the next theme
   Send("+^!r")
   Sleep(500)

   Local $currentTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; ensure the current theme is actually the next theme in the list
   If $currentTheme == $nextThemeId Then
	  $testResults = "TEST PASSED: the rotate persona shortcut changed the theme to the next theme on the list with the new combination : Shift + Ctrl + Alt + R"
   Else
      $testResults = "TEST FAILED: the rotate persona shortcut did not change the theme to the next theme on the list with the new combination : Shift + Ctrl + Alt + R"
   EndIf

   _FFPrefReset("extensions.personaswitcher.rotshift") ;shift
   ResetRotateCurrentPref(UBound($themeList))

   Return $testResults
EndFunc
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Toggle Auto Switch
; shortcut will change the theme and enable "Switch every __ minutes" preference.
; Changed Ctrl + Alt + A to Shift + Alt + W
Func AutoSwitch_DifferentKeyAndChar()
   Local $testResults

   OpenPersonaSwitcherPrefs()
   Send("{TAB 14}")
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB}")
   Sleep(500)
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB 5}")
   Sleep(500)
   Send("W")
   Sleep(500)
   Send("{TAB 20}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; use the new key combination to change theme and enable "Switch every __ minutes"
   Send("+!w")
   Sleep(500)

   ; grab the value for the "Switch every __ minutes" preference
   Local $isSwitchEnabled = _FFPrefGet("extensions.personaswitcher.auto")

   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") AND Not $isSwitchEnabled Then
      $testResults = "TEST FAILED: the auto switch shortcut did not change the theme or enabled the 'Switch every __ minutes' preference with the new combination: Shift + Alt + W"
   Else
      $testResults = "TEST PASSED: the auto switch shortcut changed the theme and enabled the 'Switch every __ minutes' preference with the new combination: Shift + Alt + W"
   EndIf

   _FFPrefReset("extensions.personaswitcher.autocontrol") ;ctrl
   _FFPrefReset("extensions.personaswitcher.autoshift") ;shift
   _FFPrefReset("extensions.personaswitcher.autokey") ;key
   _FFPrefReset("extensions.personaswitcher.auto")

   Return $testResults
 EndFunc
 ;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Toggle Auto Switch
; shortcut will change the theme and enable "Switch every __ minutes" preference.
; Changed Ctrl + Alt + A to Shift + Ctrl + Alt + A
Func AutoSwitch_ExtraKey()
   Local $testResults

   OpenPersonaSwitcherPrefs()
   Send("{TAB 14}")
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB 26}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; use the new key combination to change theme and enable "Switch every __ minutes"
   Send("+^!a")
   Sleep(500)

   ; grab the value for the "Switch every __ minutes" preference
   Local $isSwitchEnabled = _FFPrefGet("extensions.personaswitcher.auto")

   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") AND Not $isSwitchEnabled Then
      $testResults = "TEST FAILED: the auto switch shortcut did not change the theme or enabled the 'Switch every __ minutes' preference with the new combination: Shift + Ctrl + Alt + A"
   Else
      $testResults = "TEST PASSED: the auto switch shortcut changed the theme and enabled the 'Switch every __ minutes' preference with the new combination: Shift + Ctrl + Alt + A"
   EndIf

   _FFPrefReset("extensions.personaswitcher.autoshift") ;shift
   _FFPrefReset("extensions.personaswitcher.auto")

   Return $testResults
EndFunc
;------------------------------------------------------------------------------
; Testing that pressing the Toggle Auto Switch shortcut twice will change the
; theme once and disable the "Switch every __ minutes" preference.
Func AutoSwitch_DoublePress()
   Local $testResults

   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   Send("^!a")
   Sleep(500)
   Send("^!a")
   Sleep(500)

   ; checking the current value for the switch preference
   Local $isSwitchEnabled = _FFPrefGet("extensions.personaswitcher.auto")

   If $isSwitchEnabled AND $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
      $testResults = "TEST FAILED: Pressing the auto switch shortcut twice did not change the theme or disable the 'Switch every __ minutes' preference"
   Else
      $testResults = "TEST PASSED: Pressing the auto switch shortcut twice changed the theme once and disabled the 'Switch every __ minutes' preference"
   EndIf

   Return $testResults
EndFunc
;------------------------------------------------------------------------------
; Testing that the Toggle Auto Switch shortcut disables the "Switch every __ minutes"
; preference if it is already enabled.
Func AutoSwitch_Disable()
   Local $testResults

   ; enable the "Switch every __minutes" preference
   OpenPersonaSwitcherPrefs()
   Send("{TAB 29}")
   Sleep(500)
   Send("{SPACE}")
   Sleep(500)
   Send("{TAB 11}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; use the shortcut to disable "Switch every __ minutes"
   Send("^!a")
   Sleep(500)

   ; checking the current value for the switch preference
   Local $isSwitchEnabled = _FFPrefGet("extensions.personaswitcher.auto")

   If $isSwitchEnabled Then
      $testResults = "TEST FAILED: While the 'Switch every __ minutes' preference was enabled, the auto switch shortcut did not disable it"
   Else
	  $testResults = "TEST PASSED: While the 'Switch every __ minutes' preference was enabled, the auto switch shortcut was able to disable it"
   EndIf

   Return $testResults
EndFunc
;------------------------------------------------------------------------------
; Helper function to change the theme, except default
Func SelectTheme()
   ; ensure firefox window is active before proceeding
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Send("{f10}")
   Sleep(500)
   Send("{t}")
   Sleep(500)
   Send("{p}")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)
EndFunc
;------------------------------------------------------------------------------
; Helper function to grab the next theme id in the rotate persona list
Func GetNextThemeId($themeList)
   Local $rotateCurrentIndex = _FFPrefGet("extensions.personaswitcher.current")
   Local $arrayIndex = Mod(($rotateCurrentIndex + 1), (UBound($themeList)-1))

   Return $themeList[$arrayIndex]
EndFunc
;------------------------------------------------------------------------------
; Helper function to manually reset the current index preference for the
; rotate persona shortcut
Func ResetRotateCurrentPref($themeListSize)
   While(_FFPrefGet("extensions.personaswitcher.current") >= $themeListSize-1)
	  Send("^!r")
	  Sleep(500)
	  if(_FFPrefGet("extensions.personaswitcher.current") == 0) Then
		 ExitLoop
	  EndIf
   WEnd
EndFunc