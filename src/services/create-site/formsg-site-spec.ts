import { SiteSpecification } from './site-generator'

import { FormField } from '@opengovsg/formsg-sdk/dist/types'

export default function ({
  responses,
}: {
  responses: FormField[]
}): SiteSpecification {
  const siteSpecification: SiteSpecification = {
    repoName: '',
    pages: [],
    collections: {},
    resourceRoom: {
      name: undefined,
      categories: [],
    },
  }

  const repoNameResponse = responses.find(
    ({ question }) => question === 'Repository Name'
  )
  if (repoNameResponse && repoNameResponse.answer) {
    siteSpecification.repoName = repoNameResponse.answer
  }
  const singlePagesResponse = responses.find(
    ({ question }) => question === 'Single Pages (Page Name)'
  )
  if (singlePagesResponse && singlePagesResponse.answerArray) {
    siteSpecification.pages = siteSpecification.pages
      .concat(...singlePagesResponse.answerArray)
      .filter((s) => s !== '')
  }
  const collectionsResponse = responses.find(
    ({ question }) =>
      question === 'Page Collections (Collection, Page, Sub-Page)'
  )
  if (collectionsResponse && collectionsResponse.answerArray) {
    const answerArray = ((collectionsResponse.answerArray as unknown) as string[][]).filter(
      (s) => s[0] !== '' && s[1] !== ''
    )
    for (const [name, page, subPage] of answerArray) {
      if (!siteSpecification.collections[name]) {
        siteSpecification.collections[name] = {}
      }
      if (!siteSpecification.collections[name][page]) {
        siteSpecification.collections[name][page] = []
      }
      if (subPage !== '') {
        siteSpecification.collections[name][page].push(subPage)
      }
    }
  }
  const resourceRoomNameResponse = responses.find(
    ({ question }) => question === 'Resource Room Name'
  )
  const resourceRoomCategoriesResponse = responses.find(
    ({ question }) => question === 'Resource Types (Name)'
  )

  if (
    resourceRoomNameResponse &&
    resourceRoomNameResponse.answer &&
    resourceRoomCategoriesResponse &&
    resourceRoomCategoriesResponse.answerArray
  ) {
    siteSpecification.resourceRoom.name = resourceRoomNameResponse.answer
    siteSpecification.resourceRoom.categories = siteSpecification.resourceRoom.categories.concat(
      ...resourceRoomCategoriesResponse.answerArray
    )
  }

  return siteSpecification
}
