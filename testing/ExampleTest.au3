#include <FF V0.6.0.1b-15.au3>
#include "PS Testing Library.au3"

;-----------------------------------------------------------------------------;

Local $testName = "Example Test" ; name of test category (ex: Toolbar Tests)
Local $tests[1] ; size of array = number of tests

; start Firefox and setup for tests
InitializeFirefox()

; run tests and store results
$tests[0] = TestToolbarChangeTheme()
;$tests[1] = TestBlahBlah()
;$tests[2] = TestBlahBlahBlah()...

; save results to file
SaveResultsToFile($tests, $testName)

; disconnect and close from Firefox
EndFirefox()


;------------------------------------ tests ----------------------------------;

; tests a theme change through the personaswitcher toolbar menu
Func TestToolbarChangeTheme()
   Local $testResults

   ; send keys 'f10', 't' to open firefox toolbar
   ; then send key 'p' to select PersonaSwitcher
   ; use arrow keys to navigate themes, enter to select

   ; select default theme
   Send("{f10}")
   Sleep(100)
   Send("t")
   Sleep(100)
   Send("p")
   Sleep(100)
   Send("{ENTER}")
   Sleep(100)

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; select next theme
   Send("{f10}")
   Sleep(100)
   Send("t")
   Sleep(100)
   Send("p")
   Sleep(100)
   Send("{DOWN}")
   Sleep(100)
   Send("{ENTER}")
   Sleep(100)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not changed through toolbar"
   Else
	  $testResults = "TEST PASSED: theme was changed through toolbar"
   EndIf

   Return $testResults

EndFunc
