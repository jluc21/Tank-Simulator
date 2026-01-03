/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This allows production builds to complete even if you have linting errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This allows production builds to complete even if you have TS errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
