#!/bin/bash

set -e

PROJECTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

#start
node ${PROJECTDIR}/src/app.js
