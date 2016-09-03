// Untitled Salem Tools App
/* Perform configuration for the app, and define its controllers.
Config steps:
	Change angular binding from curly-curly to curly-square.
	Register event types: death, revival, accusation, trial
Controllers:
	personasCtrl
	populationCtrl
	playerRosterCtrl
	autospyCtrl
	accusationCtrl
	trialCtrl
	gameEventCtrl
	salemClockCtrl */

var app = angular.module("salemApp", ['ngSanitize']);

/* Register event types.
All of these helper functions accept the gameEventProviderProvider as a
dependency, and call its registerType method to register an event type.
Registration for all includes a summary method that returns a string, and most
also define a details method returning a list of strings. */
var registerDeathEvent = function(eventProvider) {
	/* Register an event type 'death' and properties 'player', 'time', and
	'causes'. Summary string includes player name and time of death. Details
	strings describe the various causes of death. */
	var deathSummary = function() {
		var player = this.data.player.name || '[An unknown player]';
		var time = this.data.time.toString() || '[Time of death unknown]';
		return player + ' died on ' + time;
	}
	var deathDetails = function() {
		var details = [];
		for (var i = 0; i < this.data.causes.length; i++) {
			details.push(this.data.causes[i].note);
		}
		return details;
	}
	var deathObj = {
		summary: deathSummary,
		details: deathDetails};
	eventProvider.registerType('death', ['player', 'time', 'causes'], deathObj);
};

var registerReviveEvent = function(eventProvider) {
	/* Register an event type 'revival' and properties 'player', and 'time'.
	Summary string includes both properties. No details method is provided. */
	var reviveString = function() {
		var player = this.data.player.name || '[An unknown player]';
		var time = this.data.time.toString() || '[Time of revival unknown]';
		return player + ' was revived on ' + time;
	}
	var revivalObj = { summary: reviveString };
	eventProvider.registerType('revival', ['player', 'time'], revivalObj);
};

var registerAccuseEvent = function(eventProvider) {
	/* Register an event type 'accusation' and properties 'accused',
	'accusers', and 'time'. Summary string includes name of accused and time.
	Details	strings include the name of an accuser. */
	var accuseString = function() {
		var name = this.data.accused.name;
		var time = this.data.time.toString();
		return name + ' was put on trial on ' + time + '...';
	}
	var accuseDetails = function() {
		var details = [];
		for (var i = 0; i < this.data.accusers.length; i++) {
			details.push(this.data.accusers[i].name + ' voted against');
		}
		return details;
	}
	var accuseObj = {
		summary: accuseString,
		details: accuseDetails
	}
	eventProvider.registerType('accusation',
		['accused', 'accusers', 'time'], accuseObj);
};

var registerTrialEvent = function(eventProvider) {
	/* Register an event type 'trial' and properties 'accused', 'verdict'
	'time', and 'tally'. Summary string includes name of accused, verdict, and
	time. Details strings include a name and vote from the tally. */
	var trialString = function() {
		var name = this.data.accused.name;
		var verdict = this.data.verdict;
		var time = this.data.time.toString();
		return name + ' was found ' + verdict + ' on ' + time;
	}
	var trialDetails = function() {
		details = [];
		for (var i = 0; i < this.data.tally.length; i++) {
			var detail = this.data.tally[i].player.name;
			var choice = this.data.tally[i].choice;
			if (choice == 'abstain') {
				detail += ' abstained';
			}
			else {
				detail += ' voted ' + choice;
			}
			details.push(detail);
		}
		return details;
	}
	var trialObj = {
		summary: trialString,
		details: trialDetails
	}
	eventProvider.registerType('trial',
		['accused', 'verdict', 'time', 'tally'], trialObj)
};

app.config(function($interpolateProvider, gameEventProviderProvider) {
	/* Alter the symbols for bindings so AngularJS and Flask can play nicely. */
	$interpolateProvider.startSymbol('{[');
	$interpolateProvider.endSymbol(']}');

	/* Call helper functions to register game events. */
	registerDeathEvent(gameEventProviderProvider);
	registerReviveEvent(gameEventProviderProvider);
	registerAccuseEvent(gameEventProviderProvider);
	registerTrialEvent(gameEventProviderProvider);

});

