const gulp= require('gulp');
const webpack= require('webpack-stream');
const sass=require('gulp-sass')(require('sass'));


const dist= '/Users/albinamakisheva/Sites/localhost/react_admin/admin';



gulp.task('copy-html', ()=>{
    return gulp.src('./app/src/index.html')
                .pipe(gulp.dest(dist))
});

gulp.task('build-js', ()=>{
    return gulp.src('./app/src/main.js')
                .pipe(webpack({
                    mode: 'development',
                    output: {
                        filename: 'script.js'
                    },
                    watch: false,
                    devtool: 'source-map',
                    module: {
                        rules: [
                            {
                                test: /\.jsx?$/,
                                exclude:/(node_modules|bower_components)/,
                                use:{
                                    loader: 'babel-loader',
                                    options:{
                                        presets: [['@babel/preset-env',{ 
                                            debug: true, 
                                            corejs: 3,
                                            useBuiltIns: 'usage'
                                        }], 
                                        '@babel/react']
                                    }
                                }
                            }
                        ]
                    }
                }))
                .pipe(gulp.dest(dist))
});

gulp.task('build-sass', ()=>{
    return gulp.src('./app/scss/style.scss')
                .pipe(sass().on('error', sass.logError))
                .pipe(gulp.dest(dist));
});

gulp.task('copy-api', ()=>{
    return gulp.src('./app/api/**')
                .pipe(gulp.dest(dist + '/api')); // for not mixing with other files
});

gulp.task('copy-assets', ()=>{
    return gulp.src('./app/assets/**/*.*')
                .pipe(gulp.dest(dist + '/assets')); // for not mixing with other files
});

// to watch and immediately change any new changes with 'gulp watch' command
gulp.task('watch',()=>{
    gulp.watch('./app/src/index.html', gulp.parallel('copy-html'));
    gulp.watch('./app/assets/**/*.*', gulp.parallel('copy-assets'));
    gulp.watch('./app/api/**/*.*', gulp.parallel('copy-api'));
    gulp.watch('./app/scss/**/*.scss', gulp.parallel('build-sass'));
    gulp.watch('./app/src/**/*.*', gulp.parallel('build-js'));

});

gulp.task('build', gulp.parallel('copy-html', 'copy-assets', 'copy-api', 'build-sass', 'build-js'));

// first- build old changes, then watch new with 'gulp' command
gulp.task('default', gulp.parallel('watch', 'build'))