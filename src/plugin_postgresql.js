// plugin_postgresql.js
const {Client} = require('pg')
const ERR_OPEN_DB = 'PostgreSQLの命令を使う前に『PG開く』でデータベースを開いてください。';
const ERR_ASYNC = '『逐次実行』構文で使ってください。';
const PluginPG = {
  '初期化': {
    type: 'func',
    josi: [],
    fn: function (sys) {
      sys.__pg_db = null
    }
  },
  // @PostgreSQL
  'PG開': { // @データベースを開く // @PGひらく
    type: 'func',
    josi: [['を', 'の', 'で']],
    fn: function (s, sys) {
        let db = null
        if (typeof(s) === 'string') {
            db = new Client({connectionString: s})
        } else {
            db = new Client(s)
        }
        sys.__pg_db = db
        db.connect()
        return db
    }
  },
  'PG閉': { // @データベースを閉じる // @PGとじる
    type: 'func',
    josi: [],
    fn: function (sys) {
        sys.__pg_db.end()
    }
  },
  'PG逐次実行': { // @逐次実行構文にて、SQLとパラメータPARAMSでSQLを実行し、変数『対象』に結果を得る。SELECT句以外を実行した時も情報が『対象』に入る。 // PGちくじじっこう
    type: 'func',
    josi: [['を'], ['で']],
    fn: function (sql, params, sys) {
      if (!sys.resolve) throw new Error(ERR_ASYNC)
      sys.resolveCount++
      const resolve = sys.resolve
      if (!sys.__pg_db) throw new Error(ERR_OPEN_DB)
      sys.__pg_db.query({
          text: sql, 
          values: params
        }, function (err, res) {
        if (err) {
          throw new Error('PG逐次実行のエラー『' + sql + '』' + err.message)
        }
        const command = res['command'].toUpperCase()
        if (command === 'SELECT') {
            sys.__v0['対象'] = res['rows']
        } else {
            sys.__v0['対象'] = res
        }
        resolve()
      })
    },
    return_none: true
  }
}

module.exports = PluginPG

