import dns from 'dns'
import { promisify } from 'util'

const cname = promisify(dns.resolveCname)

export default async (domainName: string, repoName: string): Promise<void> => {
  const cNames = await cname(domainName)
  const zoneName = `isomer${repoName.replace('-', '')}`
  const zoneLongName = `${zoneName}-dbca.kxcdn.com`
  if (!cNames.includes(zoneLongName)) {
    throw new Error(
      `${domainName} resolves to ${cNames.join(',')}; not ${zoneLongName}`
    )
  }
}
