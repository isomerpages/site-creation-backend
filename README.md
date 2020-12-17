# site-creation-backend

Creates Isomer sites from FormSG site creation requests

# Overview

Isomer allows users to perform certain administrative tasks themselves, namely:

- Creating a GitHub repository and accompanying Netlify sites
- Add and removing users from their GitHub team, and;
- Setting up of KeyCDN for the website, along with DNS aliases (go-live)

This is done through several FormSG forms managed by the Isomer team.

Users have to verify through e-mail that they are Singapore Government personnel
in order to use the forms.

Form submissions are then sent via webhook to site-creation-backend to trigger
the appropriate calls to GitHub, Netlify and KeyCDN.

# Architecture

This application is built using TypeScript and Express.js; code is currently
organised into middleware, controllers and services. Controllers make calls 
to set-up infrastructure through services.  

For each form webhook, we mount two controllers, one for webhook payload decryption
and one to handle the actual request. This is bootstrapped at `express.ts`.

site-creation-backend has two possible entrypoints:
  - `index.ts` launches a standard Express.js application
  - `serverless.ts` is an adapter for the application into
    an AWS Lambda function

# Development Setup

- Make copies of the forms using your own FormSG account
  - Take care to use storage mode
- Use ngrok to expose port 8080 on your local machine as a
  https host on ngrok, ie, `npx ngrok https 8080`
- Set the webhook of each form to the corresponding path
  on site-creation-backend on the ngrok host
- Study `config.ts` to set the appropriate env vars.
  Note that site-creation-backend will directly manipulate
  GitHub, Netlify and KeyCDN.
- `npm run dev`

# Deployment

This application is deployed into API Gateway and AWS Lambda; each
endpoint exposed is handled by a separate lambda function that happens
to share the same codebase. 

The lambda codebase in turn is the Express.js application wrapped by 
[serverless-http](https://github.com/dougmoscrop/serverless-http).
