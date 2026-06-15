import { Product } from '../types';

export const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion & Apparel',
  'Accessories & Jewelry',
  'Home & Living'
];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'AeroSound Pro Wireless Headphones',
    price: 299.99,
    description: 'Immersive noise-cancelling headphones featuring acoustic sound engineering, 45-hour battery life, and ultra-soft memory foam earcups for ultimate comfort.',
    category: 'Electronics',
    rating: { rate: 4.8, count: 124 },
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    featured: true,
    stock: 12
  },
  {
    id: 2,
    name: 'Classique Leather Chronograph Gold',
    price: 189.50,
    description: 'A timeless timepiece crafted with genuine Italian leather strap, scratch-resistant sapphire crystal glass, and Japanese quartz movement.',
    category: 'Accessories & Jewelry',
    rating: { rate: 4.7, count: 88 },
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600',
    featured: true,
    stock: 5
  },
  {
    id: 3,
    name: 'Vanguard Urban Parka Coat',
    price: 145.00,
    description: 'Weather-resistant outer shell with thermal heavy insulation. Features a minimalist aesthetic, multiple utility pockets, and adjustable hood.',
    category: 'Fashion & Apparel',
    rating: { rate: 4.5, count: 56 },
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
    featured: true,
    stock: 15
  },
  {
    id: 4,
    name: 'Minimalist Ceramic Coffee Set',
    price: 48.00,
    description: 'Set of two hand-thrown ceramic mugs with a matte textured glaze and a matching bamboo coaster tray. Elevate your morning coffee ritual.',
    category: 'Home & Living',
    rating: { rate: 4.9, count: 210 },
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
    featured: true,
    stock: 25
  },
  {
    id: 5,
    name: 'Lumina Smart Desk Lamp',
    price: 79.99,
    description: 'Advanced desk lighting with adjustable color temperatures, integrated wireless smartphone charger, and auto-dimming ambient sensor.',
    category: 'Electronics',
    rating: { rate: 4.6, count: 42 },
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
    featured: false,
    stock: 8
  },
  {
    id: 6,
    name: 'Excursion Canvas Travel Duffle',
    price: 110.00,
    description: 'Heavy-duty waterized cotton canvas bag reinforced with top-grain leather buckles. Perfect size for weekend getaways and airplane carry-on.',
    category: 'Accessories & Jewelry',
    rating: { rate: 4.4, count: 75 },
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
    featured: false,
    stock: 10
  },
  {
    id: 7,
    name: 'Essential Hemp Comfort Sweatshirt',
    price: 65.00,
    description: 'Crafted from sustainable organic hemp blend fibers. Ridiculously soft feel, relaxed silhouette, and durable non-shrink stitch construction.',
    category: 'Fashion & Apparel',
    rating: { rate: 4.6, count: 112 },
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600',
    featured: false,
    stock: 20
  },
  {
    id: 8,
    name: 'Aroma Diffuser & Nebulizer',
    price: 36.50,
    description: 'Pure ultrasonic cold-mist diffusion quiet technology. Delivers microscopic essential oil particles into the air. Automatically powers off.',
    category: 'Home & Living',
    rating: { rate: 4.3, count: 94 },
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600',
    featured: false,
    stock: 18
  }
];
