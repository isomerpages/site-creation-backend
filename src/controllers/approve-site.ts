import { Request, Response } from 'express'
import winston from 'winston'

export default (opts: {
  getRepoNameFromToken: (token: string) => string
  addCloudflareCname: (subdomain: string, value: string) => Promise<void>
  updateNetlifyDomainConfig: (siteId: string, domain: string) => Promise<void>
  logger?: winston.Logger
}) => async (req: Request, res: Response): Promise<void> => {
  const {
    getRepoNameFromToken,
    updateNetlifyDomainConfig,
    addCloudflareCname,
    logger,
  } = opts
  let statusCode = 200
  try {
    const { token } = req.query
    const repoName = getRepoNameFromToken(token as string)
    // hardcoded site-id for demo purpose
    // TODO: store this as part of the github repo during prod site creation
    await Promise.all([
      updateNetlifyDomainConfig(
        '0c550024-1d50-4ff8-9fdf-79870e8c7e68',
        `${repoName}.by.gov.sg`
      ),
      addCloudflareCname(repoName, `${repoName}-prod.netlify.app`),
    ])
  } catch (e) {
    statusCode = 400
    logger?.error(e)
  } finally {
    const message =
      statusCode !== 201 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
