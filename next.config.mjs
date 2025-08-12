/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better development
  reactStrictMode: true,
  
  // Environment variables validation
  env: {
    // Validate required environment variables
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  },
  
  // Configure for Vercel deployment
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google profile images
    ],
    // Allow data URLs for Base64 images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Ensure all Firebase environment variables are available
  publicRuntimeConfig: {},
  serverRuntimeConfig: {
    firebaseAdminConfig: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }
  }
};

export default nextConfig;
