import NetlifyAPI from 'netlify'

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
}
