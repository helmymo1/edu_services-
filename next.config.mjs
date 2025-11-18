/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: Next.js v16 no longer supports the top-level `eslint` config shape
  // used in older projects. Remove it to avoid warnings. If you still want
  // to ignore lint errors during build, configure ESLint separately or use
  // a CI step.
  typescript: {
    // keep ignoring build errors for now to match original behavior
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow local dev origins (prevents cross-origin dev warnings when accessing via LAN IP)
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.100.14:3000',
  ],
}

export default nextConfig
