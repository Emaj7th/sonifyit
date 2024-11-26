//================================================================
//ALL GET FUNCTIONS
//================================================================
//getText() - either from text area in UI, or take URL from text field, generate YQL URL get JSON result, set value to textSource document.getElementById("textareaID").value
function getText() {
	var str = document.getElementById("textSource").value;
	var strTrim = str.trim(); 
	var returnText = "";
	if (validateURL(strTrim)) {		//checking if valid URL to reqeuest or if the value is just text
		//request YQL url with the submitted URL - returns JSON - extract the text from the result.
		// https://query.yahooapis.com/v1/public/yql?q=select * from html where url="https://www.reddit.com/" and xpath='//text()'&format=json&diagnostics=true&callback=
		var uriEnc = encodeURI(strTrim);
		var uriFull = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + uriEnc + "%22%20and%0A%20%20%20%20%20%20xpath%3D'%2F%2Ftext()'&format=json&diagnostics=true&callback=";
		$.ajax({
		  type: 'GET',
		  url: strTrim,
		  beforeSend:function(){					// this is where we append a loading image
			$('#ajaxpanel').html('<div class="success">Loading...<br /><img src="img/ajax-loader.gif" alt="Loading..." /></div>');
		  },
		  success:function(data){					// successful request; do something with the data
			$('#ajaxpanel').html('<div class="success">Request successful, now processing...</div>');
				returnText = data.query.results;	//results in json format:  {"query":{"results":"text from URL here"}}
		  },
		  error:function(){							// failed request; give feedback to user
			$('#ajaxpanel').html('<div class="error"><strong>Error</strong> the address you entered did not respond.</div>');
		  }
		});
	} 
	else {
		returnText = strTrim;					//String is text
	}
	return returnText;
};
//getKey() function - from UI Setting
function getKey() {
	return parseInt($("#key").val());
};
//getScale() function - from UI Setting
function getScale() {
	return $("#scale").val();
};
//getTempo() funtion - from UI Setting
function getTempo() {
	return $("#tempo").val();
};
//getShortestNote() funtion from UI Setting
function getShortestNote() {
	return $("#shortestNote").val();
};
//getMinVelocity() funtion from UI Setting
function getMinVelocity() {
	return $("#minVelocity").val();
};
//getInstrument() funtion from UI Setting
function getInstrument() {
	return $("#instrument").val();
};
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
function getCorrectValue(value,maxValue){
	var returnVal=0;
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

//main function
function processText() {
	var thisKey=getKey();						//get the key
	var thisScale=getScale();					//get the scale
	var thisScaleArray =thisScale.split(",");								//create array from the scale
	var thisScaleArrayLen=thisScaleArray.length;
	var thisMinVelocity=getMinVelocity();		//get the velocity
	var thisShortestNote=getShortestNote();		//get the shortest note
	var thisTempo=getTempo();					//get the tempo
	var thisInstrument=getInstrument();			//get the isntrument
	var str = getText();						//get the content to concert
	var strLen = str.length;					//for checking if there is any content
	var wordsArray = str.split(" "); 			//split text into an array based on space
	var wordsLength = wordsArray.length;		// get the length of the array
	var songPosition = 0;						//used in for loops to tracking when notes play
	var newSongPosition = 0;						//used in for loops to tracking when notes play
	arrayCheck=
	console.log('scale array check: ' + Array.isArray(thisScaleArray));
	console.log('thisScale' + thisScale);							//Debug

	//loop over words array
	if(strLen){									//only process if the content has length
		$('#ajaxpanel').html('<div class="success">Request successful, now playing...</div>');
		MIDI.programChange(0, thisInstrument); 		// Load thisInstrument into Channel 0
	
	for (var i = 0; i < wordsLength; i++) {
		var thisWord = wordsArray[i];			//get a word from the array
		console.log(thisWord);					//Debug
		var thisWordLen = thisWord.length;		//get the length of each word - which is used as an offset per each character's procesing
		//loop over characters in work array
		for (var c = 0; c < thisWordLen; c++) {
			var thisChar = thisWord.charAt(c);										// extract a char from a word
			//var matchedChar = ASCII.findIndex(thisChar);							//find char in sonifyitData.min.js - array: ASCII
			console.log(thisChar);					//Debug
			var matchedChar = jQuery.inArray(thisChar, ASCII);
			//get char's values	
			var noteLength= getCorrectValue(NA1[matchedChar]+thisWordLen,13);		//get noteLength (shortestNote-13)	Seconds=(NoteValue/BPM)+lastNoteLen
			var scalePosition= getCorrectValue(NA2[matchedChar]+thisWordLen,thisScaleArrayLen-1);		//get scalePosition - subtracted by 1 to start with Zero
			var octave= getCorrectValue((NA3[matchedChar]+thisWordLen)-1,8);		//get octave - octave (1-8)
			var velocity= getCorrectValue(NA4[matchedChar]+thisWordLen,127);		//get velocity (1-127)
			var scaleoffset = parseInt(thisScaleArray[scalePosition]);						//get scale offset from the selected scale and derived scale positon
			//DEBUG TO CONSOLE	
			console.log('thisScaleArrayLen ' + thisScaleArrayLen);
			console.log('velocity ' + velocity);
			console.log('scaleoffset ' + scaleoffset);
			var noteNumber = (octave*12)+thisKey+scaleoffset;						//get note value by multiplying the derived octave by 12, then adding the key and scale offset
			if (velocity < thisMinVelocity){										//apply the min velocity value
				velocity=thisMinVelocity;
			};
			if (noteLength < thisShortestNote){										//apply the shortest note value
				noteLength=thisShortestNote;
			};
			//DEBUG TO CONSOLE
			console.log('octave ' + octave);
			console.log('thisKey ' + thisKey);
			console.log('scalePosition ' + scalePosition);
			console.log('noteNumber ' + noteNumber);
			
			//sets the last NoteLen so the notes occur in time
			//channelId, noteId, velocity, delay
			noteLength = (noteValues[noteLength]/thisTempo).toFixed(3);	
			newSongPosition = parseFloat(songPosition) + parseFloat(noteLength);								//sets newSongPositon, which is the end time of noteOff
			//DEBUG TO CONSOLE
			console.log('newSongPosition ' + newSongPosition);
			console.log('noteLength ' + noteLength);
			console.log('songPosition ' + songPosition);
			
			MIDI.noteOn(0, noteNumber, velocity, songPosition);						//play note
			MIDI.noteOff(0, noteNumber, newSongPosition);
			songPosition = newSongPosition;
			if (c == thisWordLen && thisChar == '.'){								//if word ends with a period, generate duplicate output as a rest - note number with the same duration
				songPosition = newSongPosition+parseFloat(noteLength);			
			}
		}	//end loop over word
	};		//end loop over textSource, write final output
	};		//end if statement if str had length
};

//================================================================
//	DOCUMENT READY
//================================================================
$(document).ready(function() {
	$('#ajaxpanel').html('<div class="success">Initializing... please wait.<br /><img src="img/ajax-loader.gif" alt="..." /></div>');
	// loading the midi plugin to play the resulting midi data
	
	$("#sonifyForm").submit(function(event) {
		event.preventDefault();
		processText();
	});
	//textSource Counter
    var text_max = 5000;
    $('#textarea_feedback').html(text_max + ' characters remaining');
    $('#textSource').keyup(function() {
        var text_length = $('#textSource').val().length;
        var text_remaining = text_max - text_length;
        $('#textarea_feedback').html(text_remaining + ' characters remaining');
    });
});
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
//URL Validation Function
function validateURL(textval) {
	var urlregex = new RegExp(
	"/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i");
	return urlregex.test(textval);
	}