export interface Agent {
  slug: string; name: string; title: string;
  photo: string;          // path under src/assets
  bio: string;
  realtorCaUrl: string; realBrokerUrl: string;  // empty → link hidden (fill at go-live)
}

export const AGENTS: Agent[] = [
  {
    slug: 'derrick-garcia', name: 'Derrick Garcia', title: 'Broker',
    photo: 'profile/derrick-garcia.webp',
    bio: "A trusted real estate professional who brings a unique edge to the industry. Based in Caledon and deeply familiar with the Peel region and Orangeville, Derrick has built a reputation for delivering exceptional results, backed by his 99.9% list-to-sell ratio. With over a decade of experience in the construction industry, Derrick possesses a keen eye for design, architecture, and market trends — he understands not just how a home looks, but how it's built, giving his clients an advantage when buying or selling. Known for his honest advice, sharp negotiation skills, and deep market knowledge, Derrick ensures his clients make informed decisions with confidence. When he's not working, you'll likely find him at his daughter's soccer games, exploring new architectural designs, or walking his dog, Maverick, in the community he proudly calls home.",
    realtorCaUrl: '', realBrokerUrl: '',
  },
  {
    slug: 'pina-marrella', name: 'Pina Marrella', title: 'Agent',
    photo: 'profile/pina-marrella.webp',
    bio: "A seasoned real estate agent fluent in French, English, and Italian (with basic Spanish), Pina brings 21 years of licensing expertise to the table. Partnering with a top-ranking agent group, she excels at maximizing home prices, facilitating smooth transitions, and providing personalized advice — and connects clients with a trusted network of professionals such as lawyers and mortgage brokers. Her business ethos revolves around lasting relationships, whether you're a first-time buyer or a seasoned investor. If you seek a dedicated, honest, and attentive realtor committed to exceptional service and results, she will guide you through every step of your real estate journey.",
    realtorCaUrl: '', realBrokerUrl: '',
  },
  {
    slug: 'voula-spingos', name: 'Voula Spingos', title: 'Agent',
    photo: 'profile/voula-spingos.webp',
    // Source site had no bio for Voula; brief accurate statement until a full bio is provided.
    bio: 'Real estate agent on the Derrick Garcia team at Real Broker Ontario, serving Toronto and the Greater Toronto Area.',
    realtorCaUrl: '', realBrokerUrl: '',
  },
];
