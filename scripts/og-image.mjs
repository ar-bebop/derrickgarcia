import sharp from 'sharp';
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#121212"/>
  <rect x="0" y="0" width="1200" height="6" fill="#b08d57"/>
  <text x="80" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="72"
    fill="#f3efe7" letter-spacing="8">DERRICK GARCIA</text>
  <text x="80" y="370" font-family="Georgia, 'Times New Roman', serif" font-size="30"
    fill="#b08d57" letter-spacing="6">REAL BROKER ONTARIO LTD</text>
  <text x="80" y="440" font-family="Arial, sans-serif" font-size="24"
    fill="#9a9486" letter-spacing="2">Toronto &amp; GTA Real Estate · derrickgarcia.ca</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('og-default.png written');
