import { verify } from 'jsonwebtoken'

export default ({ secretKey }: { secretKey: string }) => (
  token: string
): string => {
  const decoded = verify(token, secretKey) as { repoName: string }
  return decoded.repoName
}
