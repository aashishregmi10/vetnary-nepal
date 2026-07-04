require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const Category = require('../src/models/category.model');
const Product = require('../src/models/product.model');

const categories = [
  { slug: 'dogs', name: 'Dogs', parent: null, description: 'Everything for dogs — food, toys, grooming, and health, picked for Nepali homes and climates.' },
  { slug: 'cats', name: 'Cats', parent: null, description: 'Food, litter, scratchers, and toys for cats of every age and temperament.' },
  { slug: 'dog-food', name: 'Dog Food', parentSlug: 'dogs', description: 'Dry, wet, and treat-style food for puppies through senior dogs.' },
  { slug: 'dog-toys', name: 'Dog Toys', parentSlug: 'dogs', description: 'Chew-tough and fetch-ready toys for dogs of every size.' },
  { slug: 'cat-food', name: 'Cat Food', parentSlug: 'cats', description: 'Balanced everyday food and grain-free options for cats.' },
  { slug: 'cat-litter', name: 'Cat Litter', parentSlug: 'cats', description: 'Clumping, crystal, and natural litters for easy cleanup.' },
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
