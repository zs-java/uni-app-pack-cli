const _ = require('lodash')
const path = require('path')
const fsExtra = require('fs-extra')
const fs = require('fs')
const child_process = require('child_process')

const { manifest } = require('./manifest')
const { renderDir } = require('./template')


function prepareAndroidFiles(config) {
  const { workDir, android } = config
  // copy 文件，icon、keystore 等
  // icon
  const iconConfig = _.get(manifest, 'app-plus.distribute.icons.android', {})
  const iconPath = iconConfig['xxxhdpi'] || iconConfig['xxhdpi'] || iconConfig['xhdpi'] || iconConfig['hdpi'] || null
  if (iconPath && iconPath !== '') {
    // 删除模版自带的 icon
    const defaultPath = `${workDir}/${android.templateName}/app/src/main/res/drawable/icon.png`
    if (fs.existsSync(defaultPath)) {
      fs.rmSync(defaultPath)
    }
    fs.copyFileSync(path.resolve(iconPath), `${workDir}/${android.templateName}/app/src/main/res/drawable/icon${path.extname(iconPath)}`)
  }
  // splash 启动图
  const splashConfig = _.get(manifest, 'app-plus.distribute.splashscreen.android', {})
  const splashPath = splashConfig['xxhdpi'] || splashConfig['xhdpi'] || splashConfig['hdpi'] || null
  if (splashPath && splashPath !== '') {
    const defaultPath = `${workDir}/${android.templateName}/app/src/main/res/drawable/splash.png`
    if (fs.existsSync(defaultPath)) {
      fs.rmSync(defaultPath)
    }
    fs.copyFileSync(path.resolve(splashPath), `${workDir}/${android.templateName}/app/src/main/res/drawable/splash${path.extname(splashPath)}`)
  }
  // 证书
  const keystoreConfig = android['keystore'] || {}
  if (!keystoreConfig.file || keystoreConfig.file === '') {
    console.error('must config --android.keystore.file !')
    process.exit(1)
  }
  const keystoreFilePath = path.resolve(keystoreConfig.file)
  if (!fs.existsSync(keystoreFilePath)) {
    console.error(`keystore file: [${keystoreConfig}] is not found!`)
    process.exit(1)
  }
  fs.copyFileSync(keystoreFilePath, `${workDir}/${android.templateName}/app/keystore.jks`)
}

function copyAppPlusDist(config, appPlusDist) {
  const { workDir, android } = config
  // copy 静态资源
  const distTargetDir = `${workDir}/${android.templateName}/app/src/main/assets/apps/${manifest.appid}/www/`
  if (!fs.existsSync(distTargetDir)) {
    fs.mkdirSync(distTargetDir, { recursive: true })
  }
  fsExtra.copySync(appPlusDist, `${distTargetDir}`)
}

function renderTemplate(config) {
  // 模版引擎渲染
  const templateData = {
    applicationId: config.android.applicationId,
    versionCode: manifest.versionCode,
    versionName: manifest.versionName,
    certificate: {
      keyAlias: config.android.keystore['alias'],
      keyPassword: config.android.keystore['password'],
      storePassword: config.android.keystore['password']
    },
    permissions: _.get(manifest, 'app-plus.distribute.android.permissions', []),
    appId: manifest.appid,
    appName: manifest.name,
    appKey: config['android']['appKey'],
    androidSdk: config['android']['sdk'],
    javaHome: config['javaHome'],
    jvmArgs: config['android']['jvmArgs'],
    buildToolsVersion: config['android']['buildToolsVersion'] || null
  }
  renderDir(path.resolve(`${config.workDir}/${config.android.templateName}/`), templateData)
}

function gradleBuild(config) {
  const { workDir, android } = config
  child_process.execSync(`
  cd ${path.join(path.resolve(workDir), android.templateName)} && \
  ./gradlew assembleRelease
  `, { stdio: 'inherit' })
}

function archiveApk(config) {
  const { workDir, android } = config

  const output = 'dist/apk/'
  // mkdir dist
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true })
  }

  // copy apk
  fsExtra.copySync(`${workDir}/${android.templateName}/app/build/outputs/apk/release/app-release.apk`, `${output}/${manifest.appid}_${new Date().getTime()}.apk`)
}

module.exports = {
  prepareAndroidFiles,
  copyAppPlusDist,
  renderTemplate,
  gradleBuild,
  archiveApk
}