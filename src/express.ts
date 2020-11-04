import express from 'express'
import morgan from 'morgan'

import NetlifyAPI from 'netlify'
import { Octokit } from '@octokit/rest'

import config from './config'

import { formsg, handleSubmission } from './controllers'
import makeGitHubPublisher from './services/github-publisher'
import makeNetlifyPublisher from './services/netlify-publisher'

const formSecretKey = config.get('formSecretKey')
const githubAccessToken = config.get('githubAccessToken')
const netlifyAccessToken = config.get('netlifyAccessToken')
const netlifyAppId = config.get('netlifyAppId')

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
  formsg(formSecretKey),
  handleSubmission({ publishToGitHub, publishToNetlify })
)

export default app
