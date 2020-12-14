import { Request, Response } from 'express'
import winston from 'winston'

import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'

import getLiveSiteDetails from '../services/live-site/formsg-site-details'

const onSuccess = ({
  repoName,
  zoneName,
  domainName,
}: {
  repoName: string
  zoneName: string
  domainName: string
}) => () => `
The Isomer site for ${repoName} has been made live successfully! 
Please note the following:

KeyCDN Zone at ${zoneName}

Zone Aliased to ${domainName}

If your domain name starts with www, a request has been filed
to redirect your root domain to your www domain.
`

const action = 'creating'

export default (options: {
  createKeyCDNZone: (
    repoName: string
  ) => Promise<{ zoneName: string; zoneId: number }>
  verifyDns: (repoName: string, zoneName: string) => Promise<void>
  addZoneAlias: (domainName: string, zoneId: number) => Promise<void>
  createDomainRedirect: (domainName: string) => Promise<void>
  mailOutcome: (options: {
    to: string | string[]
    submissionId: string
    repoName: string
    action: string
    error?: Error
    successText?: (supportEmail: string) => string
  }) => Promise<void>
  logger?: winston.Logger
}) => async (req: Request, res: Response): Promise<void> => {
  const {
    createKeyCDNZone,
    verifyDns,
    addZoneAlias,
    createDomainRedirect,
    mailOutcome,
    logger,
  } = options
  const { submissionId } = req.body.data

  logger?.info(`[${submissionId}] Handling live-site submission`)
  let statusCode = 200

  const { responses } = res.locals.submission as DecryptedContent

  const { requesterEmail: to, repoName, domainName } = getLiveSiteDetails({
    responses,
  })

  try {
    logger?.info(`[${submissionId}] Adding KeyCDN Zone`)
    const { zoneName, zoneId } = await createKeyCDNZone(repoName)

    logger?.info(`[${submissionId}] Verifying DNS records`)
    await verifyDns(domainName, zoneName)

    logger?.info(
      `[${submissionId}] Adding Zone Alias ${domainName} to ${zoneId}`
    )
    await addZoneAlias(domainName, zoneId)

    if (domainName.startsWith('www.')) {
      logger?.info(`[${submissionId}] Filing pull request for ${domainName}`)
      await createDomainRedirect(domainName)
    }

    logger?.info(`[${submissionId}] Mailing outcome`)
    const successText = onSuccess({ repoName, zoneName, domainName })
    await mailOutcome({ to, submissionId, repoName, action, successText })
  } catch (error) {
    statusCode = 400
    logger?.error(error)
    await mailOutcome({ to, submissionId, repoName, action, error })
  } finally {
    const message =
      statusCode !== 200 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
