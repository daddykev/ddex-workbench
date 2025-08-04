// functions/scripts/downloadSchematrons.js
const SchemaManager = require('../schemas/manager/schemaManager');

async function downloadAllSchematrons() {
  console.log('Starting Schematron download...');
  const schemaManager = new SchemaManager();
  
  try {
    await schemaManager.downloadAllSchematrons();
    console.log('All Schematron files downloaded successfully!');
  } catch (error) {
    console.error('Error downloading Schematron files:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  downloadAllSchematrons();
}

module.exports = downloadAllSchematrons;