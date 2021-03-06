// Build static data for the Untitled Salem Tools App.
/* 
	Factories:
		personasFactory
		populationsFactory
		playerFactory
		playerRosterFactory
		salemClockFactory
		gameEventLogFactory
		causesOfDeathFactory
		salemTextColorFactory

	Services:
		juryService

	Providers:
		gameEventProvider */

app = angular.module("salemApp");

app.factory('personasFactory', function($http) {
	/* Create a map of persona objects for all roles and alignments, keyed by
	string name. */
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
});

app.factory('populationsFactory', function($http, personasFactory) {
	/* Return a map of game mode names to the list of personas they comprise. */
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
	/* Return a simple constructor for a player object. */
	// Yes, this should be a service. Maybe later!
	return function(name, number) {
		this.name = name;
		this.number = number;
		this.present = true;
		this.alive = true;
		this.isMayor = false;

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
	/* Return a list of 15 player objects. */
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
	/* Return a clock object for day and night phases and numbers. */
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
			if (this.phase == 'Day') {
				this.phase = 'Night';
			}
			else if (this.phase == 'Night') {
				this.number += 1;
				this.phase = 'Day';
			}
		},
		recede: function() {
			if (this.phase == 'Day' && this.number == 1) {
				return;
			}
			else if (this.phase == 'Day') {
				this.phase = 'Night';
			}
			else if (this.phase == 'Night') {
				this.number -= 1;
				this.phase = 'Day';
			}
		},
		toString: function() {
			return this.phase + ' ' + this.number;
		},
		getTime: function() {
			// This seems silly. But I don't care to dig right now.
			return {
				phase: this.phase,
				number: this.number,
				toString: this.toString
			}
		}
	}
});

app.provider('gameEventProvider', function() {
	/* Exposes a registration function for configuration that allows creating
	custom game event types with arbitrary properties and methods.
	Also exposes a create function to module that will build an object of the
	requested type using its registration information. */
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
	/* A very simple log object. */
	var eventLog = {
		entries: [],
		log: function(gameEvent) {
			this.entries.push(gameEvent);
		}
	};
	return eventLog;
});

app.factory('causesOfDeathFactory', function($http) {
	/* Expose information for each way a player can be rendered deceased. */
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
	/* A function for determining the appropriate color class to use for any
	object that might have team or roleName properties. */
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
			colorClass += 'salem-text--town';
		}
		else if (team == "Mafia") {
			colorClass += 'salem-text--mafia';
		}
		// For Neutrals, use color for roleName if specified
		else if (roleName) {
			colorClass += 'salem-text--' +
				roleName.toLowerCase().replace(' ', '-');
		}
		else if (team == "Neutral") {
			colorClass += 'salem-text--neutral';
		}
		else {
			colorClass += 'salem-text--any';
		}
		return colorClass;
	}
	personas = null;
	return personasFactory.then(function(result) {
		personas = result;
		return colorFunction;
	});
});

app.service('juryService', function (playerRosterFactory) {
	/* A service for managing jury members and their votes during a trial. */
	this.clear = function () {
		this.players = [];
		this.votes = {
			guilty: [],
			innocent: [],
			abstain: []
		};
	}
	this.clear();

	this.startTrialFor = function (accusedPlayer) {
		this.clear();
		for (var i = 0; i < playerRosterFactory.length; i++) {
			var player = playerRosterFactory[i];
			if (player.alive && player != accusedPlayer) {
				this.players.push(player);
				this.votes.abstain.push(player);
			}
		}
	};

	this.setVote = function(player, newVoteType) {
		for (var voteType in this.votes) {
			if (this.votes.hasOwnProperty(voteType)) {
				var index = this.votes[voteType].indexOf(player);
				if (index > -1) {
					this.votes[voteType].splice(index, 1);
				}
			}
		}
		this.votes[newVoteType].push(player);
	};

	this.checkVote = function(player) {
		for (var voteType in this.votes) {
			if (this.votes.hasOwnProperty(voteType)) {
				if (this.votes[voteType].indexOf(player) > -1) {
					return voteType;
				}
			}
		}
		return null;
	};

	this.getTally = function() {
		tally = [];
		for (var voteType in this.votes) {
			if (this.votes.hasOwnProperty(voteType)) {
				voters = this.votes[voteType];
				for (var i = 0; i < voters.length; i++) {
					tally.push({
						player: voters[i],
						choice: voteType
					});
				}
			}
		}
		tally.sort(function(a, b) {
			return a.player.number - b.player.number;
		});
		return tally;
	}

	this.getVerdict = function() {
		var guiltyCount = 0;
		var innocentCount = 0;
		for (var i = 0; i < this.votes.guilty.length; i++) {
			guiltyCount += this.votes.guilty[i].isMayor ? 3 : 1;
		}
		for (var i = 0; i < this.votes.innocent.length; i++) {
			innocentCount += this.votes.innocent[i].isMayor ? 3 : 1;
		}
		if (guiltyCount > innocentCount) {
			return 'guilty';
		}
		else {
			return 'innocent';
		}
	}
});
