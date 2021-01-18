import { FormField } from '@opengovsg/formsg-sdk/dist/types'

export type UserInstructions = {
  requesterEmail: string
  teamName: string
  users: {
    add: string[]
    remove: string[]
  }
}

export default function ({
  responses,
}: {
  responses: FormField[]
}): UserInstructions {
  const userInstructions: UserInstructions = {
    requesterEmail: '',
    teamName: '',
    users: {
      add: [],
      remove: [],
    },
  }

  const requesterEmailResponse = responses.find(
    ({ question }) => question === 'Your Government E-mail'
  )
  if (requesterEmailResponse && requesterEmailResponse.answer) {
    userInstructions.requesterEmail = requesterEmailResponse.answer
  }

  const teamNameResponse = responses.find(
    ({ question }) => question === 'Team Name'
  )
  if (teamNameResponse && teamNameResponse.answer) {
    userInstructions.teamName = teamNameResponse.answer
  }

  const addUsersResponse = responses.find(
    ({ question }) => question === 'GitHub users to be added (Username)'
  )
  if (addUsersResponse && addUsersResponse.answerArray) {
    userInstructions.users.add = userInstructions.users.add
      .concat(...addUsersResponse.answerArray)
      .filter((s) => s !== '')
  }

  const removeUsersResponse = responses.find(
    ({ question }) => question === 'GitHub users to be removed (Username)'
  )
  if (removeUsersResponse && removeUsersResponse.answerArray) {
    userInstructions.users.remove = userInstructions.users.remove
      .concat(...removeUsersResponse.answerArray)
      .filter((s) => s !== '')
  }

  return userInstructions
}
