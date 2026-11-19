/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // Use memory cache in dev to avoid OneDrive file locking and packfile ENOENT errors
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
