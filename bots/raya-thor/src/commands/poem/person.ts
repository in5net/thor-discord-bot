import { random } from "@in5net/limitless";

const nordicNamesMale = [
	"Erik",
	"Magnus",
	"John",
	"William",
	"Lukas",
	"Elias",
	"Malik",
	"Aron",
	"Enuk",
	"Christian",
	"Peter",
	"Hans",
	"Jens",
	"Niels",
	"Kristian",
	"Aage",
	"Johannes",
	"Carl",
	"Svend",
	"Sven",
	"Jakup",
	"Benjamin",
	"Danjal",
	"Hanus",
	"Rei",
	"Simun",
	"Bardur",
	"Johan",
	"Jonas",
	"Aleksi",
	"Ville",
	"Niko",
	"Juho",
	"Teemu",
	"Joonas",
	"Jesse",
	"Joni",
	"Jere",
	"Antti",
	"Ole",
	"Lars",
	"Jorgen",
	"Jakob",
	"Jon",
	"Daniel",
	"Sigurdur",
	"Arnar",
	"Kristofer",
	"Einar",
	"Gunnar",
	"Alexander",
	"Andri",
	"Viktor",
	"Olof",
	"Lennart",
	"Pall",
];
const nordicNamesFemale = [
	"Emma",
	"Eva",
	"Sofia",
	"Pipaluk",
	"Emilia",
	"Alice",
	"Marie",
	"Anna",
	"Margrethe",
	"Kristine",
	"Johanne",
	"Karen",
	"Elisabeth",
	"Ellen",
	"Ingeborg",
	"Rebekka",
	"Helena",
	"Vir",
	"Ronja",
	"Katrin",
	"Liv",
	"Maria",
	"Sara",
	"Jenna",
	"Laura",
	"Roosa",
	"Veera",
	"Emilia",
	"Julia",
	"Sara",
	"Jenni",
	"Noora",
	"Ane",
	"Johanne",
	"Dorthe",
	"Margrethe",
	"Sofie",
	"Else",
	"Amalie",
	"Gudrun",
	"Helga",
	"Birta",
	"Maria",
];

export default class Person {
	constructor(
		readonly firstName: string,
		readonly middleName?: string,
		readonly lastName?: string
	) {}

	get fullName() {
		const names = [this.firstName, this.middleName, this.lastName];
		return names.filter(Boolean).join(" ");
	}
}

export function randomPerson(male: boolean) {
	const middleName = Math.random() < 0.3 ? nordicName(male) : undefined;
	const lastName =
		Math.random() < 0.95
			? nordicLastName(male, Math.random() < 0.1)
			: undefined; // People were named after their fathers. It's a fact, not sexist :P
	return new Person(nordicName(male), middleName, lastName);
}

function nordicName(male: boolean) {
	return male ? random(nordicNamesMale) : random(nordicNamesFemale);
}

function nordicLastName(male: boolean, parentMale: boolean) {
	return nordicName(parentMale) + (male ? "sson" : "sdottir");
}
