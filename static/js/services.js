// Build static data for the Untitled Salem Tools App.

app = angular.module("salemApp");

// Create various roles and alignments use to describe players and abilities
app.factory('roleDescsFactory', function() {
	return function() {

		function  RoleDesc (team, category, name, unique) {
			if (team == undefined) {
				this.team = null;
				this.category = null;
				this.name = null;
				this.unique = false;
				this.specificity = 0;
			}
			else if (category == undefined){
				this.team = team;
				this.category = null;
				this.name = null;
				this.unique = false;
				this.specificity = 1;
			}
			else if (name == undefined){
				this.team = team;
				this.category = category;
				this.name = null;
				this.unique = false;
				this.specificity = 2;
			}
			else {
				this.team = team;
				this.category = category;
				this.name = name;
				this.unique = unique || false;
				this.specificity = 3;
			}
		}

		RoleDesc.prototype.match = function(other) {
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
		
		var descs = [];
		// Specificity 0 (Any)
		descs.push(new RoleDesc())
		// Specificity 1 (Random)
		descs.push(new RoleDesc('Town'))
		descs.push(new RoleDesc('Mafia'))
		descs.push(new RoleDesc('Neutral'))
		// Specificty 2 (Alignment)
		descs.push(new RoleDesc('Town', 'Protective'))
		descs.push(new RoleDesc('Town', 'Support'))
		descs.push(new RoleDesc('Town', 'Investigative'))
		descs.push(new RoleDesc('Town', 'Killing'))
		descs.push(new RoleDesc('Mafia', 'Killing'))
		descs.push(new RoleDesc('Mafia', 'Deception'))
		descs.push(new RoleDesc('Mafia', 'Support'))
		descs.push(new RoleDesc('Neutral', 'Killing'))
		descs.push(new RoleDesc('Neutral', 'Evil'))
		descs.push(new RoleDesc('Neutral', 'Benign'))
		descs.push(new RoleDesc('Neutral', 'Chaos'))
		// Specificty 3 (Role)
		descs.push(new RoleDesc('Town', 'Protective', 'Bodyguard'))
		descs.push(new RoleDesc('Town', 'Protective', 'Doctor'))
		descs.push(new RoleDesc('Town', 'Support', 'Escort'))
		descs.push(new RoleDesc('Town', 'Support', 'Mayor', true))
		descs.push(new RoleDesc('Town', 'Support', 'Medium'))
		descs.push(new RoleDesc('Town', 'Support', 'Retributionist', true))
		descs.push(new RoleDesc('Town', 'Support', 'Transporter'))
		descs.push(new RoleDesc('Town', 'Investigative', 'Lookout'))
		descs.push(new RoleDesc('Town', 'Investigative', 'Sheriff'))
		descs.push(new RoleDesc('Town', 'Investigative', 'Spy'))
		descs.push(new RoleDesc('Town', 'Killing', 'Jailor', true))
		descs.push(new RoleDesc('Town', 'Killing', 'Vampire Hunter'))
		descs.push(new RoleDesc('Town', 'Killing', 'Veteran', true))
		descs.push(new RoleDesc('Town', 'Killing', 'Vigilante'))
		descs.push(new RoleDesc('Mafia', 'Killing', 'Godfather', true))
		descs.push(new RoleDesc('Mafia', 'Killing', 'Mafioso', true))
		descs.push(new RoleDesc('Mafia', 'Deception', 'Disguiser'))
		descs.push(new RoleDesc('Mafia', 'Deception', 'Forger'))
		descs.push(new RoleDesc('Mafia', 'Deception', 'Framer'))
		descs.push(new RoleDesc('Mafia', 'Deception', 'Janitor'))
		descs.push(new RoleDesc('Mafia', 'Support', 'Blackmailer'))
		descs.push(new RoleDesc('Mafia', 'Support', 'Consigliere'))
		descs.push(new RoleDesc('Mafia', 'Support', 'Consort'))
		descs.push(new RoleDesc('Neutral', 'Killing', 'Arsonist'))
		descs.push(new RoleDesc('Neutral', 'Killing', 'Serial Killer'))
		descs.push(new RoleDesc('Neutral', 'Killing', 'Werewolf', true))
		descs.push(new RoleDesc('Neutral', 'Evil', 'Executioner'))
		descs.push(new RoleDesc('Neutral', 'Evil', 'Jester'))
		descs.push(new RoleDesc('Neutral', 'Evil', 'Witch'))
		descs.push(new RoleDesc('Neutral', 'Benign', 'Amnesiac'))
		descs.push(new RoleDesc('Neutral', 'Benign', 'Survivor'))
		descs.push(new RoleDesc('Neutral', 'Chaos', 'Vampire'))

		return descs;
	}
});