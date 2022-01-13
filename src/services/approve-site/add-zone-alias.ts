import fetch from 'cross-fetch'

export default ({ keyCDNAccessToken }: { keyCDNAccessToken: string }) => async (
  domainName: string,
  zoneId: number
): Promise<void> => {
  const response = await fetch('https://api.keycdn.com/zonealiases.json', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization:
        'Basic ' + Buffer.from(`${keyCDNAccessToken}:`).toString('base64'),
    },
    body: JSON.stringify({
      name: domainName,
      zone_id: zoneId,
    }),
  })
  if (!response.ok) {
    const json = await response.json()
    throw new Error(JSON.stringify(json))
  }
}
