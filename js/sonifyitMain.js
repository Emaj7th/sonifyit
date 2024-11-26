/*
NOTES
* Octave low/high setting - to keep a voice within a range
* Midi Player - after generated, provide player controls for play/pause/stop
* replace current real time play with conversion to base64 to play as a midi file
* note played displayed on screen
*/
//================================================================
//	Note Values from Sixtyfourth to Whole, 1-13: Seconds=NoteValue/BPM
//================================================================
var noteValues = {
'1':[3.75],
'2':[7.5],
'3':[10],
'4':[15],
'5':[20],
'6':[22.5],
'7':[30],
'8':[40],
'9':[50],
'10':[60],
'11':[90],
'12':[120],
'13':[240]
};
var noteValuesStd = {
'1':[3.75],
'2':[7.5],
'3':[15],
'4':[30],
'5':[60],
'6':[120],
'7':[240]
};

var noteValueNames = {
'1':['Sixtyfourth'],
'2':['Thirtysecond'],
'3':['Triplet-sixteenth'],
'4':['Sixteenth'],
'5':['Triplet-eighth'],
'6':['Dotted-sixteenth'],
'7':['Eighth'],
'8':['Triplet-quarter'],
'9':['Dotted-eighth'],
'10':['Quarter'],
'11':['Dotted-quarter'],
'12':['Half'],
'13':['Whole']
}; 
var noteValueNamesStd = {
'1':['Sixtyfourth'],
'2':['Thirtysecond'],
'3':['Sixteenth'],
'4':['Eighth'],
'5':['Quarter'],
'6':['Half'],
'7':['Whole']
}; 
var noteValuePPQN = {
'1':[6],
'2':[12],
'3':[16],
'4':[24],
'5':[32],
'6':[36],
'7':[48],
'8':[64],
'9':[72],
'10':[96],
'11':[144],
'12':[192],
'13':[384]
};
var noteValuePPQNStd = {
'1':[6],
'2':[12],
'3':[24],
'4':[48], 
'5':[96],
'6':[192],
'7':[384]
};

