FROM alvrme/alpine-android:android-30-jdk8
#FROM alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

RUN apk add --no-cache libstdc++

WORKDIR /usr/local/

ADD node-v14.19.3-linux-x64-musl.tar.xz .

ENV NODE_HOME /usr/local/node-v14.19.3-linux-x64-musl
ENV PATH $NODE_HOME/bin:$PATH

RUN npm config set registry https://registry.npm.taobao.org

WORKDIR /home/project