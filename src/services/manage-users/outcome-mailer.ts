import { SendMailOptions, SentMessageInfo } from 'nodemailer'
import winston from 'winston'

type UserManagementResults = {
  add: string[]
  remove: string[]
  notFound: string[]
}

const errorText = (
  teamName: string,
  supportEmail: string,
  submissionId: string,
  error?: Error
) => `
We were unable to manage users for the team ${teamName}.

Please follow up by sending a mail to ${supportEmail},
quoting the submission id [${submissionId}] and the following error:

${error}
`

const successText = (teamName: string, users: UserManagementResults) => `
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

export default ({
  transport,
  supportEmail,
  logger,
}: {
  transport: {
    sendMail: (options: SendMailOptions) => Promise<SentMessageInfo>
  }
  supportEmail: string
  logger?: winston.Logger
}) => async ({
  to,
  submissionId,
  teamName,
  users,
  error,
}: {
  to: string[]
  submissionId: string
  teamName: string
  users: UserManagementResults
  error?: Error
}): Promise<void> => {
  const subject = error
    ? `[Isomer] Error managing users on ${teamName}`
    : `[Isomer] Users added/removed for ${teamName}`
  const text = error
    ? errorText(teamName, supportEmail, submissionId, error)
    : successText(teamName, users)
  try {
    await transport.sendMail({
      to,
      cc: supportEmail,
      from: supportEmail,
      subject,
      text,
    })
  } catch (err) {
    logger?.error(err)
  }
}
