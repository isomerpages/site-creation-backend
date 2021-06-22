import fs from 'fs-extra'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'

const ISOMER_CONFIG = `
description: An Isomer site of the Singapore Government

##################################################################################################################
# Everything below this line is Isomer-specific configuration. There should not be a need to edit these settings #
##################################################################################################################
permalink: none
baseurl: ""
exclude: [travis-script.js, .travis.yml, README.md, package.json, package-lock.json, node_modules, vendor/bundle/, vendor/cache/, vendor/gems/, vendor/ruby/, Gemfile, Gemfile.lock]
include: [_redirects]
defaults:
  - scope:
      path: ""
    values:
      layout: "page"
# Custom CSS file path
custom_css_path: "/misc/custom.css"
custom_print_css_path: "/assets/css/print.css"
paginate: 12
remote_theme: isomerpages/isomerpages-template@next-gen
safe: false
plugins:
  - jekyll-feed
  - jekyll-assets
  - jekyll-paginate
  - jekyll-sitemap
  - jekyll-remote-theme
`

export type SiteSpecification = {
  repoName: string
  pages: string[]
  collections: {
    [collection: string]: {
      [page: string]: string[]
    }
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

function createCollections(collections: {
  [page: string]: { [subPage: string]: string[] }
}) {
  const result = {
    navYaml: '',
    configYaml: [] as { path: string; content: string }[],
    files: [] as { path: string; content: string }[],
    dirs: [] as { path: string }[],
  }
  for (const [name, pages] of Object.entries(collections)) {
    const humanReadableName = humanReadable(name)
    let collectionConfigYaml = `collections:\n  ${name}:\n    output: true\n    order:\n`
    Object.entries(pages).forEach(([page, subPages]) => {
      if (subPages.length === 0) {
        result.files.push({
          path: `_${name}/${page}.md`,
          content: `---\ntitle: ${humanReadable(
            page
          )}\npermalink: /${name}/${page}/\n---\n`,
        })
        collectionConfigYaml += `      - ${page}.md\n`
      } else {
        result.dirs.push({
          path: `_${name}/${page}`,
        })
        result.files.push({
          path: `_${name}/${page}/.keep`,
          content: ``,
        })
        collectionConfigYaml += `      - ${page}/.keep\n`
        subPages.forEach((subPage) => {
          result.files.push({
            path: `_${name}/${page}/${subPage}.md`,
            content: `---\ntitle: ${humanReadable(
              subPage
            )}\npermalink: /${name}/${page}/${subPage}\nthird_nav_title: ${humanReadable(
              page
            )}\n---\n`,
          })
          collectionConfigYaml += `      - ${page}/${subPage}.md\n`
        })
      }
    })
    result.navYaml += `  - title: ${humanReadableName}\n    collection: ${name}\n`
    result.configYaml.push({
      path: `_${name}/collection.yml`,
      content: collectionConfigYaml,
    })
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
    indexYaml: '',
    files: [] as { path: string; content: string }[],
  }
  if (resourceRoom.name && resourceRoom.categories.length) {
    const resourceRoomName = humanReadable(resourceRoom.name)
    result.configYaml += `resources_name: ${resourceRoom.name}\n`
    result.navYaml += `  - title: ${resourceRoomName}\n    resource_room: true\n`
    result.indexYaml += `    - resources:\n        title: Media\n        subtitle: Learn more\n        button: View More\n`
    result.files.push({
      path: `${resourceRoom.name}/index.html`,
      content: `---\nlayout: resources\ntitle: ${resourceRoomName}\n---\n`,
    })
    for (const category of resourceRoom.categories) {
      const categoryName = humanReadable(category)
      result.files.push(
        {
          path: `${resourceRoom.name}/${category}/index.html`,
          content: `---\nlayout: resources-alt\ntitle: ${categoryName}\n---\n`,
        },
        {
          path: `${resourceRoom.name}/${category}/_posts/2019-01-01-test.md`,
          content: `---\nlayout: post\ntitle: "Sample post for ${categoryName}"\npermalink: "/${resourceRoom.name}/${category}/test"\n---\nLorem ipsum sit amet\n`,
        }
      )
    }
  }
  return result
}

export async function generateFromBaseRepo(repoName: string): Promise<void> {
  // Clone base repo to /tmp
  const destination = `/tmp/${repoName}`
  const configPath = `${destination}/_config.yml`
  const githubBaseRepoURL = 'https://github.com/isomerpages/site-creation-base'

  await git.clone({
    fs: fs,
    http: http,
    dir: destination,
    ref: 'staging',
    singleBranch: true,
    url: githubBaseRepoURL,
    depth: 1,
  })
  // Clear git
  fs.removeSync(`${destination}/.git`)

  // Edit config yml netlify links
  const configFile = fs.readFileSync(configPath, 'utf-8')
  const lines = configFile.split('\n').slice(0, -2)
  lines.push(`staging: https://${repoName}-staging.netlify.app`)
  lines.push(`prod: https://${repoName}-prod.netlify.app`)
  fs.writeFileSync(configPath, configFile)
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
  const indexPath = `${destination}/index.md`

  const simplePagesOutput = createPages(pages)
  for (const file of simplePagesOutput.files) {
    fs.writeFileSync(`${destination}/${file.path}`, file.content)
  }

  const collectionsOutput = createCollections(collections)
  for (const name of Object.keys(collections)) {
    fs.mkdirpSync(`${destination}/_${name}`)
  }
  for (const dir of collectionsOutput.dirs) {
    fs.mkdirpSync(`${destination}/${dir.path}`)
  }
  for (const file of collectionsOutput.configYaml) {
    fs.writeFileSync(`${destination}/${file.path}`, file.content)
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
  configFile += resourceRoomOutput.configYaml
  configFile += ISOMER_CONFIG
  configFile += `staging: https://${repoName}-staging.netlify.app\nprod: https://${repoName}-prod.netlify.app`
  fs.writeFileSync(configPath, configFile)

  let navFile = fs.readFileSync(navPath, 'utf-8')
  navFile += simplePagesOutput.navYaml
  navFile += collectionsOutput.navYaml
  navFile += resourceRoomOutput.navYaml
  fs.writeFileSync(navPath, navFile)

  let indexFile = fs.readFileSync(indexPath, 'utf-8')
  indexFile += resourceRoomOutput.indexYaml
  indexFile += '---\n\n'
  fs.writeFileSync(indexPath, indexFile)
}
