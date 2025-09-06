// functions/test/test-xmllint-v5.js
const { validateXML, memoryPages } = require('xmllint-wasm');

async function testV5() {
  console.log('Testing xmllint-wasm v5.x API...\n');
  
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
  
  console.log('Test: v5.x array-of-objects format');
  try {
    const result = await validateXML({
      xml: [{ fileName: 'test.xml', contents: simpleXml }],
      schema: [{ fileName: 'schema.xsd', contents: simpleSchema }]
    });
    console.log('Success:', result);
  } catch (error) {
    console.log('Failed:', error.message);
  }
}

testV5().catch(console.error);