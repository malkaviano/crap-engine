import sharedConfig from './jest.config';

const config = sharedConfig;

config.testRegex = '.int-spec.ts$';

export default config;
