import assert from 'assert'
import path from 'path'
import nadesiko3 from 'nadesiko3'
import PluginPG from '../src/plugin_postgresql.js'
import configObj from './db_config.mjs' // 接続文字列を返すようにする

const assert_func = (a, b) => { assert.equal(a, b) }
const PluginNode = nadesiko3.PluginNode
const config = JSON.stringify(configObj)

describe('PostgreSQL test', () => {
  const nako = new nadesiko3.CNako3()
  nako.addPluginObject('PluginNode', PluginNode)
  nako.addPluginObject('PluginPG', PluginPG)
  // console.log(nako.gen.plugins)
  nako.debug = false
  nako.setFunc('テスト', [['と'], ['で']], assert_func)
  
  const cmp = async (code, res) => {
    if (nako.debug) { console.log('code=' + code) }
    const log = await nako.run(code, 'test.nako3')
    assert.equal(log.log, res)
  }
  // --- test ---
  it('表示', async () => {
    await cmp('3を表示', '3')
  })
  // --- テスト ---
  it('作成', async () => {
    await cmp(
      `${config}をPG開く。\n` +
      '「CREATE TABLE tt (id BIGINT, value BIGINT);」を[]でPG実行\n' +
      'PG閉じる。\n', '')
  })
  it('挿入', async () => {
    await cmp(
      `${config}をPG開く。\n` +
      '「BEGIN」を[]でPG実行\n' +
      '「INSERT INTO tt (id, value)VALUES(1,321);」を[]でPG実行\n' +
      '「INSERT INTO tt (id, value)VALUES($1,$2);」を[2,333]でPG実行\n' +
      '「INSERT INTO tt (id, value)VALUES(3,222);」を[]でPG実行\n' +
      '「COMMIT」を[]でPG実行\n' +
      'PG閉じる。\n', ''
    )
  })
  it('抽出', async () => {
    await cmp(
      `${config}をPG開く。\n` +
      'R=「SELECT * FROM tt ORDER BY id ASC」を[]でPG実行\n' +
      'Rを表示;R[1]["value"]を表示\n' +
      'PG閉じる。\n', '333'
    )
  })
  it('削除', async () => {
    await cmp(
      `${config}をPG開く。\n` +
      '「DROP TABLE tt」を[]でPG実行\n' +
      'PG閉じる。', ''
    )
  })
})
