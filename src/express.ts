import express from 'express'
import { authenticate, decrypt, handleSubmission } from './controllers'

import FormSG from '@opengovsg/formsg-sdk'

const formsg = FormSG()

const app = express()

app.post(
  '/sites',
  authenticate(formsg.webhooks.authenticate),
  express.json(),
  decrypt(formsg.crypto.decrypt),
  handleSubmission
)

export default app
