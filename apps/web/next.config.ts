import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const apiTarget = process.env.API_INTERNAL_URL ?? "http://api:3001";
    const grafanaTarget =
      process.env.GRAFANA_INTERNAL_URL ?? "http://grafana:3000";
    const sentryTarget =
      process.env.SENTRY_INTERNAL_URL ?? "http://sentry:8123";

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: "/grafana",
        destination: `${grafanaTarget}/grafana`,
      },
      {
        source: "/grafana/:path*",
        destination: `${grafanaTarget}/grafana/:path*`,
      },
      {
        source: "/sentry",
        destination: `${sentryTarget}/`,
      },
      {
        source: "/sentry/:path*",
        destination: `${sentryTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
