import { verify } from 'jsonwebtoken'

export default ({ secretKey }: { secretKey: string }) => (
  token: string
): {
  repoName: string
  domainName: string
} => {
  const decoded = verify(token, secretKey) as {
    repoName: string
    domainName: string
  }
  return decoded
}
