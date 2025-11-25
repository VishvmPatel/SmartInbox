/**
 * Vercel serverless function entry point.
 * This file exports the Express app as a serverless handler.
 * 
 * Note: This imports from the compiled dist folder after build.
 */

let app;

try {
  // Import the Express app from compiled code
  const appModule = require('../dist/index.js');
  
  // Handle both default export and named export
  app = appModule.default || appModule;
  
  if (!app) {
    throw new Error('Express app not found in module');
  }
  
  console.log('✅ Express app loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Express app:', error);
  console.error('Error stack:', error.stack);
  
  // Create a fallback handler that shows the error
  app = (req, res) => {
    console.error('Request received but app failed to load');
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };
}

// Vercel expects a function that handles (req, res)
// Express app is already a function, so we can export it directly
module.exports = app;

