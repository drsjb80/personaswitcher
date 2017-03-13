; ==========================================================
; Name ..........: InitializeFirefox
; Description ...: Starts Firefox Developer Edition,
;                  connects to it through MozRepl, then
;                  pauses the script until the Firefox
;                  window is active.
; Return Value ..: The process ID of the started Firefox window.
; ==============================================================================
Func InitializeFirefox()
   If _Singleton("PSTest", 1) = 0 Then
	  If IsDeclared("testName") Then
		 MsgBox(64, "Warning", "'" & $testName & "' was not started, an automated test is already running.")
	  Else
		 MsgBox(64, "Warning", "New test was not started, an automated test is already running.")
	  EndIf
	  Exit(-1)
   EndIf

   If ProcessExists("firefox.exe") Then
	  Local $iMsgBoxAnswer = MsgBox(33, "Firefox is already running", "Please close all Firefox processes, then hit 'Ok' to proceed.")
	  If $iMsgBoxAnswer == 1 Then
		 Sleep(3000)
		 If ProcessExists("firefox.exe") Then
			Local $iMsgBoxAnswer = MsgBox(64, "Firefox is still running", "Firefox was not closed, aborting test.")
			Exit(0)
		 EndIf
	  Else
		 Exit(0)
	  EndIf
   EndIf

   $FF = @ProgramFilesDir & "\Firefox Developer Edition\firefox.exe"
   If FileExists($FF) Then
	  Local $PID = Run($FF, "", @SW_SHOWMAXIMIZED)
   Else
	  MsgBox(64, $FF, "Does not exists. Aborting tests.")
	  Exit(1)
   EndIf

   ; Wait for the Firefox window to load
   ProcessWait($PID)
   WinWaitActive("[CLASS:MozillaWindowClass]")

   ; connect to a running Firefox with MozRepl
   If _FFConnect(Default, Default, 10000) Then
	  ; ensure firefox window is active before proceeding
	  _FFLoadWait()
	  ResetPersonaSwitcherPrefs()
	  WinWaitActive("[CLASS:MozillaWindowClass]")
	  Return $PID
   Else
     MsgBox(64, "", "Can't connect to Firefox. Aborting tests.")
	 Exit(1)
   EndIf
EndFunc


; ==========================================================
; Name ..........: EndFirefox
; Description ...: Closes and disconnects from Firefox
; Return Value ..: Success      - 1
;                  Failure      - 0
; ==============================================================================
Func EndFirefox()
   _FFWindowClose()
   Return _FFDisconnect()
EndFunc


; ==========================================================
; Name ..........: RestartFirefox
; Description ...: Closes Firefox and starts a new session
; Return Value ..: The process ID of the started Firefox window.
; ==============================================================================
Func RestartFirefox()
   _FFWindowClose()
   _FFDisConnect()

   While ProcessExists("firefox.exe") Or _FFIsConnected()
	  Sleep(250)
   WEnd

   $FF = @ProgramFilesDir & "\Firefox Developer Edition\firefox.exe"
   Local $PID = Run($FF, "", @SW_SHOWMAXIMIZED)
   ProcessWait($PID)
   WinWaitActive("[CLASS:MozillaWindowClass]")

   ; connect to a running Firefox with MozRepl
   If _FFConnect(Default, Default, 10000) Then
	  ; ensure firefox window is active before proceeding
	  _FFLoadWait()
	  WinWaitActive("[CLASS:MozillaWindowClass]")
	  Return $PID
   Else
	  MsgBox(64, "", "Can't connect to Firefox. Aborting tests.")
	  Exit(1)
   EndIf
EndFunc


; ==========================================================
; Name ..........: SaveResultsToFile
; Description ...: Takes an array of test result strings and prints them to a file.
;                  file is saved in a directory named "Test Results" that must exist
;                  in the parent directory of the script ran
; Parameters ....: $tests - an array of strings that provide test results
;                  $testname - the testing category name
; ==============================================================================
Func SaveResultsToFile(ByRef $tests, ByRef $testname)
   ; set results file path and file name
   Local Const $sFilePath = StringRegExpReplace(@ScriptDir, '\\[^\\]*$', '') & _
	  "\PS Automated Tests Results.txt"

   Local Const $sFileHeader = "# Persona Switcher Automated Test Results" & @CRLF & _
	  "# " & _NowTime() & " latest test suite ran: " & $testname

   ; open the file for writing and store the handle to a variable
   Local $hFileOpen = FileOpen($sFilePath, 0)

   ; check that file was opened
   If $hFileOpen = -1 Then
	  $hFileOpen = FileOpen($sFilePath, 2)
	  If $hFileOpen = -1 Then
		 MsgBox(64, "", "An error occurred attempting to write results file.")
		 Exit(1)
	  EndIf
   EndIf

   Local $lineCount = _FileCountLines($sFilePath)
   Local $fileArray[$lineCount + UBound($tests) + 1]
   Local $writeState = False;

   ; process old file
   For $i = 1 to $lineCount
	  $line = FileReadLine($sFilePath, $i)
	  If StringLeft($line, 1) == '#' Then
		 $fileArray[$i - 1] = ""
	  ElseIf $line == "[" & $testname & "]" Then
		 $writeState = True
	  Else
		 If $writeState Then
			If StringLeft($line, 1) == '[' And StringRight($line, 1) == ']' Then
			   $writeState = False
			   $fileArray[$i - 1] = $line
			Else
			   $fileArray[$i - 1] = ""
			EndIf
		 Else
			$fileArray[$i - 1] = $line
		 EndIf
	  EndIf
   Next

   FileClose($hFileOpen)

   ; save test results into array
   $fileArray[$lineCount] = "[" & $testname & "]"
   For $i = 0 to UBound($tests) - 1
	  $fileArray[$lineCount + $i + 1] = $tests[$i]
   Next

   $hFileOpen = FileOpen($sFilePath, 2)
   FileWrite($hFileOpen, $sFileHeader & @CRLF)

   ; write array to new file
   For $i = 0 to UBound($fileArray) - 1
	  If StringLen($fileArray[$i]) > 0 Then
		 If StringLeft($fileArray[$i], 1) == '[' And StringRight($fileArray[$i], 1) == ']' Then
			FileWrite($hFileOpen, @CRLF & $fileArray[$i] & @CRLF)
		 Else
			FileWrite($hFileOpen, $fileArray[$i] & @CRLF)
		 EndIf
	  EndIf
   Next

   FileClose($hFileOpen)
EndFunc