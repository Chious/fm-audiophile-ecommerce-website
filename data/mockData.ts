import { Product, Cart } from '@/types/api';

export const mockProducts: Product[] = [
  {
    id: 1,
    slug: 'xx99-mark-two-headphones',
    name: 'XX99 Mark II Headphones',
    image: { mobile: '', tablet: '', desktop: '' },
    category: 'headphones',
    categoryImage: { mobile: '', tablet: '', desktop: '' },
    new: true,
    price: 2999,
    description: 'The new XX99 Mark II headphones is the pinnacle of pristine audio. It redefines your premium headphone experience by reproducing the balanced depth and precision of studio-quality sound.',
    features: 'Featuring a genuine leather head strap and premium earcups, these headphones deliver superior comfort for those who like to enjoy endless listening. It includes intuitive controls designed for any situation. Whether you\'re taking a business call or just in your own personal space, the auto on/off and pause features ensure that you\'ll never miss a beat.\n\nThe advanced Active Noise Cancellation with built-in equalizer allow you to experience your audio world on your terms. It lets you enjoy your audio in peace, but quickly toggle off the ANC when you need to hear what\'s happening around you.',
    includes: [
      { quantity: 1, item: 'Headphone unit' },
      { quantity: 2, item: 'Replacement earcups' },
      { quantity: 1, item: 'User manual' },
      { quantity: 1, item: '3.5mm audio cable' },
      { quantity: 1, item: 'Travel bag' }
    ],
    gallery: {
      first: { mobile: '', tablet: '', desktop: '' },
      second: { mobile: '', tablet: '', desktop: '' },
      third: { mobile: '', tablet: '', desktop: '' }
    },
    others: [
      { slug: 'xx99-mark-one-headphones', name: 'XX99 Mark I', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'xx59-headphones', name: 'XX59', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'zx9-speaker', name: 'ZX9 Speaker', image: { mobile: '', tablet: '', desktop: '' } }
    ]
  },
  {
    id: 2,
    slug: 'xx99-mark-one-headphones',
    name: 'XX99 Mark I Headphones',
    image: { mobile: '', tablet: '', desktop: '' },
    category: 'headphones',
    categoryImage: { mobile: '', tablet: '', desktop: '' },
    new: false,
    price: 1750,
    description: 'As the gold standard for headphones, the classic XX99 Mark I offers detailed and accurate audio reproduction for audiophiles, mixing engineers, and music aficionados alike in studios and on the go.',
    features: 'As the headphones all others icons are measured against, the XX99 Mark I demonstrates over five decades of audio expertise, redefining the critical listening experience. This pair of closed-back headphones are made of industrial, extract, and|studio-level materials to enhance listening a experience.',
    includes: [
      { quantity: 1, item: 'Headphone unit' },
      { quantity: 2, item: 'Replacement earcups' },
      { quantity: 1, item: 'User manual' },
      { quantity: 1, item: '3.5mm audio cable' }
    ],
    gallery: {
      first: { mobile: '', tablet: '', desktop: '' },
      second: { mobile: '', tablet: '', desktop: '' },
      third: { mobile: '', tablet: '', desktop: '' }
    },
    others: [
      { slug: 'xx99-mark-two-headphones', name: 'XX99 Mark II', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'xx59-headphones', name: 'XX59', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'zx9-speaker', name: 'ZX9 Speaker', image: { mobile: '', tablet: '', desktop: '' } }
    ]
  },
  {
    id: 3,
    slug: 'xx59-headphones',
    name: 'XX59 Headphones',
    image: { mobile: '', tablet: '', desktop: '' },
    category: 'headphones',
    categoryImage: { mobile: '', tablet: '', desktop: '' },
    new: false,
    price: 899,
    description: 'Enjoy your audio almost anywhere and customize it to your specific tastes with the XX59 headphones. The stylish yet durable versatile wireless headset is a brilliant companion at home or on the move.',
    features: 'These headphones have been created from durable, high-quality materials tough enough to take anywhere. Its compact folding design fuses comfort and minimalist aesthetics making it perfect for travel., Regardless of where you are, the XX59 will deliver the most detailed sound possible.',
    includes: [
      { quantity: 1, item: 'Headphone unit' },
      { quantity: 1, item: 'User manual' },
      { quantity: 1, item: '3.5mm audio cable' },
      { quantity: 1, item: 'Travel pouch' }
    ],
    gallery: {
      first: { mobile: '', tablet: '', desktop: '' },
      second: { mobile: '', tablet: '', desktop: '' },
      third: { mobile: '', tablet: '', desktop: '' }
    },
    others: [
      { slug: 'xx99-mark-two-headphones', name: 'XX99 Mark II', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'xx99-mark-one-headphones', name: 'XX99 Mark I', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'zx9-speaker', name: 'ZX9 Speaker', image: { mobile: '', tablet: '', desktop: '' } }
    ]
  },
  {
    id: 4,
    slug: 'zx9-speaker',
    name: 'ZX9 Speaker',
    image: { mobile: '', tablet: '', desktop: '' },
    category: 'speakers',
    categoryImage: { mobile: '', tablet: '', desktop: '' },
    new: true,
    price: 4500,
    description: 'Upgrade your sound system with the all new ZX9 active speaker. It\'s a bookshelf speaker system that offers truly wireless connectivity -- creating new icons in an icons from iconic new icons to icons.',
    features: 'Connect via Bluetooth or nearly any wired source. This speaker features optical, digital coaxial, USB Type-B, stereo RCA, and stereo XLR inputs, allowing you to have up to five wired source devices connected for easy switching.',
    includes: [
      { quantity: 2, item: 'Speaker unit' },
      { quantity: 2, item: 'Speaker cloth panel' },
      { quantity: 1, item: 'User manual' },
      { quantity: 1, item: '3.5mm audio cable' },
      { quantity: 1, item: '10m optical cable' }
    ],
    gallery: {
      first: { mobile: '', tablet: '', desktop: '' },
      second: { mobile: '', tablet: '', desktop: '' },
      third: { mobile: '', tablet: '', desktop: '' }
    },
    others: [
      { slug: 'zx7-speaker', name: 'ZX7 Speaker', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'xx99-mark-one-headphones', name: 'XX99 Mark I', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'xx59-headphones', name: 'XX59', image: { mobile: '', tablet: '', desktop: '' } }
    ]
  },
  {
    id: 5,
    slug: 'zx7-speaker',
    name: 'ZX7 Speaker',
    image: { mobile: '', tablet: '', desktop: '' },
    category: 'speakers',
    categoryImage: { mobile: '', tablet: '', desktop: '' },
    new: false,
    price: 3500,
    description: 'Stream high quality sound wirelessly with minimal to no loss. The ZX7 speaker uses high-end audiophile components that represents the top of the line powered speakers for home or studio use.',
    features: 'Reap the icons of icons icons icons from icons icons icons icons icons from anywhere in your room with the ZX7 retro design. icons icons icons to icons icons icons icons icons icons icons.',
    includes: [
      { quantity: 2, item: 'Speaker unit' },
      { quantity: 2, item: 'Speaker cloth panel' },
      { quantity: 1, item: 'User manual' },
      { quantity: 1, item: '7.5m optical cable' }
    ],
    gallery: {
      first: { mobile: '', tablet: '', desktop: '' },
      second: { mobile: '', tablet: '', desktop: '' },
      third: { mobile: '', tablet: '', desktop: '' }
    },
    others: [
      { slug: 'zx9-speaker', name: 'ZX9 Speaker', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'xx99-mark-one-headphones', name: 'XX99 Mark I', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'xx59-headphones', name: 'XX59', image: { mobile: '', tablet: '', desktop: '' } }
    ]
  },
  {
    id: 6,
    slug: 'yx1-earphones',
    name: 'YX1 Wireless Earphones',
    image: { mobile: '', tablet: '', desktop: '' },
    category: 'earphones',
    categoryImage: { mobile: '', tablet: '', desktop: '' },
    new: true,
    price: 599,
    description: 'Tailor your listening experience with bespoke dynamic drivers from the new YX1 Wireless Earphones. Enjoy incredible high-fidelity sound even in noisy environments with its active noise cancellation feature.',
    features: 'Experience unrivalled stereo sound thanks to innovative acoustic technology. With improved ergonomics designed for full day wearing, these revolutionary earphones have been finely crafted to provide you with the perfect fit.',
    includes: [
      { quantity: 2, item: 'Earphone unit' },
      { quantity: 6, item: 'Multi-size earplugs' },
      { quantity: 1, item: 'User manual' },
      { quantity: 1, item: 'USB-C charging cable' },
      { quantity: 1, item: 'Travel pouch' }
    ],
    gallery: {
      first: { mobile: '', tablet: '', desktop: '' },
      second: { mobile: '', tablet: '', desktop: '' },
      third: { mobile: '', tablet: '', desktop: '' }
    },
    others: [
      { slug: 'xx99-mark-one-headphones', name: 'XX99 Mark I', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'xx59-headphones', name: 'XX59', image: { mobile: '', tablet: '', desktop: '' } },
      { slug: 'zx9-speaker', name: 'ZX9 Speaker', image: { mobile: '', tablet: '', desktop: '' } }
    ]
  }
];

