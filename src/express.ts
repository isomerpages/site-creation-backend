import express from 'express'
import morgan from 'morgan'
import winston from 'winston'

import NetlifyAPI from 'netlify'
import { Octokit } from '@octokit/rest'

import aws from 'aws-sdk'
import nodemailer, { SendMailOptions } from 'nodemailer'

import config from './config'

import { formsg, createSite } from './controllers'
import makeGitHubPublisher from './services/create-site/github-publisher'
import makeNetlifyPublisher from './services/create-site/netlify-publisher'
import makeCreateOutcomeMailer from './services/create-site/outcome-mailer'

const formCreateKey = config.get('formCreateKey')
const githubAccessToken = config.get('githubAccessToken')
const netlifyAccessToken = config.get('netlifyAccessToken')
const netlifyAppId = config.get('netlifyAppId')

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
const publishToGitHub = makeGitHubPublisher({ octokit, githubAccessToken })
const publishToNetlify =
  netlifyAccessToken && netlifyAppId
    ? makeNetlifyPublisher({
        netlifyAppId,
        netlify: new NetlifyAPI(netlifyAccessToken),
      })
    : () => Promise.resolve()

const transport =
  config.get('nodeEnv') === 'production'
    ? nodemailer.createTransport({
        SES: new aws.SES({ region: config.get('awsRegion') }),
      })
    : {
        sendMail: async (options: SendMailOptions) =>
          logger.info(`Mail sent - ${JSON.stringify(options, null, 2)}`),
      }

const mailCreateOutcome = makeCreateOutcomeMailer({
  transport,
  supportEmail,
  logger,
})

const app = express()

app.use(morgan('common'))

app.post(
  '/sites',
  formsg({ formCreateKey, logger }),
  createSite({
    publishToGitHub,
    publishToNetlify,
    mailOutcome: mailCreateOutcome,
    logger,
  })
)

export default app
