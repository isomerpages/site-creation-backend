import NetlifyAPI from 'netlify'

export default ({
  netlify,
  netlifyAppId,
}: {
  netlify: NetlifyAPI
  netlifyAppId: number
}) => async (options: { repoName: string; repoId: number }): Promise<void> => {
  const { repoName, repoId } = options
  await Promise.all([
    netlify.createSiteInTeam({
      account_slug: 'isomer',
      body: {
        name: `${repoName}-staging`,
        account_slug: 'isomer',
        repo: {
          provider: 'github',
          id: repoId,
          repo: `isomerpages/${repoName}`,
          private: false,
          branch: 'staging',
          cmd:
            'curl https://raw.githubusercontent.com/opengovsg/isomer-build/master/build.sh | bash -s -- -e staging',
          dir: '_site/',
          installation_id: netlifyAppId,
        },
      },
    }),
    netlify.createSiteInTeam({
      account_slug: 'isomer',
      body: {
        name: `${repoName}-prod`,
        account_slug: 'isomer',
        repo: {
          provider: 'github',
          id: repoId,
          repo: `isomerpages/${repoName}`,
          private: false,
          branch: 'master',
          cmd:
            'curl https://raw.githubusercontent.com/opengovsg/isomer-build/master/build.sh | bash',
          dir: '_site/',
          installation_id: netlifyAppId,
        },
      },
    }),
  ])
}
