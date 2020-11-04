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
  formSecretKey: {
    doc: 'The key given by FormSG to decrypt entries',
    env: 'FORM_SECRET_KEY',
    format: 'required-string',
    default: '',
    sensitive: true,
  },
  githubAccessToken: {
    doc: 'The key given by GitHub for repo creation',
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
})

config.validate()

export default config
