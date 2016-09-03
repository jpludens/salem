// Filters for the Untitled Salem Tools App.
/* Filters:
	specOnly
	teamOnly
	iterToArray
	padNumberText
	salemifyText */

app = angular.module("salemApp");

app.filter('specOnly', function() {
	/* Filters a list of personas objects, excluding nothing, personas with
	specificity of 3, or personas with specifity under 3. */
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
	/* Filters a list of objects to only those objects whose team property
	matches the value provided as an argument. */
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

app.filter('iterToArray', function() {
	/* Used so app can do ng-repeat on a filtered ES6 iterable,	without any
	OTHER filters needing to worry about input is an interable or an array.
	(This would be trivial for individual filters, but for chained
	filters, order would matter, as the first would be dealing with
	an iterable but all others with lists.) */
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

app.filter('padNumberText', function() {
	/* Pad a number with 0s on its left to acheive a desired string length. */
	// This should really be padding with non-breaking spaces,
	// but doing that apparently requires an angular extension
	// and a module dependency.
	// I'm not willing to do that when '0' should work just fine.
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
	/* Wrap keywords in spans with salem text color classes. */
	var colorsForWords = new Map();
	colorsForWords.set("Any", "salem-text--any");
	colorsForWords.set("Town", "salem-text--town");
	colorsForWords.set("Mafia", "salem-text--mafia");
	colorsForWords.set("Neutral", "salem-text--neutral")
	colorsForWords.set("Random", "salem-text--category");
	colorsForWords.set("Protective", "salem-text--category");
	colorsForWords.set("Support", "salem-text--category");
	colorsForWords.set("Investigative", "salem-text--category");
	colorsForWords.set("Killing", "salem-text--category");
	colorsForWords.set("Deception", "salem-text--category");
	colorsForWords.set("Evil", "salem-text--category");
	colorsForWords.set("Benign", "salem-text--category");
	colorsForWords.set("Chaos", "salem-text--category");
	colorsForWords.set("guilty", "salem-text--guilty");
	colorsForWords.set("innocent", "salem-text--innocent");
	colorsForWords.set("abstain", "salem-text--abstain");
	colorsForWords.set("abstained", "salem-text--abstain");

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
		return "<span class='salem-text " +
			colorClass + "'>" + text + "</span>";
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
				var search = word;
				if (word == 'Vampire') {
					search = /Vampire(?! Hunter)/;
				}
				else if (word == 'abstain') {
					search = /abstain(?!ed)/;
				}
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
