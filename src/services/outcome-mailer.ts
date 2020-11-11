import { SendMailOptions, SentMessageInfo } from 'nodemailer'
import winston from 'winston'

const errorText = (
  repoName: string,
  supportEmail: string,
  submissionId: string,
  error?: Error
) => `
We were unable to create the Isomer site for ${repoName}.

Please follow up by sending a mail to ${supportEmail},
quoting the submission id [${submissionId}] and the following error:

${error}
`

const successText = (repoName: string, supportEmail: string) => `
The Isomer site for ${repoName} has been created successfully! 
Please follow up by sending a mail to ${supportEmail} to 
give yourself and other users access to the repository.

The Isomer guide is available at https://v2.isomer.gov.sg.
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
  repoName,
  error,
}: {
  to: string
  submissionId: string
  repoName: string
  error?: Error
}): Promise<void> => {
  const subject = error
    ? `[Isomer] Error creating ${repoName}`
    : `[Isomer] ${repoName} created successfully`
  const text = error
    ? errorText(repoName, supportEmail, submissionId, error)
    : successText(repoName, supportEmail)
  try {
    await transport.sendMail({
      to,
      from: supportEmail,
      subject,
      text,
    })
  } catch (err) {
    logger?.error(err)
  }
}
