#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${REPO_ROOT}"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

COMMAND="${1:-run}"

case "${COMMAND}" in
  run|brainstorm|critique|annotate)
    node scripts/side-quests/generate-side-quests.mjs "$@"
    ;;
  build-migration)
    shift
    node scripts/side-quests/build-side-quest-migration.mjs "$@"
    ;;
  export-copy)
    shift
    node scripts/side-quests/export-side-quest-copy.mjs "$@"
    ;;
  build-copy-migration)
    shift
    node scripts/side-quests/build-side-quest-copy-update-migration.mjs "$@"
    ;;
  *)
    echo "Usage:"
    echo "  ./scripts/side-quests/run.sh run"
    echo "  ./scripts/side-quests/run.sh brainstorm"
    echo "  ./scripts/side-quests/run.sh critique <seeds.json>"
    echo "  ./scripts/side-quests/run.sh annotate <raw-json-file>"
    echo "  ./scripts/side-quests/run.sh build-migration <annotated-json-file> <migration-file-name.sql>"
    echo "  ./scripts/side-quests/run.sh export-copy [output-json-file]"
    echo "  ./scripts/side-quests/run.sh build-copy-migration <edited-copy-json-file> <migration-file-name.sql>"
    exit 1
    ;;
esac
