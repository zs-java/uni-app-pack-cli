const compressing = require('compressing')
const fs = require('fs')
const download = require('download')

function mkdirWorkDir(workDir) {
  if (fs.existsSync(workDir)) {
    console.log('workDir is exists')
  } else {
    fs.mkdirSync(workDir, { recursive: true })
    console.log(`mkdir ${workDir}`)
  }
}

async function prepareAndroidTemplate(config) {
  const { workDir, android } = config
  if (!fs.existsSync(`${workDir}/${android.templateArchiveName}`)) {
    // download
    console.log('downloadUrl:' + android.templateDownloadUrl)
    const res = await download(android.templateDownloadUrl)
    fs.writeFileSync(`${workDir}/${android.templateArchiveName}`, res)
    console.log('download success')
  } else {
    console.log('remove old uni-app-pack-android dir')
    fs.rmdirSync(`${workDir}/${android.templateName}/`, { recursive: true })
  }
}

async function unCompressAndroidTemplate(config) {
  const { workDir, android } = config
  await compressing.tgz.uncompress(`${workDir}/${android.templateArchiveName}`, `${workDir}/`)
  console.log('unpackage success')
}

module.exports = {
  mkdirWorkDir,
  prepareAndroidTemplate,
  unCompressAndroidTemplate
}