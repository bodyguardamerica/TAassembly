const CopyPlugin = require('copy-webpack-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
            to: '../public/pdf.worker.min.mjs',
          },
        ],
      })
    )
    return config
  },
}

module.exports = nextConfig
