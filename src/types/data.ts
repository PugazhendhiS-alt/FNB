export interface Building {
  id: string;
  name: string;
  address: string;
  cafeteriaCount?: number;
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
  rating?: number;
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
