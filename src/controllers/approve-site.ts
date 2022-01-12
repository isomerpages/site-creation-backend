import { Request, Response } from 'express'
import winston from 'winston'

export default (opts: {
  createKeyCDNZone: (
    repoName: string
  ) => Promise<{ zoneName: string; zoneId: number }>
  addZoneAlias: (domainName: string, zoneId: number) => Promise<void>
  createDomainRedirect: (domainName: string) => Promise<void>
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
    createKeyCDNZone,
    addZoneAlias,
    createDomainRedirect,
    getRepoNameFromToken,
    updateNetlifyDomainConfig,
    addCloudflareCname,
    logger,
  } = opts
  let statusCode = 200
  try {
    const { token } = req.query
    const { repoName, domainName } = getRepoNameFromToken(token as string)

    if (domainName.endsWith('by.gov.sg')) {
      const netlifyName = `${repoName}-prod.netlify.app`
      logger?.info(
        `[${domainName}] Adding Cloudflare CNAME alias to ${netlifyName}`
      )
      await addCloudflareCname(domainName, netlifyName)
      logger?.info(`[${domainName}] Updating domain config for ${netlifyName}`)
      await updateNetlifyDomainConfig(netlifyName, domainName)
    } else {
      logger?.info(`[${domainName}] Adding KeyCDN Zone`)
      const { zoneId } = await createKeyCDNZone(repoName)

      logger?.info(
        `[${domainName}] Adding Zone Alias ${domainName} to ${zoneId}`
      )
      await addZoneAlias(domainName, zoneId)

      if (domainName.startsWith('www.')) {
        logger?.info(`[${domainName}] Filing pull request for ${domainName}`)
        await createDomainRedirect(domainName)
      }
    }
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
