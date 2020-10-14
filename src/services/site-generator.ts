import fs from 'fs-extra'

function humanReadable(s: string) {
  return s
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(' ')
}

function createPages(repoName: string, pages: string[]) {
  const result = {
    navYaml: '',
    files: [] as { path: string; content: string }[],
  }
  for (const page of pages) {
    const humanReadableTitle = humanReadable(page)
    result.files.push({
      path: `/tmp/${repoName}/pages/${page}.md`,
      content: `---\ntitle: ${humanReadableTitle}\npermalink: /${page}\n---\n`,
    })
    result.navYaml += `  - title: ${humanReadableTitle}\n    url: /${page}/\n`
  }
  return result
}

export default ({
  repoName,
  pages,
  collections,
  resourceRoom,
}: {
  repoName: string
  pages: string[]
  collections: any
  resourceRoom: any
}): void => {
  // Copy isomerpages-base to /tmp
  fs.remove(`/tmp/${repoName}`)
  fs.copySync('./isomerpages-base', `/tmp/${repoName}`)
  const configPath = `/tmp/${repoName}/_config.yml`
  const navPath = `/tmp/${repoName}/_data/navigation.yml`
  const simplePagesOutput = createPages(repoName, pages)
  for (const file of simplePagesOutput.files) {
    fs.writeFileSync(file.path, file.content)
  }
  let navFile = fs.readFileSync(navPath, 'utf-8')
  navFile += simplePagesOutput.navYaml
  fs.writeFileSync(navPath, navFile)
}
