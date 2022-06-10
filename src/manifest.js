const path = require('path')
const fs = require('fs')
const { config } = require('./config')
const stripJsonComments = require('./strip-json-comments')

const paths = [
  './manifest.json',
  './src/manifest.json',
]

let manifest = null
let manifestPath = null
// 先从配置文件里找
if (config.manifest) {
  const fullPath = path.resolve(config.manifest)
  if (!fs.existsSync(fullPath)) {
    console.error(`${manifest} file not found!`)
    process.exit(1)
  } else {
    console.log('find manifest.json at ' + fullPath)
    manifest = JSON.parse(stripJsonComments(fs.readFileSync(fullPath).toString()))
    manifestPath = fullPath
  }
} else {
  for (let i = 0; i < paths.length; i++) {
    const fullPath = path.resolve(paths[i])
    if (fs.existsSync(fullPath)) {
      console.log('find manifest.json at ' + fullPath)
      manifest = JSON.parse(stripJsonComments(fs.readFileSync(fullPath).toString()))
      manifestPath = fullPath
      break
    }
  }
}

if (manifest === null) {
  console.error(`not found manifest.json file at ${paths}, please config --manifest`)
  process.exit(1)
}

module.exports.manifest = manifest
module.exports.manifestPath = manifestPath




