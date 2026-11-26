---
"@quintal/monads": patch
---

Fix `asyncResultFromThrowable` throwing instead of returning an `Err` when the given function throws synchronously (e.g. a non-async function, or before its first `await`)
