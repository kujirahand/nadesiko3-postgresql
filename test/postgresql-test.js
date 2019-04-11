const assert = require('assert')
const path = require('path')
const nadesiko3 = require('nadesiko3')
const NakoCompiler = nadesiko3.compiler
const PluginNode = nadesiko3.PluginNode
const PluginPG = require('../src/plugin_postgresql.js')
const config = require('../db_config.js') // 接続文字列を返すようにする
const assert_func = (a, b) => { assert.equal(a, b) }

describe('PostgreSQL test', () => {
  const nako = new NakoCompiler()
  nako.addPluginObject('PluginNode', PluginNode)
  nako.addPluginObject('PluginPG', PluginPG)
  // console.log(nako.gen.plugins)
  // nako.debug = true
  nako.setFunc('テスト', [['と'], ['で']], assert_func)
  const cmp = (code, res) => {
    if (nako.debug) {
      console.log('code=' + code)
    }
    assert.equal(nako.runReset(code).log, res)
  }
  const cmd = (code) => {
    if (nako.debug) console.log('code=' + code)
    nako.runReset(code)
  }
  // --- test ---
  it('表示', () => {
    cmp('3を表示', '3')
  })
  // --- テスト ---
  it('作成', (done) => {
    global.done = done
    cmd(
      `『${config}』をPG開く。\n` +
      '逐次実行\n' +
      '　次に、「CREATE TABLE tt (id BIGINT, value BIGINT);」を[]でPG逐次実行\n' +
      '　次に、PG閉じる。\n' +
      '　次に、JS{{{ global.done() }}}\n' +
      'ここまで\n'
    )
  })
  it('挿入', (done) => {
    global.done = done
    cmd(
      '逐次実行\n' +
      `　先に、『${config}』をPG開く。\n` +
      '　次に、「BEGIN」を[]でPG逐次実行\n' +
      '　次に、「INSERT INTO tt (id, value)VALUES(1,321);」を[]でPG逐次実行\n' +
      '　次に、「INSERT INTO tt (id, value)VALUES($1,$2);」を[2,333]でPG逐次実行\n' +
      '　次に、「INSERT INTO tt (id, value)VALUES(3,222);」を[]でPG逐次実行\n' +
      '　次に、「COMMIT」を[]でPG逐次実行\n' +
      '　次に、PG閉じる。\n' +
      '　次に、JS{{{ global.done() }}}\n' +
      'ここまで\n'
    )
  })
  it('抽出', (done) => {
    global.done = done
    cmd(
      '逐次実行\n' +
      `　先に、『${config}』をPG開く。\n` +
      '　次に、「SELECT * FROM tt ORDER BY id ASC」を[]でPG逐次実行\n' +
      '　次に、対象[1]["value"]と333でテスト。\n' +
      '　次に、PG閉じる。\n' +
      '　次に、JS{{{ global.done() }}}\n' +
      'ここまで\n'
    )
  })
  it('削除', (done) => {
    global.done = done
    cmd(
      '逐次実行\n' +
      `　先に、『${config}』をPG開く。\n` +
      '　次に、「DROP TABLE tt」を[]でPG逐次実行\n' +
      '　次に、PG閉じる。\n' +
      '　次に、JS{{{ global.done() }}}\n' +
      'ここまで\n'
    )
  })
})
