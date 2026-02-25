const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Path aliases matching the old vite.config.ts resolve.alias
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, '.');
    config.resolve.alias['@contracts'] = path.resolve(__dirname, '../shared/contracts');
    return config;
  },

  // Allow Three.js and other large packages to be transpiled
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

module.exports = nextConfig;
