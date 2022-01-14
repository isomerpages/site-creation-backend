import NetlifyAPI from 'netlify'
import promiseRetry from 'promise-retry'

export default ({ netlify }: { netlify: NetlifyAPI }) => async (
  netlifyName: string,
  domain: string
): Promise<void> => {
  const { site_id: siteId } = await netlify.getSite({
    site_id: netlifyName,
  })
  await netlify.updateSite({
    site_id: siteId,
    body: {
      custom_domain: domain,
    },
  })

  await promiseRetry(
    async (retry) => {
      return netlify
        .provisionSiteTLSCertificate({
          site_id: siteId,
        })
        .catch(retry)
    },
    { retries: 25 }
  )
}
