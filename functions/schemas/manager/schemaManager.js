// functions/schemas/manager/schemaManager.js
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Only import fetch if we need to download at runtime
let fetch;

class SchemaManager {
  constructor() {
    this.schemaUrls = {
      '4.3': {
        main: 'http://ddex.net/xml/ern/43/release-notification.xsd',
        avs: 'http://ddex.net/xml/avs/avs43.xsd',
        namespace: 'http://ddex.net/xml/ern/43'
      },
      '4.2': {
        main: 'http://ddex.net/xml/ern/42/release-notification.xsd',
        avs: 'http://ddex.net/xml/avs/avs42.xsd',
        namespace: 'http://ddex.net/xml/ern/42'
      },
      '3.8.2': {
        main: 'http://ddex.net/xml/ern/382/release-notification.xsd',
        avs: 'http://ddex.net/xml/avs/avs382.xsd',
        namespace: 'http://ddex.net/xml/ern/382'
      }
    };

    this.schematronUrls = {
      '4.3': {
        'AudioAlbum': 'http://ddex.net/xml/ern/43/profiles/AudioAlbum.sch',
        'AudioSingle': 'http://ddex.net/xml/ern/43/profiles/AudioSingle.sch',
        // ... other profiles
      }
      // ... other versions
    };
  }

  async downloadSchema(url, targetPath) {
    // Lazy load fetch only when needed
    if (!fetch) {
      fetch = require('node-fetch');
    }
    
    console.log(`Downloading schema from ${url}...`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download schema: ${response.statusText}`);
    }
    
    const content = await response.text();
    
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    
    // Save the schema
    await fs.writeFile(targetPath, content, 'utf8');
    
    // Save a hash for integrity checking
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    await fs.writeFile(`${targetPath}.sha256`, hash, 'utf8');
    
    return content;
  }

  async ensureSchemas(version) {
    const urls = this.schemaUrls[version];
    if (!urls) {
      throw new Error(`Unsupported version: ${version}`);
    }

    const schemaDir = path.join(__dirname, `../ern/${version}`);
    const mainPath = path.join(schemaDir, 'release-notification.xsd');
    const avsPath = path.join(schemaDir, `avs${version.replace('.', '')}.xsd`);

    // Check if schemas already exist
    try {
      await fs.access(mainPath);
      await fs.access(avsPath);
      console.log(`Schemas for version ${version} already exist`);
      return;
    } catch {
      // Schemas don't exist, try to download them
      console.warn(`Schemas for version ${version} not found locally`);
      
      // In production, we should have pre-downloaded schemas
      // This is just a fallback
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Schemas for version ${version} not found. Please run the schema download script.`);
      }
      
      // Download schemas in development
      await Promise.all([
        this.downloadSchema(urls.main, mainPath),
        this.downloadSchema(urls.avs, avsPath)
      ]);
    }
  }

  // ... rest of the methods remain the same
}

module.exports = SchemaManager;