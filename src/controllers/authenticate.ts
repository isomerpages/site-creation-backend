import { Request, Response, NextFunction } from 'express'

export default (authenticate: (signature: string, uri: string) => void) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const signature = req.get('X-FormSG-Signature')
    if (!signature) {
      res.status(401).send({ message: 'Unauthorized' })
    } else {
      authenticate(
        signature,
        `https://${req.get('host')}${req.baseUrl}${req.path}`
      )
      // Continue processing the POST body
      next()
    }
  } catch (e) {
    console.error(e)
    res.status(401).send({ message: 'Unauthorized' })
  }
}
