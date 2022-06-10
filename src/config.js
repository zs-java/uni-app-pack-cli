const path = require('path')
const YAML = require('yaml')
const minimist = require('minimist')
const stripJsonComments = require('./strip-json-comments')
const fs = require('fs')
const _ = require('lodash')
const packageConfig = require('../package.json')

const argv = minimist(process.argv.slice(2))

const downloadBaseUrl = `http://static.xzcoder.com/uni-app/pack/${packageConfig.version}`
// const downloadBaseUrl = `http://localhost:8124/`

const templateName = 'uni-app-pack-android'
const templateArchiveName = `${templateName}.tar.gz`

// 默认配置
const defaultConfig = {
  workDir: 'dist/pack',
  appPlusDist: './dist/build/app-plus/',
  android: {
    sdk: process.env['ANDROID_HOME'] || null,
    templateName,
    templateArchiveName,
    templateDownloadUrl: `${downloadBaseUrl}/uni-app-pack-android.tar.gz`,
    appKey: null,
    applicationId: null,
    keystore: {
      file: null,
      alias: null,
      password: null
    },
    jvmArgs: '-Xmx1024m -Dfile.encoding=UTF-8',
    buildToolsVersion: null
  },
  manifest: null,
  // 项目类型：HBuilderX、uni-cli、auto
  projectType: 'auto',
  uniCli: {
    name: 'uni-vue-cli',
    pm: 'npm',
    archiveName: 'uni-vue-cli.tar.gz',
    downloadUrl: `${downloadBaseUrl}/uni-vue-cli.tar.gz`
  }
}

delete argv['_']
let fileConfig = {}
if (argv['config']) {
  const configFilePath = path.resolve(argv['config'])
  console.log('configFilePath', configFilePath)
  if (!fs.existsSync(configFilePath)) {
    console.error(`config file [${argv['config']}] is not found!`)
    process.exit(1)
  }
  const extName = path.extname(configFilePath)
  switch (extName) {
    case '.json':
    case '.JSON':
      fileConfig = JSON.parse(stripJsonComments(fs.readFileSync(configFilePath).toString()))
      break
    case '.yml':
    case '.YML':
    case '.yaml':
    case '.YAML':
      fileConfig = YAML.parse(fs.readFileSync(configFilePath).toString())
      break
    default:
      console.error('unsupported config file type: ' + extName)
        process.exit(1)
      break
  }
}

let config = JSON.parse(JSON.stringify(defaultConfig))
_.merge(config, fileConfig)
_.merge(config, argv)

module.exports = {
  argv,
  config,
  defaultConfig,
  fileConfig
}