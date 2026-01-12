import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'functions/**',
      'dist/**',
      'node_modules/**',
      'public/sw.js',
      'public/workbox-*.js',
      'public/swe-worker-*.js',
      'scripts/**',
    ],
  },
  ...nextVitals,
  ...nextTs,
]

export default eslintConfig
