; Persona Switcher Testing Library
; v1.0

; Starts Firefox Developer Edition, connects to it through MozRepl, then
; pauses the script until the Firefox window is active.
; Returns the process ID of the started Firefox window.

#include <FF V0.6.0.1b-15.au3>

Func InitializeFirefox()
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
	  WinWaitActive("[CLASS:MozillaWindowClass]")
	  Return $PID
   Else
     MsgBox(64, "", "Can't connect to Firefox. Aborting tests.")
	 Exit(1)
   EndIf
EndFunc


; Disconnects and closes Firefox.
Func EndFirefox()
   WinWaitActive("[CLASS:MozillaWindowClass]")
   _FFWindowClose()
   _FFDisConnect()
EndFunc


; Closes Firefox and starts a new session
Func RestartFirefox()
   WinWaitActive("[CLASS:MozillaWindowClass]")
   EndFirefox()
   return InitializeFirefox()
EndFunc


; Takes an array of test result strings and prints them to a file.
; file is saved to same directory this script is ran from
Func SaveResultsToFile(ByRef $tests, ByRef $filename)
   ; set directory to script directory, append "Results .txt" to filename
   Local Const $sFilePath = @ScriptDir & "\" & $filename & " Results.txt"

   ; open the file for writing and store the handle to a variable
   Local $hFileOpen = FileOpen($sFilePath, 2)

   ; check that file was opened
   If $hFileOpen = -1 Then
       MsgBox(64, "", "An error occurred attempting to write results file.")
       Exit(1)
   EndIf

   ; write file header
   FileWrite($hFileOpen, $filename & " - results" & @CRLF)

   ; write results to file
   For $i = 0 To UBound($tests) - 1
	  FileWrite($hFileOpen, $tests[$i] & @CRLF)
   Next

   ; close the handle returned by FileOpen
   FileClose($hFileOpen)
EndFunc


; Resets all of Persona Switcher's preferences on the about:config page
Func ResetPersonaSwitcherPrefs()
   _FFPrefReset("extensions.personaswitcher.accesskey")
   _FFPrefReset("extensions.personaswitcher.activateaccel")
   _FFPrefReset("extensions.personaswitcher.activatealt")
   _FFPrefReset("extensions.personaswitcher.activatecontrol")
   _FFPrefReset("extensions.personaswitcher.activatekey")
   _FFPrefReset("extensions.personaswitcher.activatemeta")
   _FFPrefReset("extensions.personaswitcher.activateos")
   _FFPrefReset("extensions.personaswitcher.activateshift")
   _FFPrefReset("extensions.personaswitcher.auto")
   _FFPrefReset("extensions.personaswitcher.autoaccel")
   _FFPrefReset("extensions.personaswitcher.autoalt")
   _FFPrefReset("extensions.personaswitcher.autocontrol")
   _FFPrefReset("extensions.personaswitcher.autokey")
   _FFPrefReset("extensions.personaswitcher.autometa")
   _FFPrefReset("extensions.personaswitcher.autominutes")
   _FFPrefReset("extensions.personaswitcher.autoos")
   _FFPrefReset("extensions.personaswitcher.autoshift")
   _FFPrefReset("extensions.personaswitcher.current")
   _FFPrefReset("extensions.personaswitcher.debug")
   _FFPrefReset("extensions.personaswitcher.defaccel")
   _FFPrefReset("extensions.personaswitcher.defalt")
   _FFPrefReset("extensions.personaswitcher.defcontrol")
   _FFPrefReset("extensions.personaswitcher.defkey")
   _FFPrefReset("extensions.personaswitcher.defmeta")
   _FFPrefReset("extensions.personaswitcher.defos")
   _FFPrefReset("extensions.personaswitcher.defshift")
   _FFPrefReset("extensions.personaswitcher.fastswitch")
   _FFPrefReset("extensions.personaswitcher.icon-preview")
   _FFPrefReset("extensions.personaswitcher.main-menubar")
   _FFPrefReset("extensions.personaswitcher.notification-workaround")
   _FFPrefReset("extensions.personaswitcher.preview")
   _FFPrefReset("extensions.personaswitcher.preview-delay")
   _FFPrefReset("extensions.personaswitcher.random")
   _FFPrefReset("extensions.personaswitcher.rotaccel")
   _FFPrefReset("extensions.personaswitcher.rotalt")
   _FFPrefReset("extensions.personaswitcher.rotcontrol")
   _FFPrefReset("extensions.personaswitcher.rotkey")
   _FFPrefReset("extensions.personaswitcher.rotmeta")
   _FFPrefReset("extensions.personaswitcher.rotos")
   _FFPrefReset("extensions.personaswitcher.rotshift")
   _FFPrefReset("extensions.personaswitcher.startup-switch")
   _FFPrefReset("extensions.personaswitcher.static-popups")
   _FFPrefReset("extensions.personaswitcher.toolbox-maxheight")
   _FFPrefReset("extensions.personaswitcher.toolbox-minheight")
   _FFPrefReset("extensions.personaswitcher.tools-submenu")
EndFunc


; Opens Persona Switcher's options page
Func OpenPersonaSwitcherPrefs()
   _FFTabAdd("about:addons")
   _FFLoadWait()

   ;Get to the extensions menu on the sidebar
   Send("{TAB}")
   Sleep(500)
   Send("{UP 4}")
   _FFLoadWait()
   Send("{DOWN}")
   _FFLoadWait()

   ;Search for Persona Switcher add-on
   Send("^f")
   Sleep(500)
   Send("Persona Switcher")
   Sleep(500)
   Send("{ENTER}")
   _FFLoadWait()

   ;Change the search filter to "My Add-ons"
   _FFClick("search-filter-local", "id", 0)
   Sleep(500)

   ;Select Persona Switcher
   Send("{TAB 5}")
   Sleep(500)
   Send("{UP}")
   Send("{ENTER}")
   _FFLoadWait()

   ;Open the preferences menu
   Send("{TAB 5}")
   ;$result = _FFClick("detail-prefs-btn", "id", 0)
   Send("{ENTER}")
   Sleep(1000)

   If WinActive("Persona Switcher preferences") Then
	  return True
   Else
	  MsgBox(64, "", "Unable to reach Persona Switcher preferences.")
	  return False
   EndIf
EndFunc