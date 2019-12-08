# promise的-polyfill
aixos没有finally方法，通过Promose的原型方法添加。
使用方法直接在main.js里面引入，让然后执行该函数对象即可,例示如下

import Finally from promise-polyfill.js;

Finally()

      export default function () {
        if (!Promise.prototype.finally) {
          Promise.prototype.finally = function (callback) {
            let P = this.constructor
            return this.then(
              value => P.resolve(callback()).then(() => value),
              reason =>
                P.resolve(callback()).then(() => {
                  throw reason
                })
            )
          }
        }
      }