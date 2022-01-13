import { sign } from 'jsonwebtoken'

export default ({ secretKey }: { secretKey: string }) => ({
  repoName,
  domainName,
  serverHostname,
}: {
  repoName: string
  domainName: string
  serverHostname: string
}): string => {
  const token = sign({ repoName, domainName }, secretKey, {
    expiresIn: '7d',
  })
  return `https://${serverHostname}/approve?token=${token}`
}
