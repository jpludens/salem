// Filters for the Untitled Salem Tools App.

app = angular.module("salemApp");

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