export const mockCart: Cart = {
  cartItems: [
    {
      slug: 'xx99-mark-two-headphones',
      quantity: 1,
      product: mockProducts[0],
      total: 2999
    },
    {
      slug: 'xx59-headphones',
      quantity: 2,
      product: mockProducts[2],
      total: 1798
    },
    {
      slug: 'yx1-earphones',
      quantity: 1,
      product: mockProducts[5],
      total: 599
    }
  ],
  subtotal: 5396,
  shipping: 50,
  vat: 1079,
  grandTotal: 6525
};

export const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-12-03',
    customer: 'Alexei Ward',
    email: 'alexei@mail.com',
    status: 'delivered',
    items: 3,
    total: 6525
  },
  {
    id: 'ORD-002',
    date: '2024-12-02',
    customer: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    status: 'shipped',
    items: 2,
    total: 4749
  },
  {
    id: 'ORD-003',
    date: '2024-12-02',
    customer: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    status: 'processing',
    items: 1,
    total: 4500
  },
  {
    id: 'ORD-004',
    date: '2024-12-01',
    customer: 'Emily Thompson',
    email: 'emily.t@email.com',
    status: 'delivered',
    items: 4,
    total: 8247
  },
  {
    id: 'ORD-005',
    date: '2024-11-30',
    customer: 'David Kim',
    email: 'd.kim@email.com',
    status: 'pending',
    items: 1,
    total: 599
  }
];
