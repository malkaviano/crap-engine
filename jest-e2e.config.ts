import sharedConfig from './jest.config';

const config = sharedConfig;

config.testRegex = '.e2e-spec.ts$';

export default config;
