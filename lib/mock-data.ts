// Mock Categories
export const mockCategories = [
  { id: "coffee", name: "Coffee" },
  { id: "tea", name: "Tea" },
  { id: "food", name: "Food" },
  { id: "dessert", name: "Dessert" },
]

// Mock Products
export const mockProducts = [
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam",
    price: 4.5,
    image: "/placeholder.svg?height=300&width=400",
    category: "coffee",
  },
  {
    id: "latte",
    name: "Caffè Latte",
    description: "Espresso with steamed milk",
    price: 4.75,
    image: "/placeholder.svg?height=300&width=400",
    category: "coffee",
  },
  {
    id: "americano",
    name: "Americano",
    description: "Espresso with hot water",
    price: 3.5,
    image: "/placeholder.svg?height=300&width=400",
    category: "coffee",
  },
  {
    id: "mocha",
    name: "Mocha",
    description: "Espresso with chocolate and steamed milk",
    price: 5.25,
    image: "/placeholder.svg?height=300&width=400",
    category: "coffee",
  },
  {
    id: "green-tea",
    name: "Green Tea",
    description: "Traditional Japanese green tea",
    price: 3.75,
    image: "/placeholder.svg?height=300&width=400",
    category: "tea",
  },
  {
    id: "chai-latte",
    name: "Chai Latte",
    description: "Spiced tea with steamed milk",
    price: 4.5,
    image: "/placeholder.svg?height=300&width=400",
    category: "tea",
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    description: "Flaky, buttery pastry",
    price: 3.25,
    image: "/placeholder.svg?height=300&width=400",
    category: "food",
  },
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    description: "Sourdough with avocado and toppings",
    price: 8.5,
    image: "/placeholder.svg?height=300&width=400",
    category: "food",
  },
  {
    id: "chocolate-cake",
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake",
    price: 5.75,
    image: "/placeholder.svg?height=300&width=400",
    category: "dessert",
  },
  {
    id: "cheesecake",
    name: "New York Cheesecake",
    description: "Classic creamy cheesecake",
    price: 6.25,
    image: "/placeholder.svg?height=300&width=400",
    category: "dessert",
  },
]

// Mock Order Items
export const mockOrderItems = [
  {
    name: "Cappuccino",
    quantity: 1,
    price: 4.5,
    customization: "Medium, Almond Milk",
  },
  {
    name: "Butter Croissant",
    quantity: 2,
    price: 3.25,
    customization: "",
  },
]

// Mock Order History
export const mockOrderHistory = [
  {
    id: "12345",
    date: "Today, 10:30 AM",
    status: "Completed",
    items: [
      { name: "Cappuccino", quantity: 1, price: 4.5 },
      { name: "Croissant", quantity: 1, price: 3.25 },
    ],
    total: 7.75,
  },
  {
    id: "12344",
    date: "Yesterday, 2:15 PM",
    status: "Completed",
    items: [
      { name: "Latte", quantity: 1, price: 4.75 },
      { name: "Avocado Toast", quantity: 1, price: 8.5 },
    ],
    total: 13.25,
  },
]

// Mock Rewards
export const mockRewards = [
  {
    name: "Free Drip Coffee",
    points: 100,
  },
  {
    name: "Free Pastry",
    points: 150,
  },
  {
    name: "Free Specialty Drink",
    points: 200,
  },
  {
    name: "Free Breakfast Sandwich",
    points: 300,
  },
]

// Mock Admin Orders
export const mockAdminOrders = [
  {
    id: "12345",
    time: "10:30 AM",
    table: 5,
    status: "Preparing",
    items: [
      { name: "Cappuccino", quantity: 1, price: 4.5 },
      { name: "Croissant", quantity: 1, price: 3.25 },
    ],
    total: 7.75,
  },
  {
    id: "12344",
    time: "10:15 AM",
    table: 3,
    status: "Completed",
    items: [
      { name: "Latte", quantity: 1, price: 4.75 },
      { name: "Avocado Toast", quantity: 1, price: 8.5 },
    ],
    total: 13.25,
  },
  {
    id: "12343",
    time: "10:05 AM",
    table: 7,
    status: "New",
    items: [
      { name: "Americano", quantity: 2, price: 3.5 },
      { name: "Chocolate Cake", quantity: 1, price: 5.75 },
    ],
    total: 12.75,
  },
]

// Mock Admin Stats
export const mockAdminStats = {
  totalSales: 1245.75,
  ordersToday: 42,
  activeUsers: 18,
}

// Mock Admin Products
export const mockAdminProducts = [
  {
    name: "Cappuccino",
    category: "Coffee",
    price: 4.5,
    stock: "Unlimited",
  },
  {
    name: "Latte",
    category: "Coffee",
    price: 4.75,
    stock: "Unlimited",
  },
  {
    name: "Croissant",
    category: "Food",
    price: 3.25,
    stock: 24,
  },
  {
    name: "Avocado Toast",
    category: "Food",
    price: 8.5,
    stock: 15,
  },
  {
    name: "Chocolate Cake",
    category: "Dessert",
    price: 5.75,
    stock: 8,
  },
]
