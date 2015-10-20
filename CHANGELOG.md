# Changelog

`5.0.0`:

- drop cmd commands
- use proxy bot.log and bot.send to cmd
- use bot to emit chat events
- use cmd pipeline to process messages
- integrate with slackbot 3.1.0

`4.0.0`:

- integerate with slackbot 3.0.0

`3.1.0`:

- implement streaming
- message format helper
- documentation
- examples

`3.0.0`:

- clean up `cmd`
- add `.result(...)` to cmd
- add `.error(...)` to cmd
- change bot result event to `result` (was 'respond')

`2.0.0`:

- `exec` doesn't take callback anymore, bot emits events instead
