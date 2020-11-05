interface NetlifySite {
  id: string
  state: string
  plan: string
  name: string
  custom_domain: string
  domain_aliases: string[]
  password: string
  notification_email: string
  url: string
  ssl_url: string
  admin_url: string
  screenshot_url: string
  created_at: string
  updated_at: string
  user_id: string
  session_id: string
  ssl: boolean
  force_ssl: boolean
  managed_dns: boolean
  deploy_url: string
  published_deploy: PublishedDeploy
  account_name: string
  account_slug: string
  git_provider: string
  deploy_hook: string
  capabilities: Capabilities
  processing_settings: ProcessingSettings
  build_settings: BuildSettings
  id_domain: string
  default_hooks_data: DefaultHooksData
  build_image: string
}

interface CreateSiteRequest extends Partial<NetlifySite> {
  repo?: BuildSettings
}

declare module 'netlify' {
  export default class NetlifyAPI {
    constructor(token: string)
    createDeployKey: () => Promise<{ id: string; public_key: string }>
    createSiteInTeam: (site: {
      account_slug: string
      body: CreateSiteRequest
    }) => Promise<CreateSiteResponse>
  }
}
