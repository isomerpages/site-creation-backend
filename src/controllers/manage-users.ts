import { Request, Response } from 'express'
import winston from 'winston'

import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'
import { UserInstructions } from '../services/manage-users/formsg-user-instructions'
import makeUserInstructions from '../services/manage-users/formsg-user-instructions'

export default ({
  manageTeam,
  mailOutcome,
  logger,
}: {
  manageTeam: (userInstructions: UserInstructions) => Promise<string[]>
  mailOutcome: (options: {
    to: string[]
    submissionId: string
    teamName: string
    users: {
      add: string[]
      remove: string[]
      notFound: string[]
    }
    error?: Error
  }) => Promise<void>
  logger?: winston.Logger
}) => async (req: Request, res: Response): Promise<void> => {
  const { submissionId } = req.body.data

  logger?.info(`[${submissionId}] Handling manage-users submission`)
  let statusCode = 201

  const { responses } = res.locals.submission as DecryptedContent
  const userInstructions = makeUserInstructions({ responses })
  const to = [userInstructions.adminEmail, userInstructions.requesterEmail]
  const { teamName } = userInstructions
  const users = {
    ...userInstructions.users,
    notFound: [] as string[],
  }
  try {
    logger?.info(`[${submissionId}] Adding/Removing users`)
    users.notFound = await manageTeam(userInstructions)

    users.add = users.add.filter((u) => !users.notFound.includes(u))
    users.remove = users.remove.filter((u) => !users.notFound.includes(u))

    if (!users.add.length) {
      users.add.push('N/A')
    }
    if (!users.remove.length) {
      users.remove.push('N/A')
    }
    if (!users.notFound.length) {
      users.notFound.push('N/A')
    }

    await mailOutcome({ to, submissionId, users, teamName })
  } catch (error) {
    statusCode = 400
    logger?.error(error)
    await mailOutcome({ to, submissionId, users, teamName, error })
  } finally {
    const message =
      statusCode !== 201 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
