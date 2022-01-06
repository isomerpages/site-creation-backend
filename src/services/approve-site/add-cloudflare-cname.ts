import Cloudflare from 'cloudflare'

export default ({
  cloudflare,
  zoneId,
}: {
  cloudflare: Cloudflare
  zoneId: string
}) => async (subdomain: string, value: string): Promise<void> => {
  await cloudflare.dnsRecords.add(zoneId, {
    type: 'CNAME',
    name: subdomain,
    content: value,
    ttl: 1, // 1 for 'automatic'
  })
}
