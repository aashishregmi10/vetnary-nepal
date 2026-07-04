require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const Category = require('../src/models/category.model');
const Product = require('../src/models/product.model');

const categories = [
  { slug: 'dogs', name: 'Dogs', parent: null, description: 'Everything for dogs — food, toys, grooming, and health, picked for Nepali homes and climates.' },
  { slug: 'cats', name: 'Cats', parent: null, description: 'Food, litter, scratchers, and toys for cats of every age and temperament.' },
  { slug: 'birds', name: 'Birds', parent: null, description: 'Feed, cages, and accessories for pet birds.' },
  { slug: 'fish', name: 'Fish', parent: null, description: 'Aquarium food and care essentials for freshwater and tropical fish.' },
  { slug: 'small-pets', name: 'Small Pets', parent: null, description: 'Supplies for rabbits, guinea pigs, hamsters, and other small companions.' },
  { slug: 'reptiles', name: 'Reptiles', parent: null, description: 'Habitat and feeding essentials for pet reptiles.' },

  { slug: 'dog-food', name: 'Dog Food', parentSlug: 'dogs', description: 'Dry, wet, and treat-style food for puppies through senior dogs.' },
  { slug: 'dog-toys', name: 'Dog Toys', parentSlug: 'dogs', description: 'Chew-tough and fetch-ready toys for dogs of every size.' },
  { slug: 'cat-food', name: 'Cat Food', parentSlug: 'cats', description: 'Balanced everyday food and grain-free options for cats.' },
  { slug: 'cat-litter', name: 'Cat Litter', parentSlug: 'cats', description: 'Clumping, crystal, and natural litters for easy cleanup.' },
  { slug: 'bird-food', name: 'Bird Food', parentSlug: 'birds', description: 'Seed mixes and pellets for parakeets, finches, and larger parrots.' },
  { slug: 'aquarium-care', name: 'Aquarium Care', parentSlug: 'fish', description: 'Fish food, water conditioners, and tank maintenance essentials.' },
  { slug: 'small-pet-bedding', name: 'Bedding & Habitat', parentSlug: 'small-pets', description: 'Bedding, hideouts, and habitat accessories for small pets.' },
  { slug: 'reptile-habitat', name: 'Reptile Habitat', parentSlug: 'reptiles', description: 'Heating, substrate, and feeding supplies for reptile enclosures.' },
];

