import { Request, Response } from 'express'
import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'

import makeSiteSpecification from '../services/formsg-site-spec'
import generateSite from '../services/site-generator'

export default (options: {
  publishToGitHub: (repoName: string) => Promise<void>
}) => async (_req: Request, res: Response): Promise<void> => {
  const { publishToGitHub } = options

  const siteSpecification = makeSiteSpecification(
    res.locals.submission as DecryptedContent
  )

  generateSite(siteSpecification)

  const { repoName } = siteSpecification
  await publishToGitHub(repoName)

  res.json({ message: 'Done' })
}
