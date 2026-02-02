// Placeholder file to avoid Metro ENOENT during Hermes symbolication.
// Hermes stack traces sometimes reference InternalBytecode.js; Metro attempts
// to read it for code frames. Having this file prevents noisy ENOENT logs.
module.exports = {};