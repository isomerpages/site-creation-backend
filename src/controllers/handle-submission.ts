import { Request, Response } from 'express'
import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'

import makeSiteSpecification from '../services/formsg-site-spec'
import generateSite from '../services/site-generator'
import { GitHubPublisher } from '../services/github-publisher'

export default (options: { gh: GitHubPublisher }) => async (
  _req: Request,
  res: Response
): Promise<void> => {
  const { gh } = options

  const siteSpecification = makeSiteSpecification(
    res.locals.submission as DecryptedContent
  )

  generateSite(siteSpecification)

  const { repoName } = siteSpecification
  await gh.publish(repoName)

  res.json({ message: 'Done' })
}
