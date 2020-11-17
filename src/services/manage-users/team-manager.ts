import { Octokit } from '@octokit/rest'
import { UserInstructions } from './formsg-user-instructions'

export default ({ octokit }: { octokit: Octokit }) => async (
  userInstructions: UserInstructions
): Promise<string[]> => {
  const notFound = []
  const team = await octokit.teams.getByName({
    org: 'isomerpages',
    team_slug: userInstructions.teamName,
  })
  if (team) {
    for (const username of userInstructions.users.add) {
      try {
        await octokit.teams.addOrUpdateMembershipForUserInOrg({
          org: 'isomerpages',
          team_slug: userInstructions.teamName,
          username,
        })
      } catch (error) {
        if (error.message === 'Not Found') {
          notFound.push(username)
        } else {
          throw error
        }
      }
    }
    for (const username of userInstructions.users.remove) {
      try {
        await octokit.teams.removeMembershipForUserInOrg({
          org: 'isomerpages',
          team_slug: userInstructions.teamName,
          username,
        })
      } catch (error) {
        if (error.message === 'Not Found') {
          notFound.push(username)
        } else {
          throw error
        }
      }
    }
  }
  return notFound
}
