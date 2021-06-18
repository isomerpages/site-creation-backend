import { Request, Response } from 'express'
import winston from 'winston'

import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'

import makeSiteSpecification from '../services/create-site/formsg-site-spec'
import generateSite, {
  SiteSpecification,
} from '../services/create-site/site-generator'

const onSuccess = (repoName: string) => (supportEmail: string) => `
The Isomer site for ${repoName} has been created successfully! 
Please follow up by doing the following:

Setup a GitHub account for yourself and others who will
edit the site by following the instructions in the link below:
https://v2.isomer.gov.sg/setup/create-a-github-account

Send this mail to ${supportEmail} with your GitHub usernames 
to give yourself and other users access to the repository.

The Isomer guide is available at https://v2.isomer.gov.sg.
`

const action = 'creating'

// Base pages and folders to create
const SAMPLE_PAGES = ['example-page']
const SAMPLE_COLLECTION = {
  'example-collection': {
    'example-page': [],
  },
}
const SAMPLE_RESOURCES = {
  name: 'resources',
  categories: ['example-category'],
}

export default (options: {
  publishToGitHub: (repoName: string) => Promise<number>
  publishToNetlify: (options: {
    repoName: string
    repoId: number
  }) => Promise<void>
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
  const { publishToGitHub, publishToNetlify, mailOutcome, logger } = options
  const { submissionId } = req.body.data

  logger?.info(`[${submissionId}] Handling create-site submission`)
  let statusCode = 201

  const { responses } = res.locals.submission as DecryptedContent
  const repoName = makeSiteSpecification({ responses })

  let to = ''

  const requestorEmailResponse = responses.find(
    ({ question }) => question === 'Government E-mail'
  )
  if (requestorEmailResponse && requestorEmailResponse.answer) {
    to = requestorEmailResponse.answer
  }

  const siteSpecification: SiteSpecification = {
    repoName: repoName,
    pages: SAMPLE_PAGES,
    collections: SAMPLE_COLLECTION,
    resourceRoom: SAMPLE_RESOURCES,
  }

  try {
    generateSite(siteSpecification)

    logger?.info(`[${submissionId}] Publishing to GitHub`)
    const repoId = await publishToGitHub(repoName)

    logger?.info(`[${submissionId}] Publishing to Netlify`)
    await publishToNetlify({ repoName, repoId })

    logger?.info(`[${submissionId}] Mailing outcome`)
    const successText = onSuccess(repoName)
    await mailOutcome({ to, submissionId, repoName, action, successText })
  } catch (error) {
    statusCode = 400
    logger?.error(error)
    await mailOutcome({ to, submissionId, repoName, action, error })
  } finally {
    const message =
      statusCode !== 201 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