const products = [
  {
    slug: 'chunky-chicken-adult-dog-food-3kg',
    name: 'Chunky Chicken Adult Dog Food (3kg)',
    brand: 'Pedigree',
    species: 'dog',
    categorySlug: 'dog-food',
    price: 1450,
    comparePrice: 1650,
    stock: 40,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600', name: 'dog-food' },
    shortDescription: 'Real chicken, balanced nutrition for adult dogs of all breeds.',
    description:
      'A complete, balanced meal built around real chicken for adult dogs. Formulated with the vitamins and minerals a working or house dog needs to stay active across every season in the Valley.',
    specifications: { weight: '3kg', suitableFor: 'Adult dogs, all breeds', ingredients: 'Chicken, rice, vegetables', countryOfOrigin: 'India' },
    isFeatured: true,
  },
  {
    slug: 'rope-tug-chew-toy',
    name: 'Rope Tug Chew Toy',
    brand: 'ChewBuddy',
    species: 'dog',
    categorySlug: 'dog-toys',
    price: 320,
    stock: 75,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', name: 'rope-toy' },
    shortDescription: 'Cotton rope tug for fetch and tug-of-war.',
    description: 'Durable braided cotton rope built to survive enthusiastic tug-of-war sessions, with a knotted design that helps clean teeth as your dog chews.',
    specifications: { weight: '150g', suitableFor: 'Puppies, all breeds', material: 'Cotton rope', countryOfOrigin: 'Nepal' },
    isNewArrival: true,
  },
  {
    slug: 'dental-chew-sticks-dog',
    name: 'Dental Chew Sticks (12-pack)',
    brand: 'PetCare',
    species: 'dog',
    categorySlug: 'dog-food',
    price: 540,
    stock: 60,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1585846888147-3bc2657a4b64?w=600', name: 'dog-treats' },
    shortDescription: 'Daily dental chews that help reduce plaque and tartar.',
    description: 'Vet-recommended dental chews shaped to clean teeth and freshen breath with every bite — a good daily treat for dogs of all sizes.',
    specifications: { weight: '360g / 12 sticks', suitableFor: 'Adult dogs, all breeds', countryOfOrigin: 'Thailand' },
  },
  {
    slug: 'salmon-adult-cat-food-1-5kg',
    name: 'Salmon Recipe Adult Cat Food (1.5kg)',
    brand: 'Whiskas',
    species: 'cat',
    categorySlug: 'cat-food',
    price: 980,
    stock: 8,
    lowStockThreshold: 10,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600', name: 'cat-food' },
    shortDescription: 'Salmon-based dry food for coat and digestive health.',
    description: 'A salmon-forward recipe formulated for adult cats, supporting a healthy coat and easy digestion — a good everyday staple for indoor cats.',
    specifications: { weight: '1.5kg', suitableFor: 'Adult cats', ingredients: 'Salmon, rice', countryOfOrigin: 'Thailand' },
  },
  {
    slug: 'clumping-cat-litter-10l',
    name: 'Unscented Clumping Cat Litter (10L)',
    brand: 'PurrClean',
    species: 'cat',
    categorySlug: 'cat-litter',
    price: 890,
    stock: 0,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600', name: 'cat-litter' },
    shortDescription: 'Fast-clumping, low-dust, unscented litter.',
    description: 'A fine-grain clumping litter that forms tight clumps for easy scooping, with a low-dust formula that keeps the air around the litter box clean.',
    specifications: { weight: '10L / ~8kg', suitableFor: 'All cats', material: 'Bentonite clay', countryOfOrigin: 'Nepal' },
  },
  {
    slug: 'feather-wand-cat-toy',
    name: 'Feather Wand Teaser',
    brand: 'ChewBuddy',
    species: 'cat',
    categorySlug: 'cat-food',
    price: 260,
    stock: 45,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600', name: 'cat-toy' },
    shortDescription: 'Interactive feather wand for play and exercise.',
    description: 'A springy wand with a feather attachment that brings out any cat\'s hunting instinct — great for short, active play sessions indoors.',
    specifications: { weight: '40g', suitableFor: 'All cats', material: 'Bamboo, feather', countryOfOrigin: 'Nepal' },
    isNewArrival: true,
  },
  {
    slug: 'parakeet-seed-mix-1kg',
    name: 'Parakeet Seed Mix (1kg)',
    brand: 'FeatherFirst',
    species: 'bird',
    categorySlug: 'bird-food',
    price: 420,
    stock: 30,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600', name: 'bird-seed' },
    shortDescription: 'A balanced seed mix for parakeets and small parrots.',
    description: 'A blend of millet, canary seed, and oats formulated for the everyday nutrition of parakeets and other small pet birds.',
    specifications: { weight: '1kg', suitableFor: 'Parakeets, small parrots', ingredients: 'Millet, canary seed, oats', countryOfOrigin: 'India' },
  },
  {
    slug: 'tropical-fish-flakes-200g',
    name: 'Tropical Fish Flakes (200g)',
    brand: 'AquaLife',
    species: 'fish',
    categorySlug: 'aquarium-care',
    price: 380,
    stock: 50,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=600', name: 'fish-flakes' },
    shortDescription: 'Daily flake food for tropical freshwater fish.',
    description: 'A complete daily flake food that floats before slowly sinking, formulated to support color and vitality in tropical freshwater fish.',
    specifications: { weight: '200g', suitableFor: 'Tropical freshwater fish', countryOfOrigin: 'India' },
    isFeatured: true,
  },
  {
    slug: 'aspen-bedding-small-pet-4l',
    name: 'Aspen Bedding (4L)',
    brand: 'CozyNest',
    species: 'small-pet',
    categorySlug: 'small-pet-bedding',
    price: 450,
    stock: 25,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600', name: 'small-pet-bedding' },
    shortDescription: 'Soft, dust-extracted bedding for small pets.',
    description: 'Dust-extracted aspen shavings that provide warm, absorbent bedding for guinea pigs, hamsters, and rabbits.',
    specifications: { weight: '4L', suitableFor: 'Guinea pigs, hamsters, rabbits', material: 'Aspen shavings', countryOfOrigin: 'Nepal' },
  },
  {
    slug: 'reptile-heat-mat-small',
    name: 'Reptile Heat Mat (Small)',
    brand: 'TerraWarm',
    species: 'reptile',
    categorySlug: 'reptile-habitat',
    price: 1200,
    stock: 15,
    coverImage: { secureUrl: 'https://images.unsplash.com/photo-1601758124096-1f76c40e6f16?w=600', name: 'reptile-heat-mat' },
    shortDescription: 'Low-wattage under-tank heat mat for reptile enclosures.',
    description: 'A steady, low-wattage heat mat designed to sit under a terrarium, providing gentle background warmth for reptiles that need a stable basking zone.',
    specifications: { weight: '150g', suitableFor: 'Small to medium terrariums', countryOfOrigin: 'China' },
  },
];

async function run() {
  await connectDB();

  await Category.deleteMany({});
  await Product.deleteMany({});

  const bySlug = {};
  for (const c of categories) {
    const doc = await Category.create({ slug: c.slug, name: c.name, description: c.description, parent: null });
    bySlug[c.slug] = doc;
  }
  for (const c of categories) {
    if (c.parentSlug) {
      await Category.updateOne({ slug: c.slug }, { parent: bySlug[c.parentSlug]._id });
    }
  }

  for (const p of products) {
    const { categorySlug, ...rest } = p;
    await Product.create({ ...rest, category: bySlug[categorySlug]._id });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
