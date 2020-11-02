import { Request, Response } from 'express'
import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'
import { Octokit } from '@octokit/rest'

import makeSiteSpecification from '../services/formsg-site-spec'
import generateSite from '../services/site-generator'
import simpleGit from 'simple-git'

export default (options: {
  octokit: Octokit
  githubAccessToken: string
}) => async (_req: Request, res: Response): Promise<void> => {
  const { octokit, githubAccessToken } = options
  const siteSpecification = makeSiteSpecification(
    res.locals.submission as DecryptedContent
  )
  generateSite(siteSpecification)

  const { repoName } = siteSpecification

  // Export site to GitHub
  await octokit.repos.createInOrg({
    org: 'isomerpages',
    name: siteSpecification.repoName,
    description: `Staging: https://${repoName}-staging.netlify.app | Production: https://${repoName}-prod.netlify.app`,
    visibility: 'public',
  })
  const git = simpleGit({
    baseDir: `/tmp/${repoName}`,
  })

  await git
    .init()
    .add('.')
    .commit('Initial commit')
    .addRemote(
      'origin',
      `https://user:${githubAccessToken}@github.com/isomerpages/${repoName}`
    )
    .branch(['-m', 'staging'])
    .push('origin', 'staging', { '-u': null })
    .checkoutBranch('master', 'HEAD')
    .push('origin', 'master', { '-u': null })

  res.json({ message: 'Done' })
}
