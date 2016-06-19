var app = angular.module("salemApp", []);

app.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[');
    $interpolateProvider.endSymbol(']}');
}]);

app.controller("mainCtrl", function ($scope) {
	// For early prototyping, ALIGNMENTS and ROLES
	// are global variables defined in salemObjects.js.

	$scope.roles = ROLES;
	$scope.alignments = [
		TWNPRO,
		TWNSUP,
		TWNINV,
		TWNKIL,
		MAFKIL,
		MAFDEC,
		MAFSUP,
		NEUKIL,
		NEUEVL,
		NEUBEN,
		NEUCHA,
		ANY]
	console.log($scope.alignments)
});