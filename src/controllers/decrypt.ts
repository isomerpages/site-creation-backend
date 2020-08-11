import { Request, Response, NextFunction } from 'express'
import {
  DecryptParams,
  DecryptedContent,
} from '@opengovsg/formsg-sdk/dist/types'

import config from '../config'

const formSecretKey = config.get('formSecretKey')

export default (
  decrypt: (
    formSecretKey: string,
    decryptParams: DecryptParams
  ) => DecryptedContent | null
) => (req: Request, res: Response, next: NextFunction): void => {
  try {
    const submission = decrypt(
      formSecretKey,
      // If `verifiedContent` is provided in `req.body.data`, the return object
      // will include a verified key.
      req.body.data
    )

    // If the decryption failed, submission will be `null`.
    if (submission) {
      // Continue processing the submission
      res.locals.submission = submission
      next()
    } else {
      res.status(401).send({ message: 'Bad submission' })
    }
  } catch (e) {
    console.error(e)
    res.status(401).send({ message: 'Unauthorized' })
  }
}
