// Untitled Salem Tools App

var app = angular.module("salemApp", ['ngSanitize']);

app.config(function($interpolateProvider, gameEventProviderProvider) {
	$interpolateProvider.startSymbol('{[');
	$interpolateProvider.endSymbol(']}');

	var deathString = function() {
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
		toString: deathString,
		details: deathDetails};
	gameEventProviderProvider.registerType('death', ['player', 'time', 'causes'], deathObj);

	var reviveString = function() {
		var player = this.data.player.name || '[An unknown player]';
		var time = this.data.time.toString() || '[Time of revival unknown]';
		return player + ' was revived on ' + time;
	}
	var revivalObj = { toString: reviveString };
	gameEventProviderProvider.registerType('revival', ['player', 'time'], revivalObj);

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
		toString: accuseString,
		details: accuseDetails
	}
	gameEventProviderProvider.registerType('accusation',
		['accused', 'accusers', 'time'], accuseObj);

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
		toString: trialString,
		details: trialDetails
	}
	gameEventProviderProvider.registerType('trial',
		['accused', 'verdict', 'time', 'tally'], trialObj)

});

app.controller("personasCtrl", function ($scope, $rootScope, personasFactory) {
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

app.controller("autopsyCtrl", function ($scope, $rootScope,
	causesOfDeathFactory, salemTextColorFactory) {
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
		// Admittedly not exactly clean, but this allows
		// every other controller to ignore causes of death.
		var autopsy = {
			player: deceased,
			causes: [lynchCause]
		};
		$rootScope.$broadcast('autopsyConfirm', autopsy);
	});
});

app.controller("playerRosterCtrl", function ($scope, $rootScope,
	playerRosterFactory) {
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

app.controller('accusationCtrl', function($scope, $rootScope,
	playerRosterFactory) {
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
	$scope.data = {
		clock: salemClockFactory
	};
});