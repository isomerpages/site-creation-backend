import { FormField } from '@opengovsg/formsg-sdk/dist/types'

export default function ({ responses }: { responses: FormField[] }): string {
  const repoNameResponse = responses.find(
    ({ question }) => question === 'Repository Name'
  )
  if (repoNameResponse && repoNameResponse.answer) {
    return repoNameResponse.answer
  }

  return ''
}
