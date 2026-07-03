## Running it

The habits that take a fedify app from federating to running in
production — each with the manual page that covers it.

**Split web and worker.** Serve HTTP in one process; run the queue with
`manuallyStartQueue` + `startQueue` in another. Both Hollo and Hackers' Pub
converged on this after slow federation work degraded user-facing requests.
[manual/mq](https://fedify.dev/manual/mq) ·
[manual/deploy](https://fedify.dev/manual/deploy).

**Behind a proxy, pin the origin.** Set the `origin` option (or the
`x-forwarded-fetch` middleware) so signatures verify against your public URL
rather than the rewritten internal Host.
[manual/federation](https://fedify.dev/manual/federation).

**Leave the safety rails on.** Signature verification is on by default
([manual/inbox](https://fedify.dev/manual/inbox#signature-verification));
the document loader refuses private addresses
([manual/federation § allowPrivateAddress](https://fedify.dev/manual/federation#allowprivateaddress)).
Both mark the line between "appears to work" and "is safe" — relax them
only in tests ([manual/test](https://fedify.dev/manual/test)).

**Debug with the CLI, lint in your editor.** `fedify lookup` inspects any
remote object, `fedify inbox` gives you a throwaway inbox, `fedify tunnel`
exposes your dev server over HTTPS ([CLI reference](https://fedify.dev/cli)).
The `@fedify/lint` plugin catches interop mistakes — a missing key pair, an
outbox listener that never delivers — as you type
([manual/lint](https://fedify.dev/manual/lint)). And
[DrFed](https://drfed.org/), the team's dedicated ActivityPub debugger, is
on the way.

**Start from the tutorials, not the API reference.** The
[basics tutorial](https://fedify.dev/tutorial/basics) and the
[federated microblog](https://fedify.dev/tutorial/microblog) walk the whole
path. There's an [llms.txt](https://fedify.dev/llms.txt) if your editor's AI
is doing the reading.

---

[icon:arrow-left] [Back to Fedify](/build/fedify)
