#!/usr/bin/env node

import winston from 'winston'
import yargs from 'yargs'

import generateSite from './services/site-generator'

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
})

function flattenArguments(rawArgument?: (string | number)[]): string[] {
  const argumentParts = (rawArgument || []).map((v) => v.toString().split(','))
  return ([] as string[]).concat(...argumentParts)
}

const reservedArgumentKeys = [
  '_',
  '$0',
  'pages',
  'resourceRoomName',
  'resource-room-name',
  'resourceRoomCategories',
  'resource-room-categories',
  'repoName',
  'repo-name',
]

const { argv } = yargs(process.argv.slice(2))
  .parserConfiguration({
    'camel-case-expansion': false,
  })
  .usage(
    '\nUsage:\n\n' +
      '  $0 --repoName <name>\n' +
      '    [--pages <page1-name>,<page2-name>...]\n' +
      '    [--resourceRoomName <name>] [--resourceRoomCategories <name>,<name>...]\n' +
      '    [--<category1-name> <category-page>,<category-page>...]\n' +
      '    [--<category2-name> <category-page>,<category-page>...]...'
  )
  .options({
    repoName: {
      type: 'string',
      describe: 'the name of the Isomer repository',
      demandOption: true,
    },
    pages: {
      type: 'array',
      describe: 'a comma-separated list of simple pages',
    },
    resourceRoomName: {
      type: 'string',
      describe: 'the name of the resource room',
    },
    resourceRoomCategories: {
      type: 'array',
      describe: 'a comma-separated list of resource room categories',
    },
  })

const { repoName } = argv

const pages = flattenArguments(argv.pages)
const resourceRoomCategories = flattenArguments(argv.resourceRoomCategories)

const resourceRoom = {
  name: argv.resourceRoomName,
  categories: resourceRoomCategories,
}

const rawCollectionEntries = Object.entries(argv).filter(
  ([k]) => !reservedArgumentKeys.includes(k)
)

const collections: {
  [key: string]: string[]
} = {}

for (const [collectionName, collectionPageArguments] of rawCollectionEntries) {
  const collectionPages = ([] as string[]).concat(
    collectionPageArguments as string[] | string
  )
  collections[collectionName] = flattenArguments(collectionPages)
}

generateSite({ repoName, pages, collections, resourceRoom })

logger.info(`Site created at /tmp/${repoName}`)
