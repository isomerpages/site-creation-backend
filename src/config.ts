/**
 * @file Configuration
 * All defaults can be changed
 */
import convict from 'convict'

/**
 * To require an env var without setting a default,
 * use
 *    default: '',
 *    format: 'required-string',
 *    sensitive: true,
 */
convict.addFormats({
  'required-string': {
    validate: (val: unknown): void => {
      if (val === '') {
        throw new Error('Required value cannot be empty')
      }
    },
    coerce: <T extends unknown>(val: T): T | undefined => {
      if (val === null) {
        return undefined
      }
      return val
    },
  },
})

const config = convict({
  port: {
    doc: 'The port that the service listens on',
    env: 'PORT',
    format: 'port',
    default: 8080,
  },
  nodeEnv: {
    doc: 'The Node.js Environment',
    env: 'NODE_ENV',
    format: 'required-string',
    default: 'production',
  },
  awsRegion: {
    doc: 'The AWS region',
    env: 'AWS_REGION',
    format: 'required-string',
    default: 'ap-southeast-1',
  },
  supportEmail: {
    doc: 'The e-mail of the sender for outcome e-mails',
    env: 'SUPPORT_EMAIL',
    format: 'required-string',
    default: 'support@isomer.gov.sg',
  },
  formCreateKey: {
    doc: 'The key given by FormSG to decrypt create requests',
    env: 'FORM_CREATE_KEY',
    format: '*',
    default: '',
    sensitive: true,
  },
  formUsersKey: {
    doc: 'The key given by FormSG to decrypt user management requests',
    env: 'FORM_USERS_KEY',
    format: '*',
    default: '',
    sensitive: true,
  },
  formLiveKey: {
    doc: 'The key given by FormSG to decrypt site go-live requests',
    env: 'FORM_LIVE_KEY',
    format: '*',
    default: '',
    sensitive: true,
  },
  githubAccessToken: {
    doc: 'The key given by GitHub',
    env: 'GITHUB_ACCESS_TOKEN',
    format: 'required-string',
    default: '',
    sensitive: true,
  },
  netlifyAccessToken: {
    doc: 'The key given by Netlify for site creation',
    env: 'NETLIFY_ACCESS_TOKEN',
    format: '*',
    default: '',
    sensitive: true,
  },
  netlifyAppId: {
    doc:
      'The id number of the Netlify App installed on the GitHub organisation',
    env: 'NETLIFY_APP_ID',
    format: 'int',
    default: 0,
  },
  keyCDNAccessToken: {
    doc: 'The key given by KeyCDN for Zone creation and aliasing',
    env: 'KEYCDN_ACCESS_TOKEN',
    format: '*',
    default: '',
    sensitive: true,
  },
})

config.validate()

export default config
