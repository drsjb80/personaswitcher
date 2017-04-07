; This library contains functions regarding formatting and saving
; a test suite's results to a file. All tests should return their
; result as a string formatted by FormatTestString(), and all test
; suites should write their results with SaveResultsToFile()


#include <String.au3>

; ==========================================================
; Takes an individual test's results and description and formats it to a human readable format
; Parameters - $testPassed		True/False if the test passed
;              $sDescription	Description string of test results
; ==============================================================================
Func FormatTestString(ByRef $testPassed, ByRef $sDescription)
   Local $lineLength = 0
   Local $leftPadding = 12
   Local $maxLineLength = 80 - $leftPadding

   For $i = 0 to StringLen($sDescription)
	  If $lineLength >= $maxLineLength And StringMid($sDescription, $i, 1) == ' ' Then
		 $sDescription = StringLeft($sDescription, $i - 1) & @CRLF & _
			StringRight($sDescription, StringLen($sDescription) - $i)
		 $lineLength = 0
	  ElseIf StringInStr($sDescription, @CRLF, 0, 1, $i, $maxLineLength - $lineLength) Then
		 $lineLength = 0
	  Else
		 $lineLength = $lineLength + 1
	  EndIf
   Next

   $sDescription = StringReplace($sDescription, @CRLF, @CRLF & _StringRepeat(' ', $leftPadding))
   $sDescription = ($testPassed ? "PASS - " : "FAIL - ") & $sDescription

   Return $sDescription

EndFunc


; ==========================================================
; Takes an array of test result strings and prints them to a file
; Parameters - $tests		an array of strings that provide test results
;              $testname	the testing category name
; ==============================================================================
Func SaveResultsToFile(ByRef $tests, ByRef $testname)
   ; set results file path and file name
   Local Const $sFilePath = StringRegExpReplace(@ScriptDir, '\\[^\\]*$', '') & _
	  "\PS Automated Tests Results.txt"

   Local Const $sFileHeader = "# Persona Switcher Automated Test Results" & @CRLF & _
	  "# " & _NowTime() & " latest test suite ran: " & $testname & @CRLF

   FileSetAttrib($sFilePath, "-R")
   ; open old results for reading or create new results file
   Local $hFileOpen = OpenOrCreateFile($sFilePath)
   ; read old results file and store each line as a string in an array
   ; add new test results to end of array
   Local $fileArray = ProcessOldResultsFile($sFilePath, $tests, $testname)
   FileClose($hFileOpen)

   ; open file for overwriting
   $hFileOpen = FileOpen($sFilePath, 2)
   FileWrite($hFileOpen, $sFileHeader & @CRLF)

   ; write array to new results file
   For $i = 0 to UBound($fileArray) - 1
	  If StringLen($fileArray[$i]) > 0 Then
		 FileWrite($hFileOpen, $fileArray[$i] & @CRLF)
	  EndIf
   Next

   FileClose($hFileOpen)
   FileSetAttrib($sFilePath, "+R")
EndFunc


; opens a file for reading or create a new writable file
Func OpenOrCreateFile(Const $sFilePath)
   ; try to open file as read only
   Local $hFileOpen = FileOpen($sFilePath, 0)

   ; if file doesn't exist, create a new writable file
   If $hFileOpen = -1 Then
	  $hFileOpen = FileOpen($sFilePath, 2)
	  If $hFileOpen = -1 Then
		 MsgBox(64, "", "An error occurred attempting to write results file.")
		 Exit(1)
	  EndIf
   EndIf

   Return $hFileOpen
EndFunc


; reads each line in the old results file into an array. Omits all tests
; under the current test's name if they exist. Appends the current test's
; results to end of file.
Func ProcessOldResultsFile(Const $sFilePath, ByRef $tests, ByRef $testname)
   Local $lineCount = _FileCountLines($sFilePath)
   Local $fileArray[$lineCount + UBound($tests) + 1]
   Local $writeState = False;

   For $i = 1 to $lineCount
	  $line = FileReadLine($sFilePath, $i)
	  If StringLeft($line, 1) == '#' Then
		 $fileArray[$i - 1] = ""
	  ElseIf StringInStr($line, "[" & $testname & "]") Then
		 $writeState = True
	  Else
		 If StringRegExp($line, "\[.+\].*", 0) Then
			$writeState = False
			$fileArray[$i - 1] = @CRLF & $line
		 Else
			$fileArray[$i - 1] = $writeState ? "" : $line
		 EndIf
	  EndIf
   Next

   ; add new test results to end of file array
   $fileArray[$lineCount] = @CRLF & "[" & $testname & "]" & _StringRepeat('=', 87 - StringLen($testname))
   For $i = 0 to UBound($tests) - 1
	  $fileArray[$lineCount + $i + 1] = "  " & _
		 StringFormat("%02i", $i) & " " & $tests[$i]
   Next

   Return $fileArray
EndFunc