app.controller("personasCtrl", function ($scope, $rootScope, personasFactory) {
	/* Controls a list of all defined personas, and user settings for desired
	teams or specificities (meaning, specific roles vs general categories).
	Listens for requests from populationCtrl to allow users to select roles to
	be added to population lists, and broadcasts any such selections. */
	$scope.data = {
		personasLoading: true,
		personasError: null,
		personas: null,
		selectedSpecificity: null,
		selectedTeam: null,
		specificityValues: ["Roles", "Alignments"],
		teamValues: ["Town", "Neutral", "Mafia"],
		showAddToCustomButton: false
	}

	personasFactory.then(function(result) {
		$scope.data.personasLoading = false;
		$scope.data.personas = result;
	}, function(error) {
		$scope.data.personasLoading = false;
		$scope.data.personasError = error;
	});

	$scope.updateSelectedSpecificity = function(clicked) {
		// If what's already clicked is clicked again,
		// unselect it and remove this restriction.
		// Otherwise, change restriction to the new value.
		if (clicked == null) {
			return;
		}
		if (clicked == $scope.data.selectedSpecificity) {
			$scope.data.selectedSpecificity = null;
		}
		else {
			$scope.data.selectedSpecificity = clicked;
		}
	}

	$scope.updateSelectedTeam = function(clicked) {
		// If what's already clicked is clicked again,
		// unselect it and remove this restriction.
		// Otherwise, change restriction to the new value.
		if (clicked == null) {
			return;
		}
		if (clicked == $scope.data.selectedTeam) {
			$scope.data.selectedTeam = null;
		}
		else {
			$scope.data.selectedTeam = clicked;
		}
	}

	$scope.addToCustom = function(persona) {
		$rootScope.$broadcast('add to custom game', persona)
	}

	$scope.$on('set add to custom game button', function (event, setting) {
		if (setting == undefined) {
			return;
		}
		else if (setting == 'on') {
			$scope.showAddToCustomButton = true;
		}
		else if (setting == 'off') {
			$scope.showAddToCustomButton = false;
		}
	})
});

app.controller("populationCtrl", function ($scope, $rootScope, populationsFactory) {
	/* Controls the list of game modes and roles in those modes. Relies on
	personasCtrl for adding roles to the Custom mode, by broadcasting requests
	start and stop asking for additions, and listening for those additions. */
	$scope.data = {
		populationsLoading: true,
		populationsError: null,
		populations: null,
		selectedMode: null
	}

	populationsFactory.then(function(result) {
		$scope.data.populationsLoading = false;
		$scope.data.populations = result;
	}, function(error) {
		$scope.data.populationsLoading = false;
		$scope.data.populationsError = error;
	});

	$scope.$on('add to custom game', function(event, persona) {
		$scope.data.populations.get('Custom').push(persona);
	})

	$scope.removeFromCustom = function(index) {
		$scope.data.populations.get('Custom').splice(index, 1);
	}

	$scope.broadcastEditMode = function (state) {
		$rootScope.$broadcast(
			'set add to custom game button',
			state ? 'on' : 'off');
	}
});

app.controller("playerRosterCtrl", function ($scope, $rootScope,
	playerRosterFactory) {
	/* Controls the list of players, events involving them, and information
	about them. Sends requests to other controllers for collecting data for
	those events or pieces of information. */
	$scope.data = {
		playerRoster: playerRosterFactory,
		graveyard: [],
	};

	var killPlayer = function (player) {
		player.kill();
		$scope.data.graveyard.push(player);
	}

	$scope.playerKilled = function(player) {
		if (player == null) {
			return;
		}
		$rootScope.$broadcast('autopsyStart', player);
	}

	$scope.playerAccused = function (player) {
		if (player == null) {
			return;
		}
		$rootScope.$broadcast('accusationStart', player);
	}

	$scope.playerQuit = function(player) {
		player.leave();
	}

	$scope.playerRevived = function(player) {
		if (player == null) {
			return;
		}
		var index = $scope.data.graveyard.indexOf(player);
		if (index > -1) {
			player.revive();
			$scope.data.graveyard.splice(index, 1);
			$rootScope.$broadcast('revival', {player: player});
		}
	}

	$scope.$on("autopsyConfirm", function(event, autopsy) {
		killPlayer(autopsy.player)
	});
});

