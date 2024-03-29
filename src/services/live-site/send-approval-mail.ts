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
  const html = `<p>There's a new request for a site go-live from ${requesterEmail}.</p>

<p>
Repository: ${repoName} <br/>
Target Domain: ${domainName}
</p>

<p>
Preview site: <a href="${previewLink}">${previewLink}</a>
</p>

<p>
Use the following URL to approve this site deployment:<br/>
<pre>
${approvalLink}
</pre>
</p>
`

  await transport.sendMail({
    to,
    cc: supportEmail,
    from: supportEmail,
    subject,
    html,
  })
}
