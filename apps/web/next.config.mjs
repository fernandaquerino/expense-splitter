/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint is run explicitly via `npm run lint`; keep it out of the build so a
    // style nit can't block a production build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
