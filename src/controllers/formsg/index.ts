import express from 'express'
import { Request, Response, NextFunction } from 'express'

import FormSG from '@opengovsg/formsg-sdk'
import {
  DecryptParams,
  DecryptedContent,
} from '@opengovsg/formsg-sdk/dist/types'

import authenticate from './authenticate'
import decrypt from './decrypt'

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
  formsg: CanDecryptFormSGPayload
}

export default (
  formCreateKey: string,
  { formsg }: FormSGExpressOptions = { formsg: FormSG() }
): Array<(req: Request, res: Response, next: NextFunction) => void> => [
  authenticate(formsg.webhooks.authenticate),
  express.json(),
  decrypt(formCreateKey, formsg.crypto.decrypt),
]
