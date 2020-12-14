import express from 'express'
import morgan from 'morgan'
import winston from 'winston'

import NetlifyAPI from 'netlify'
import { Octokit } from '@octokit/rest'

import aws from 'aws-sdk'
import nodemailer, { SendMailOptions } from 'nodemailer'

import config from './config'

import { formsg, createSite, manageUsers } from './controllers'
import makeGitHubPublisher from './services/create-site/github-publisher'
import makeNetlifyPublisher from './services/create-site/netlify-publisher'
import makeOutcomeMailer from './services/outcome-mailer'

import makeTeamManager from './services/manage-users/team-manager'

const formCreateKey = config.get('formCreateKey')
const formUsersKey = config.get('formUsersKey')
const githubAccessToken = config.get('githubAccessToken')

const supportEmail = config.get('supportEmail')

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

const app = express()

app.use(morgan('common'))

const mailOutcome = makeOutcomeMailer({
  transport,
  supportEmail,
  logger,
})

if (formCreateKey) {
  logger.info('Initializing middleware for /sites')
  const netlifyAccessToken = config.get('netlifyAccessToken')
  const netlifyAppId = config.get('netlifyAppId')

  const publishToGitHub = makeGitHubPublisher({ octokit, githubAccessToken })
  const publishToNetlify =
    netlifyAccessToken && netlifyAppId
      ? makeNetlifyPublisher({
          netlifyAppId,
          netlify: new NetlifyAPI(netlifyAccessToken),
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

export default app
