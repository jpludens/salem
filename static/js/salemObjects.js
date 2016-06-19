
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

function Role (name, alignment, unique) {
	this.name = name;
	this.alignment = alignment;
	this.team = alignment.team;
	this.category = alignment.category;
	this.unique = unique ? true : false;


	if (this.team == TWN) {
		this.displayClass = 'town';
	}
	else if (this.team == MAF) {
		this.displayClass = 'mafia';
	}
	else if (this.name == 'Amnesiac') {
		this.displayClass = 'amne';
	}
	else if (this.name == 'Arsonist') {
		this.displayClass = 'arso';
	}
	else if (this.name == 'Executioner') {
		this.displayClass = 'exe';
	}
	else if (this.name == 'Jester') {
		this.displayClass = 'jest';
	}
	else if (this.name == 'Serial Killer') {
		this.displayClass = 'sk';
	}
	else if (this.name == 'Survivor') {
		this.displayClass = 'surv';
	}
	else if (this.name == 'Vampire') {
		this.displayClass = 'vamp';
	}
	else if (this.name == 'Werewolf') {
		this.displayClass = 'ww';
	}
	else if (this.name == 'Witch') {
		this.displayClass = 'witch';
	}
}

TWNPRO = new Alignment(TWN, PRO);
TWNSUP = new Alignment(TWN, SUP);
TWNINV = new Alignment(TWN, INV);
TWNKIL = new Alignment(TWN, KIL);
MAFKIL = new Alignment(MAF, KIL);
MAFDEC = new Alignment(MAF, DEC);
MAFSUP = new Alignment(MAF, SUP);
NEUKIL = new Alignment(NEU, KIL);
NEUEVL = new Alignment(NEU, EVL);
NEUBEN = new Alignment(NEU, BEN);
NEUCHA = new Alignment(NEU, CHA);
ANY = new Alignment('Any');

ROLES = [
	new Role('Bodyguard', TWNPRO),
	new Role('Doctor', TWNPRO),
	new Role('Escort', TWNSUP),
	new Role('Jailor', TWNKIL, true),
	new Role('Lookout', TWNINV),
	new Role('Mayor', TWNSUP, true),
	new Role('Medium', TWNSUP),
	new Role('Retributionist', TWNSUP, true),
	new Role('Sheriff', TWNINV),
	new Role('Spy', TWNINV),
	new Role('Transporter', TWNSUP),
	new Role('Vampire Hunter', TWNKIL),
	new Role('Veteran', TWNKIL, true),
	new Role('Vigilante', TWNKIL),
	new Role('Blackmailer', MAFSUP),
	new Role('Consigliere', MAFSUP),
	new Role('Consort', MAFSUP),
	new Role('Disguiser', MAFDEC),
	new Role('Forger', MAFDEC),
	new Role('Framer', MAFDEC),
	new Role('Godfather', MAFKIL, true),
	new Role('Janitor', MAFDEC),
	new Role('Mafioso', MAFKIL, true),
	new Role('Amnesiac', NEUBEN),
	new Role('Arsonist', NEUKIL),
	new Role('Executioner', NEUEVL),
	new Role('Jester', NEUEVL),
	new Role('Serial Killer', NEUKIL),
	new Role('Survivor', NEUBEN),
	new Role('Vampire', NEUCHA),
	new Role('Werewolf', NEUKIL, true),
	new Role('Witch', NEUEVL)];

// for (var i = 0; i < ROLES.length; i++) {
// 	role = ROLES[i];
// 	console.log(role.name + ' ' + role.team + ' ' + role.displayClass);
// }