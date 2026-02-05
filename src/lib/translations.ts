export const translations = {
  en: {
    // Navigation
    home: 'Home',
    wallet: 'Wallet',
    travel: 'Travel',
    tutoring: 'Tutoring',
    emergency: 'Emergency',
    donate: 'Donate',
    shop: 'Shop',
    tickets: 'Tickets',
    religious: 'Religious',
    aiAssistant: 'AI Assistant',
    social: 'Social',
    profile: 'Profile',
    admin: 'Admin',
    signOut: 'Sign Out',
    more: 'More',
    confirmSignOut: 'Are you sure you want to sign out?',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    language: 'Language',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    welcomeBack: 'Welcome back!',
    accountCreated: 'Account created successfully!',
    
    // Wallet
    balance: 'Balance',
    topUp: 'Top Up',
    sendMoney: 'Send Money',
    transactions: 'Transactions',
    amount: 'Amount',
    recipient: 'Recipient',
    description: 'Description',
    
    // Travel
    travelPackages: 'Travel Packages',
    destination: 'Destination',
    duration: 'Duration',
    price: 'Price',
    bookNow: 'Book Now',
    myBookings: 'My Bookings',
    travelers: 'Travelers',
    
    // Tutoring
    findTutor: 'Find a Tutor',
    subjects: 'Subjects',
    hourlyRate: 'Hourly Rate',
    rating: 'Rating',
    bookSession: 'Book Session',
    
    // Emergency
    reportEmergency: 'Report Emergency',
    emergencyType: 'Emergency Type',
    priority: 'Priority',
    location: 'Location',
    submitReport: 'Submit Report',
    
    // Donations
    campaigns: 'Campaigns',
    goal: 'Goal',
    raised: 'Raised',
    donateNow: 'Donate Now',
    anonymous: 'Anonymous',
    
    // Shopping
    products: 'Products',
    cart: 'Cart',
    checkout: 'Checkout',
    orders: 'Orders',
    addToCart: 'Add to Cart',
    
    // Events
    events: 'Events',
    venue: 'Venue',
    capacity: 'Capacity',
    buyTickets: 'Buy Tickets',
    
    // Religious
    services: 'Services',
    register: 'Register',
    
    // Common
    search: 'Search',
    filter: 'Filter',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    date: 'Date',
    time: 'Time',
    quantity: 'Quantity',
  },
  ha: {
    // Navigation
    home: 'Gida',
    wallet: 'Jakar Kuɗi',
    travel: 'Tafiya',
    tutoring: 'Koyarwa',
    emergency: 'Gaggawa',
    donate: 'Ba da Gudummawa',
    shop: 'Siyayya',
    tickets: 'Tikiti',
    religious: 'Addini',
    aiAssistant: 'Mataimaki na AI',
    social: 'Zamantakewa',
    profile: 'Bayani',
    admin: 'Mai Gudanarwa',
    signOut: 'Fita',
    more: 'More',
    confirmSignOut: 'Ka tabbace kana son fita?',
    
    // Auth
    signIn: 'Shiga',
    signUp: 'Yi Rajista',
    email: 'Imel',
    password: 'Kalmar Sirri',
    name: 'Suna',
    language: 'Harshe',
    createAccount: 'Ƙirƙiri Asusu',
    alreadyHaveAccount: 'Kana da asusu?',
    dontHaveAccount: 'Ba ka da asusu?',
    welcomeBack: 'Barka da komawa!',
    accountCreated: 'An ƙirƙiri asusu nasara!',
    
    // Wallet
    balance: 'Ma\'auni',
    topUp: 'Cika Kuɗi',
    sendMoney: 'Aika Kuɗi',
    transactions: 'Mu\'amala',
    amount: 'Adadi',
    recipient: 'Mai Karɓa',
    description: 'Bayani',
    
    // Travel
    travelPackages: 'Kunshin Tafiya',
    destination: 'Inda Za a Je',
    duration: 'Lokaci',
    price: 'Farashi',
    bookNow: 'Yi Booking Yanzu',
    myBookings: 'Bookings na',
    travelers: 'Masu Tafiya',
    
    // Tutoring
    findTutor: 'Nemo Malami',
    subjects: 'Darussa',
    hourlyRate: 'Kuɗin Sa\'a',
    rating: 'Ƙima',
    bookSession: 'Yi Booking Session',
    
    // Emergency
    reportEmergency: 'Bayar da Rahoton Gaggawa',
    emergencyType: 'Nau\'in Gaggawa',
    priority: 'Fifiko',
    location: 'Wurin',
    submitReport: 'Aika Rahoto',
    
    // Donations
    campaigns: 'Kamfen',
    goal: 'Manufa',
    raised: 'An Tara',
    donateNow: 'Ba da Gudummawa Yanzu',
    anonymous: 'Ba Tare da Suna Ba',
    
    // Shopping
    products: 'Kayayyaki',
    cart: 'Keken Sayayya',
    checkout: 'Biya',
    orders: 'Oda',
    addToCart: 'Saka a Keken',
    
    // Events
    events: 'Abubuwan Da Suka Faru',
    venue: 'Wurin',
    capacity: 'Ƙarfi',
    buyTickets: 'Sayi Tikiti',
    
    // Religious
    services: 'Hidima',
    register: 'Yi Rajista',
    
    // Common
    search: 'Nema',
    filter: 'Tace',
    save: 'Ajiye',
    cancel: 'Soke',
    submit: 'Aika',
    loading: 'Ana Lodi...',
    error: 'Kuskure',
    success: 'Nasara',
    confirm: 'Tabbatar',
    date: 'Kwanan Wata',
    time: 'Lokaci',
    quantity: 'Yawa',
  },
};

export type Language = 'en' | 'ha';
export type TranslationKey = keyof typeof translations.en;

export function translate(key: TranslationKey, lang: Language = 'en'): string {
  return translations[lang][key] || translations.en[key] || key;
}
