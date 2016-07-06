// Untitled Salem Tools App

var app = angular.module("salemApp", []);

app.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('{[');
	$interpolateProvider.endSymbol(']}');
}]);

app.controller("mainCtrl", function ($scope, personasFactory) {
	$scope.personas = personasFactory();

	$scope.specRest = null;
	$scope.teamRest = null;
	$scope.held = null;
	
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
});

app.controller("populationCtrl", function ($scope, populationsFactory) {
	$scope.populations = populationsFactory();
	console.log($scope.populations)
})