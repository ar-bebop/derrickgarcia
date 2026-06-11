export interface Agent {
  slug: string; name: string; title: string;
  photo: string;          // path under src/assets
  bio: string;
  realtorCaUrl: string; realBrokerUrl: string;  // empty → link hidden (fill at go-live)
  sameAs?: string[];      // extra profile URLs (socials, personal site, GBP) — JSON-LD only, never rendered
}

export const AGENTS: Agent[] = [
  {
    slug: 'derrick-garcia', name: 'Derrick Garcia', title: 'Broker',
    photo: 'profile/derrick-garcia.webp',
    bio: "A trusted real estate professional who brings a unique edge to the industry. Based in Caledon and deeply familiar with the Peel region and Orangeville, Derrick has built a reputation for delivering exceptional results, backed by his 99.9% list-to-sell ratio. With over a decade of experience in the construction industry, Derrick possesses a keen eye for design, architecture, and market trends — he understands not just how a home looks, but how it's built, giving his clients an advantage when buying or selling. Known for his honest advice, sharp negotiation skills, and deep market knowledge, Derrick ensures his clients make informed decisions with confidence. When he's not working, you'll likely find him at his daughter's soccer games, exploring new architectural designs, or walking his dog, Maverick, in the community he proudly calls home.",
    realtorCaUrl: 'https://www.realtor.ca/agent/2088980/derrick-vieira-garcia-130-king-st-w-unit-1900b-toronto-ontario-m5x1e3',
    realBrokerUrl: 'https://onereal.ca/profile/derrick-garcia',
    sameAs: [
      'https://www.facebook.com/DerrickGarciaRealtor',
      'https://www.instagram.com/derrickgarcia__/',
      'https://www.linkedin.com/in/derrick-garcia-094820358/',
    ],
  },
  {
    slug: 'pina-marrella', name: 'Pina Marrella', title: 'Agent',
    photo: 'profile/pina-marrella.webp',
    bio: "A seasoned real estate agent fluent in French, English, and Italian (with basic Spanish), Pina brings 21 years of licensing expertise to the table. Partnering with a top-ranking agent group, she excels at maximizing home prices, facilitating smooth transitions, and providing personalized advice — and connects clients with a trusted network of professionals such as lawyers and mortgage brokers. Her business ethos revolves around lasting relationships, whether you're a first-time buyer or a seasoned investor. If you seek a dedicated, honest, and attentive realtor committed to exceptional service and results, she will guide you through every step of your real estate journey.",
    realtorCaUrl: 'https://www.realtor.ca/agent/1414868/pina-marrella-130-king-st-w-unit-1900b-toronto-ontario-m5x1e3',
    realBrokerUrl: 'https://onereal.ca/profile/pina-marrella',
    sameAs: [
      'https://www.pinamarrellarealestate.com/',
      'https://www.facebook.com/pinarealestate416',
      'https://www.linkedin.com/in/pinamarrella',
      'https://www.google.com/search?kgmid=/g/11ld88chw_&q=Pina+Marrella+Real+Estate&hl=en-CA',
    ],
  },
  {
    slug: 'voula-spingos', name: 'Voula Spingos', title: 'Agent',
    photo: 'profile/voula-spingos.webp',
    // Sourced from Voula's Google Business bio (2026-06-11): EN/EL bilingual, realtor + stager.
    bio: "Fluent in English and Greek, Voula is a dedicated real estate professional who brings a blend of creativity and proficiency to every project. With a background as both a realtor and a home stager, she sees a property from two sides at once: finding the home that truly fits when you buy, and presenting yours at its absolute best when you sell. Committed to a seamless, stress-free experience from first showing to closing day, Voula serves clients across Toronto and the GTA as part of the Derrick Garcia team at Real Broker Ontario.",
    realtorCaUrl: 'https://www.realtor.ca/agent/2021291/voula-spingos-130-king-st-w-unit-1900b-toronto-ontario-m5x1e3',
    realBrokerUrl: 'https://onereal.ca/profile/voula-spingos',
    sameAs: [
      'https://www.voulaspingosrealestate.com/',
      'https://www.facebook.com/spingosvoula.ca',
      'https://www.instagram.com/spingosvoula',
      'https://www.google.com/search?kgmid=/g/11tgg4d32g&q=Voula+Spingos&hl=en-CA',
    ],
  },
];
