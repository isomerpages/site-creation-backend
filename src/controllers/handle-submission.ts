import { Request, Response } from 'express'
import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'
import makeSiteSpecification from '../services/formsg-site-spec'
import generateSite from '../services/site-generator'

export default (_req: Request, res: Response): void => {
  const siteSpecification = makeSiteSpecification(
    res.locals.submission as DecryptedContent
  )
  generateSite(siteSpecification)
  // TODO: Export site to GitHub
  res.json({ message: 'Done' })
}
