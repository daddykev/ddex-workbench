// functions/test/test-xmllint-datatypes.js
const { validateXML } = require('xmllint-wasm');

async function testDataTypes() {
  console.log('Testing different data types with xmllint-wasm...\n');
  
  const simpleXml = '<?xml version="1.0"?><root><item>test</item></root>';
  const simpleSchema = `<?xml version="1.0"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="root">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="item" type="xs:string"/>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>`;
  
  // Test 1: Strings
  console.log('Test 1: Strings');
  try {
    const result = await validateXML({
      xml: simpleXml,
      schema: simpleSchema
    });
    console.log('Success with strings:', result);
  } catch (error) {
    console.log('Failed with strings:', error.message);
  }
  
  // Test 2: Buffers
  console.log('\nTest 2: Buffers');
  try {
    const result = await validateXML({
      xml: Buffer.from(simpleXml, 'utf8'),
      schema: Buffer.from(simpleSchema, 'utf8')
    });
    console.log('Success with Buffers:', result);
  } catch (error) {
    console.log('Failed with Buffers:', error.message);
  }
  
  // Test 3: Uint8Arrays
  console.log('\nTest 3: Uint8Arrays');
  try {
    const result = await validateXML({
      xml: new Uint8Array(Buffer.from(simpleXml, 'utf8')),
      schema: new Uint8Array(Buffer.from(simpleSchema, 'utf8'))
    });
    console.log('Success with Uint8Arrays:', result);
  } catch (error) {
    console.log('Failed with Uint8Arrays:', error.message);
  }
}

testDataTypes().catch(console.error);