#!/usr/bin/env python3

import os
import re
import sys
import time

import pexpect


def main() -> int:
    cmd = "npx expo start --tunnel --clear"

    env = os.environ.copy()
    env.pop("CI", None)

    child = pexpect.spawn(cmd, env=env, encoding="utf-8")
    child.logfile_read = sys.stdout

    patterns = [
        re.compile(r"proceed anonymously", re.IGNORECASE),
        re.compile(r"would you like to.*log in", re.IGNORECASE),
        re.compile(r"log in", re.IGNORECASE),
        re.compile(r"press .* to", re.IGNORECASE),
        pexpect.EOF,
        pexpect.TIMEOUT,
    ]

    while True:
        try:
            idx = child.expect(patterns, timeout=30)
        except KeyboardInterrupt:
            child.sendcontrol("c")
            return 130

        if idx in (0, 1, 2):
            # expo sometimes shows a prompt with options (log in / proceed anonymously).
            # try to choose the anonymous path.
            time.sleep(0.2)
            child.send("\x1b[B")  # arrow down
            time.sleep(0.1)
            child.send("\r")
            continue

        if idx == 3:
            # generic key prompts; don't interfere.
            continue

        if idx == 4:
            return 0

        if idx == 5:
            continue


if __name__ == "__main__":
    raise SystemExit(main())
