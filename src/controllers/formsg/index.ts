import express from 'express'
import { Request, Response, NextFunction } from 'express'

import FormSG from '@opengovsg/formsg-sdk'
import {
  DecryptParams,
  DecryptedContent,
} from '@opengovsg/formsg-sdk/dist/types'

import authenticate from './authenticate'
import decrypt from './decrypt'
import winston from 'winston'

export { authenticate, decrypt }

interface CanDecryptFormSGPayload {
  webhooks: {
    authenticate: (header: string, uri: string) => void
  }
  crypto: {
    decrypt: (
      formCreateKey: string,
      decryptParams: DecryptParams
    ) => DecryptedContent | null
  }
}

interface FormSGExpressOptions {
  formKey: string
  formsg?: CanDecryptFormSGPayload
  logger?: winston.Logger
}

export default ({
  formKey,
  formsg = FormSG(),
  logger,
}: FormSGExpressOptions): Array<
  (req: Request, res: Response, next: NextFunction) => void
> => [
  authenticate({ authenticate: formsg.webhooks.authenticate, logger }),
  express.json(),
  decrypt({ formKey, decrypt: formsg.crypto.decrypt, logger }),
]
