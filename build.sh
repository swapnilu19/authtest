#! /bin/bash
PROJECTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# install npm dependencies
cd ${PROJECTDIR} && npm install

# shrinkwrap
cd ${PROJECTDIR} && npm shrinkwrap

# jshint
${PROJECTDIR}/node_modules/.bin/jshint ${PROJECTDIR}

set +e

# copy to dist
rm -rf ${PROJECTDIR}/dist
mkdir ${PROJECTDIR}/dist
cp -R ${PROJECTDIR}/config ${PROJECTDIR}/dist/
cp -R ${PROJECTDIR}/src ${PROJECTDIR}/dist/
cp -R ${PROJECTDIR}/node_modules ${PROJECTDIR}/dist/
cp -R ${PROJECTDIR}/views ${PROJECTDIR}/dist/
cp ${PROJECTDIR}/*.md ${PROJECTDIR}/dist/
cp ${PROJECTDIR}/run.sh ${PROJECTDIR}/dist/
cp ${PROJECTDIR}/package.json ${PROJECTDIR}/dist/

set -e

# archive
rm dist.tar.gz
tar -zcf ${PROJECTDIR}/dist.tar.gz ${PROJECTDIR}/dist
