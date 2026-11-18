// functions/test/debug-xmllint.js
async function debugXmllint() {
  console.log('Debugging xmllint-wasm...\n');
  
  // Step 1: Require the module
  const xmllintModule = require('xmllint-wasm');
  console.log('Step 1 - Required module');
  console.log('Type of module:', typeof xmllintModule);
  console.log('Module properties:', Object.keys(xmllintModule));
  console.log('Module values:', xmllintModule);
  
  // Check if it has a default export
  if (xmllintModule.default) {
    console.log('\nHas default export');
    console.log('Type of default:', typeof xmllintModule.default);
    
    if (typeof xmllintModule.default === 'function') {
      console.log('Default is a function, trying to initialize...');
      try {
        const xmllint = await xmllintModule.default();
        console.log('Initialized via default!');
        console.log('Type:', typeof xmllint);
        console.log('Properties:', Object.keys(xmllint || {}));
      } catch (e) {
        console.log('Default() error:', e.message);
      }
    }
  }
  
  // Check for xmllint property
  if (xmllintModule.xmllint) {
    console.log('\nHas xmllint property');
    console.log('Type of xmllint:', typeof xmllintModule.xmllint);
    
    if (typeof xmllintModule.xmllint === 'function') {
      console.log('xmllint is a function');
      
      // Test it
      const simpleXml = '<?xml version="1.0"?><root><item>test</item></root>';
      try {
        const result = xmllintModule.xmllint(['--version'], {});
        console.log('Version result:', result);
      } catch (e) {
        console.log('Version error:', e.message);
      }
    }
  }
  
  // Check for validateXML method
  if (xmllintModule.validateXML) {
    console.log('\nHas validateXML method');
    console.log('Type:', typeof xmllintModule.validateXML);
  }
  
  // Try to use it directly if it's a function
  if (typeof xmllintModule === 'function') {
    console.log('\nModule itself is a function');
    try {
      const result = await xmllintModule();
      console.log('Direct call result type:', typeof result);
      console.log('Result properties:', Object.keys(result || {}));
    } catch (e) {
      console.log('Direct call error:', e.message);
    }
  }
  
  console.log('\nDebug complete!');
}

debugXmllint().catch(console.error);