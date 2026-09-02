export const DEMO_FARMER = {
  id: 1,
  name: 'Raja Kumar',
  email: 'demo@agroneon.in',
  phone: '+91 9876543210',
  language: 'Tamil',
  location: 'Thanjavur, Tamil Nadu',
  landArea: 2.5,
  soilType: 'Red Loam',
  waterAvailability: 'Moderate',
  previousCrop: 'Paddy',
  currentSeason: 'Kharif',
  currentCrop: 'Tomato',
  cropStage: 'Vegetative Growth',
}

export const DEMO_WEATHER = {
  _demo: true,
  temperature: 32,
  humidity: 68,
  windSpeed: 12,
  rainProbability: 45,
  condition: 'Partly Cloudy',
  forecast: [
    { day: 'Mon', temp: 32, rain: 45 },
    { day: 'Tue', temp: 31, rain: 60 },
    { day: 'Wed', temp: 30, rain: 30 },
    { day: 'Thu', temp: 33, rain: 20 },
    { day: 'Fri', temp: 32, rain: 55 },
  ],
  alerts: ['Moderate rainfall expected Tuesday — plan irrigation accordingly.'],
}

export const DEMO_SOIL_PARAMS = [
  { name: 'pH', value: 6.5, unit: '', status: 'Optimal', interpretation: 'Suitable for most crops' },
  { name: 'Nitrogen (N)', value: 280, unit: 'kg/ha', status: 'Moderate', interpretation: 'Supplement with organic manure' },
  { name: 'Phosphorus (P)', value: 22, unit: 'kg/ha', status: 'Low', interpretation: 'Apply DAP or SSP fertilizer' },
  { name: 'Potassium (K)', value: 180, unit: 'kg/ha', status: 'Good', interpretation: 'Maintain current levels' },
  { name: 'Organic Carbon', value: 0.65, unit: '%', status: 'Moderate', interpretation: 'Add compost to improve' },
  { name: 'Soil Type', value: 'Red Loam', unit: '', status: 'Info', interpretation: 'Good drainage, moderate fertility' },
]

export const DEMO_CROP_RECOMMENDATIONS = [
  {
    id: 1,
    crop: 'Tomato',
    suitability: 92,
    explanation: ['Suitable soil pH (6.5)', 'Adequate temperature range', 'Moderate water availability', 'Kharif season match'],
    economics: {
      seedCost: 8500, fertilizerCost: 12000, labourCost: 25000,
      irrigationCost: 8000, equipmentCost: 5000, otherCost: 3000,
      expectedYield: 250, yieldUnit: 'quintal/acre',
      marketPrice: 2800, priceUnit: '₹/quintal',
      estimatedRevenue: 700000, estimatedCost: 61500, estimatedProfit: 638500,
    },
    risk: { level: 'Medium', factors: ['Weather variability', 'Market price fluctuation'] },
  },
  {
    id: 2,
    crop: 'Groundnut',
    suitability: 87,
    explanation: ['Suitable for red loam soil', 'Low water requirement', 'Good for crop rotation', 'Kharif season suitable'],
    economics: {
      seedCost: 6000, fertilizerCost: 8000, labourCost: 18000,
      irrigationCost: 4000, equipmentCost: 3000, otherCost: 2000,
      expectedYield: 15, yieldUnit: 'quintal/acre',
      marketPrice: 6200, priceUnit: '₹/quintal',
      estimatedRevenue: 93000, estimatedCost: 41000, estimatedProfit: 52000,
    },
    risk: { level: 'Low', factors: ['Drought tolerance good', 'Stable demand'] },
  },
  {
    id: 3,
    crop: 'Cotton',
    suitability: 81,
    explanation: ['Red loam soil compatible', 'Long growing season available', 'Previous paddy rotation beneficial'],
    economics: {
      seedCost: 12000, fertilizerCost: 15000, labourCost: 30000,
      irrigationCost: 12000, equipmentCost: 8000, otherCost: 5000,
      expectedYield: 12, yieldUnit: 'quintal/acre',
      marketPrice: 7500, priceUnit: '₹/quintal',
      estimatedRevenue: 90000, estimatedCost: 72000, estimatedProfit: 18000,
    },
    risk: { level: 'High', factors: ['Pest susceptibility', 'High input cost', 'Market volatility'] },
  },
]

export const DEMO_MARKETS = [
  { id: 1, name: 'Thanjavur APMC', crop: 'Tomato', price: 2800, unit: '₹/quintal', grade: 'Grade A', transportCost: 500, distance: '8 km', updatedAt: '2026-08-10 09:00' },
  { id: 2, name: 'Trichy Wholesale Market', crop: 'Tomato', price: 3100, unit: '₹/quintal', grade: 'Grade A', transportCost: 1200, distance: '55 km', updatedAt: '2026-08-10 08:30' },
  { id: 3, name: 'Madurai Market', crop: 'Tomato', price: 2950, unit: '₹/quintal', grade: 'Grade A', transportCost: 2500, distance: '120 km', updatedAt: '2026-08-10 07:45' },
]

