import { Request, Response } from 'express'
import winston from 'winston'

import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'

import getLiveSiteDetails from '../services/live-site/formsg-site-details'

export default (options: {
  createApprovalLink: (opts: {
    repoName: string
    domainName: string
    serverHostname: string
  }) => string
  sendApprovalEmail: (opts: {
    to: string
    requesterEmail: string
    repoName: string
    domainName: string
    approvalLink: string
    previewLink: string
  }) => Promise<void>
  supportEmail: string
  logger?: winston.Logger
}) => async (req: Request, res: Response): Promise<void> => {
  const {
    logger,
    supportEmail,
    createApprovalLink,
    sendApprovalEmail,
  } = options
  const { submissionId } = req.body.data

  logger?.info(`[${submissionId}] Handling go-live request`)
  let statusCode = 200

  const { responses } = res.locals.submission as DecryptedContent

  const { requesterEmail, repoName, domainName } = getLiveSiteDetails({
    responses,
  })

  try {
    const approvalLink = createApprovalLink({
      repoName,
      domainName,
      serverHostname: req.hostname,
    })
    await sendApprovalEmail({
      to: supportEmail,
      requesterEmail,
      repoName,
      domainName,
      approvalLink,
      previewLink: `https://${repoName}-prod.netlify.app`,
    })
  } catch (error) {
    statusCode = 400
    logger?.error(error)
  } finally {
    const message =
      statusCode !== 200 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
