const admin = require('firebase-admin');

// Ensure all environment variables are present
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle the case where the private key has escaped newlines
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
};

if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
  console.warn('⚠️ Firebase Admin environment variables are missing. Social login will not work.');
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig)
    });
    console.log('✅ Firebase Admin Initialized');
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
  }
}

module.exports = admin;
