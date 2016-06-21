// Build static data for the Untitled Salem Tools App.

app = angular.module("salemApp");

// Create the alignments used in the role list 
app.factory('alignmentsFactory', function() {
	return function() {
		function Alignment (team, category) {
			this.team = team;
			this.category = category;
		}

		var TWN = 'Town';
		var MAF = 'Mafia';
		var NEU = 'Neutral';
		var PRO = 'Protective';
		var SUP = 'Support';
		var INV = 'Investigative';
		var KIL = 'Killing';
		var DEC = 'Deception';
		var BEN = 'Benign';
		var EVL = 'Evil';
		var CHA = 'Chaos';
		var RAN = 'Random';
		
		var alignments = {
			// More specific alignments
			TWNPRO : new Alignment(TWN, PRO),
			TWNSUP : new Alignment(TWN, SUP),
			TWNINV : new Alignment(TWN, INV),
			TWNKIL : new Alignment(TWN, KIL),
			MAFKIL : new Alignment(MAF, KIL),
			MAFDEC : new Alignment(MAF, DEC),
			MAFSUP : new Alignment(MAF, SUP),
			NEUKIL : new Alignment(NEU, KIL),
			NEUEVL : new Alignment(NEU, EVL),
			NEUBEN : new Alignment(NEU, BEN),
			NEUCHA : new Alignment(NEU, CHA),
			// Less specific alignments
			TWNRAN : new Alignment(TWN, RAN),
			MAFRAN : new Alignment(MAF, RAN),
			NEURAN : new Alignment(NEU, RAN),
			// Least specific alignment
			ANY : new Alignment('Any')
		};

		return alignments;
	};
});

// Create the roles using their names and specific alignments.
app.factory('rolesFactory', function(alignmentsFactory) {
	return function() {

		function Role (name, alignment, unique) {
			this.name = name;
			this.team = alignment.team;
			this.category = alignment.category;
			this.unique = unique ? true : false;

			
			var base = 'textColor';
			if (this.team == 'Neutral') {
				if (this.name == 'Amnesiac') {
					this.textColor = base + 'Amne';
				}
				else if (this.name == 'Arsonist') {
					this.textColor = base + 'Arso';
				}
				else if (this.name == 'Excecutioner') {
					this.textColor = base + 'Exe';
				}
				else if (this.name == 'Jester') {
					this.textColor = base + 'Jest';
				}
				else if (this.name == 'Serial Killer') {
					this.textColor = base + 'Sk';
				}
				else if (this.name == 'Survivor') {
					this.textColor = base + 'Surv';
				}
				else if (this.name == 'Vampire') {
					this.textColor = base + 'Vamp';
				}
				else if (this.name == 'Werewolf') {
					this.textColor = base + 'Ww';
				}
				else if (this.name == 'Witch') {
					this.textColor = base + 'Witch';
				}
			}
			else {
				this.textColor = base + this.team;
			}

			// Couldn't get equality comparisons to work between
			// equal alignments objects and this property...
			// Not sure why, but also not sure the property can be useful.
			// this.alignment = alignment;
		}

		var alignments = alignmentsFactory();
		
		var roles = {
			bodyguard : new Role('Bodyguard', alignments.TWNPRO),
			doctor : new Role('Doctor', alignments.TWNPRO),
			escort : new Role('Escort', alignments.TWNSUP),
			jailor : new Role('Jailor', alignments.TWNKIL, true),
			lookout : new Role('Lookout', alignments.TWNINV),
			mayor : new Role('Mayor', alignments.TWNSUP, true),
			medium : new Role('Medium', alignments.TWNSUP),
			retributionist : new Role(
				'Retributionist', alignments.TWNSUP, true),
			sheriff : new Role('Sheriff', alignments.TWNINV),
			spy : new Role('Spy', alignments.TWNINV),
			transporter : new Role('Transporter', alignments.TWNSUP),
			vampireHunter : new Role('Vampire Hunter', alignments.TWNKIL),
			veteran : new Role('Veteran', alignments.TWNKIL, true),
			vigilante : new Role('Vigilante', alignments.TWNKIL),
			blackmailer : new Role('Blackmailer', alignments.MAFSUP),
			consigliere : new Role('Consigliere', alignments.MAFSUP),
			consort : new Role('Consort', alignments.MAFSUP),
			disguiser : new Role('Disguiser', alignments.MAFDEC),
			forger : new Role('Forger', alignments.MAFDEC),
			framer : new Role('Framer', alignments.MAFDEC),
			godfather : new Role('Godfather', alignments.MAFKIL, true),
			janitor : new Role('Janitor', alignments.MAFDEC),
			mafioso : new Role('Mafioso', alignments.MAFKIL, true),
			amnesiac : new Role('Amnesiac', alignments.NEUBEN),
			arsonist : new Role('Arsonist', alignments.NEUKIL),
			executioner : new Role('Executioner', alignments.NEUEVL),
			jester : new Role('Jester', alignments.NEUEVL),
			serialKiller : new Role('Serial Killer', alignments.NEUKIL),
			survivor : new Role('Survivor', alignments.NEUBEN),
			vampire : new Role('Vampire', alignments.NEUCHA),
			werewolf : new Role('Werewolf', alignments.NEUKIL, true),
			witch : new Role('Witch', alignments.NEUEVL)
		};

		return roles
	};
});