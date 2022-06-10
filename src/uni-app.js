const path = require('path')
const fs = require('fs')
const fsExtra = require('fs-extra')
const child_process = require('child_process')
const compressing = require('compressing')
const download = require('download')

const { config } = require('./config')

const projectTypeObj = {
  uniCli: {
    name: 'UniCli',
    keywords: ['uni-cli', 'vue-cli'],
    manifestPath: path.resolve('src/manifest.json'),
    buildFunc: buildUniCliAppPlus
  },
  hBuilderX: {
    name: 'HBuilderX',
    keywords: ['hbuilder', 'huilberx', 'hx'],
    manifestPath: path.resolve('manifest.json'),
    buildFunc: buildHBuilderXAppPlus
  }
}

function getProjectType() {
  if (!config.projectType || config.projectType === 'auto') {
    return getAutoProjectType()
  }
  if (projectTypeObj.uniCli.keywords.includes(config.projectType)) {
    return projectTypeObj.uniCli
  }
  if (projectTypeObj.hBuilderX.keywords.includes(config.projectType)) {
    return projectTypeObj.hBuilderX
  }
}

function getAutoProjectType() {
  if (fs.existsSync(projectTypeObj.uniCli.manifestPath)) {
    return projectTypeObj.uniCli
  }
  if (fs.existsSync(projectTypeObj.hBuilderX.manifestPath)) {
    return projectTypeObj.hBuilderX
  }
  console.error('无法识别的项目类型')
  process.exit(1)
}

async function buildAppPlusWtg() {
  return await getProjectType().buildFunc()
}

async function buildUniCliAppPlus() {
  return path.resolve('dist/build/app-plus')
}

async function buildHBuilderXAppPlus() {
  const uniCliConfig = config.uniCli
  // 不存在 cli 则下载模版
  const templatePath = path.resolve(`${config.workDir}/${uniCliConfig.name}`)
  const templateArchivePath = path.resolve(`${config.workDir}/${uniCliConfig.archiveName}`)
  if (!fs.existsSync(templatePath)) {
    if (!fs.existsSync(templateArchivePath)) {
      const res = await download(uniCliConfig.downloadUrl)
      fs.writeFileSync(templateArchivePath, res)
    }
    // 解压
    await compressing.tgz.uncompress(templateArchivePath, `${config.workDir}`)
  }
  const linkPath = path.join(templatePath, 'src')
  if (fs.existsSync(linkPath)) {
    fs.rmdirSync(linkPath, { recursive: true })
  }
  try {
    // 创建软连接
    // fs.linkSync(path.resolve('.'), linkPath)
    console.log('copy project to ' + linkPath)
    const rootDir = path.resolve('.')
    const ignores = ['dist', '.git', '.hbuilder', '.idea']
    fs.readdirSync(rootDir).forEach(item => {
      if (ignores.includes(item)) {
        return
      }
      const itemPath = path.join(rootDir, item)
      fsExtra.copySync(itemPath, path.join(linkPath, item))
    })
    console.log('copy project done')
  } catch (e) {
    // child_process.execSync(`ln -s ${path.resolve('.')} ${linkPath}`)
  }
  let shell
  switch (uniCliConfig.pm.toLowerCase()) {
    case 'npm':
      shell = 'npm install && npm run build:app-plus'
      break
    case 'yarn':
      shell = 'yarn && yarn build:app-plus'
      break
    default:
      console.error('不支持的软件包管理器：' + uniCliConfig.pm)
      process.exit(1)
  }
  // 执行 build:app-plus
  child_process.execSync(`
    cd ${templatePath} && \
    ${shell}
  `, { stdio: 'inherit' })
  // 返回 app-plus wgt 资源路径
  return path.join(templatePath, 'dist/build/app-plus')
}

module.exports = {
  buildAppPlusWtg
}