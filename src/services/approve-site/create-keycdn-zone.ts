import fetch from 'cross-fetch'

export default ({ keyCDNAccessToken }: { keyCDNAccessToken: string }) => async (
  repoName: string
): Promise<{ zoneName: string; zoneId: number }> => {
  const name = `isomer${repoName.replace('-', '')}`
  const originurl = `https://${repoName}-prod.netlify.app`
  const response = await fetch('https://api.keycdn.com/zones.json', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization:
        'Basic ' + Buffer.from(`${keyCDNAccessToken}:`).toString('base64'),
    },
    body: JSON.stringify({
      name,
      type: 'pull',
      expire: 5,
      originurl,
      cachecanonical: 'disabled',
      cachemaxexpire: 5,
      forcessl: 'enabled',
      sslcert: 'letsencrypt',
    }),
  })
  const json = await response.json()
  if (!response.ok) {
    throw new Error(JSON.stringify(json))
  }
  return {
    zoneName: name,
    zoneId: json.data.zone.id,
  }
}
