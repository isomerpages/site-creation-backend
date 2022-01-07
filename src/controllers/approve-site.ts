import { Request, Response } from 'express'
import winston from 'winston'

export default (opts: {
  getRepoNameFromToken: (
    token: string
  ) => {
    repoName: string
    domainName: string
  }
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
    const { repoName, domainName } = getRepoNameFromToken(token as string)
    // hardcoded site-id for demo purpose
    // TODO: store this as part of the github repo during prod site creation
    const netlifyName = `${repoName}-prod.netlify.app`
    await addCloudflareCname(domainName, netlifyName)
    await updateNetlifyDomainConfig(netlifyName, domainName)
  } catch (e) {
    statusCode = 400
    console.error(e)
    logger?.error(e)
  } finally {
    const message =
      statusCode !== 200 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
