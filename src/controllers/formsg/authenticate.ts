import { Request, Response, NextFunction } from 'express'
import winston from 'winston'

export default ({
  authenticate,
  logger,
}: {
  authenticate: (signature: string, uri: string) => void
  logger?: winston.Logger
}) => (req: Request, res: Response, next: NextFunction): void => {
  try {
    const signature = req.get('X-FormSG-Signature')
    if (!signature) {
      res.status(401).send({ message: 'Signature missing' })
    } else {
      authenticate(
        signature,
        `https://${req.get('host')}${req.baseUrl}${req.path}`
      )
      // Continue processing the POST body
      next()
    }
  } catch (e) {
    logger?.error(e)
    res.status(401).send({ message: 'Unauthorized' })
  }
}
