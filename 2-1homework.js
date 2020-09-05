// 简答题
/* 第一题
1.让项目的代码编写更加规范和标准，也大大提高了代码；
2.快速搭建项目，代码风格统一，使得项目多人协作开发，文件目录管理更加规范 */

/* 第二题
  减少大量的重复性工作，让我们有更多的时间投入到业务中去
 */

//  编程题

// 第一题
const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const ejs = require('ejs')

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name?',
    },
    {
      type: 'list',
      name: 'theme',
      message: 'Select the theme color',
      choices: ['Dark', 'Light'],
      filter: function (val) {
        return val.toLowerCase()
      },
    },
    {
      type: 'checkbox',
      message: 'Select what to include',
      name: 'content',
      choices: [
        {
          name: 'Header',
        },
        {
          name: 'Body',
        },
        {
          name: 'Footer',
        },
      ],
      validate: function (answer) {
        if (answer.length < 1) {
          return 'You must choose at least one content.'
        }
        return true
      },
    },
  ])
  .then((anwsers) => {
    const tmplDir = path.join(__dirname, 'templates')
    const destDir = process.cwd()
    fs.readdir(tmplDir, (err, files) => {
      if (err) throw err
      files.forEach((file) => {
        ejs.renderFile(path.join(tmplDir, file), anwsers, (err, result) => {
          if (err) throw err
          fs.writeFileSync(path.join(destDir, file), result)
        })
      })
    })
  })
// 第二题
// gulpfile.js文件
const { src, dest, parallel, series, watch } = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')

const loadPlugins = require('gulp-load-plugins')
const autoprefixer = require('autoprefixer')
const stylelint = require('stylelint')
const scss = require('postcss-scss')
const reporter = require('postcss-reporter')
const minimist = require('minimist')

const plugins = loadPlugins()
const bs = browserSync.create()
const cwd = process.cwd()

const args = minimist(process.argv.slice(2))

const isProd = process.env.NODE_ENV
  ? process.env.NODE_ENV === 'production'
  : args.production || args.prod || false

const bsInit = {
  notify: false,
  port: args.port || 2080,
  open: args.open || false,
}

let config = {
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: 'assets/styles/**/*.scss',
      scripts: 'assets/scripts/**/*.js',
      pages: '**/*.html',
      images: 'assets/images/**/*.{jpg,jpeg,png,gif,svg}',
      fonts: 'assets/fonts/**/*.{eot,svg,ttf,woff,woff2}',
    },
  },
}

try {
  const loadConfig = require(`${cwd}/pages.config.js`)
  config = { ...config, ...loadConfig }
} catch (e) {}

const clean = () => del([config.build.dist, config.build.temp])

const style = () =>
  src(config.build.paths.styles, {
    base: config.build.src,
    cwd: config.build.src,
    sourcemaps: !isProd,
  })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(plugins.postcss([autoprefixer()]))
    .pipe(dest(config.build.temp, { sourcemaps: '.' }))
    .pipe(bs.reload({ stream: true }))

const stylesLint = () =>
  src(config.build.paths.styles, {
    base: config.build.src,
    cwd: config.build.src,
  }).pipe(
    plugins.postcss([stylelint({ fix: args.fix }), reporter()], {
      syntax: scss,
    })
  )

const script = () =>
  src(config.build.paths.scripts, {
    base: config.build.src,
    cwd: config.build.src,
    sourcemaps: !isProd,
  })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(config.build.temp, { sourcemaps: '.' }))
    .pipe(bs.reload({ stream: true }))

const scriptsLint = () =>
  src(config.build.paths.scripts, {
    base: config.build.src,
    cwd: config.build.src,
  })
    .pipe(plugins.eslint({ fix: args.fix }))
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError())

const page = () =>
  src(config.build.paths.pages, {
    base: config.build.src,
    cwd: config.build.src,
    ignore: ['{layouts,partials}/**'],
  })
    .pipe(plugins.swig({ data: config.data, defaults: { cache: false } }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }))

const image = () =>
  src(config.build.paths.images, {
    base: config.build.src,
    cwd: config.build.src,
  })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))

const font = () =>
  src(config.build.paths.fonts, {
    base: config.build.src,
    cwd: config.build.src,
  })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))

