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

	var personas = new Map();
	$http({
		url: '/api/personas',
		dataType: "json",
		method: "GET"
	}).then(function (response) {
		for (var i = 0; i < response.data.length; i++) {
			var persona = new Persona(response.data[i]);
			personas.set(persona.name, persona);
		}
	}, function (response) {
		// TODO: This is where I'd write some logs.
		// IF I HAD ANY!!!
		console.log(response);
	});

	return personas;
});

// Create role populations used by various game modes
app.factory('populationsFactory', function($http, personasFactory) {
	var populations = new Map();
	var addMode = function (mode) {
		var personaList = []
		for (var i = 0; i < mode.population.length; i++) {
			var persona = personasFactory.get(mode.population[i])
			personaList.push(persona);
		}
		populations.set(mode.name, personaList);
	};

	$http({
		url: '/api/game_modes',
		dataType: "json",
		method: "GET"
	}).then(function (response) {
		for (var i = 0; i < response.data.length; i++) {
			addMode(response.data[i]);
		}
	}, function (response) {
		// TODO: This is where I'd write some logs.
		// IF I HAD ANY!!!
		console.log(response);
	});
	return populations;
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
