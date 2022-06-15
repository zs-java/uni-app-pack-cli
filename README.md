# uni-app-pack-cli
> uni-app 工程自动化自动化离线打包工具，可用于 CI/CD  
> 支持`HBuilderX`或`vue-cli`创建的`uni-app`项目  
> 暂不支持`iOS`、原生SDK，后面有需要再写

## 环境准备
> 若不想安装 jdk 和 android sdk，可以使用 docker 环境
1. jdk1.8 环境
2. Android SDK

## 安装
```shell script
# 全局安装
npm install @xzcoder/pack-cli -g
# 项目安装
npm install @xzcoder/pack-cli -D
```

## package.json
```json5
{
  "scripts": {
    "pack:android": "pack-cli --config your_config_file"
  }
}
```

## 参数配置
> 以下参数可通过命令行参数指定，如：`pack-cli --android.appKey your_app_key`  
> 或通过`pack-cli --config your_config_file`指定加载配置文件，支持JSON、YAML两种配置文件格式
```yaml
# 打包工作路径，默认：'dist/pack'
workDir: 'dist/pack'
  # 安卓项目配置
  android:
    # Android SDK 路径，默认读取环境变量 $ANDROID_HOME
    sdk: your_android_sdk_path
    # Android 模版工程下载路径（使用默认值即可）
    templateDownloadUrl: 
    # uni-app 离线打包 appKey
    appKey: your_uni_app_offline_packaging_key
    # Android APP 包名
    applicationId: your_package_name
    # Android 证书配置
    keystore:
      # 证书文件路径
      file: your_keystore_file_path
      # 证书别名
      alias: your_keystore_alias
      # 证书密码
      password: your_keystore_password
      # Gradle JVM 参数
    jvmArgs: -Xmx1024m -Dfile.encoding=UTF-8
    # Android BuildTools 版本
    buildToolsVersion: 30.0.3
# 项目类型，(HBuilderX|uni-cli|auto)，默认auto自动识别
projectType: auto
# uni-cli 配置
uniCli:
  # NodeJS 包管理器，支持 npm | yarn
  pm: npm
  # uni-cli 项目模版下载路径（使用默认值即可）
  downloadUrl: 
```

## Docker
```shell script
docker pull xzcoder/pack-cli
docker run -d --name pack-cli \
    -v your_project_path:/home/project \ # 挂载项目目录
    -v your_gradle_home:/root/.gradle \  # 持久化 gradle 缓存
    xzcoder/pack-cli-alpine tail -f /dev/null
docker exec -it pack-cli sh
$/home/project: npm install && npm run pack:android    
```

## Pipeline
> 下面使用`.gitlab-ci.yml`举例
```yaml
image: registry.cn-hangzhou.aliyuncs.com/xzcoder/pack-cli-apline:0.0.7
before_script:
  - export GRADLE_USER_HOME=$(pwd)/.gradle

pack:
  interruptible: true
  stage: Build
  script:
    - |
      npm install
      ./node_modules/.bin/pack-cli --android.sdk $ANDROID_HOME \
        --android.appKey $CI_APP_KEY \
        --android.applicationId com.xzcoder.test \
        --android.buildToolsVersion "30.0.3" \
        --android.keystore.file key.jks \
        --android.keystore.alias $CI_KEYSTORE_ALIAS \
        --android.keystore.password $CI_KEYSTORE_PASSWORD
  artifacts:
    paths:
      - dist/apk/
  cache:
    key: "$CI_JOB_NAME"
    paths:
      - .gradle
```