//================================================================
//ALL GET FUNCTIONS
//================================================================
function getKey() {
	return parseInt($("#key").val());
};
function getScale() {
	return $("#scale").val();
};
function getTempo() {
	return $("#tempo").val();
};
//================================================================
//ALL CHANNEL FUNCTIONS
//================================================================
function getText(ch) {
	var channelField = "#textSource" + ch;
	//var str = document.getElementById(channelField).value;
	var str = $(channelField).val();
	var strTrim = str.replace(/[^\x00-\x7F]/g, "").trim(); //ASCII is in range of 0 to 127 - removes anything not in range and trims 
	return strTrim;
};
function getVolume(ch) {
	var channelField = "#volume" + ch;
	return $(channelField).val();
};
function getOctaveLow(ch) {
	var channelField = "#octaveLow" + ch;
	return $(channelField).val();
};
function getOctaveHigh(ch) {
	var channelField = "#octaveHigh" + ch;
	return $(channelField).val();
};
function getShortestNote(ch) {
	var channelField = "noteSet" + ch;
	var setStd = "#shortestNoteStd" + ch ;
	var setFull = "#shortestNoteFull" + ch ;
	var noteSet = $('input[name=channelField]:checked', '#sonifyForm').val();
	var returnNoteSet='';
	if (noteSet == 0){
		returnNoteSet=$(setStd).val();
	}
	else{
		returnNoteSet=$(setFull).val();
	};
	return returnNoteSet;
};
function getLongestNote(ch) {
	var channelField = "noteSet" + ch;
	var noteSet = $('input[name=channelField]:checked', '#sonifyForm').val();
	var shortestNote= getShortestNote(ch);
	var setStd = "#longestNoteStd" + ch;
	var setFull = "#longestNoteFull" + ch;
	var setStdOpt = "#longestNoteStd" + ch + " option";
	var setFullOpt = "#longestNoteFull" + ch  + " option";	
	var returnNoteSet='';
	if (noteSet == 0){
		returnNoteSet=$(setStd).val();
		//if (returnNoteSet < shortestNote){								//if the longest note is shorter than the shortest note, set the longest note to last option, WHOLE
		//	returnNoteSet = $(setStdOpt).prop('selected',true);		//.last()
		//};
	}
	else{
		returnNoteSet=$(setFull).val();
		//if (returnNoteSet < shortestNote){								//if the longest note is shorter than the shortest note, set the longest note to last option, WHOLE
		//	returnNoteSet = $(setFullOpt).prop('selected',true);		//.last()
		//};
	};
	return returnNoteSet;
};
function getMinVelocity(ch) {
	var channelField = "#minVelocity" + ch;
	return $(channelField).val();
};
function getMaxRest(ch) {
	var channelField = "#maxRestLen" + ch;
	return $(channelField).val();
};
function getInstrument(ch) {
	var channelField = "#instrument" + ch;
	return $(channelField).val();
};
//================================================================
//ALL HELPER FUNCTIONS
//================================================================
function sumDigits(number) {
    var remainder = number % 10;
    var sum = remainder;
    if(number >= 10) {
        var rest = Math.floor(number / 10);
        sum += sumDigits(rest); 
    }
    return sum;
};
//If result is greater than maximum value, and greater than 9, sum the digits of the number. If is greater than maximum value, and less than or equal to 9, use maximum value.
//**TODO**Need to replace this attempt with applying scale using the javascript here: https://stackoverflow.com/a/31687097
//	function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
//  	return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
//	}
function getCorrectValue(value,maxValue){
	if(value > maxValue && value > 9)	//only when the value is greater than it's max value, and you'd only sum the digits of value it they had 2 or more digits
	{
	  do {
		  value=sumDigits(value);	// Add the digits of value to reduce it until it conforms
	  }
	  while (value > maxValue && value > 9);
	}
	else if (value > maxValue && value <= 9) //for cases when value is a single digit, yet greater than it's maxvalue, therefore, use the maxvalue
	{
		value= maxValue;
	}
	else {
		value= value;
	}
	if(value > maxValue)
	{
		value= maxValue;
	}
	return parseInt(value);
};
function getValueInRange(value,minValue,maxValue){
	var resultValue = 0;
	if(value > maxValue)	//when the value is greater than max value, set value to maxValue 
	{
		  resultValue=maxValue;
	}
	else if (value < minValue) //for cases when value is a single digit, yet greater than it's maxvalue, therefore, use the maxvalue
	{
		resultValue= minValue;
	}
	else {
		resultValue= value;
	}
	return parseInt(resultValue);
};
//================================================================
//MAIN FUNCTION
//================================================================
function processText() {
	var thisKey=getKey();																	//get the key
	var thisScale=getScale();																//get the scale
	var thisScaleArray =thisScale.split(",");												//create array from the scale
	var thisScaleArrayLen=thisScaleArray.length;
	var thisTempo=getTempo();																//get the tempo
	var thisMidiOutput = $('input[name="midiOutput"]:checked', '#sonifyForm').val();		//generate midi file or play
	$('#outputMIDI').html('');																//empty the div for outputting link to download
	//console.log('scale array check: ' + Array.isArray(thisScaleArray));
		console.log('thisScale ' + thisScale);							//Debug
		console.log('thisScaleArrayLen ' + thisScaleArrayLen);
		console.log('thisKey' + thisKey);
	var maxChannels = $('#channels').val();													//get then number of channels
	$('#ajaxpanel').html('<div class="success">Now Playing!</div>');
	if(thisMidiOutput ==0){																	// playing output
		var midiOutArrary = []; 															//create array for output
		}
	else{																					//Generate MIDI File
		mf = new JZZ.MidiFile(1,96);														// Create a MIDI file. Type 1; 96 clocks per quarter note.
		// Add MIDI file tracks:
		var tr0 = new JZZ.MidiFile.MTrk; mf.push(tr0); 										// First track in Type 1 MIDI file is normally used for tempo changes
		var tr1 = new JZZ.MidiFile.MTrk; mf.push(tr1); 										// This one will be for the music
		var tr2 = new JZZ.MidiFile.MTrk; mf.push(tr2); 										// This one will be for the music
		var tr1Instrument = thisInstrument=getInstrument(0);
		var tr2Instrument = thisInstrument=getInstrument(1);	
		tr0.addName(0,'SonifyIt'); 															// The name of the first track serves as the file title
		tr0.addTempo(0,thisTempo); 															// Set Tempo
		tr1.addName(0,'Ch 1');
		tr1.addMidi(0,192,tr1Instrument); 													// clock: 0, MIDI signal: 0xc0 0x0b (change channel 0 program to vibraphone)- 0,192,11
		tr1.addMidi(0,176,10,34);
		tr2.addName(0,'Ch 2');
		tr2.addMidi(0,193,tr2Instrument); 													// clock: 0, MIDI signal: 0xc0 0x0b (change channel 0 program to vibraphone)- 0,192,11
		tr2.addMidi(0,177,10,94);
		};
	//loop over channels
	for (var ch = 0; ch <= maxChannels; ch++) {	
		console.log('thisChannel ' + ch);
		var songPosition = 0;																//used in for loops to tracking when notes play
		var newSongPosition = 0;															//used in for loops to tracking when notes play
		var previousOctave = 0;
		var previousVelocity = 0;
		var stdMinValue=9;
		var displayNote = "";
		var displayNoteType ="";
		var thisInstrument=getInstrument(ch);												//get the isntrument
		var str = getText(ch);																//get the content to concert
		var strLen = str.length;															//for checking if there is any content
		var wordArray = str.split(" "); 													//split text into an array based on space
		var wordArrayLength = wordArray.length;												//get the length of the array
		var midiSelectChannel = ch;															//offset the midiSelectChannel since the first value is 0
		MIDI.programChange(midiSelectChannel, MIDI.GM.byId[thisInstrument].number);			//Load instrument into channel 0
		var thisMinVelocity=getMinVelocity(ch);												//get the velocity 
		var thisShortestNote=getShortestNote(ch);											//get the shortest note
		var thisLongestNote=getLongestNote(ch);												//get the longest note
		var thisVolume=getVolume(ch);														//get the volume
		var thisMaxRestLen=getMaxRest(ch);
		var channelField = "noteSet" + ch;
		var octaveLow = getOctaveLow(ch);
		var octaveHigh = getOctaveHigh(ch);
			console.log('octaveLow ' + octaveLow);
			console.log('octaveHigh ' + octaveHigh);
		if (ch == 0) {var thisNoteSet = $('input[name=noteSet0]:checked').val();			//get the note set: 0 = std 1 = full
			}
		else {var thisNoteSet = $('input[name=noteSet1]:checked').val();
			};
			console.log('channelField: ' + channelField);
			console.log('this note set: ' + thisNoteSet);
			console.log('text length: ' + wordArrayLength);
			console.log('thisShortestNote: ' + thisShortestNote);
			console.log('thisLongestNote: ' + thisLongestNote);
	  for (var i = 0; i < wordArrayLength; i++) {											//starting word loop
		  var thisWord = wordArray[i].replace(/(\r\n|\n|\r|\t)/gm,"");						//get a word from the array and removes any linebreaks or tabs
		  //console.log('thisWord' + thisWord);					//Debug
		  var thisWordLen = thisWord.length;												//get the length of each word - which is used as an offset per each character's procesing
		  //loop over characters in word array
		  console.log('thisWordLen ' + thisWordLen);
		  for (var c = 0; c < thisWordLen; c++) {											//starting letter loop
		  		console.log('current word c: ' + c);
			  var thisChar = thisWord.charAt(c);											// extract a char from a word
			  //var matchedChar = ASCII.findIndex(thisChar);								//find char in sonifyitData.min.js - array: ASCII
			  console.log('thisChar ' + thisChar);					//Debug
			  var matchedChar = jQuery.inArray(thisChar, ASCII);
			  //get char's values	
			  if (thisNoteSet ==0){
				  var noteQty =7;
			  }
			  else{var noteQty =13;
			  };
			  var noteLength= getCorrectValue(NA1[matchedChar]+thisWordLen,noteQty);					//get noteLength (shortestNote-13)	[Seconds=(NoteValue/BPM)+lastNoteLen]
			  var scalePosition= getCorrectValue(NA2[matchedChar],thisScaleArrayLen)-1;					//get scalePosition - subtracted by 1 to start with Zero
			  var octave= getCorrectValue((NA3[matchedChar]+thisWordLen),7);							//get octave
			  var velocity= Math.round(getCorrectValue((NA4[matchedChar]+thisWordLen),12)*10.5);		//get velocity (1-12), normalizing value with *10.5
			  var scaleoffset = parseInt(thisScaleArray[scalePosition]);								//get scale offset from the selected scale and derived scale positon
			  //In order to minimize the erratic output of notes due to having access to all notes at all times, this if statement minimized the traversing of octaves to 1 per note
			  if (previousOctave >= 2 &&  previousOctave > octave){
				  octave = previousOctave-1;
			  }
			  else if (previousOctave <= 6 && previousOctave < octave){
				  octave = previousOctave+1;
			  };
			  if (previousVelocity >= 6 &&  previousVelocity > velocity){								//limit the note velocity so that it can only change be 6 values per note value.
				  velocity = previousVelocity-6;
			  }
			  else if (previousVelocity >= 1 &&  previousVelocity < velocity){
				  velocity = previousVelocity+6;
			  };
			  
			  	console.log('scalePosition ' + scalePosition);
			  	console.log('scaleoffset ' + scaleoffset);
			  //console.log('velocity ' + velocity);
			  previousOctave = octave;
			  octave= getValueInRange(octave,octaveLow,octaveHigh);										// Using octaveLow and octaveHigh, the range is limited based on the UI settings
			  previousVelocity = velocity;
			  noteNumber = (octave*12)+thisKey+scaleoffset;												//get note value by multiplying the derived octave by 12, then adding the key and scale offset
			  	console.log('noteNumber PRE ' + noteNumber);																				
			  // check the note value, if outside the min-max, shift an octave
			  if (noteNumber < 21){																		// min note value = 21, max note value = 108
				  octave = octave+1;								 
				  noteNumber = (octave*12)+thisKey+scaleoffset;
			  }
			  else if (noteNumber > 108){																//note is too high for the midi script, drop the note an octave
				  octave = octave-1;
				  noteNumber = (octave*12)+thisKey+scaleoffset;		
			  };
			  if (velocity < thisMinVelocity){															//apply the min velocity value
				  velocity=thisMinVelocity;
			  };
			  	console.log('velocityEdit ' + velocity);
			  if (noteLength < thisShortestNote){														//apply the shortest and longest note value to ensure note output is within this range
				  noteLength=thisShortestNote;															//this could use a better function which translates generated note to the range defined by shortest/longest
			  } else if (noteLength > thisLongestNote){
				  noteLength=thisLongestNote;
			  };
				console.log('octave ' + octave);
				console.log('noteLength ' + noteLength);
				//console.log('thisKey ' + thisKey);
				//console.log('scalePosition ' + scalePosition);
				console.log('noteNumber ALT ' + noteNumber);
				//sets the last NoteLen so the notes occur in time
				//channelId, noteId, velocity, delay
			  if (thisNoteSet ==0){
					  thisNote =noteValueNamesStd[noteLength];
				  }
			  else{thisNote =noteValueNames[noteLength];
				  };
			  console.log('note ' + MIDI.noteToKey[noteNumber]);
			  displayNote = displayNote + MIDI.noteToKey[noteNumber] + ',' + thisNote + '<br/>' ;
			  if(thisMidiOutput ==0){	
			  	var finalNoteLength ='';		
				console.log('thisNoteSet ' + thisNoteSet);											//Playing converted text
				  if (thisNoteSet ==0){
					  finalNoteLength = (noteValuesStd[noteLength]/thisTempo).toFixed(3);	
					  console.log('noteLength ' + noteValuesStd[noteLength]);		
				  }
				  else{
					  finalNoteLength = (noteValues[noteLength]/thisTempo).toFixed(3);
					  console.log('noteLength ' + noteValues[noteLength]);			
				  };
				  newSongPosition = parseFloat(songPosition) + parseFloat(finalNoteLength);	//sets newSongPositon, which is the end time of noteOff
				  newSongPosition = parseFloat(newSongPosition.toFixed(3));
				  //console.log('newSongPosition ' + newSongPosition);
				  console.log('thisTempo ' + thisTempo);
				  console.log('finalNoteLength ' + finalNoteLength);
				  console.log('songPosition ' + songPosition);
				  console.log('newSongPosition ' + newSongPosition);
 				 noteValueString=songPosition + ',' + midiSelectChannel + ',' + noteNumber + ',' + velocity + ',' + finalNoteLength + ',' + newSongPosition;	//noteValue String - all values to play a note
				 console.log('noteValueString ' + noteValueString);
				 midiOutArrary.push(noteValueString);																		//adding the noteValue string to the midi output array
				 songPosition = newSongPosition;
			  } 
			  else{																					//MIDI FILE
				  if (thisNoteSet ==0){
					  noteLength = noteValuePPQNStd[noteLength];		
				  }
				  else{
					  noteLength = noteValuePPQN[noteLength];		
				  };																				//Creating MIDI File from converted text
				  console.log('noteLength ' + noteLength);
				  console.log('songPosition ' + songPosition);
				  //noteNumber = noteNumber-12;
				  if(ch ==0){
				  	tr1.addNote(parseFloat(songPosition),0,noteNumber,velocity,noteLength);   // clock current position, MIDI Channel, note, velociy, duration (clocks)
				  }
				  else{
					tr2.addNote(parseFloat(songPosition),0,noteNumber,velocity,noteLength);   // clock current position, MIDI Channel, note, velociy, duration (clocks)
				  };
				  songPosition = songPosition + parseFloat(noteLength);
			  };
			  
			  if (thisMaxRestLen > 0 && thisWordLen == c+1){								//end of word, generate duplicate output as a rest - note number with the same duration
					  songPosition = songPosition+(parseFloat(noteLength)*thisMaxRestLen);			
			  };
		 console.log('newSongPositionWithRest ' + songPosition); 	  
		 console.log('======================WORD===============================');
		 };	//end loop over word
	 	console.log('==========================SOURCE=========================');
		};		//end loop over textSource, 
	 console.log('=======================CHANNEL==============================');
	 };		//end loop over channels, write final output
	 console.log('conversion completed');	  
	  //$('#noteOutput').html(displayNote);
	  //OUTPUT - playing the piece or generating a MIDI file: Data will arrive -  songPosition,midiChannel,noteNumber,velocity,noteLength
	  if(thisMidiOutput ==0){
	  		midiOutArrary.sort();								//PREPARE - sort array to properly order all channels
			midiOutLen = midiOutArrary.length;
			 console.log('midiOutLen ' + midiOutLen);
		  	//Loop over arrary and ouptput
			for (var p = 0; p < midiOutLen; p++) {
    			var noteValueArray= midiOutArrary[p].split(',');
				var outSongPosition=parseFloat(noteValueArray[0]);
				var outMidiChannel=parseInt(noteValueArray[1]);
				var outNoteNumber=parseInt(noteValueArray[2]);
				var outVelocity=parseFloat(noteValueArray[3]);
				var outNoteLength=parseFloat(noteValueArray[4]);
				var outSongPositionEnd=parseFloat(noteValueArray[5]);
				console.log('playing note ' + p + ' note value' + outNoteNumber);
				console.log('playing outSongPosition ' + outSongPosition);
				console.log('playing outSongPositionEnd ' + outSongPositionEnd);
				
				displayThisNote = 'channel:' + outMidiChannel + ' / ' + 'note: ' + MIDI.noteToKey[outNoteNumber] ;
				//$('#ajaxpanel').html(displayThisNote);
				MIDI.setVolume(outMidiChannel, thisVolume);
				MIDI.noteOn(outMidiChannel, outNoteNumber, outVelocity, outSongPosition);						//play note
				MIDI.noteOff(outMidiChannel, outNoteNumber, outSongPositionEnd);
				};
	  }
	  else if(thisMidiOutput ==1){	
		  tr1.setTime(songPosition+1536); // add time to end - 4 whole notes
		  var str = mf.dump(); // MIDI file dumped as a string
		  var b64 = JZZ.MidiFile.toBase64(str); // convert to base-64 string
		  var uri = 'data:audio/midi;base64,' + b64; // data URI
		  // Finally, write it to the document as a link and as an embedded object:
		  document.getElementById('outputMIDI').innerHTML='MIDI File Ready: <a href=' + uri + '>DOWNLOAD HERE</a>';
		  }
	  else if(thisMidiOutput ==2){
		  tr1.setTime(songPosition+1536); // add time to end - 4 whole notes
		  var str = mf.dump(); // MIDI file dumped as a string
		  var b64 = JZZ.MidiFile.toBase64(str); // convert to base-64 string
		  var uri = 'data:audio/midi;base64,' + b64; // data URI
		  //play with player
	  };
 };
