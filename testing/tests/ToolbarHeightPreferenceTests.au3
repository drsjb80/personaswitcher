#include "..\library\PSTestingLibrary.au3"

;---------------------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's "minimum height
; of top toolbox" preference

Local $testName = "Toolbox Min Height Preference Tests"
Local $tests[4]

InitializeFirefox()

$tests[0] = ToolbarHeightExpands()
$tests[1] = ToolbarHeightShrinks()
$tests[2] = ToolbarHeightMinValue()
$tests[3] = ToolbarHeightMaxValue()

SaveResultsToFile($tests, $testName)
EndFirefox()
Exit(0)


;---------------------------------------- tests ----------------------------------------;


; Testing that the update of the toolbar height preference from 0 to 175
; expands the toolbar.
Func ToolbarHeightExpands()
   Local $sDescription
   Local $testPassed = False

   ; Set height to 0
   SetPsOption('toolbox-minheight', "0")

   Local $startingHeight = GetToolbarHeight()

   ; Set height to 175
   SetPsOption('toolbox-minheight', "175")

   ; grab the height of the toolbar after updating the preference
   Local $modifiedHeight = GetToolBarHeight()

   ; verify that the toolbar height expanded
   If ($startingHeight == 0 And $modifiedHeight == 175) Then
	  $testPassed = True
	  $sDescription = "After changing the toolbox-minheight from 0 to 175, the height of the toolbox expanded from 0 to 175."
   Else
	  $sDescription = "When setting the toolbox-minheight to 0 and 175, the height of the toolbox did not match those values."
   EndIf

   ResetPsOption("toolbox-minheight")

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;---------------------------------------------------------------------------------------;
; Testing that the update of the toolbar height preference from 150 to 10
; shrinks the toolbar.
Func ToolbarHeightShrinks()
   Local $sDescription
   Local $testPassed = False

   ; Update height to 150
   SetPsOption('toolbox-minheight', "150")

   Local $startingHeight = GetToolbarHeight()

   ; Update height to 10
   SetPsOption('toolbox-minheight', "10")

   ; grab the height of the toolbar after updating the preference
   Local $modifiedHeight = GetToolbarHeight()

   ; verify that the toolbar height shrunk
   If $startingHeight == 150 And $modifiedHeight == 10 Then
	  $testPassed = True
	  $sDescription = "After changing the toolbox-minheight from 150 to 10, the height of the toolbox shrunk from 150 to 10."
   Else
	  $sDescription = "When setting the toolbox-minheight to 150 and 10, the height of the toolbox did not match those values."
   EndIf

   ResetPsOption("toolbox-minheight")

   Return FormatTestString($testPassed, $sDescription)
  EndFunc
;---------------------------------------------------------------------------------------;
; Testing that the min value of the preference is 0 and nothing less can be entered.
Func ToolbarHeightMinValue()
   Local $sDescription
   Local $testPassed = False

   ; Try sending -1 to toolbox height preference
   Local $negativeValueCopy = SetPsOption('toolbox-minheight', "-1", True)

   If $negativeValueCopy < 0 Then
	  $sDescription = "Persona Switcher allowed setting the toolbox-minheight to a negative value."
   Else
	  ; If -1 wasn't accepted, try 0
	  Local $zeroValueCopy = SetPsOption('toolbox-minheight', "0", True)

	  ; check that the value in the preference is zero
	  If $zeroValueCopy == 0 Then
		 $testPassed = True
		 $sDescription = "When setting the toolbox-minheight preference, 0 was accepted but -1 was not."
	  Else
		 $sDescription = "When setting the toolbox-minheight preference, 0 was not accepted."
	  EndIf
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;---------------------------------------------------------------------------------------;
; Testing that the max value of the preference is 200 and nothing larger
; can be entered.
Func ToolbarHeightMaxValue()
   Local $sDescription
   Local $testPassed = False

   Local $valueCopy = SetPsOption('toolbox-minheight', "201", True)

   ; check that value is set to the max
   If $valueCopy == 200 Then
	  $testPassed = True
      $sDescription = "When setting the toolbox-minheight preference, 201 was not accepted (max is 200)."
   Else
      $sDescription = "When setting the toolbox-minheight preference, 201 was accepted (max is 200)."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc


;------------------------------------ helper functions ---------------------------------;

Func GetToolbarHeight()
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Local $Cmd = _FFCmd('Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
   '.getService(Components.interfaces.nsIWindowMediator)' & _
   '.getMostRecentWindow("navigator:browser").document' & _
   '.getElementsByAttribute("id", "navigator-toolbox")[0].minHeight')
   return Number($Cmd)
EndFunc