import cafeteriaHero from "@/assets/cafeteria-hero.jpg";

export interface Building {
  id: string;
  name: string;
  address: string;
  cafeteriaCount: number;
}

export interface Cafeteria {
  id: string;
  buildingId: string;
  name: string;
  image?: string;
  cuisine?: string;
  openTime?: string;
  closeTime?: string;
  isOpen: boolean;
}

export interface MenuItem {
  id: string;
  cafeteriaId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isVeg?: boolean;
  isVegan?: boolean;
  calories?: number;
  prepTime?: string;
}

export const buildings: Building[] = [
  { id: "b1", name: "Prestige Tower", address: "Outer Ring Road, Bellandur, Bengaluru", cafeteriaCount: 3 },
  { id: "b2", name: "Lakeside Campus", address: "HITEC City, Hyderabad", cafeteriaCount: 2 },
  { id: "b3", name: "BKC Central Hub", address: "Bandra Kurla Complex, Mumbai", cafeteriaCount: 4 },
];

export const cafeterias: Cafeteria[] = [
  {
    id: "c1",
    buildingId: "b1",
    name: "The Green Bowl",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    cuisine: "Healthy & Salads",
    openTime: "7:00 AM",
    closeTime: "3:00 PM",
    isOpen: true,
  },
  {
    id: "c2",
    buildingId: "b1",
    name: "Desi Grill",
    image: "https://images.unsplash.com/photo-1604908554092-3b37f0ad8b29?auto=format&fit=crop&w=900&q=80",
    cuisine: "North Indian",
    openTime: "11:00 AM",
    closeTime: "8:00 PM",
    isOpen: true,
  },
  {
    id: "c3",
    buildingId: "b1",
    name: "Pasta Corner",
    image: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=900&q=80",
    cuisine: "Italian",
    openTime: "11:00 AM",
    closeTime: "4:00 PM",
    isOpen: false,
  },
  {
    id: "c4",
    buildingId: "b2",
    name: "Spice Route",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80",
    cuisine: "South Indian",
    openTime: "11:30 AM",
    closeTime: "9:00 PM",
    isOpen: true,
  },
  {
    id: "c5",
    buildingId: "b2",
    name: "Chai & More",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    cuisine: "Café & Snacks",
    openTime: "6:30 AM",
    closeTime: "5:00 PM",
    isOpen: true,
  },
];

export const menuItems: MenuItem[] = [
  {
    id: "m1",
    cafeteriaId: "c1",
    name: "Grilled Paneer Salad",
    description: "Fresh greens with grilled paneer, cherry tomatoes, avocado, and mint dressing",
    price: 180,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    category: "Mains",
    isVeg: true,
    isVegan: false,
    calories: 380,
    prepTime: "8 min",
  },
  {
    id: "m2",
    cafeteriaId: "c1",
    name: "Quinoa Power Bowl",
    description: "Quinoa, roasted sweet potato, chickpeas, kale, tahini dressing",
    price: 220,
    image: "https://images.unsplash.com/photo-1523986371872-9d3ba2e2fbcf?auto=format&fit=crop&w=900&q=80",
    category: "Mains",
    isVeg: true,
    isVegan: true,
    calories: 420,
    prepTime: "5 min",
  },
  {
    id: "m3",
    cafeteriaId: "c1",
    name: "Mango Lassi",
    description: "Thick mango yoghurt smoothie with a hint of cardamom",
    price: 90,
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80",
    category: "Drinks",
    isVeg: true,
    isVegan: false,
    calories: 180,
    prepTime: "3 min",
  },
  {
    id: "m4",
    cafeteriaId: "c2",
    name: "Butter Chicken Thali",
    description: "Creamy butter chicken, dal makhani, naan, rice, raita, and salad",
    price: 250,
    image: "https://images.unsplash.com/photo-1604908177522-6d9edab06e4b?auto=format&fit=crop&w=900&q=80",
    category: "Thali",
    isVeg: false,
    isVegan: false,
    calories: 650,
    prepTime: "12 min",
  },
  {
    id: "m5",
    cafeteriaId: "c2",
    name: "Paneer Tikka Wrap",
    description: "Tandoori paneer with mint chutney, onions, wrapped in rumali roti",
    price: 160,
    image: "https://images.unsplash.com/photo-1589308078050-250e6d81352a?auto=format&fit=crop&w=900&q=80",
    category: "Wraps",
    isVeg: true,
    isVegan: false,
    calories: 480,
    prepTime: "10 min",
  },
  {
    id: "m6",
    cafeteriaId: "c2",
    name: "Masala Fries",
    description: "Crispy fries tossed with chaat masala, cheese, and green chutney",
    price: 120,
    image: "https://images.unsplash.com/photo-1551892589-865f6986948b?auto=format&fit=crop&w=900&q=80",
    category: "Sides",
    isVeg: true,
    isVegan: false,
    calories: 520,
    prepTime: "6 min",
  },
  {
    id: "m7",
    cafeteriaId: "c4",
    name: "Masala Dosa",
    description: "Crispy rice crepe filled with spiced potato, served with sambar and chutneys",
    price: 120,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80",
    category: "Dosa",
    isVeg: true,
    isVegan: true,
    calories: 340,
    prepTime: "5 min",
  },
  {
    id: "m8",
    cafeteriaId: "c4",
    name: "Hyderabadi Biryani",
    description: "Fragrant basmati rice layered with aromatic spices, served with raita and mirchi ka salan",
    price: 280,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80",
    category: "Biryani",
    isVeg: false,
    isVegan: false,
    calories: 420,
    prepTime: "8 min",
  },
  {
    id: "m9",
    cafeteriaId: "c5",
    name: "Masala Chai",
    description: "Strong CTC tea brewed with ginger, cardamom, and fresh milk",
    price: 30,
    image: "https://images.unsplash.com/photo-1510626176961-4b65b2f8c95d?auto=format&fit=crop&w=900&q=80",
    category: "Beverages",
    isVeg: true,
    isVegan: false,
    calories: 120,
    prepTime: "3 min",
  },
  {
    id: "m10",
    cafeteriaId: "c5",
    name: "Vada Pav",
    description: "Mumbai-style spiced potato fritter in a soft pav with garlic and tamarind chutneys",
    price: 40,
    image: "https://images.unsplash.com/photo-1543349683-2bbc53a27922?auto=format&fit=crop&w=900&q=80",
    category: "Snacks",
    isVeg: true,
    isVegan: true,
    calories: 230,
    prepTime: "1 min",
  },
];

export const heroImage = cafeteriaHero;
