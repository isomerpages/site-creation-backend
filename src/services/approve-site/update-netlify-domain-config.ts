import NetlifyAPI from 'netlify'

export default ({ netlify }: { netlify: NetlifyAPI }) => async (
  siteId: string,
  domain: string
): Promise<void> => netlify.updateSite({ id: siteId, custom_domain: domain })
