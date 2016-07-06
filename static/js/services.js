// Build static data for the Untitled Salem Tools App.

app = angular.module("salemApp");

// Create various roles and alignments use to describe players and abilities
// Return as a map so that the application can access a specific persona
// by knowing its key instead of having to search a full list.
app.factory('personasFactory', function() {
	return function() {

		function Persona (team, category, name, unique) {
			if (team == undefined) {
				// Any player
				this.team = null;
				this.category = null;
				this.name = null;
				this.unique = false;
				this.specificity = 0;
			}
			else if (category == undefined) {
				// Team (and Random $Team Alignments)
				this.team = team;
				this.category = null;
				this.name = null;
				this.unique = false;
				this.specificity = 1;
			}
			else if (name == undefined) {
				// Alignment
				this.team = team;
				this.category = category;
				this.name = null;
				this.unique = false;
				this.specificity = 2;
			}
			else {
				// Role
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
			if (p.specificity == 0) {
				personas.set("Any", p);
			}
			else if (p.specificity == 1) {
				// Random alignments: RT, RM, RN
				personas.set("R" + p.team[0], p);
			}
			else if (p.specificity == 2) {
				// Town alignments: TP, TS, TI, TK
				// Mafia alignments: MK, MD, MS
				// Neutral alignments: NK, NE, NB, NC
				personas.set(p.team[0] + p.category[0], p);
			}
			else {
				personas.set(p.name, p);
			}
		}
		return personas;
	}
});

// Create role populations used by various game modes
app.factory('populationsFactory', function(personasFactory) {
	return function() {
		var personas = personasFactory();

		var classicPopulation = [
			personas.get("Sheriff"),
			personas.get("Doctor"),
			personas.get("Sheriff"), // replace with investigator as part of that fix
			// personas.get("Investigator"),
			personas.get("Jailor"),
			personas.get("Medium"),
			personas.get("Godfather"),
			personas.get("Framer"),
			personas.get("Executioner"),
			personas.get("Escort"),
			personas.get("Mafioso"),
			personas.get("Lookout"),
			personas.get("Serial Killer"),
			personas.get("TK"),
			personas.get("Jester"),
			personas.get("RT")];

		var rankedPopulation = [
			personas.get("Jailor"),
			personas.get("TI"),
			personas.get("TI"),
			personas.get("TS"),
			personas.get("TS"),
			personas.get("TP"),
			personas.get("TK"),
			personas.get("RT"),
			personas.get("Godfather"),
			personas.get("Mafioso"),
			personas.get("RM"),
			personas.get("NK"),
			personas.get("NE"),
			personas.get("NB"),
			personas.get("Any")];

		var rainbowPopulation = [
			personas.get("Godfather"),
			personas.get("Arsonist"),
			personas.get("Survivor"),
			personas.get("Jailor"),
			personas.get("Amnesiac"),
			personas.get("Serial Killer"),
			personas.get("Witch"),
			personas.get("Any"),
			personas.get("Witch"),
			personas.get("Serial Killer"),
			personas.get("Amnesiac"),
			personas.get("Veteran"),
			personas.get("Survivor"),
			personas.get("Arsonist"),
			personas.get("Mafioso")];

		var populations = new Map()
		populations.set("Classic", classicPopulation);
		populations.set("Ranked", rankedPopulation);
		populations.set("Rainbow", rainbowPopulation);
		populations.set("Custom", []);
		return populations;
	}
});