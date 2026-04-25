import product1 from "../../../assets/Home/product-1.png"
import product2 from "../../../assets/Home/product-2.png"
import product3 from "../../../assets/Home/product-3.png"
import product4 from "../../../assets/Home/product-4.png"
import product5 from "../../../assets/Home/product-5.png"

export interface Product {
  id: number;
  name: string;
  price: number;
  mrp: number;
  badge?: string;
  badgeColor?: string;
  image: string;
  category: string;
}

export interface Review {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
}

export const TOP_SELLERS: Product[] = [
  { id: 1, name: "MRF Genius Grand Edition 1.0 English Willow Cricket Bat", price: 100, mrp: 150, badge: "60% off", badgeColor: "#e53e3e", image: product1, category: "Cricket Bats" },
  { id: 2, name: "SS TON Range TON Maximus Kashmir Willow Cricket Bat", price: 100, mrp: 180, badge: "55% off", badgeColor: "#e53e3e", image: product2, category: "Cricket Bats" },
  { id: 3, name: "SS Stunner Duffle Cricket Kit Bag with wheels", price: 100, mrp: 200, badge: "Deal of the Day", badgeColor: "#4361ee", image: product3, category: "Accessories" },
  { id: 4, name: "SS Gutsy Cricket Helmet", price: 100, mrp: 170, badge: "45% off", badgeColor: "#e53e3e", image: product4, category: "Accessories" },
  { id: 5, name: "SS Spring Loaded Stumps for Cricket – Heavy Duty", price: 100, mrp: 160, badge: "Deal of the Day", badgeColor: "#4361ee", image: product5, category: "Accessories" },
];

export const ALL_PRODUCTS: Product[] = [
  ...TOP_SELLERS,
  { id: 6, name: "MRF Genius Grand Edition 1.0 English Willow Cricket Bat", price: 100, mrp: 150, image: product1, category: "Cricket Bats" },
  { id: 7, name: "SS TON Range TON Maximus Kashmir Willow Cricket Bat", price: 100, mrp: 180, image: product2, category: "Cricket Bats" },
  { id: 8, name: "SS Stunner Duffle Cricket Kit Bag with wheels", price: 210, mrp: 300, image: product3, category: "Accessories" },
  { id: 9, name: "SS Gutsy Cricket Helmet", price: 210, mrp: 280, image: product4, category: "Accessories" },
  { id: 10, name: "SS Spring Loaded Stumps for Cricket \u2013 Heavy Duty", price: 80, mrp: 120, image: product5, category: "SS TON" },
  { id: 11, name: "SS Kashmir Willow Cricket Full Kit", price: 120, mrp: 200, image: product1, category: "Cricket Bats" },
  { id: 12, name: "SS TON Range TON Maximus Kashmir Willow Cricket Bat", price: 100, mrp: 180, image: product2, category: "Cricket Bats" },
  { id: 13, name: "SS Spring Loaded Stumps for Cricket \u2013 Heavy Duty", price: 410, mrp: 550, image: product5, category: "SS TON" },
  { id: 14, name: "SS Red Max Cricket Batting Gloves White", price: 210, mrp: 300, image: product4, category: "Accessories" },
  { id: 15, name: "SS Spring Loaded Stumps for Cricket \u2013 Heavy Duty", price: 80, mrp: 110, image: product5, category: "SS TON" },
  { id: 16, name: "SS Matrix Cricket Helmet (Maroon)", price: 120, mrp: 180, image: product4, category: "Accessories" },
  { id: 17, name: "SS TON Range TON Maximus Kashmir Willow Cricket Bat", price: 100, mrp: 180, image: product2, category: "Cricket Bats" },
  { id: 18, name: "SS RuKi Max Cricket Batting Gloves White", price: 80, mrp: 120, image: product4, category: "Accessories" },
  { id: 19, name: "MRF Legend VK 18 SS Cricket Adult Kit Bag", price: 410, mrp: 580, image: product3, category: "Accessories" },
  { id: 20, name: "SS TON Range TON Maximus Kashmir Willow Cricket Bat", price: 100, mrp: 180, image: product2, category: "SS TON" },
];

export const REVIEWS: Review[] = [
  { id: 1, name: "Pranay Shukla", role: "Cricket Enthusiast", rating: 4, avatar: "PS", text: "It's An Online Shop And We Found Them Accidentally And Landed Up In Their Office. They Have Provided The Excellent Service And I Bought The Cricket A Kit For My Son. The Quality And The Staff Is Excellent! I Would Refer Every One To Buy Cricket Kit From Them." },
  { id: 2, name: "Pranay Shukla", role: "Cricket Player", rating: 4, avatar: "PS", text: "It's An Online Shop And We Found Them Accidentally And Landed Up In Their Office. They Have Provided The Excellent Service And I Bought The Cricket A Kit For My Son. The Quality And The Staff Is Excellent! I Would Refer Every One To Buy Cricket Kit From Them." },
  { id: 3, name: "Pranay Shukla", role: "Sports Coach", rating: 5, avatar: "PS", text: "It's An Online Shop And We Found Them Accidentally And Landed Up In Their Office. They Have Provided The Excellent Service And I Bought The Cricket A Kit For My Son. The Quality And The Staff Is Excellent! I Would Refer Every One To Buy Cricket Kit From Them." },
  { id: 4, name: "Pranay Shukla", role: "Team Captain", rating: 4, avatar: "PS", text: "It's An Online Shop And We Found Them Accidentally And Landed Up In Their Office. They Have Provided The Excellent Service And I Bought The Cricket A Kit For My Son. The Quality And The Staff Is Excellent! I Would Refer Every One To Buy Cricket Kit From Them." },
];

export const FILTER_TABS = ["All Products", "Cricket Bats", "Accessories", "MRF", "SS TON"];
export const NAV_LINKS = ["Home", "Sale", "Accessories", "All Products", "My Orders", "Contact Us", "FAQ's"];
