/*
 * Copyright 2016 Willow Sells 
 * This code is licensed under the GNU GPLv3
 */

var game = function() {

	/* These two quick functions have been put in just to pretty things up (and make the coding easier, too).
	Should I be doing this? I don't know. */
	function cleanid(id) {
		return(document.getElementById(id));
	};
	function cleanclass(name,index) {
		return(document.getElementsByClassName(name)[index]);
	};

	settings = {
		/* Contained here are settings that are intended to be edited for optimized gameplay
		(namely number ranges and operator types) as well as functions that aid the use of the settings
		and that aid the user in changing settings. */

		ranges: {
			addition: 100,
			subtraction: 100,
			timesx: [2,3,4,5,6,7,8,9],
			timesy: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
			division: 100,
		},
		operatorsettings: {
			"+": true,
			"-": true,
			"x": true,
			"/": true
		},
		alloperators: ["+","-","x","/"],
		chosenoperators: [],
		choseoperators: function() {
			settings.chosenoperators = settings.alloperators.filter(
				function(element) {
					if (settings.operatorsettings[element]){
						return(element)
					}
				}
			)
		}
	};

	function setup() {
		generate();
		pause();
	}

	var problem = "";
	var answer = 0;
	function generate() {
		/* This is the core function of the game. It:
		1) generates a random math problem based on the settings above
		2) declares an answer and
		3) physically outputs the problem
		Changes may come here if I come up with better logic for such calculations. */

		function randomoutof(i) {
			return Math.floor(Math.random()*i)+1;
		}
		function randomwithin(a) {
			return a[(Math.floor((Math.random()*a.length)))];
		}

		settings.choseoperators();
		var operator = randomwithin(settings.chosenoperators);

		switch (operator) {
			case "+":
				/* This logic creates a random number between 0 and the input number. The difference between the first random number and the input value is then calculated.
				The second random number is generated between zero and the calculated difference.
				This means the addition problem will never be greater than the input value. */
				var zo = settings.ranges.addition;
				var x = randomoutof(zo);
				var zi = zo - x;
				var y = randomoutof(zi);
				break;

			case "-":
				/* This logic creates a random number between 0 and the input number, then calculates a random number between zero and the first random number.
				This means the subtraction problem will never equal less than zero. */
				var zo = settings.ranges.subtraction;
				var x = randomoutof(zo);
				var y = randomoutof(x);
				break;

			case "x":
				/* This logic picks two random numbers out of the input arrays.
				This allows the user to pick the multiplication tables allowed in the problems. */
				var x = randomwithin(settings.ranges.timesx);
				var y = randomwithin(settings.ranges.timesy);

				operator = "*";

				break;

			case "/":
				/* This logic picks a random number between one and the input value.
				It then calculates all factors of that random number and randomly picks one of those factors. */
				var zo = settings.ranges.division - 1;
				var divisors = [];

				while(divisors.length < 1) {
					var divisor = [];
					var x = randomoutof(zo) + 1;
					var r = 0;
					for (var i = 2; i <= (x/3); i++) {
						r = x%i;
						if(r == 0) {
							divisors.push(i);
						}
					}
				}
				var y = randomwithin(divisors);
				break;
		}

		problem = x + " " + operator + " " + y;

		answer = eval(problem);

		cleanid("question").innerHTML = problem;
	};

	function clear() {
		cleanid("response").value="";
	}

	function eventdirect(event){

		var key = event.keyCode;

		if(key === 13 || key === 9) {
			check();
		}
		else if(key === 32) {
			pause();
		}
	}

	function check() {
		var response = document.getElementById("response").value;
		if(paused%2 != 0){
			if(!isNaN(response)) {
				if(Number(response) === answer) {
					generate();
					scoring(true);
				}
				else {
					flash();
					scoring(false);
				}
			}
		}
	}



	var totalseconds = 0;
	var seconds = 0;
	function timer(turn) {
		/*This function turns itself on on first call, and then can be turned on or off.
		It counts playtime and questiontime and outputs that information both to the page and to external variables used elsewhere.*/

		/* A sort of convoluted way of using setInterval, as it's calling the same function
		it was defined within. However, this seems to work better and is more concise than other
		strategies I've come up with. */
		if ((typeof running === 'undefined')||(turn === "on")) {
		running = setInterval(timer,1000);
		}
		if (turn === "off") {
		clearInterval(running);
		seconds = 0;
		}

		var readabletime = totalseconds + "s";
		if (totalseconds > 60) {
			var minutes = Math.floor(totalseconds/60);
			readabletime = minutes + "m " + totalseconds%60 + "s";
		}
		cleanid("totaltime").innerHTML = readabletime;
		cleanid("seconds").innerHTML = seconds;
		cleanid("score").innerHTML = score;

		totalseconds ++;
		seconds ++;
	}

	var	score = 0;

	function scoring(check) {
		if (check) {
			score = (score + parseInt(10/(1+seconds)));
			seconds = 0;
			clear();
		}
		else if (!check) {
			score = (score - (1 * seconds));
		}
	}

	function flash() {
		var background = cleanclass('grade', 0);
		var internaltime = 0;
		background.classList.add('fail');
		function internalcount(){
			internaltime++;
			if (internaltime > 1) {
				clearInterval(begininternalcount);
				background.classList.remove('fail');
			}
		}
		var begininternalcount = setInterval(internalcount,100);
		clear();
	}

	var paused = 1;
	function pause() {
		if(paused%2==0) {
			timer("on");
			generate();
			cleanid('response').classList.remove('hidden');
			cleanid('statustext').innerHTML="PAUSE";
			cleanid('response').focus();

		}
		else {
			timer("off");
			cleanid('seconds').innerHTML = "---";
			cleanid('question').innerHTML="PAUSED";
			cleanid('statustext').innerHTML="PLAY";
			cleanid('response').classList.add('hidden');
		}
		paused++;
	}

	function restart() {
		totalseconds = 0;
		seconds = 0;
		score = 0;
		paused = 1;
		pause();
	}

	setup();
	cleanid("status").onclick = pause;
	cleanid("question").onclick = pause;
	cleanid("restart").onclick = restart;
	document.body.onkeydown = eventdirect;

}
window.onload = game;
