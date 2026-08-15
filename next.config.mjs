/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  compress: true,
  experimental: {
    useDeploymentId: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'canvas-confetti',
    ],
  },
};

export default nextConfig;
