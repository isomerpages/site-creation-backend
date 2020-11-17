import { Request, Response } from 'express'
import winston from 'winston'

import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'

import makeSiteSpecification from '../services/create-site/formsg-site-spec'
import generateSite from '../services/create-site/site-generator'

export default (options: {
  publishToGitHub: (repoName: string) => Promise<number>
  publishToNetlify: (options: {
    repoName: string
    repoId: number
  }) => Promise<void>
  mailOutcome: (options: {
    to: string
    submissionId: string
    repoName: string
    error?: Error
  }) => Promise<void>
  logger?: winston.Logger
}) => async (req: Request, res: Response): Promise<void> => {
  const { publishToGitHub, publishToNetlify, mailOutcome, logger } = options
  const { submissionId } = req.body.data

  logger?.info(`[${submissionId}] Handling create-site submission`)
  let statusCode = 201

  const { responses } = res.locals.submission as DecryptedContent
  const siteSpecification = makeSiteSpecification({ responses })
  const { repoName } = siteSpecification

  let to = ''

  const requestorEmailResponse = responses.find(
    ({ question }) => question === 'Government E-mail'
  )
  if (requestorEmailResponse && requestorEmailResponse.answer) {
    to = requestorEmailResponse.answer
  }

  try {
    generateSite(siteSpecification)

    logger?.info(`[${submissionId}] Publishing to GitHub`)
    const repoId = await publishToGitHub(repoName)

    logger?.info(`[${submissionId}] Publishing to Netlify`)
    await publishToNetlify({ repoName, repoId })

    logger?.info(`[${submissionId}] Mailing outcome`)
    await mailOutcome({ to, submissionId, repoName })
  } catch (error) {
    statusCode = 400
    logger?.error(error)
    await mailOutcome({ to, submissionId, repoName, error })
  } finally {
    const message =
      statusCode !== 201 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