//================================================================
//	DOCUMENT READY
//================================================================
$(document).ready(function() {
	$('#ajaxpanel').html('<div class="success">Loading: <img src="img/ajax-loader.gif" alt="..." /></div>');
	$('#sonifyForm').submit(function(event) {
		event.preventDefault();
		processText();
	});
	//textSource Counter
    var text_max = 5000;
    $('#textarea_feedback0').html(text_max + ' characters remaining');
    $('#textSource0').keyup(function() {
        var text_length = $('#textSource0').val().length;
        var text_remaining = text_max - text_length;
        $('#textarea_feedback0').html(text_remaining + ' characters remaining');
    });
    $('#textarea_feedback1').html(text_max + ' characters remaining');
    $('#textSource1').keyup(function() {
        var text_length = $('#textSource1').val().length;
        var text_remaining = text_max - text_length;
        $('#textarea_feedback1').html(text_remaining + ' characters remaining');
    });	
	$('#fullSet0').hide();
	$('#fullSet1').hide();
	$('#fullSet0Long').hide();
	$('#fullSet1Long').hide();
	$('input[name=noteSet0]').on( "change", function() {
		var selectedSet = $(this).val();
		var setName = '';
		var setNameLong = '';
		$(".bothSets0").hide();
		if(selectedSet ==0){
			setName='standardSet0';
			setNameLong='standardSet0Long';
		}
		 else {
			 setName='fullSet0';
			 setNameLong='fullSet0Long';
		 }
         $("#"+setName).show();
		 $("#"+setNameLong).show();
    });		
	$('input[name=noteSet1]').on( "change", function() {
		var selectedSet = $(this).val();
		var setName = '';
		var setNameLong = '';
		$(".bothSets1").hide();
		if(selectedSet ==0){
			setName='standardSet1';
			setNameLong='standardSet1Long';
		}
		 else {
			 setName='fullSet1';
			 setNameLong='fullSet1Long';
		 }
         $("#"+setName).show();
		 $("#"+setNameLong).show();
    } );
});
