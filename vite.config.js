import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'
const isGitHubUserSite = repositoryName?.endsWith('.github.io') ?? false
const configuredBasePath = process.env.BRENO_BASE_PATH

export default defineConfig({
  base: configuredBasePath || (isGitHubPages && repositoryName && !isGitHubUserSite ? `/${repositoryName}/` : '/'),
  plugins: [react(), tailwindcss()],
})

