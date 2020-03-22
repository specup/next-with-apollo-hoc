const isBrowser = process.env.BROWSER === 'true'
const isDemo = process.env.DEMO === 'true'

if (isDemo) {
  module.exports = {
    presets: ['next/babel'],
  }
} else {
  module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: isBrowser ? false : 'commonjs',
          ...(!isBrowser && {
            targets: { node: 'current' },
          }),
        },
      ],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: ['@babel/plugin-transform-runtime'],
  }
}