app.controller("autopsyCtrl", function ($scope, $rootScope,
	causesOfDeathFactory, salemTextColorFactory) {
	/* Controls a list of reasons a player in the game was killed. Broadcasts
	event data when user confirms the list. Listens for requests from other
	controllers to appear to the user. Also listens for requests to broadcast
	data for a hanging, restricting reliance on causesofDeathFactory. */
	$scope.data = {
		causesLoading: true,
		causesError: false,
		causesOfDeath: null,
		selectedCauses: [],
		victim: null,
		show: false,
		getColor: function() {
			return ''
		}
	};

	var lynchCause = null;

	salemTextColorFactory.then(function (result) {
		$scope.data.getColor = result;
	})

	causesOfDeathFactory.then( function(causes) {
		$scope.data.causesLoading = false;
		$scope.data.causesOfDeath = causes;
		// Find the lynch cause now, to rubberstamp execution autopsies later.
		for (var i = 0; i < causes.length; i++) {
			if (causes[i].team == 'Town') {
				lynchCause = causes[i];
			}
		}
	}, function(error) {
		$scope.data.causesLoading = false;
		$scope.data.causesError = error;
	});

	var reset = function() {
		$scope.data.victim = null;
		$scope.data.selectedCauses = [];
	};

	var setup = function (victim) {
		$scope.data.victim = victim;
	};

	$scope.isSelected = function (cause) {
		return $scope.data.selectedCauses.indexOf(cause) >= 0;
	};

	$scope.toggleCause = function(cause) {
		if (cause == null) {
			return;
		}
		var index = $scope.data.selectedCauses.indexOf(cause);
		if (index > -1) {
			$scope.data.selectedCauses.splice(index, 1);
		}
		else {
			$scope.data.selectedCauses.push(cause);
		}
	};

	$scope.confirm = function() {
		var autopsy = {
			player: $scope.data.victim,
			causes: []
		}
		for (var i = 0; i < $scope.data.selectedCauses.length; i++) {
			autopsy.causes.push($scope.data.selectedCauses[i]);
		}
		$rootScope.$broadcast('autopsyConfirm', autopsy);
		$scope.close();
	};

	$scope.close = function() {
		reset();
		$scope.data.show = false;
	};

	$scope.$on('autopsyStart', function (event, victim) {
		reset();
		setup(victim);
		$scope.data.show = true;
	});

	$scope.$on('obviousSuicide', function (event, deceased) {
		var autopsy = {
			player: deceased,
			causes: [lynchCause]
		};
		$rootScope.$broadcast('autopsyConfirm', autopsy);
	});
});

