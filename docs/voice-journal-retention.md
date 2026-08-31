# Voice journal retention

Voice journaling is optional and does not request or collect location. Text journaling remains available when microphone access, upload, or transcription is unavailable.

Before submission, audio is uploaded to the private `growth-journal-audio` bucket under the authenticated user's ID. The machine transcript is stored in `growth_voice_journals` only for user review. It is not copied into `growth_interactions`, included in adaptation context, or treated as evidence until the user reviews and submits it.

On submission, the reviewed transcript becomes the journal evidence in `growth_interactions`. The original machine transcript is removed, while a boolean records whether the submitted transcript was edited. The private audio and reviewed transcript remain available to the owner until the journal is deleted. Normal product and administrative database access is restricted by row-level and storage policies.

Deleting a journal hard-deletes its audio object, transcript records, journal interaction, pending adaptation request, and generated response. Later generated-response text and evidence summaries created while that journal could have been in context are also removed or redacted; those later interactions can be regenerated without the deleted journal. No deleted content or excerpt is retained as audit metadata or supplied to later guidance. A plan or step change that the user separately confirmed before deletion remains part of the versioned working plan because that confirmation is an independent user action; the deleted journal itself is no longer available as supporting context.

Account deletion first removes every object under the user's private voice-journal storage prefix, then deletes the account and its cascading database records. This prevents profile deletion from leaving unreferenced recordings in object storage.

Before an external transcription request, the server validates the M4A container duration and file-size boundary and records a durable per-user quota claim. At most six transcription requests per user are sent in a rolling hour, including retries that actually reach the transcription provider.

Local recorder files use the operating system's temporary app storage. StepnOut deletes them after private upload, cancellation, discard, or component cleanup. If the app is backgrounded while recording, it stops the recorder and keeps the completed local recording available for the user to continue or discard when the app resumes.
