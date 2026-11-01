import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

mkdirSync('work', { recursive: true });
console.log('\nChecking the intentionally failing sale regression separately…');
const result = spawnSync(process.execPath, [
  '--no-experimental-webstorage', 'node_modules/vitest/vitest.mjs', 'run',
  'src/inventory.regression.test.ts', '--reporter=json', '--outputFile=work/intentional-regression.json',
], { encoding: 'utf8' });
if (result.error) throw result.error;
const report = JSON.parse(readFileSync('work/intentional-regression.json', 'utf8'));
const assertions = report.testResults.flatMap(test => test.assertionResults);
const expected = assertions.length === 1 && assertions[0].fullName === 'selling 2 kg sugar from 15 kg leaves 13 kg'
  && assertions[0].status === 'failed' && result.status === 1 && report.numFailedTests === 1
  && assertions[0].failureMessages.some(message => message.includes('expected 17000 to be 13000'));
if (!expected) {
  console.error('The separate regression probe did not observe the exact expected 17,000 → 13,000 mismatch.');
  console.error(result.stdout, result.stderr);
  process.exit(1);
}
console.log('EXPECTED REGRESSION CONFIRMED: sale returned 17,000 g; correct expectation is 13,000 g.');
console.log('Baseline passed. npm test still runs this regression normally and exits 1 until the source is repaired.');
