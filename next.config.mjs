/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site: `npm run build` writes plain HTML/CSS/JS into the `out/` folder.
  // Upload that folder to any static host (Netlify, Vercel, GitHub Pages, Hostinger, S3...).
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  optimizeFonts: false,
  images: {
    // No image server in a static export — images are served exactly as they are in /public.
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use memory cache in dev to avoid OneDrive file locking and packfile ENOENT errors
      config.cache = {
        type: "memory",
      };
    }
    return config;
  },
};

export default nextConfig;