import { Request, Response } from 'express'
import winston from 'winston'

import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'
import makeUserInstructions from '../services/manage-users/formsg-user-instructions'

export default ({
  // manageTeam,
  // mailOutcome,
  logger,
}: {
  manageTeam: (teamName: string) => Promise<void>
  mailOutcome: (options: {
    to: string
    submissionId: string
    repoName: string
    error?: Error
  }) => Promise<void>
  logger?: winston.Logger
}) => async (req: Request, res: Response): Promise<void> => {
  const { submissionId } = req.body.data

  logger?.info(`[${submissionId}] Handling manage-users submission`)
  const statusCode = 201

  const { responses } = res.locals.submission as DecryptedContent
  const userInstructions = makeUserInstructions({ responses })
  try {
    logger?.info(JSON.stringify(userInstructions))
    logger?.info(`[${submissionId}] Adding/Removing users`)
  } finally {
    const message =
      statusCode !== 201 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
