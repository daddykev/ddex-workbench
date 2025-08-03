// functions/scripts/downloadSchemas.js
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const schemaUrls = {
  '4.3': {
    main: 'http://ddex.net/xml/ern/43/release-notification.xsd',
    avs: 'http://ddex.net/xml/avs/avs43.xsd'
  },
  '4.2': {
    main: 'http://ddex.net/xml/ern/42/release-notification.xsd',
    avs: 'http://ddex.net/xml/avs/avs42.xsd'
  },
  '3.8.2': {
    main: 'http://ddex.net/xml/ern/382/release-notification.xsd',
    avs: 'http://ddex.net/xml/avs/avs382.xsd'
  }
};

async function downloadAllSchemas() {
  for (const [version, urls] of Object.entries(schemaUrls)) {
    console.log(`Downloading schemas for version ${version}...`);
    
    const schemaDir = path.join(__dirname, `../schemas/ern/${version}`);
    await fs.mkdir(schemaDir, { recursive: true });
    
    // Download main schema
    const mainResponse = await fetch(urls.main);
    const mainContent = await mainResponse.text();
    await fs.writeFile(path.join(schemaDir, 'release-notification.xsd'), mainContent);
    
    // Download AVS schema
    const avsResponse = await fetch(urls.avs);
    const avsContent = await avsResponse.text();
    await fs.writeFile(path.join(schemaDir, `avs${version.replace('.', '')}.xsd`), avsContent);
    
    console.log(`✓ Downloaded schemas for version ${version}`);
  }
}

downloadAllSchemas().catch(console.error);