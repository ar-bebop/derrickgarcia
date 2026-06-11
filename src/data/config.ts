// External go-live configuration. Fill these in before launch (plan Task 19).
// Empty values make the related feature render a graceful fallback instead of a broken widget.
export const CONFIG = {
  web3formsAccessKey: '610ea3a2-77ef-4010-b294-4b68ef49aeec',  // forms — https://web3forms.com
  // ^ key currently delivers to aribeir4@gmail.com (testing). Before go-live: relink to
  //   info@derrickgarcia.ca in the Web3Forms dashboard, or swap in a key created under info@.
  tidycalUrl: 'https://tidycal.com/3ezo9wz/consult',  // booking — embedded as iframe on /contact
  // ^ account slug is auto-generated; before go-live confirm the account is Derrick's
  //   (primary calendar = his iCloud) and optionally set a custom username in TidyCal settings.
  cloudflareAnalyticsToken: '36e995726f60487d8720dab5e51b031c',  // beacon emitted by BaseLayout on every page
  // ^ dashboard stays empty until derrickgarcia.ca is live (beacon reports by hostname).
};

// Real client testimonials. Ships empty — old site had none. When Derrick supplies
// reviews, add them here; the Reviews page and Home teaser render automatically.
export interface Testimonial { quote: string; name: string; source: string; location?: string }
export const TESTIMONIALS: Testimonial[] = [];
