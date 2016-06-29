// Untitled Salem Tools App

var app = angular.module("salemApp", []);

app.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('{[');
	$interpolateProvider.endSymbol(']}');
}]);

app.controller("mainCtrl", function ($scope, roleDescsFactory) {
	$scope.descriptions = roleDescsFactory();

	$scope.selectedRole = null;
	$scope.selectedAlignment = null;

	$scope.selectRole = function (role) {
		if (role == $scope.selectedRole) {
			$scope.selectedRole = null;
		}
		else {
			$scope.selectedRole = role;
		}
	}

	$scope.selectAlignment = function (alignment) {
		if (alignment == $scope.selectedAlignment) {
			$scope.selectedAlignment = null;
		}
		else {
			$scope.selectedAlignment = alignment;
		}
	}

	$scope.roleMatchesAlignment = function (role, alignment) {

		if (role == null || alignment == null) {
			return false
		}
		else if (alignment == $scope.alignments.ANY) {
			return true;
		}
		else if (alignment.team == role.team &&
			    (alignment.category == role.category ||
				 alignment.category == 'Random')) {
			return true;
		}
		else {
			return false;
		}
	}

});