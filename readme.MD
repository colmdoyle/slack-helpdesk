# Slack / Jira simple connector

A simple implementation of the IT Helpdesk system used internally at Slack. End users file tickets via the Slack UI, which are then routed to our IT Department. In this example, the "IT Department" use JIRA issues, but this can be changed at will to any system, without affecting the end user experience.

## Setting up your Slack App

### URLs
As this is a [Bolt for Javascript app](https://slack.dev/bolt), all URLs for your Slack configuration should point to `https://<yoururl>/slack/events`.

### Scopes

Your app will need the following scopes to operate

- `commands` *This allows your app to add a [Slash Command](https://api.slack.com/interactivity/slash-commands) and a [Shortcuts](https://api.slack.com/interactivity/shortcuts)*
- `chat:write` *This allows your bot to post messages*
- `im:write` *This allows your bot to DM users who haven't yet messaged the bot, so we can DM them a link to their ticket*