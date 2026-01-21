/** @type {import('next').NextConfig} */

const nextConfig = {
  trailingSlash: true,
  compress: true,
  images: {
    loader: 'akamai',
    path: '',
  },
}

module.exports = nextConfig