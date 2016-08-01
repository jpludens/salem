// Untitled Salem Tools App

var app = angular.module("salemApp", []);

app.config(function($interpolateProvider, gameEventProviderProvider) {
	$interpolateProvider.startSymbol('{[');
	$interpolateProvider.endSymbol(']}');

	var deathString = function() {
		var player = this.data.player.name || '[An unknown player]';
		var time = this.data.time.toString() || '[Time of death unknown]';
		return player + ' died on ' + time;
	}
	var deathObj = { toString: deathString };
	gameEventProviderProvider.registerType('death', ['player', 'time'], deathObj);

	var reviveString = function() {
		var player = this.data.player.name || '[An unknown player]';
		var time = this.data.time.toString() || '[Time of revival unknown]';
		return player + ' was revivied on ' + time;
	}
	var revivalObj = { toString: reviveString };
	gameEventProviderProvider.registerType('revival', ['player', 'time'], revivalObj);
});

app.controller("personasCtrl", function ($scope, $rootScope, personasFactory) {
	$scope.data = {
		personasLoading: true,
		personasError: null,
		personas : null
	}

	personasFactory.then(function(result) {
		$scope.data.personasLoading = false;
		$scope.data.personas = result;
	}, function(error) {
		$scope.data.personasLoading = false;
		$scope.data.personasError = error;
	});

	$scope.specRest = null;
	$scope.teamRest = null;
	$scope.held = null;
	$scope.showAddToCustomButton = false;
	
	$scope.specRestValues = ["Roles", "Alignments"];
	$scope.teamRestValues = ["Town", "Neutral", "Mafia"]

	$scope.updateSpecRest = function(clicked) {
		// If what's already clicked is clicked again,
		// unselect it and remove this restriction.
		// Otherwise, change restriction to the new value.
		if (clicked == null) {
			return;
		}
		if (clicked == $scope.specRest) {
			$scope.specRest = null;
		}
		else {
			$scope.specRest = clicked;
		}
	}

	$scope.updateTeamRest = function(clicked) {
		// If what's already clicked is clicked again,
		// unselect it and remove this restriction.
		// Otherwise, change restriction to the new value.
		if (clicked == null) {
			return;
		}
		if (clicked == $scope.teamRest) {
			$scope.teamRest = null;
		}
		else {
			$scope.teamRest = clicked;
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
		populations : null
	}

	populationsFactory.then(function(result) {
		$scope.data.populationsLoading = false;
		$scope.data.populations = result;
	}, function(error) {
		$scope.data.populationsLoading = false;
		$scope.data.populationsError = error;
	});


	// $scope.populations = populationsFactory;
	$scope.gameMode = null;

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


app.controller("playerRosterCtrl", function ($scope, $rootScope, playerRosterFactory) {

	$scope.data = {
		playerRoster: playerRosterFactory,
		graveyard: [],
		editingNameAt: -1
	};

	$scope.switchEditingNameAt = function (playerNumber) {
		if (playerNumber == $scope.data.editingNameAt) {
			$scope.data.editingNameAt = -1;
		}
		else {
			$scope.data.editingNameAt = playerNumber;
		}
	}

	$scope.killPlayer = function(player) {
		if (player == null) {
			return;
		}
		player.alive = false;
		$scope.data.graveyard.push(player);
		var eventDescription = {
			eventType: 'death',
			eventData: {
				player: player
			}
		}
		$rootScope.$broadcast('Game Event', eventDescription);
	}

	$scope.revivePlayer = function(player) {
		if (player == null) {
			return;
		}
		var index = $scope.data.graveyard.indexOf(player);
		if (index > -1) {
			player.alive = true;
			$scope.data.graveyard.splice(index, 1);
			var eventDescription = {
				eventType: 'revival',
				eventData: {
					player: player
				}
			}
			$rootScope.$broadcast('Game Event', eventDescription);
		}
	}
});

app.controller('gameEventLogCtrl', function($scope, $rootScope,
	salemClockFactory, gameEventProvider, gameEventLogFactory) {
	var clock = salemClockFactory;
	var eventLog = gameEventLogFactory;

	$scope.data = {
		events: eventLog.entries
	};

	$scope.$on('Game Event', function(event, eventDescription) {
		// Before you squint to check, the 'event' is not used here. :)
		eventDescription.eventData.time = clock.getTime();
		var gameEvent = gameEventProvider.create(
			eventDescription.eventType,
			eventDescription.eventData);
		eventLog.log(gameEvent);
	});
});

app.controller('salemClockCtrl', function($scope, salemClockFactory) {
	$scope.clock = salemClockFactory;
});