// ===== START CUT: data/restaurant.js =====
const RESTAURANT_MEALS = [
  {
    id: 'breakfast',
    meal: 'Breakfast',
    time: '6:00 AM – 10:00 AM',
    price: 450,
    desc: 'Start your island morning right. Fresh tropical fruits, Filipino breakfast staples, and international selections.',
    img: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&h=380&fit=crop&auto=format',
    capacity: 80,
  },
  {
    id: 'lunch',
    meal: 'Lunch',
    time: '11:00 AM – 2:30 PM',
    price: 650,
    desc: 'A midday feast with fresh seafood, traditional Filipino dishes, and international cuisine.',
    img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=380&fit=crop&auto=format',
    capacity: 80,
  },
  {
    id: 'dinner',
    meal: 'Dinner',
    time: '6:00 PM – 10:00 PM',
    price: 850,
    desc: 'An elevated dining experience under the stars featuring the finest seafood and island flavors.',
    img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&h=380&fit=crop&auto=format',
    capacity: 80,
  },
]

const RESERVATION_TYPES = ['Solo', 'Couple', 'Family', 'Group', 'Whole Restaurant']
const WHOLE_REST_EVENTS = ['Birthday', 'Wedding', 'Reunion', 'Corporate Event', 'Private Party', 'Other']
