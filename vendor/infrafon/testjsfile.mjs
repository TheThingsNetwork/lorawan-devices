import PayloadDecoder from './cc1.mjs';
import chai from 'chai';

const { expect } = chai;


function testFunction() {
  // Define the uplink message in hexadecimal format
  const uplinkHex = '5001010164';

  // Decode the uplink message using PayloadDecoder
  const result = PayloadDecoder.parseAndInterprete(uplinkHex);

  // Print the result to check the output
  console.log('Decoded Uplink Message:', result);

  // Test assertions
  expect(result).to.have.property('battery');
  expect(result.battery.data).to.equal(100);

  // Define the message to send to the pager in hexadecimal format
  const pagerMessageHex = '900202082230313233343522030131';

  // Decode the pager message using PayloadDecoder
  const pagerResult = PayloadDecoder.parseAndInterprete(pagerMessageHex);

  // Print the result to check the output
  console.log('Decoded Pager Message:', pagerResult);

  // Test assertions for the pager message
  expect(pagerResult).to.have.property('getConfig');
  expect(pagerResult.getConfig.data).to.deep.include({
    key: '02',
    value: '23031323343522'
  });
  expect(pagerResult).to.have.property('pager');
  expect(pagerResult.pager.data.msg).to.equal('012345');
  expect(pagerResult.pager.actions.gotoPage).to.equal('1');
}

testFunction();