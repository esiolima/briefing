const nextConfig = {
  reactStrictMode: true,
  basePath: "/briefing",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