export const DEMO_SERVICES = [
  { id: 1, name: 'TNAU Soil Testing Lab', type: 'Soil Testing', distance: '12 km', location: 'Coimbatore', contact: '0422-6611200', website: 'https://tnau.ac.in' },
  { id: 2, name: 'District Agriculture Office', type: 'Government Office', distance: '5 km', location: 'Thanjavur', contact: '04362-230100', website: 'https://agri.tn.gov.in' },
  { id: 3, name: 'Krishi Vigyan Kendra', type: 'Research Centre', distance: '18 km', location: 'Thanjavur', contact: '04362-256789', website: 'https://kvk.icar.gov.in' },
  { id: 4, name: 'Agri Equipment Rental', type: 'Equipment Rental', distance: '7 km', location: 'Thanjavur', contact: '+91 9876543211', website: '' },
]

export const DEMO_SCHEMES = [
  {
    id: 1,
    name: 'PM-KISAN',
    eligibility: 'All landholding farmer families with cultivable land',
    benefit: '₹6,000 per year in 3 equal installments',
    category: 'Small & Marginal Farmers',
    application: 'Apply through PM-KISAN portal or visit nearest CSC',
    source: 'https://pmkisan.gov.in',
  },
  {
    id: 2,
    name: 'Soil Health Card Scheme',
    eligibility: 'All farmers',
    benefit: 'Free soil testing and personalized nutrient recommendations',
    category: 'All Farmers',
    application: 'Contact nearest soil testing lab or agriculture office',
    source: 'https://soilhealth.dac.gov.in',
  },
  {
    id: 3,
    name: 'Kisan Credit Card (KCC)',
    eligibility: 'Farmers engaged in agriculture and allied activities',
    benefit: 'Short-term credit at subsidized interest rates',
    category: 'Small & Marginal Farmers',
    application: 'Apply at any commercial/cooperative bank',
    source: 'https://www.nabard.org',
  },
]

export const DEMO_EVENTS = [
  { id: 1, title: 'Organic Farming Workshop', type: 'Training', date: '2026-08-15', location: 'TNAU, Coimbatore', source: 'TNAU Extension' },
  { id: 2, title: 'Kisan Mela 2026', type: 'Exhibition', date: '2026-09-01', location: 'Thanjavur', source: 'District Agriculture Dept.' },
  { id: 3, title: 'Integrated Pest Management Training', type: 'Workshop', date: '2026-08-22', location: 'KVK Thanjavur', source: 'ICAR-KVK' },
]

export const FARMING_STAGES = [
  'Land Preparation', 'Seed Treatment', 'Sowing', 'Germination',
  'Vegetative Growth', 'Nutrient Management', 'Irrigation',
  'Pest Monitoring', 'Disease Monitoring', 'Flowering',
  'Fruit/Grain Development', 'Harvest Preparation', 'Harvest',
]

export const DEMO_FARMING_TASKS = {
  today: { stage: 'Vegetative Growth', task: 'Apply side-dressing of nitrogen fertilizer (25 kg urea/acre). Monitor for early blight symptoms.', alert: 'Rain expected tomorrow — avoid spraying.' },
  upcoming: { stage: 'Nutrient Management', task: 'Second dose of NPK (19:19:19) foliar spray scheduled in 5 days.', date: '2026-08-15' },
  completed: [
    { stage: 'Sowing', task: 'Seeds sown at 60×45 cm spacing', date: '2026-07-01' },
    { stage: 'Germination', task: '90% germination achieved', date: '2026-07-08' },
    { stage: 'Irrigation', task: 'Drip irrigation system checked and running', date: '2026-07-15' },
  ],
}

export const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'weather', title: 'Rain Alert', message: 'Moderate rainfall expected Tuesday. Adjust irrigation schedule.', time: '2 hours ago', read: false },
  { id: 2, type: 'crop', title: 'Task Reminder', message: 'Apply nitrogen side-dressing today for Tomato crop.', time: '5 hours ago', read: false },
  { id: 3, type: 'market', title: 'Price Update', message: 'Tomato prices up 8% at Trichy market. DEMO DATA', time: '1 day ago', read: true },
  { id: 4, type: 'scheme', title: 'PM-KISAN Installment', message: 'Next PM-KISAN installment expected this month.', time: '2 days ago', read: true },
]

export const SOIL_TYPES = ['Red Loam', 'Black Cotton', 'Alluvial', 'Sandy Loam', 'Laterite', 'Clay', 'Other']
export const WATER_OPTIONS = ['Abundant', 'Moderate', 'Scarce', 'Rain-fed Only']
export const SEASONS = ['Kharif', 'Rabi', 'Zaid']
export const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam']
