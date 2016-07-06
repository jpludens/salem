// Filters for the Untitled Salem Tools App.

app = angular.module("salemApp");

// DEPRECATED
app.filter('descSpec', function() {
	return function(input, specificities) {
		results = []
		for (var i = 0; i < input.length; i++) {
			for (var j = 0; j < specificities.length; j++) {
				if (input[i].specificity == specificities[j]) {
					results.push(input[i]);
				}	
			}

		}
		return results;
	}
});

app.filter('specOnly', function() {
	return function(input, restriction) {
		if (restriction == null) {
			return input;
		}

		var results = [];
		// Restrict to roles: return only descriptions
		// with specifity of 3.
		if (restriction == "Roles") {
			for (var i = 0; i < input.length; i++) {
				if (input[i].specificity == 3) {
					results.push(input[i]);
				}
			}
		}
		// Restrict to alignments: return only descriptions
		// with specifity under 3 (Any, Random $Team, Team $Category)
		else if (restriction == "Alignments") {
			for (var i = 0; i < input.length; i++) {
				if (input[i].specificity < 3) {
					results.push(input[i]);
				}
			}
		}
		else {
			results = input;
		}
		return results;
	}
});

app.filter('teamOnly', function() {
	return function(input, team) {
		if (team == null) {
			return input;
		}

		var results = [];
		for (var i = 0; i < input.length; i++) {
			if (input[i].team == team) {
				results.push(input[i]);
			}
		}
		return results;
	}
});


// Used so app can do ng-repeat on a filtered iterable,
// without any OTHER filters needing to worry about
// whether input is an interable or an array.
// (This would be trivial for individual filters, but for chained
// filters, order would matter, as the first would be dealing with
// an iterable but all others with lists.)
// TRY CONVERTING OTHER FILTERS TO PURE ITERABLE THOUGH,
// AND USING NG-REPEAT WITH OF RATHER THAN IN
app.filter('iterToArray', function() {
	return function(input) {
		if (input == null ||
			! typeof input[Symbol.iterator] === "function") {
			return input;
		}

		var results = [];
		for (let item of input) {
			results.push(item);
		}
		return results;
	}
});