function timestamp () {
  stat -c %Y $1
}
ts1=`timestamp ./babel/solcWorker2.js`
ts2=`timestamp ./public/solcWorker.js`
if [ $ts1 -gt $ts2 ];
then
  echo building solcjs worker...
  npx -y browserify -t babelify ./babel/solcWorker2.js > ./public/solcWorker.js
fi
