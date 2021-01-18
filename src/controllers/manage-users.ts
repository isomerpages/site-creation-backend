import { Request, Response } from 'express'
import winston from 'winston'

import { DecryptedContent } from '@opengovsg/formsg-sdk/dist/types'
import { UserInstructions } from '../services/manage-users/formsg-user-instructions'
import makeUserInstructions from '../services/manage-users/formsg-user-instructions'

type UserManagementResults = {
  add: string[]
  remove: string[]
  notFound: string[]
}

const onSuccess = (teamName: string, users: UserManagementResults) => () => `
User management for ${teamName} has been executed successfully! 

Users who are new to Isomer will be sent a GitHub invitation via e-mail.
They are to accept the invitation by following the instructions in the
mail, or visiting https://github.com/isomerpages and following the 
instructions there.

The following users have been added:
${users.add.join('\n')}

The following users have been removed:
${users.remove.join('\n')}

The following users were not found:
${users.notFound.join('\n')}
`

const action = 'managing users for'

export default ({
  manageTeam,
  mailOutcome,
  logger,
}: {
  manageTeam: (userInstructions: UserInstructions) => Promise<string[]>
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
  const { submissionId } = req.body.data

  logger?.info(`[${submissionId}] Handling manage-users submission`)
  let statusCode = 201

  const { responses } = res.locals.submission as DecryptedContent
  const userInstructions = makeUserInstructions({ responses })
  const to = [userInstructions.requesterEmail]
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
    const successText = onSuccess(teamName, users)
    await mailOutcome({
      to,
      submissionId,
      repoName: teamName,
      action,
      successText,
    })
  } catch (error) {
    statusCode = 400
    logger?.error(error)
    await mailOutcome({ to, submissionId, repoName: teamName, action, error })
  } finally {
    const message =
      statusCode !== 201 ? 'Request processed with errors' : 'Request processed'
    res.status(statusCode).json({ message })
  }
}
