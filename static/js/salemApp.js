// Untitled Salem Tools App

var app = angular.module("salemApp", []);

app.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('{[');
	$interpolateProvider.endSymbol(']}');
}]);

app.controller("mainCtrl", function ($scope, roleDescsFactory) {
	$scope.descriptions = roleDescsFactory();

	$scope.specRest = null;
	$scope.teamRest = null;
	
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

	// $scope.selectedRole = null;
	// $scope.selectedAlignment = null;

	// $scope.selectRole = function (role) {
	// 	if (role == $scope.selectedRole) {
	// 		$scope.selectedRole = null;
	// 	}
	// 	else {
	// 		$scope.selectedRole = role;
	// 	}
	// }

	// $scope.selectAlignment = function (alignment) {
	// 	if (alignment == $scope.selectedAlignment) {
	// 		$scope.selectedAlignment = null;
	// 	}
	// 	else {
	// 		$scope.selectedAlignment = alignment;
	// 	}
	// }

	// $scope.roleMatchesAlignment = function (role, alignment) {

	// 	if (role == null || alignment == null) {
	// 		return false
	// 	}
	// 	else if (alignment == $scope.alignments.ANY) {
	// 		return true;
	// 	}
	// 	else if (alignment.team == role.team &&
	// 		    (alignment.category == role.category ||
	// 			 alignment.category == 'Random')) {
	// 		return true;
	// 	}
	// 	else {
	// 		return false;
	// 	}
	// }

});