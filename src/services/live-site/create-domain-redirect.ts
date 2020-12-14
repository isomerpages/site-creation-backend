import { Octokit } from '@octokit/rest'

const createNginxConf = (
  rootDomain: string,
  domainName: string
): string => `server {
  listen          443 ssl http2;
  listen          [::]:443 ssl http2;
  server_name     ${rootDomain};
  ssl_certificate /etc/letsencrypt/live/${rootDomain}/fullchain.pem;
  ssl_certificate_key     /etc/letsencrypt/live/${rootDomain}/privkey.pem;
  return          301 https://${domainName}$request_uri;
}
`

export default ({ octokit }: { octokit: Octokit }) => async (
  domainName: string
): Promise<void> => {
  const rootDomain = domainName.replace('www.', '')
  await octokit.repos.createOrUpdateFileContents({
    owner: 'isomerpages',
    repo: 'isomer-redirection',
    path: `letsencrypt/${rootDomain}.conf`,
    message: `Create nginx conf for ${rootDomain}`,
    content: Buffer.from(createNginxConf(rootDomain, domainName)).toString(
      'base64'
    ),
  })
  await octokit.pulls.create({
    owner: 'isomerpages',
    repo: 'isomer-redirection',
    base: 'master',
    head: 'staging',
    title: `Push nginx conf for ${rootDomain}`,
  })
}
