#include "..\library\_PSTestingLibrary.au3"

;-----------------------------------------------------------------------------;
Local $testName = "HeightToolbarOptions"
Local $tests[4]

; start Firefox and setup for tests
InitializeFirefox()

; run tests and store results
$tests[0] = ToolbarHeightExpands()
$tests[1] = ToolbarHeightShrinks()
$tests[2] = ToolbarHeightMinValue()
$tests[3] = ToolbarHeightMaxValue()

; save results to file
SaveResultsToFile($tests, $testName)

; disconnect and close from Firefox
EndFirefox()
;-----------------------------------------------------------------------------
; Testing that the update of the toolbar height preference from 0 to 175
; expands the toolbar.
Func ToolbarHeightExpands()
   Local $testResults

   ; Set height to 0
   SetPsOption('toolbox-minheight', "0")

   Local $startingHeight = GetToolbarHeight()

   ; Set height to 175
   SetPsOption('toolbox-minheight', "175")

   ; grab the height of the toolbar after updating the preference
   Local $modifiedHeight = GetToolBarHeight()

   ; verify that the toolbar height expanded
   If ($modifiedHeight == 175 And $modifiedHeight > $startingHeight) Then
	  $testResults = "TEST PASSED: The height of the toolbar expanded from 0 to 175."
   Else
	  $testResults = "TEST FAILED: The height of the toolbar did not expand from 0 to 175."
   EndIf

   ResetPsOption("toolbox-minheight")

   Return $testResults
EndFunc
;-----------------------------------------------------------------------------
; Testing that the update of the toolbar height preference from 175 to 10
; shrinks the toolbar.
Func ToolbarHeightShrinks()
   Local $testResults

   ; Update height to 175
   SetPsOption('toolbox-minheight', "175")

   Local $startingHeight = GetToolbarHeight()

   ; Update height to 10
   SetPsOption('toolbox-minheight', "10")

   ; grab the height of the toolbar after updating the preference
   Local $modifiedHeight = GetToolbarHeight()

   ; verify that the toolbar height shrunk
   If $startingHeight == 175 And $modifiedHeight == 10 Then
	  $testResults = "TEST PASSED: The height of the toolbar shrunk from 175 to 10."
   Else
	  $testResults = "TEST FAILED: The height of the toolbar did not shrink from 175 to 10."
   EndIf

   ResetPsOption("toolbox-minheight")

   Return $testResults
  EndFunc
;-----------------------------------------------------------------------------;
; Testing that the min value of the preference is 0 and nothing less can be entered.
Func ToolbarHeightMinValue()
   Local $testResults

   ; Try sending -1 to toolbox height preference
   Local $negativeValueCopy = SetPsOption('toolbox-minheight', "-1", True)

   ; If -1 didn't work, try 0
   Local $zeroValueCopy = SetPsOption('toolbox-minheight', "0", True)

   ; check that the value in the preference is zero
   If $zeroValueCopy == 0 AND $negativeValueCopy == 1 Then
	  $testResults = "TEST PASSED: value -1 for the preference was not accepted, but value 0 was accepted because the min is 0"
   Else
      $testResults = "TEST FAILED: values -1 and 0 for the preference were both accepted even though the min is 0"
   EndIf

   Return $testResults
EndFunc
;------------------------------------------------------------------------------------
; Testing that the max value of the preference is 200 and nothing larger
; can be entered.
Func ToolbarHeightMaxValue()
   Local $testResults

   Local $valueCopy = SetPsOption('toolbox-minheight', "201", True)

   ; check that value is set to the max
   If $valueCopy == 200 Then
      $testResults = "TEST PASSED: the value 201 was not accepted for the preference because the max is 200"
   Else
      $testResults = "TEST FAILED: the value 201 was accepted for the preference even though the max is 200"
   EndIf

   Return $testResults
EndFunc
;-----------------------------------------------------------------------------
; Helper function
Func GetToolbarHeight()
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Local $Cmd = _FFCmd('Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
   '.getService(Components.interfaces.nsIWindowMediator)' & _
   '.getMostRecentWindow("navigator:browser").document' & _
   '.getElementsByAttribute("id", "navigator-toolbox")[0].minHeight')
   return Number($Cmd)
EndFunc