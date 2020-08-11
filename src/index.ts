import app from './express'

import config from './config'

const port = config.get('port')

app.listen(port, () => console.log(`Listening on port ${port}`))
