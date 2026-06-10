export const SITE = {
  name: 'Derrick Garcia',
  brokerage: 'Real Broker Ontario LTD',
  legalName: 'Derrick Garcia — Real Broker Ontario LTD',
  phoneDisplay: '+1 416-684-7370',
  phoneHref: 'tel:+14166847370',
  email: 'info@derrickgarcia.ca',
  address: {
    street: '130 King St W, Unit 1800B',
    city: 'Toronto', region: 'ON', postalCode: 'M5X 1E3', country: 'CA',
  },
  url: 'https://derrickgarcia.ca',
  social: {
    instagram: 'https://www.instagram.com/derrickgarcia__/',
    facebook: 'https://www.facebook.com/DerrickGarciaRealtor',
    googleBusiness: '', // fill at go-live → added to schema sameAs when present
  },
  // Public realtor.ca Toronto search (no IDX licence needed).
  listingsSearchUrl: 'https://www.realtor.ca/on/toronto/real-estate',
  // Real facts sourced from the team bios in agents.ts — never invent numbers here.
  stats: [
    { value: '99.9%', label: 'List-to-sell ratio' },        // Derrick's bio
    { value: '21 yrs', label: 'Licensed experience' },      // Pina's bio
    { value: '3', label: 'Languages spoken' },              // EN · FR · IT (Pina's bio)
  ],
};
