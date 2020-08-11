import { Request, Response } from 'express'

export default (_req: Request, res: Response): void => {
  console.log(JSON.stringify(res.locals.submission, null, 2))
  res.send()
}
