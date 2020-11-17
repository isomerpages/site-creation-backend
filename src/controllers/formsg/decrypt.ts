import { Request, Response, NextFunction } from 'express'
import {
  DecryptParams,
  DecryptedContent,
} from '@opengovsg/formsg-sdk/dist/types'
import winston from 'winston'

export default ({
  formKey,
  decrypt,
  logger,
}: {
  formKey: string
  decrypt: (
    formKey: string,
    decryptParams: DecryptParams
  ) => DecryptedContent | null
  logger?: winston.Logger
}) => (req: Request, res: Response, next: NextFunction): void => {
  try {
    const submission = decrypt(
      formKey,
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
      res.status(422).send({ message: 'Bad submission' })
    }
  } catch (e) {
    logger?.error(e)
    res.status(401).send({ message: 'Unauthorized' })
  }
}
