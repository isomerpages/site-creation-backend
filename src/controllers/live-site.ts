import { Request, Response } from 'express'
import winston from 'winston'

import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'

import getLiveSiteDetails from '../services/live-site/formsg-site-details'

export default (options: {
  createApprovalLink: (opts: {
    repoName: string
    serverHostname: string
  }) => string
  sendApprovalEmail: (opts: {
    to: string
    approvalLink: string
    stagingSiteLink: string
  }) => Promise<void>
  logger?: winston.Logger
}) => async (req: Request, res: Response): Promise<void> => {
  const { logger, createApprovalLink, sendApprovalEmail } = options
  const { submissionId } = req.body.data

  logger?.info(`[${submissionId}] Handling go-live request`)
  let statusCode = 200

  const { responses } = res.locals.submission as DecryptedContent

  const { repoName } = getLiveSiteDetails({
    responses,
  })

  try {
    const approvalLink = createApprovalLink({
      repoName,
      serverHostname: req.hostname,
    })
    await sendApprovalEmail({
      // hard-coding jackson's email here for demo purpose
      // TODO: move this into an env variables maybe and make it a comma-separated list?
      to: 'jackson@open.gov.sg',
      approvalLink,
      stagingSiteLink: `${repoName}-staging.netlify.com`,
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
