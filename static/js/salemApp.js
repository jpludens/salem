// Untitled Salem Tools App

var app = angular.module("salemApp", []);

app.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('{[');
	$interpolateProvider.endSymbol(']}');
}]);

app.controller("personasCtrl", function ($scope, $rootScope, personasFactory) {
	$scope.personas = personasFactory();

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
		$rootScope.$broadcast('add to custom game', persona.id)
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

app.controller("populationCtrl", function ($scope, $rootScope, personasFactory, populationsFactory) {
	$scope.personas = personasFactory();
	$scope.populations = populationsFactory();
	$scope.gameMode = null;

	$scope.$on('add to custom game', function(event, personaId) {
		$scope.populations.get('Custom').push(
			$scope.personas.get(personaId));
	})

	$scope.removeFromCustom = function(index) {
		$scope.populations.get('Custom').splice(index, 1);
	}

	$scope.broadcastEditMode = function (state) {
		$rootScope.$broadcast(
			'set add to custom game button',
			state ? 'on' : 'off');
	}
});


app.controller("playerRosterCtrl", function ($scope, playerService) {
	$scope.data = {
		playerRoster: [],
		editingNameAt: -1
	};

	for (var i = 0; i < 15; i++) {
		var playerNumber = i+1;
		var playerName = '[Player ' + playerNumber + ']';
		var player = new playerService(playerName, playerNumber);
		$scope.data.playerRoster.push(player);
	}

	$scope.switchEditingNameAt = function (playerNumber) {
		if (playerNumber == $scope.data.editingNameAt) {
			$scope.data.editingNameAt = -1;
		}
		else {
			$scope.data.editingNameAt = playerNumber;
		}
	}
});
