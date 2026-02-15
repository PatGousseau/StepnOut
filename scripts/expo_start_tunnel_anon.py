#!/usr/bin/env python3
import os
import re
import sys
import pexpect

CMD = "npx expo start --tunnel --clear"

PROMPT_RE = re.compile(
  r"It is recommended to log in with your Expo account before proceeding\.|Use arrow-keys\. Return to submit\.|Proceed anonymously|Log in to EAS with email or username|Email or username",
  re.I,
)


def main() -> int:
  env = os.environ.copy()
  env.setdefault("EXPO_NO_TELEMETRY", "1")

  child = pexpect.spawn(CMD, env=env, encoding="utf-8", codec_errors="replace")
  child.logfile_read = sys.stdout

  while True:
    i = child.expect([pexpect.EOF, pexpect.TIMEOUT, PROMPT_RE], timeout=5)

    if i == 0:
      return 0

    if i == 1:
      continue

    buf = (child.before or "") + (child.after or "")
    lower = buf.lower()

    # if it dropped into the email/username login flow, escape and keep going
    if "email or username" in lower or "log in to eas" in lower:
      child.sendcontrol('c')
      continue

    # any time we see the login-vs-anon prompt, force select "proceed anonymously"
    # (default highlight is usually "log in")
    child.send("\x1b[B")  # arrow down
    child.send("\r")


if __name__ == "__main__":
  raise SystemExit(main())
