import { FormField } from '@opengovsg/formsg-sdk/dist/types'

export type SiteDetails = {
  repoName: string
  requesterEmail: string
  domainName: string
}

export default function ({
  responses,
}: {
  responses: FormField[]
}): SiteDetails {
  const siteDetails: SiteDetails = {
    repoName: '',
    requesterEmail: '',
    domainName: '',
  }

  const requestorEmailResponse = responses.find(
    ({ question }) => question === 'Government E-mail'
  )
  if (requestorEmailResponse && requestorEmailResponse.answer) {
    siteDetails.requesterEmail = requestorEmailResponse.answer
  }

  const repoNameResponse = responses.find(
    ({ question }) => question === 'Repository Name'
  )
  if (repoNameResponse && repoNameResponse.answer) {
    siteDetails.repoName = repoNameResponse.answer
  }

  const domainNameResponse = responses.find(
    ({ question }) => question === 'Domain Name'
  )
  if (domainNameResponse && domainNameResponse.answer) {
    siteDetails.domainName = domainNameResponse.answer
  }
  siteDetails.domainName = siteDetails.domainName.replace(/^\w+:\/\//, '')
  if (siteDetails.domainName.split('.').length === 3) {
    siteDetails.domainName = 'www.' + siteDetails.domainName
  }

  return siteDetails
}
