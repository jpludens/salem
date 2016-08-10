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
		// Restrict personas to roles (specifity of 3)
		if (restriction == "Roles") {
			for (var i = 0; i < input.length; i++) {
				if (input[i].specificity == 3) {
					results.push(input[i]);
				}
			}
		}
		// Restrict personas to alignments (specificity under 3)
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

// This should really be padding with non-breaking spaces,
// but doing that apparently requires an angular extension
// and a module dependency.
// I'm not willing to do that when '0' should work just fine.
app.filter('padNumberText', function() {
	return function(number, width, after) {
		if (number == null || width == null || width < 0) {
			return number;
		}

		var numString = String(number);
		while (numString.length < width) {
			if (after) {
				numString += '0';
			}
			else {
				numString = '0' + numString;
			}
		}
		return numString;
	}
})

app.filter('salemifyText', function($q, personasFactory, salemTextColorFactory) {
	var colorsForWords = new Map();
	colorsForWords.set("Town", "persona-text--town");
	colorsForWords.set("Mafia", "persona-text--mafia");
	colorsForWords.set("Neutral", "persona-text--neutral")
	colorsForWords.set("Random", "persona-text--category");
	colorsForWords.set("Protective", "persona-text--category");
	colorsForWords.set("Support", "persona-text--category");
	colorsForWords.set("Investigative", "persona-text--category");
	colorsForWords.set("Killing", "persona-text--category");
	colorsForWords.set("Deception", "persona-text--category");
	colorsForWords.set("Evil", "persona-text--category");
	colorsForWords.set("Benign", "persona-text--category");
	colorsForWords.set("Chaos", "persona-text--category");

	// Use the factories to set color classes for specific role names
	var dataLoading = true;
	var dataError = false;
	let promises = {
		personas: personasFactory,
		colors: salemTextColorFactory
	};
	$q.all(promises).then(function(values) {
		dataLoading = false;
		var colorForRole = values.colors;
		for (let [personaName, persona] of values.personas.entries()) {
			if (persona.specificity == 3) {
				colorsForWords.set(personaName, colorForRole(persona));
			}
		}
	}, function(errors) {
		dataLoading = false;
		dataError = true;
	});

	function wrap(text, colorClass) {
		return "<span class='" + colorClass + "'>" + text + "</span>";
	}

	var naiveCache = new Map();
	function salemifyTextFilter(text) {
		// Do nothing if persona has not loaded or failed to load.
		if (dataLoading || dataError) return text;

		var salemText = text;
		// See if this exact text has previously been filtered
		if (naiveCache.get(text)) {
			salemText = naiveCache.get(text);
		}
		// See if the entirety of the text is just one keyword
		else if (colorsForWords.get(text)) {
			salemText = wrap(text, colorsForWords.get(text))
		}
		// The hard way, then. Wrap all instances of mapped words in a color.
		else {
			for (let [word, color] of colorsForWords.entries()) {
				var search = word == 'Vampire' ? /Vampire(?! Hunter)/ : word;
				var replace = wrap(word, color);
				salemText = salemText.replace(search, replace);
			}
		}
		naiveCache.set(text, salemText)
		return salemText;
	};

	salemifyTextFilter.$stateful = true;
	return salemifyTextFilter;
});