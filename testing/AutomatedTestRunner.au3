#include <File.au3>

; Runs all tests found in child "\tests\" directory
; Stops running tests if the cursor is moved while Firefox is active

Local Const $sTestDirectory = @ScriptDir & "\tests\"
Local $aTestsList = _FileListToArray($sTestDirectory, "*.au3")
Local $testsRan = 0
Local $totalTests = 0
Local $abortTests = False
Sleep(3000)

For $test In $aTestsList
   If Not (IsNumber($test) or StringLeft($test, 1) == '_') Then
	  Local $MouseStartX = 0
	  Local $MouseStartY = 0

	  If Not $abortTests Then
		 Local $iPID = Run(@AutoItExe & ' "' & $sTestDirectory & $test & '"')
	  EndIf

	  While (ProcessExists($iPID) or ProcessExists("firefox.exe")) And Not $abortTests
		 If Not WinActive("[CLASS:MozillaWindowClass]") Then
			$MouseStartX = MouseGetPos(0)
			$MouseStartY = MouseGetPos(1)
		 ElseIf Not (MouseGetPos(0) == $MouseStartX and MouseGetPos(1) == $MouseStartY) Then
			ProcessClose($iPID)
			$abortTests = True
		 EndIf
		 Sleep(250)
	  WEnd

	  If Not $abortTests Then
		 $testsRan = $testsRan + 1
		 $totalTests = $testsRan
	  Else
		 $totalTests = $totalTests + 1
	  EndIf
   EndIf
Next

Local $sTestsFinished = $testsRan & " / " & $totalTests & " tests finished."

If $abortTests Then
   MsgBox(64, "", "Cursor movement detected, stopping tests; " & $sTestsFinished)
Else
   MsgBox(64, "", $sTestsFinished)
EndIf
