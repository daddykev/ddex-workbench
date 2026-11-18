// functions/test/test-preload-issue.js
const { validateXML } = require('xmllint-wasm');

async function testPreload() {
  console.log('Testing xmllint-wasm preload functionality...\n');
  
  const simpleXml = '<?xml version="1.0"?><root><item>test</item></root>';
  const mainSchema = `<?xml version="1.0"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:import namespace="http://example.com" schemaLocation="imported.xsd"/>
  <xs:element name="root">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="item" type="xs:string"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>`;
  
  const importedSchema = `<?xml version="1.0"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" 
           targetNamespace="http://example.com">
  <xs:simpleType name="MyType">
    <xs:restriction base="xs:string"/>
  </xs:simpleType>
</xs:schema>`;
  
  // Test 1: Without preload
  console.log('Test 1: Simple validation without preload');
  try {
    const result = await validateXML({
      xml: simpleXml,
      schema: mainSchema.replace(/<xs:import[^>]*>/, '') // Remove import
    });
    console.log('Success:', result.valid);
  } catch (error) {
    console.log('Failed:', error.message);
  }
  
  // Test 2: With preload (string values)
  console.log('\nTest 2: With preload (strings)');
  try {
    const result = await validateXML({
      xml: simpleXml,
      schema: mainSchema,
      preload: {
        'imported.xsd': importedSchema
      }
    });
    console.log('Success:', result.valid);
  } catch (error) {
    console.log('Failed:', error.message);
  }
  
  // Test 3: With preload (object notation)
  console.log('\nTest 3: Different preload format');
  try {
    const result = await validateXML({
      xml: simpleXml,
      schema: mainSchema,
      preload: [
        { filename: 'imported.xsd', content: importedSchema }
      ]
    });
    console.log('Success:', result.valid);
  } catch (error) {
    console.log('Failed:', error.message);
  }
}

testPreload().catch(console.error);