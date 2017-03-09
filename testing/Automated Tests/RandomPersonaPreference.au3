#include "_PSTestingLibrary.au3"
;---------------------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's "switch to random
; persona instead of least recent" preference

Local $testName = "Random Persona Preference"
Local $rotateKey = "^!r"
Local $tests[3]

InitializeFirefox()
ResetToDefaultTheme()
PersonaSwitcherRotate()

$tests[0] = Test_SwitchToRandomDisabledRotate()
$tests[1] = Test_SwitchToRandomEnabledRotate()
$tests[2] = Test_SwitchToRandomEnabledRestart()

SaveResultsToFile($tests, $testName)
EndFirefox()
Exit(0)


;---------------------------------------- tests ----------------------------------------;


; Disables Persona Switcher's switch to random preference, rotates through all
; installed themes twice, checks that the pattern of themes displayed was a cycle
Func Test_SwitchToRandomDisabledRotate()
   _FFPrefSet("extensions.personaswitcher.random", True)

   TogglePsRandomPersonaPref()
   Local $themeIndices = GetThemeCycleIndices()
   Local $sResults = ""

   If Not ArrayIsCycle($themeIndices) Then
	  $sResults = "TEST FAILED: After disabling the 'switch to random " & _
		 "persona' preference, rotating through personas did not follow " & _
		 "a cycle." & @CRLF & "  Resulting order of persona indices:  " & _
		 _ArrayToString($themeIndices)
   Else
	  $sResults = "TEST PASSED: After disabling the 'switch to random " & _
		 "persona' preference, rotating through personas followed a cycle." & _
		 @CRLF & "  Resulting order of persona indices:  " & _
		 _ArrayToString($themeIndices)
   EndIf

   Return $sResults
EndFunc


; Enables Persona Switcher's switch to random preference, rotates through
; themes, checks that the pattern of themes displayed was not a cycle
Func Test_SwitchToRandomEnabledRotate()
   _FFPrefSet("extensions.personaswitcher.random", False)

   TogglePsRandomPersonaPref()
   Local $themeIndices = GetThemeCycleIndices()
   Local $sResults = ""

   If FirstHalfOfArrayIsEqualToSecond($themeIndices) Then
	  $sResults = "TEST FAILED: After enabling the 'switch to random " & _
		 "persona' preference, rotating through personas was not random." & _
		 @CRLF & "  Resulting order of persona indices:  " & _
		 _ArrayToString($themeArrays)
   ElseIf ArrayIsCycle($themeIndices) Then
	  $sResults = "TEST FAILED: After enabling the 'switch to random " & _
		 "persona' preference, rotating through personas followed a cycle." & _
		 @CRLF & "  Resulting order of persona indices:  " & _
		 _ArrayToString($themeIndices)
   Else
	  $sResults = "TEST PASSED: After enabling the 'switch to random " & _
		 "persona' preference, rotating through personas did not follow" & _
		 " a cycle." & @CRLF & "  Resulting order of persona indices:  " & _
		 _ArrayToString($themeIndices)
   EndIf

   Return $sResults
EndFunc


; Enables Persona Switcher's 'switch to random' and 'rotate on startup'
; preferences, restarts Firefox 3 times, checks that the resulting 4 themes
; displayed are not a cycle. Note: this test could falsely fail if the
; random themes selected happen to be in chronological order
Func Test_SwitchToRandomEnabledRestart()
   _FFPrefSet("extensions.personaswitcher.random", False)
   _FFPrefSet("extensions.personaswitcher.startup-switch", True)

   TogglePsRandomPersonaPref()
   Local $numberOfRestarts = 3
   Local $themeIndices[$numberOfRestarts + 1]
   Local $sResults = ""

   $themeIndices[0] = _FFPrefGet("extensions.personaswitcher.current")

   For $i = 1 To $numberOfRestarts
	  RestartFirefox()
	  $themeIndices[$i] = _FFPrefGet("extensions.personaswitcher.current")
   Next

   If ArrayIsCycle($themeIndices) Then
	  $sResults = "TEST FAILED: After enabling the 'switch to random " & _
		 "persona' and 'rotate on startup' preferences, rotating " & _
		 "personas by restarting Firefox followed a cycle." & _
		 @CRLF & "  Resulting order of persona indices:  " & _
		 _ArrayToString($themeIndices)
   Else
	  $sResults = "TEST PASSED: After enabling the 'switch to random " & _
	  "persona' and 'rotate on startup' preferences, rotating " & _
	  "personas by restarting Firefox didn't follow a cycle." & _
	  @CRLF & "  Resulting order of persona indices:  " & _
	  _ArrayToString($themeIndices)
   EndIf

   return $sResults
EndFunc


;------------------------------------ helper functions ---------------------------------;


; rotates through n installed themes 2n times. Returns an array of indices corresponding
; to each displayed theme
Func GetThemeCycleIndices()
   Local $themes = GetAllThemeIds()
   Local $themeIndices[Ubound($themes) * 2 + 1]

   $themeIndices[0] = _FFPrefGet("extensions.personaswitcher.current")

   For $i = 1 To (Ubound($themeIndices) - 1)
	  Send($rotateKey)
	  Sleep(750)
	  $themeIndices[$i] = _FFPrefGet("extensions.personaswitcher.current")
   Next

   return $themeIndices
EndFunc


; checks if the first half of an array has identical elements as the second half.
; used for checking that rotating through n themes 2n times does not produce the same
; results when switch to random is enabled
Func FirstHalfOfArrayIsEqualToSecond(ByRef $array)
   $halfIndex = UBound($array) / 2
   For $i = 0 to $halfIndex - 1
	  If Not ($array[$i] == $array[$i + $halfIndex]) Then
		 Return False
	  EndIf
   Next
   Return True
EndFunc


; checks if the integers in an array always increment by one at each index
; if they dont, check that the larger index is zero
Func ArrayIsCycle(ByRef $iArray)
   For $i = 0 To Ubound($iArray) - 2
	  If ($iArray[$i] <> $iArray[$i + 1] - 1) And Not ($iArray[$i + 1] == 0) Then
		 Return False
	  EndIf
   Next
   Return True
EndFunc