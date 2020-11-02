import express from 'express'
import morgan from 'morgan'

import { Octokit } from '@octokit/rest'

import config from './config'

import { formsg, handleSubmission } from './controllers'

const formSecretKey = config.get('formSecretKey')
const githubAccessToken = config.get('githubAccessToken')

const octokit = new Octokit({ auth: githubAccessToken })

const app = express()

app.use(morgan('common'))

app.post(
  '/sites',
  formsg(formSecretKey),
  handleSubmission({ octokit, githubAccessToken })
)

export default app
