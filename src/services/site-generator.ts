import fs from 'fs-extra'

export type SiteSpecification = {
  repoName: string
  pages: string[]
  collections: {
    [key: string]: string[]
  }
  resourceRoom: {
    name: string | undefined
    categories: string[]
  }
}

function humanReadable(s: string) {
  return s
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(' ')
}

function createPages(pages: string[]) {
  const result = {
    navYaml: '',
    files: [] as { path: string; content: string }[],
  }
  for (const page of pages) {
    const humanReadableTitle = humanReadable(page)
    result.files.push({
      path: `pages/${page}.md`,
      content: `---\ntitle: ${humanReadableTitle}\npermalink: /${page}\n---\n`,
    })
    result.navYaml += `  - title: ${humanReadableTitle}\n    url: /${page}/\n`
  }
  return result
}

function createCollections(collections: { [name: string]: string[] }) {
  const result = {
    navYaml: '',
    configYaml: '',
    files: [] as { path: string; content: string }[],
  }
  if (Object.keys(collections).length) {
    result.configYaml += 'collections:\n'
  }
  for (const [name, pages] of Object.entries(collections)) {
    const humanReadableName = humanReadable(name)
    pages.forEach((page, index) => {
      result.files.push({
        path: `_${name}/${index}-${page}.md`,
        content: `---\ntitle: ${humanReadableName}\npermalink: /${name}/${page}/\n---\n`,
      })
    })
    result.navYaml += `  - title: ${humanReadableName}\n    collection: ${name}\n`
    result.configYaml += `  ${name}:\n    output: true\n`
  }
  return result
}

function createResourceRoom(resourceRoom: {
  name: string | undefined
  categories: string[]
}) {
  const result = {
    navYaml: '',
    configYaml: '',
    files: [] as { path: string; content: string }[],
  }
  if (resourceRoom.name && resourceRoom.categories.length) {
    const resourceRoomName = humanReadable(resourceRoom.name)
    result.configYaml += `resources_name: ${resourceRoom.name}\n`
    result.navYaml += `  - title: ${resourceRoomName}\n    resource_room: true\n`
    for (const category of resourceRoom.categories) {
      result.files.push(
        {
          path: `${resourceRoom.name}/${category}/index.html`,
          content: `---\nlayout: resources-alt\ntitle: ${resourceRoomName}\n---\n`,
        },
        {
          path: `${resourceRoom.name}/${category}/_posts/2019-01-01-test.md`,
          content: `---\nlayout: post\ntitle: "Sample post for ${humanReadable(
            category
          )}"\npermalink: "/${
            resourceRoom.name
          }/${category}/test"\n---\nLorem ipsum sit amet\n`,
        }
      )
    }
  }
  return result
}

export default ({
  repoName,
  pages,
  collections,
  resourceRoom,
}: SiteSpecification): void => {
  const destination = `/tmp/${repoName}`

  // Copy isomerpages-base to /tmp
  fs.removeSync(destination)
  fs.copySync('./isomerpages-base', `${destination}`)
  const configPath = `${destination}/_config.yml`
  const navPath = `${destination}/_data/navigation.yml`

  const simplePagesOutput = createPages(pages)
  for (const file of simplePagesOutput.files) {
    fs.writeFileSync(`${destination}/${file.path}`, file.content)
  }

  const collectionsOutput = createCollections(collections)
  for (const name of Object.keys(collections)) {
    fs.mkdirpSync(`${destination}/_${name}`)
  }
  for (const file of collectionsOutput.files) {
    fs.writeFileSync(`${destination}/${file.path}`, file.content)
  }

  const resourceRoomOutput = createResourceRoom(resourceRoom)
  if (resourceRoom.name && resourceRoom.categories.length) {
    for (const category of resourceRoom.categories) {
      fs.mkdirpSync(`${destination}/${resourceRoom.name}/${category}/_posts`)
    }
  }
  for (const file of resourceRoomOutput.files) {
    fs.writeFileSync(`${destination}/${file.path}`, file.content)
  }

  let configFile = fs.readFileSync(configPath, 'utf-8')
  configFile += collectionsOutput.configYaml
  configFile += resourceRoomOutput.configYaml
  fs.writeFileSync(configPath, configFile)

  let navFile = fs.readFileSync(navPath, 'utf-8')
  navFile += simplePagesOutput.navYaml
  navFile += collectionsOutput.navYaml
  navFile += resourceRoomOutput.navYaml
  fs.writeFileSync(navPath, navFile)
}
