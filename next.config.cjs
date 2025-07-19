/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc", // For your custom images
      },
      {
        protocol: "https",
        hostname: "www.notion.so", // For Notion's public URLs if any
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
