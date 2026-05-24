/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow server-side fetches to external RSS sources
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
