// Build static data for the Untitled Salem Tools App.

app = angular.module("salemApp");

// Create various roles and alignments use to describe players and abilities
// Return as a map so that the application can access a specific persona
// by knowing its key instead of having to search a full list.
app.factory('personasFactory', function($http) {
	function Persona (personaData) {
		this.name = personaData.name;
		this.roleName = personaData.roleName || null;
		this.category = personaData.category || null;
		this.team = personaData.team || null;
		this.unique = personaData.unique || false

		if (this.roleName) this.specificity = 3;
		else if (this.category) this.specificity = 2;
		else if (this.team) this.specificity = 1;
		else this.specificity = 0;
	}

	Persona.prototype.match = function(other) {
		if (other == undefined) {
			return false;
		}
		var spec = Math.min(this.specificity, other.specificity);
		if (spec == 0) {
			return true;
		}
		else if (spec == 1) {
			return this.team == other.team
		}
		else if (spec == 2) {
			return this.team == other.team &&
			    this.category == other.category;
		}
		else if (spec == 3) {
			return this.text == other.text
		}
	}

	var buildPersonas = function (personaJSON) {
		var personas = new Map();
		for (var i = 0; i < personaJSON.length; i++) {
			var persona = new Persona(personaJSON[i]);
			personas.set(persona.name, persona);
		}
		return personas;
	}

	return $http({
		url: '/api/personas',
		dataType: "json",
		method: "GET"
	}).then(function (response) {
		result = buildPersonas(response.data)
		return result;
	}, function (response) {
		// TODO: This is where I'd write some logs.
		// IF I HAD ANY!!!
		console.log(response);
		return null;
	});

	// return personas;
});

// Create role populations used by various game modes
app.factory('populationsFactory', function($http, personasFactory) {
	var personas = null; // Filled by promise later

	var buildPopulations = function (gameModeData) {
		var populations = new Map();
		for (var i = 0; i < gameModeData.length; i++) {
			var gameMode = gameModeData[i];
			var personaList = [];
			for (var j = 0; j < gameMode.population.length; j++) {
				personaList.push(personas.get(gameMode.population[j]));
			}
			populations.set(gameMode.name, personaList);
		}
		return populations
	};

	return personasFactory.then(function(result) {
		personas = result;
		return $http({
			url: '/api/game_modes',
			dataType: "json",
			method: "GET"
		}).then(function (response) {
			return buildPopulations(response.data)
		}, function (response) {
			// TODO: This is where I'd write some logs.
			// IF I HAD ANY!!!
			console.log(response);
			return null;
		});
	}, function (error) {
		return null;
	});
});

app.factory('playerFactory', function() {
	return function(name, number) {
		this.name = name;
		this.number = number;
		this.present = true;
		this.alive = true;

		this.kill = function () {
			this.alive = false;
		}

		this.revive = function() {
			this.alive = true;
		}

		this.leave = function () {
			this.present = false;
		}
	}
});

app.factory('playerRosterFactory', function(playerFactory) {
	var playerRoster = [];
	for (var i = 0; i < 15; i++) {
		var playerNumber = i+1;
		var playerName = '[Player ' + playerNumber + ']';
		var player = new playerFactory(playerName, playerNumber);
		playerRoster.push(player);
	}
	return playerRoster;
});

app.factory('salemClockFactory', function() {
	return {
		phase: 'Day',
		number: 1,
		setPhase: function(phase) {
			if (phase == 'Day' || phase == 'Night') this.phase = phase;
		},
		setNumber: function(number) {
			if (number > 0) this.number = number;
		},
		advance: function() {
			this.phase = this.phase == 'Day' ? 'Night' : 'Day';
			this.number += 1;
		},
		recede: function() {
			this.phase = this.phase == 'Day' ? 'Night' : 'Day';
			this.number -= this.number > 0 ? 1 : 0;
		},
		toString: function() {
			return this.phase + ' ' + this.number;
		},
		getTime: function() {
			return {
				phase: this.phase,
				number: this.number,
				toString: this.toString
			}
		}
	}
});

app.provider('gameEventProvider', function() {
	var factories = {};

	this.registerType = function(eventType, dataProperties, otherObj) {
		if (eventType == null) return;
		factories[eventType] = function(dataObj) {
			this.eventType = eventType;
			this.data = {};

			// Copy any properties from the data object that are defined in
			// the dataProperties list. Set any property name dataProperties
			// but NOT in the data object to null.
			for (var i = 0; i < dataProperties.length; i++) {
				var dataProperty = dataProperties[i];
				dataVal = dataObj[dataProperty] || null;
				this.data[dataProperty] = dataVal;
			}

			// Set new properties, as long as they don't overwrite anything
			for (otherProperty in otherObj) {
				if (otherObj.hasOwnProperty(otherProperty) &&
					!this.hasOwnProperty(otherProperty)) {
					this[otherProperty] = otherObj[otherProperty];
				}
			}
		}
	}

	this.$get = function() {
		return {
			create: function(eventType, eventData) {
				return new factories[eventType](eventData);
			}
		}
	}
});

app.factory('gameEventLogFactory', function() {
	var eventLog = {
		entries: [],
		log: function(gameEvent) {
			this.entries.push(gameEvent);
		}
	};
	return eventLog;
});

app.factory('causesOfDeathFactory', function($http) {

	var buildCauses = function (data) {
		var causes = [];
		for (var i = 0; i < data.length; i++) {
			causes.push(data[i])
		}
		return causes
	};

	return $http({
		url: '/api/causes_of_death',
		dataType: "json",
		method: "GET"
	}).then(function (response) {
		return buildCauses(response.data)
	}, function (response) {
		// TODO: This is where I'd write some logs.
		// IF I HAD ANY!!!
		console.log(response);
		return null;
	});
});

app.factory('salemTextColorFactory', function(personasFactory) {
	var colorFunction = function(data) {
		if (personas == null || data == null) {
			return;
		}

		// data is not guaranteed to have any particular persona properties.
		// Currently, this will identify the proper coloring as long as
		// the team and/or roleName are part of the data argument.

		// Get team and roleName. Use roleName to identify team if necessary,
		// so team can be given preference later.
		var team = data.team
		var roleName = data.roleName
		if (roleName && !team) {
			team = personas.get(roleName).team
		}

		var colorClass = '';
		if (team == "Town") {
			colorClass = 'persona-text--town';
		}
		else if (team == "Mafia") {
			colorClass = 'persona-text--mafia';
		}
		// For Neutrals, use color for roleName if specified
		else if (roleName) {
			colorClass = 'persona-text--' +
				roleName.toLowerCase().replace(' ', '-');
		}
		else if (team == "Neutral") {
			colorClass = 'persona-text--neutral';
		}
		else {
			colorClass = 'persona-text--any';
		}
		return colorClass;
	}
	personas = null;
	return personasFactory.then(function(result) {
		personas = result;
		return colorFunction;
	});

})