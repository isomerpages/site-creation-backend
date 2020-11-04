import { Octokit } from '@octokit/rest'
import NetlifyAPI from 'netlify'

export default ({
  octokit,
  netlify,
  netlifyAppId,
}: {
  octokit: Octokit
  netlify: NetlifyAPI
  netlifyAppId: number
}) => async (options: { repoName: string; repoId: number }): Promise<void> => {
  const { repoName, repoId } = options
  const {
    id: deployKeyId,
    public_key: deployKey,
  } = await netlify.createDeployKey()
  await octokit.repos.createDeployKey({
    owner: 'isomerpages',
    repo: repoName,
    title: 'Netlify',
    key: deployKey,
    read_only: true,
  })
  await Promise.all([
    netlify.createSite({
      body: {
        name: `${repoName}-staging`,
        repo: {
          provider: 'github',
          id: repoId,
          repo: `isomerpages/${repoName}`,
          private: false,
          branch: 'staging',
          cmd: 'JEKYLL_ENV=staging jekyll build',
          dir: '_site/',
          deploy_key_id: deployKeyId,
          installation_id: netlifyAppId,
        },
      },
    }),
    netlify.createSite({
      body: {
        name: `${repoName}-prod`,
        repo: {
          provider: 'github',
          id: repoId,
          repo: `isomerpages/${repoName}`,
          private: false,
          branch: 'master',
          cmd: 'jekyll build',
          dir: '_site/',
          deploy_key_id: deployKeyId,
          installation_id: netlifyAppId,
        },
      },
    }),
  ])
}
