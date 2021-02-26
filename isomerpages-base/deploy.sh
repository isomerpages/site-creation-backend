#!/bin/bash 

# search within all collections for collection.yml file
collections=$(find . -path ./_site -prune -false -o -name collection.yml -type f)
var=$(echo $collections | sed 's/ .\//,.\//g')

env='development'
while getopts "e:" opt; do
  case $opt in
    e) env=$OPTARG      ;;
    *) echo 'error' >&2
       exit 1
  esac
done

# netlify build
JEKYLL_ENV=$env jekyll build --config _config.yml",$var"

# uncomment for local build
# bundle exec jekyll serve --config _config.yml",$var"