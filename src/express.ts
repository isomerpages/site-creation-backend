import express from 'express'
import morgan from 'morgan'

import { Octokit } from '@octokit/rest'

import config from './config'

import { formsg, handleSubmission } from './controllers'
import { GitHubPublisher } from './services/github-publisher'

const formSecretKey = config.get('formSecretKey')
const githubAccessToken = config.get('githubAccessToken')

const octokit = new Octokit({ auth: githubAccessToken })
const gh = new GitHubPublisher({ octokit, githubAccessToken })

const app = express()

app.use(morgan('common'))

app.post('/sites', formsg(formSecretKey), handleSubmission({ gh }))

export default app
