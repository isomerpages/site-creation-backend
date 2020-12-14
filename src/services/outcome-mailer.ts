import { SendMailOptions, SentMessageInfo } from 'nodemailer'
import winston from 'winston'

const errorText = (
  repoName: string,
  supportEmail: string,
  submissionId: string,
  error?: Error
) => `
We were unable to perform the operation for ${repoName}.

Please follow up by sending a mail to ${supportEmail},
quoting the submission id [${submissionId}] and the following error:

${error}
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
  action,
  error,
  successText,
}: {
  to: string | string[]
  submissionId: string
  repoName: string
  action: string
  error?: Error
  successText?: (supportEmail: string) => string
}): Promise<void> => {
  const subject = error
    ? `[Isomer] Error ${action} ${repoName}`
    : `[Isomer] Success in ${action} ${repoName}`
  const text = error
    ? errorText(repoName, supportEmail, submissionId, error)
    : successText && successText(supportEmail)
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
