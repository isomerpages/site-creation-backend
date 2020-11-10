import express from 'express'
import morgan from 'morgan'
import winston from 'winston'

import NetlifyAPI from 'netlify'
import { Octokit } from '@octokit/rest'

import config from './config'

import { formsg, handleSubmission } from './controllers'
import makeGitHubPublisher from './services/github-publisher'
import makeNetlifyPublisher from './services/netlify-publisher'

const formCreateKey = config.get('formCreateKey')
const githubAccessToken = config.get('githubAccessToken')
const netlifyAccessToken = config.get('netlifyAccessToken')
const netlifyAppId = config.get('netlifyAppId')

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
})

const octokit = new Octokit({ auth: githubAccessToken })
const publishToGitHub = makeGitHubPublisher({ octokit, githubAccessToken })
const publishToNetlify =
  netlifyAccessToken && netlifyAppId
    ? makeNetlifyPublisher({
        octokit,
        netlifyAppId,
        netlify: new NetlifyAPI(netlifyAccessToken),
      })
    : () => Promise.resolve()

const app = express()

app.use(morgan('common'))

app.post(
  '/sites',
  formsg({ formCreateKey, logger }),
  handleSubmission({ publishToGitHub, publishToNetlify, logger })
)

export default app