app.controller('accusationCtrl', function($scope, $rootScope,
	playerRosterFactory) {
	/* Controls entry of the list of players who voted to put another player
	on the stand. Listens for requests to begin and broadcasts results. */
	$scope.data = {
		accused: null,
		players: [],
		accusers: [],
		show: false
	}

	var reset = function() {
		$scope.data.accused = null;
		$scope.data.players = [];
		$scope.data.accusers = [];
	}

	var setup = function(accused) {
		$scope.data.accused = accused;
		for (var i = 0; i < playerRosterFactory.length; i ++) {
			var player = playerRosterFactory[i];
			if (player.alive && player != accused) {
				$scope.data.players.push(player);
			}
		}
	}

	$scope.isVoting = function(player) {
		return $scope.data.accusers.indexOf(player) > -1
	}

	$scope.toggleVote = function (player) {
		if (player == null || $scope.data.players.index == -1) {
			return;
		}
		var index = $scope.data.accusers.indexOf(player);
		if (index > -1) {
			$scope.data.accusers.splice(index, 1);
		}
		else {
			$scope.data.accusers.push(player);
		}
	}

	$scope.confirmAndLogVotes = function () {
		accusation = {
			accused: $scope.data.accused,
			accusers : []
		}
		for (var i = 0; i < $scope.data.accusers.length; i++) {
			accusation.accusers.push($scope.data.accusers[i]);
		}
		$rootScope.$broadcast('accusationConfirm', accusation);
		$rootScope.$broadcast('trialStart', accusation.accused);
		$scope.close();
	}

	$scope.confirmAndSkipVotes = function () {
		var accusation = {
			accused: $scope.data.accused,
			accusers: []
		}
		$rootScope.$broadcast('accusationConfirm', accusation);
		$rootScope.$broadcast('trialStart', accusation.accused);
		$scope.close();
	}

	$scope.close = function() {
		reset();
		$scope.data.show = false;
	}

	$scope.$on('accusationStart', function (event, accusedPlayer) {
		reset();
		setup(accusedPlayer);
		$scope.data.show = true;
	});
});

app.controller('trialCtrl', function($scope, $rootScope,
	playerRosterFactory, juryService) {
	/* Controls entry of the which players voted which way during a trial.
	Listens for requests to begin and broadcasts results. */
	$scope.data = {
		choices: ['guilty', 'abstain', 'innocent'],
		accused: null,
		jury: juryService,
		show: false
	}

	var reset = function () {
		$scope.data.accused = null;
		$scope.data.jury.clear();
	}

	var setup = function (accused) {
		$scope.data.accused = accused;
		$scope.data.jury.startTrialFor(accused);
	}

	$scope.close = function () {
		reset();
		$scope.data.show = false;
	}

	$scope.confirmAndLogVotes = function () {
		console.log($scope.data.jury);
		if ($scope.data.jury.votes.guilty.length >
			$scope.data.jury.votes.innocent.length) {
			var verdict = 'guilty';
		}
		else {
			var verdict = 'innocent';
		}

		var trial = {
			accused: $scope.data.accused,
			verdict: verdict,
			tally: $scope.data.jury.getTally()
		};
		$rootScope.$broadcast('trialConfirm', trial);
		$scope.close();
	}

	$scope.confirmAndSkipVotes = function (verdict) {
		var trial = {
			accused: $scope.data.accused,
			verdict: verdict,
			tally: []
		};
		$rootScope.$broadcast('trialConfirm', trial);
		$scope.close();
	}

	$scope.$on('trialStart', function (event, accused) {
		reset();
		setup(accused);
		$scope.data.show = true;
	});
});

app.controller('gameEventLogCtrl', function($scope, $rootScope,
	salemClockFactory, gameEventProvider, gameEventLogFactory) {
	/* Controls the log of all events occurring during the game. Listens for
	broadcast events, and adds a timestamp (so other controllers can ignore
	the clock), before creating and adding the event. */
	var clock = salemClockFactory;
	var eventLog = gameEventLogFactory;

	$scope.data = {
		events: eventLog.entries
	};

	var addEvent = function (eventType, eventData) {
		eventData.time = salemClockFactory.getTime();
		var gameEvent = gameEventProvider.create(eventType, eventData)	;
		eventLog.log(gameEvent);
	};

	$scope.$on('autopsyConfirm', function(event, eventData) {
		addEvent('death', eventData);
	});

	$scope.$on('revival', function(event, eventData) {
		addEvent('revival', eventData);
	});

	$scope.$on('accusationConfirm', function(event, eventData) {
		addEvent('accusation', eventData);
	});

	$scope.$on('trialConfirm', function(event, eventData) {
		addEvent('trial', eventData);
		if (eventData.verdict == 'guilty') {
			$rootScope.$broadcast('obviousSuicide', eventData.accused);
		}
	});
});

app.controller('salemClockCtrl', function($scope, salemClockFactory) {
	/* Clock clock clock clock clock. Hardly sounds like a word anymore. */
	$scope.data = {
		clock: salemClockFactory
	};
});