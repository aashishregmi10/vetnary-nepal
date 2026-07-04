export const SPECIES_INFO: Record<string, { name: string; description: string }> = {
  dog: {
    name: "Dogs",
    description: "Food, toys, and care essentials for every breed and life stage, picked for Nepali homes.",
  },
  cat: {
    name: "Cats",
    description: "Everything your cat actually uses — food, litter, and toys, priced in NPR with cash on delivery.",
  },
  bird: {
    name: "Birds",
    description: "Feed, cages, and accessories for pet birds, delivered across Nepal.",
  },
  fish: {
    name: "Fish",
    description: "Aquarium food and care essentials for freshwater and tropical fish.",
  },
  "small-pet": {
    name: "Small Pets",
    description: "Supplies for rabbits, guinea pigs, hamsters, and other small companions.",
  },
  reptile: {
    name: "Reptiles",
    description: "Habitat and feeding essentials for pet reptiles.",
  },
};

export function isValidSpecies(slug: string): boolean {
  return slug in SPECIES_INFO;
}
