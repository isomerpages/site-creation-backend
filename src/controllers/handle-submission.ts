import { Request, Response } from 'express'
import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'

import makeSiteSpecification from '../services/formsg-site-spec'
import generateSite from '../services/site-generator'

export default (options: {
  publishToGitHub: (repoName: string) => Promise<number>
  publishToNetlify: (options: {
    repoName: string
    repoId: number
  }) => Promise<void>
}) => async (_req: Request, res: Response): Promise<void> => {
  const { publishToGitHub, publishToNetlify } = options

  try {
    const siteSpecification = makeSiteSpecification(
      res.locals.submission as DecryptedContent
    )

    generateSite(siteSpecification)

    const { repoName } = siteSpecification
    const repoId = await publishToGitHub(repoName)
    await publishToNetlify({ repoName, repoId })
  } catch (err) {
    console.error(err)
  }
  res.json({ message: 'Done' })
}
