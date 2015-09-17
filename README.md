# Code Game

Code GAME 是一个通过编写 AI 脚本控制坦克进行比赛的游戏。

娱乐第一，请点右上角 star！

## 安装

    $ npm install
    $ npm run build
    $ cp config/_sample.json config/development.json
    $ vim config/development.json
    $ node app

需要软件版本：

Node v0.11.12 或更高版本
Redis v2.4 或更高版本
MySQL

## 配置

1. GitHub 配置
    在 GitHub [创建新应用](https://github.com/settings/applications/new)，在 Authorization callback URL 栏目填写 http://127.0.0.1:3000/account/github/callback。 然后将应用的 key 和 secret 填到 config/development.json 里的相应位置

2. 地图
    地图信息存储在数据库的 Maps 表中，其中 data 为地图信息，x 表示石头，o 表示草坪，. 表示空地。abcd 表示玩家 1 的出生点（分别对应初始朝向 上 右 下 左），ABCD 表示玩家 2 的出生点。以 | 分隔每行。默认的地图为：

        xxxxxxxxxxxxxxxxxxx|xooo..............x|xoax.....x........x|xxxx.....x........x|x........x........x|x..xxxxxxxxxxx....x|x....ooxoooooo....x|x....ooooooooo....x|x....ooooooxoo....x|x....xxxxxxxxxxx..x|x........x........x|x........x.....xxxx|x........x.....xCox|x..............ooox|xxxxxxxxxxxxxxxxxxx

## 计算排行

    node services/calc_rank.js

## 技术栈

Node.js, MySQL

## 介绍文章

[Code Game 对技术的选取——兼谈为何不应该用 CoffeeScript 与 Less](http://zihua.li/2014/11/talk-about-codegame/)
