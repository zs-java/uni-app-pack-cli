const template = require('art-template')
const path = require('path')
const fs = require('fs')

function renderDir(dir, data) {
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      renderDir(filePath, data)
      return
    }

    const outputPath = path.join(dir, file.replace('.art', ''))
    // 判断是否是模版文件
    if (file.indexOf('.art') !== -1) {
      // 模版文件
      fs.writeFileSync(outputPath, template(filePath, data))
      // 删除模版
      fs.rmSync(filePath)
    }
  })
}

module.exports = {
  renderDir
}