const extra = () =>
  src('**', { base: config.build.public, cwd: config.build.public }).pipe(
    dest(config.build.dist)
  )

const devServe = () => {
  watch(config.build.paths.styles, { cwd: config.build.src }, style)
  watch(config.build.paths.scripts, { cwd: config.build.src }, script)
  watch(config.build.paths.pages, { cwd: config.build.src }, page)

  watch(
    [config.build.paths.images, config.build.paths.fonts],
    { cwd: config.build.src },
    bs.reload
  )

  watch('**', { cwd: config.build.public }, bs.reload)

  bs.init({
    ...bsInit,
    server: {
      baseDir: [
        config.build.temp,
        config.build.dist,
        config.build.public,
        config.build.src,
      ],
      routes: {
        '/node_modules': 'node_modules',
      },
    },
  })
}

const prodServe = () => {
  bs.init({
    ...bsInit,
    server: {
      baseDir: config.build.dist,
    },
  })
}

const useref = () =>
  src(config.build.paths.pages, {
    base: config.build.temp,
    cwd: config.build.temp,
  })
    .pipe(plugins.useref({ searchPath: [config.build.temp, '.', '..'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        })
      )
    )
    .pipe(dest(config.build.dist))

const publish = () =>
  src('**', { base: config.build.dist, cwd: config.build.dist }).pipe(
    plugins.ghPages()
  )

const lint = parallel(stylesLint, scriptsLint)

const compile = parallel(style, script, page)

const build = series(
  clean,
  parallel(series(compile, useref), image, font, extra)
)

const serve = series(compile, devServe)

const start = series(build, prodServe)

const deploy = series(build, publish)

module.exports = {
  clean,
  lint,
  compile,
  serve,
  build,
  start,
  deploy,
}
// page.json文件 看2-1homework.json文件

// 第三题

// gruntfile.js文件
const sass = require('sass')
const loadGruntTasks = require('load-grunt-tasks')
const browserSync = require('browser-sync')
const bs = browserSync.create()

module.exports = (grunt) => {
  grunt.initConfig({
    //sass转化为css功能
    sass: {
      options: {
        sourceMap: true, //设置后会生成相应的sourceMap文件
        implementation: sass,
      },
      main: {
        files: {
          // 目标文件：源文件
          'dist/css/main.css': 'src/scss/main.scss',
        },
      },
    },
    //js转化功能
    babel: {
      options: {
        sourceMap: true, //设置后会生成相应的sourceMap文件
        presets: ['@babel/preset-env'],
      },
      main: {
        files: {
          // 目标文件：源文件
          'dist/js/app.css': 'src/js/app.js',
        },
      },
    },
    web_swig: {
      options: {
        swigOptions: {
          //缓存设置为false
          cache: false,
        },
        getData: function (tpl) {
          //模板文件的数据
          return { myGruntTitle: 'hello,grunt-web-swig' }
        },
      },
      main: {
        expand: true,
        cwd: 'src/', //源文件文件夹
        src: '**/*.html', //后缀名匹配
        dest: 'dist/', //目标文件夹
      },
    },
    //监视功能
    watch: {
      js: {
        //文件地址
        files: ['src/js/*.js'],
        //执行的任务
        tasks: ['babel'],
      },
      css: {
        //文件地址
        files: ['src/scss/*.scss'],
        //执行的任务
        tasks: ['sass'],
      },
      html: {
        //文件地址
        files: ['src/*.html'],
        //执行的任务
        tasks: ['web_swig', 'bs-reload'],
      },
    },
    //清除功能
    clean: {
      //所要清除的文件路径
      files: 'dist/**',
    },
  })

  // grunt.loadNpmTasks('grunt-sass')
  loadGruntTasks(grunt) //自动加载所有的grunt插件
  grunt.registerTask('default', ['clean', 'sass', 'babel', 'watch'])
  grunt.registerTask('bs-reload', function () {
    bs.reload()
  })
  grunt.registerTask('bs', function () {
    const done = this.async()
    bs.init({
      server: {
        port: 8080,
        // baseDir: 'dist',
        baseDir: ['dist', 'public', 'src'],
        files: 'dist/**',
        // open:false,
        routes: {
          '/node_modules': 'node_modules',
        },
      },
    })
  })
  grunt.registerTask('compile', ['clean', 'sass', 'babel'])
}
