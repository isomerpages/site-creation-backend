import { sign } from 'jsonwebtoken'

export default ({ secretKey }: { secretKey: string }) => ({
  repoName,
  serverHostname,
}: {
  repoName: string
  serverHostname: string
}): string => {
  const token = sign({ repoName }, secretKey, {
    expiresIn: '7d',
  })
  return `https://${serverHostname}/approve?token=${token}`
}
