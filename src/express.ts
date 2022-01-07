import express from 'express'
import morgan from 'morgan'
import winston from 'winston'

import NetlifyAPI from 'netlify'
import { Octokit } from '@octokit/rest'

import aws from 'aws-sdk'
import nodemailer, { SendMailOptions } from 'nodemailer'

import config from './config'

import { formsg, createSite, manageUsers, liveSite } from './controllers'
import makeGitHubPublisher from './services/create-site/github-publisher'
import makeNetlifyPublisher from './services/create-site/netlify-publisher'
import makeOutcomeMailer from './services/outcome-mailer'

import makeTeamManager from './services/manage-users/team-manager'

import makeApprovalLinkCreator from './services/live-site/create-approval-link'
import makeApprovalEmailSender from './services/live-site/send-approval-mail'
import approveSite from './controllers/approve-site'

import makeRepoNameFromTokenGetter from './services/approve-site/get-repo-name-from-token'
import makeCloudflareCnameAdder from './services/approve-site/add-cloudflare-cname'
import makeNetlifyDomainConfigUpdater from './services/approve-site/update-netlify-domain-config'
import Cloudflare from 'cloudflare'

const formCreateKey = config.get('formCreateKey')
const formUsersKey = config.get('formUsersKey')
const formLiveKey = config.get('formLiveKey')
const githubAccessToken = config.get('githubAccessToken')

const supportEmail = config.get('supportEmail')

const jwtSecretKey = config.get('jwtSecretKey')

const netlifyAccessToken = config.get('netlifyAccessToken')

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [new winston.transports.Console()],
})

const octokit = new Octokit({ auth: githubAccessToken })
const transport =
  config.get('nodeEnv') === 'production'
    ? nodemailer.createTransport({
        SES: new aws.SES({ region: config.get('awsRegion') }),
      })
    : {
        sendMail: async (options: SendMailOptions) =>
          logger.info(`Mail sent - ${JSON.stringify(options, null, 2)}`),
      }

const netlify = new NetlifyAPI(netlifyAccessToken)
const app = express()

app.use(morgan('common'))

const mailOutcome = makeOutcomeMailer({
  transport,
  supportEmail,
  logger,
})

if (formCreateKey) {
  logger.info('Initializing middleware for /sites')
  const netlifyAppId = config.get('netlifyAppId')

  const publishToGitHub = makeGitHubPublisher({ octokit, githubAccessToken })
  const publishToNetlify =
    netlifyAccessToken && netlifyAppId
      ? makeNetlifyPublisher({
          netlifyAppId,
          netlify,
        })
      : () => Promise.resolve()
  app.post(
    '/sites',
    formsg({ formKey: formCreateKey, logger }),
    createSite({
      publishToGitHub,
      publishToNetlify,
      mailOutcome,
      logger,
    })
  )
}

if (formUsersKey) {
  logger.info('Initializing middleware for /users')
  const manageTeam = makeTeamManager({ octokit })
  app.post(
    '/users',
    formsg({ formKey: formUsersKey, logger }),
    manageUsers({
      manageTeam,
      mailOutcome,
      logger,
    })
  )
}

if (formLiveKey) {
  logger.info('Initializing middleware for /live')
  // const keyCDNAccessToken = config.get('keyCDNAccessToken')
  // const createKeyCDNZone = makeZoneCreator({ keyCDNAccessToken })
  // const addZoneAlias = makeZoneAliaser({ keyCDNAccessToken })
  // const createDomainRedirect = makeDomainRedirector({ octokit })
  const createApprovalLink = makeApprovalLinkCreator({
    secretKey: jwtSecretKey,
  })
  const getRepoNameFromToken = makeRepoNameFromTokenGetter({
    secretKey: jwtSecretKey,
  })
  const sendApprovalEmail = makeApprovalEmailSender({
    transport,
    supportEmail,
  })
  const addCloudflareCname = makeCloudflareCnameAdder({
    cloudflare: new Cloudflare({
      token: config.get('cloudflareToken'),
    }),
    zoneId: config.get('cloudflareZoneId'),
  })
  const updateNetlifyDomainConfig = makeNetlifyDomainConfigUpdater({
    netlify,
  })
  app.post(
    '/live',
    formsg({ formKey: formLiveKey, logger }),
    liveSite({
      createApprovalLink,
      sendApprovalEmail,
      supportEmail,
      logger,
    })
  )
  app.get(
    '/approve',
    approveSite({
      getRepoNameFromToken,
      addCloudflareCname,
      updateNetlifyDomainConfig,
      logger,
    })
  )
}

export default app
