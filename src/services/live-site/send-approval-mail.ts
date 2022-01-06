import { SendMailOptions, SentMessageInfo } from 'nodemailer'

export default ({
  transport,
  supportEmail,
}: {
  transport: {
    sendMail: (options: SendMailOptions) => Promise<SentMessageInfo>
  }
  supportEmail: string
}) => async ({
  to,
  approvalLink,
  stagingSiteLink,
}: {
  to: string
  approvalLink: string
  stagingSiteLink: string
}): Promise<void> => {
  const subject = '[Isomer] Going live request'
  const html = `There's a new request for site going live

- Preview site <a href="${stagingSiteLink}">here</a>

Click on <a href="${approvalLink}">this link</a> to approve this site deployment
`

  await transport.sendMail({
    to,
    cc: supportEmail,
    from: supportEmail,
    subject,
    html,
  })
}
