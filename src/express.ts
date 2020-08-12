import express from 'express'
import morgan from 'morgan'

import config from './config'

import { formsg, handleSubmission } from './controllers'

const formSecretKey = config.get('formSecretKey')

const app = express()

app.use(morgan('common'))

app.post('/sites', formsg(formSecretKey), handleSubmission)

export default app
