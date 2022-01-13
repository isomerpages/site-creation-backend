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
  requesterEmail,
  repoName,
  domainName,
  approvalLink,
  previewLink,
}: {
  to: string
  requesterEmail: string
  repoName: string
  domainName: string
  approvalLink: string
  previewLink: string
}): Promise<void> => {
  const subject = '[Isomer] Go-Live Request'
  const html = `There's a new request for a site go-live from ${requesterEmail}.

Repository: ${repoName}
Target Domain: ${domainName}

- Preview site: <a href="${previewLink}">${previewLink}</a>

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
