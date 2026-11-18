/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  transpilePackages: ['lucide-react'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
