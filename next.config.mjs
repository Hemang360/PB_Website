/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
  },
  eslint: {
    ignoreDuringBuilds: true, // Disables lint checks during the build process
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    domains: [
      "firebasestorage.googleapis.com",
      "img.icons8.com",
      "icpc.global",
      "img.freepik.com",
      "media.licdn.com",
      "res.cloudinary.com"
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Only apply these changes when bundling for the browser (not server)
    if (!isServer) {
      // Extend existing fallback configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        // Add additional Node.js modules needed for OpenTelemetry
        stream: false,
        http: false,
        https: false,
        zlib: false,
        os: false,
        crypto: false,
        buffer: false,
        tty: false,
        timers: false,
        util: false,
        net: false,
        dns: false
      };
    }
    
    return config;
  },
};
export default nextConfig;