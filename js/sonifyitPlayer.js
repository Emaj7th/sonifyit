<!--

<div class="player" style="height: 42px; box-shadow: 0 -1px #000; margin-bottom: 0; border-bottom-right-radius: 0; border-bottom-left-radius: 0;">
  <div style="margin: 0 auto; width: 160px; float: right;">
    <input type="image" src="./images/pause.png" align="absmiddle" value="pause" onClick="pausePlayStop()" id="pausePlayStop">
    <input type="image" src="./images/stop.png" align="absmiddle" value="stop" onClick="pausePlayStop(true)">
    <input type="image" src="./images/backward.png" align="absmiddle" value="stop" onClick="player.getNextSong(-1);">
    <input type="image" src="./images/forward.png" align="absmiddle" value="stop" onClick="player.getNextSong(+1);">
  </div>
  <div class="time-controls" style="float: left; margin: 0; position: relative; top: 5px;">
  <span id="time1" class="time">0:00</span> <span id="capsule"> <span id="cursor"></span> </span> <span id="time2" class="time" style="text-align: left;">-0:00</span> </div>
</div>

-->


<script>
	/// Toggle between Pause and Play modes
	var pausePlayStop = function(stop) {
		var d = document.getElementById("pausePlayStop");
		if (stop) {
			MIDI.player.stop();
			d.src = "./images/play.png";
		} else if (MIDI.player.isPlaying) {
			d.src = "./images/play.png";
			MIDI.player.pause(true);
		} else {
			d.src = "./images/pause.png";
			MIDI.player.play();
		}
	};

	eventjs.add(window, "load", function(event) {
		
		/// load up the piano keys
		var colors = document.querySelector(".keys");
		var colorElements = [];
		for (var n = 0; n < 88; n++) {
			var d = document.createElement("div");
			d.innerHTML = MIDI.noteToKey[n + 21];
			colorElements.push(d);
			colors.appendChild(d);
		}
		///
		MIDI.loader = new sketch.ui.Timer;
		MIDI.loadPlugin({
			soundfontUrl: "./soundfont/",
			onprogress: function(state, progress) {
				MIDI.loader.setValue(progress * 100);
			},
			onsuccess: function() {
				/// this sets up the MIDI.player and gets things going...
				player = MIDI.player;
				player.timeWarp = 1; // speed the song is played back
				// no auto play - player.loadFile(song[songid++ % song.length], player.start);

				/// control the piano keys colors
				player.addListener(function(event) {
					var pianoKey = event.noteNumber - 21;
					var d = colorElements[pianoKey];
					if (d) {
						if (event.status === 144) {

							d.style.background = "#FF00BF";
							d.style.color = "#fff";
						} else {
							d.style.background = "";
							d.style.color = "";
						}
					}
				});
				///
				MIDIPlayerPercentage(player);
			}
		});
	});

	var MIDIPlayerPercentage = function(player) {
		// update the timestamp
		var time1 = document.getElementById("time1");
		var time2 = document.getElementById("time2");
		var capsule = document.getElementById("capsule");
		var timeCursor = document.getElementById("cursor");
		//
		eventjs.add(capsule, "drag", function(event, self) {
			eventjs.cancel(event);
			player.currentTime = (self.x) / 420 * player.duration;
			if (player.currentTime < 0) player.currentTime = 0;
			if (player.currentTime > player.duration) player.currentTime = player.duration;
			if (self.state === "down") {
				player.pause(true);
			} else if (self.state === "up") {
				player.play();
			}
		});
		//
		function timeFormatting(n) {
			var minutes = n / 60 >> 0;
			var seconds = String(n - (minutes * 60) >> 0);
			if (seconds.length == 1) seconds = "0" + seconds;
			return minutes + ":" + seconds;
		};
		player.setAnimation(function(event, element) {
			var progress = event.progress;
			var currentTime = event.currentTime >> 0; // where we are now
			var duration = event.duration >> 0; // end of song
			///
			timeCursor.style.width = (progress * 100) + "%";
			time1.innerHTML = timeFormatting(currentTime);
			time2.innerHTML = "-" + timeFormatting(duration - currentTime);
		});
	};
	
	 
	
	// Begin loading indication.
	var player;
	var songid = 0;
	var song = [
		// Test 1
//		'data:audio/mid;base64,TVRoZAAAAAYAAQABAMBNVHJrAAAARwD/WAQEAhgIAP9RAwehIAD/AwlOZXcgVHJhY2sAwHMAkDxkMoA8MIEOkDxkMoA8MIEOkDxkMoA8MIEOkDxkgT+APDAB/y8A',
		// Test 2
//		'data:audio/mid;base64,TVRoZAAAAAYAAQABAMBNVHJrAAAAVwD/WAQEAhgIAP9RAwehIAD/AwlOZXcgVHJhY2sAwAAAkDxkgRCAPDAwkDxkgRCAPDAwkDxkAJBAZACQQ2SBEIA8MACAQDAAgEMwMJA8ZIE/gDwwJv8vAA==',
		// Test 3
//		'data:audio/mid;base64,TVRoZAAAAAYAAQABAMBNVHJrAAAAXwD/WAQEAhgIAP9RAwehIAD/AwlOZXcgVHJhY2sAwAAAkDxkgRCAPDAwkDxkgRCAPDAwkDxkAJBAZACQQ2QHkEhkgQmAPDAAgEAwAIBDMACASDAwkDxkgT+APDAm/y8A',

	];
</script>