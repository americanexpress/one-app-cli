const crypto = require('crypto');

// Monkey Patch for unsupported hash algo. Needed to support Node >=17.
// https://github.com/webpack/webpack/issues/13572#issuecomment-923736472
const originalCreateHash = crypto.createHash;
crypto.createHash = (algo) => originalCreateHash(algo === 'md4' ? 'sha256' : algo);
