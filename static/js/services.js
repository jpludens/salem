// Build static data for the Untitled Salem Tools App.

app = angular.module("salemApp");

// Create various roles and alignments use to describe players and abilities
// Return as a map so that the application can access a specific persona
// by knowing its key instead of having to search a full list.
app.factory('personasFactory', function() {
	return function() {

		function Persona (team, category, name, unique) {
			if (team == null) {
				// Any player
				this.id = "Any"
				this.team = null;
				this.category = null;
				this.name = null;
				this.unique = false;
				this.specificity = 0;
			}
			else if (category == null) {
				// Team (and Random $Team Alignments)
				this.id = "R" + team[0];
				this.team = team;
				this.category = null;
				this.name = null;
				this.unique = false;
				this.specificity = 1;
			}
			else if (name == null) {
				// Alignment
				this.id = team[0] + category[0];
				this.team = team;
				this.category = category;
				this.name = null;
				this.unique = false;
				this.specificity = 2;
			}
			else {
				// Role
				this.id = name;
				this.team = team;
				this.category = category;
				this.name = name;
				this.unique = unique || false;
				this.specificity = 3;
			}
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

		var personaList = [];
		// Specificity 0 (Any)
		personaList.push(new Persona())
		// Specificity 1 (Team / Random Alignment)
		personaList.push(new Persona('Town'))
		personaList.push(new Persona('Mafia'))
		personaList.push(new Persona('Neutral'))
		// Specificity 2 (Alignment)
		personaList.push(new Persona('Town', 'Protective'))
		personaList.push(new Persona('Town', 'Support'))
		personaList.push(new Persona('Town', 'Investigative'))
		personaList.push(new Persona('Town', 'Killing'))
		personaList.push(new Persona('Mafia', 'Killing'))
		personaList.push(new Persona('Mafia', 'Deception'))
		personaList.push(new Persona('Mafia', 'Support'))
		personaList.push(new Persona('Neutral', 'Killing'))
		personaList.push(new Persona('Neutral', 'Evil'))
		personaList.push(new Persona('Neutral', 'Benign'))
		personaList.push(new Persona('Neutral', 'Chaos'))
		// Specificity 3 (Role)
		personaList.push(new Persona('Town', 'Protective', 'Bodyguard'))
		personaList.push(new Persona('Town', 'Protective', 'Doctor'))
		personaList.push(new Persona('Town', 'Support', 'Escort'))
		personaList.push(new Persona('Town', 'Support', 'Mayor', true))
		personaList.push(new Persona('Town', 'Support', 'Medium'))
		personaList.push(new Persona('Town', 'Support', 'Retributionist', true))
		personaList.push(new Persona('Town', 'Support', 'Transporter'))
		personaList.push(new Persona('Town', 'Investigative', 'Investigator'))
		personaList.push(new Persona('Town', 'Investigative', 'Lookout'))
		personaList.push(new Persona('Town', 'Investigative', 'Sheriff'))
		personaList.push(new Persona('Town', 'Investigative', 'Spy'))
		personaList.push(new Persona('Town', 'Killing', 'Jailor', true))
		personaList.push(new Persona('Town', 'Killing', 'Vampire Hunter'))
		personaList.push(new Persona('Town', 'Killing', 'Veteran', true))
		personaList.push(new Persona('Town', 'Killing', 'Vigilante'))
		personaList.push(new Persona('Mafia', 'Killing', 'Godfather', true))
		personaList.push(new Persona('Mafia', 'Killing', 'Mafioso', true))
		personaList.push(new Persona('Mafia', 'Deception', 'Disguiser'))
		personaList.push(new Persona('Mafia', 'Deception', 'Forger'))
		personaList.push(new Persona('Mafia', 'Deception', 'Framer'))
		personaList.push(new Persona('Mafia', 'Deception', 'Janitor'))
		personaList.push(new Persona('Mafia', 'Support', 'Blackmailer'))
		personaList.push(new Persona('Mafia', 'Support', 'Consigliere'))
		personaList.push(new Persona('Mafia', 'Support', 'Consort'))
		personaList.push(new Persona('Neutral', 'Killing', 'Arsonist'))
		personaList.push(new Persona('Neutral', 'Killing', 'Serial Killer'))
		personaList.push(new Persona('Neutral', 'Killing', 'Werewolf', true))
		personaList.push(new Persona('Neutral', 'Evil', 'Executioner'))
		personaList.push(new Persona('Neutral', 'Evil', 'Jester'))
		personaList.push(new Persona('Neutral', 'Evil', 'Witch'))
		personaList.push(new Persona('Neutral', 'Benign', 'Amnesiac'))
		personaList.push(new Persona('Neutral', 'Benign', 'Survivor'))
		personaList.push(new Persona('Neutral', 'Chaos', 'Vampire'))

		var personas = new Map();
		for (var i = 0; i < personaList.length; i++) {
			var p = personaList[i];
			personas.set(p.id, p);
		}
		return personas;
	}
});

// Create role populations used by various game modes
app.factory('populationsFactory', function($http, personasFactory) {
	return function() {
		var populations = new Map();
		var personas = personasFactory();
		var addMode = function (mode) {
			var personaList = []
			for (var i = 0; i < mode.population.length; i++) {
				var persona = personas.get(mode.population[i])
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
	}
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
	return function() {
		var playerRoster = [];
		for (var i = 0; i < 15; i++) {
			var playerNumber = i+1;
			var playerName = '[Player ' + playerNumber + ']';
			var player = new playerFactory(playerName, playerNumber);
			playerRoster.push(player);
		}
		return playerRoster;
	}
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
