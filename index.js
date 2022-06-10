#!/usr/bin/env node

const dotenv = require("dotenv")
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const fs = require('fs')
const path = require('path')
const { config } = require('./src/config')
const utils = require('./src/utils')
const uniApp = require('./src/uni-app')
const android = require('./src/android');


(async function() {
  // 检查创建工作目录
  utils.mkdirWorkDir(config.workDir)

  // 准备 android 离线打包模版工程
  await utils.prepareAndroidTemplate(config)

  // 解压
  await utils.unCompressAndroidTemplate(config)

  // copy android 打包相关的文件
  android.prepareAndroidFiles(config)

  // 获取 h5 打包静态资源
  const appPlusDist = await uniApp.buildAppPlusWtg()
  // copy 静态资源
  android.copyAppPlusDist(config, appPlusDist)

  // 模版引擎渲染
  android.renderTemplate(config)
  console.log('uni-app-pack-android render done.')

  // 执行 gradle 命令
  android.gradleBuild(config)

  // 归档 apk 文件
  android.archiveApk(config)

  console.log('xzcoder-pack-cli Done!')
})()
