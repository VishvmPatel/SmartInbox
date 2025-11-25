/**
 * Vercel serverless function entry point.
 * This file exports the Express app as a serverless handler.
 * 
 * Note: This imports from the compiled dist folder after build.
 */

const appModule = require('../dist/index');
const app = appModule.default || appModule;

module.exports = app;

