#!/usr/bin/env -S node --no-warnings --loader ts-node/esm

/**
 *   Wechaty Open Source Software - https://github.com/wechaty
 *
 *   @copyright 2016 Huan LI (李卓桓) <https://github.com/huan>, and
 *                   Wechaty Contributors <https://github.com/wechaty>.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import {
  test,
  testSchedulerRunner,
  AssertEqual,
}                               from 'tstest'
import {
  Observable,
  of,
  Subject,
  tap,
}                               from 'rxjs'
import type { ActionBuilder }   from 'typesafe-actions'
import { GError }               from 'gerror'
import { map, mergeMap }        from 'rxjs/operators'

import * as duck              from '../duck/mod.js'
import * as classified        from '../classified/mod.js'
import type { MetaResponse }  from '../cqr-event/meta.js'
import type { ResponseOf }    from '../cqr-event/response-of.js'

import { TIMEOUT_MS } from './constants.js'
import { execute$ }   from './execute$.js'

test('execute$() typing', async t => {
  const dummyBus$ = new Subject<any>()
  const execute1 = execute$(dummyBus$)
  const exe2  = execute1(new classified.actions.GetCurrentUserIdQuery(''))

  type RESULT = typeof execute
  type EXPECTED = InstanceType<typeof classified.actions.GetCurrentUserIdQueryResponse>
  const typingTest: AssertEqual<RESULT, EXPECTED> = true
  t.ok(typingTest, 'should match typing')
})

test('execute$() query & response in time', testSchedulerRunner(m => {
  const PUPPET_ID   = 'puppet-id'
  const CONTACT_ID  = 'contact-id'

  const query = new classified.actions.GetCurrentUserIdQuery(PUPPET_ID)
  const response = new classified.actions.GetCurrentUserIdQueryResponse({
    ...query.meta,
    contactId : CONTACT_ID,
  })

  const values = {
    q: query,
    r: response,
  }

  const source    = '-q--'
  const bus       = '---r'
  const expected  = '---r'

  const mockBus$  = m.hot(bus, values)
  const result$   = m.hot(source, { q: values.q }).pipe(
    mergeMap(execute$(mockBus$)),
  )

  m.expectObservable(result$).toBe(expected, values)
}))

test('execute$() query & response timeout', testSchedulerRunner(m => {
  const PUPPET_ID = 'puppet-id'
  const GERROR    = 'Timeout has occurred'

  const query     = new classified.actions.GetCurrentUserIdQuery(PUPPET_ID)
  const response  = new classified.actions.GetCurrentUserIdQueryResponse({
    gerror    : GERROR,
    id        : query.meta.id,
    puppetId  : query.meta.puppetId,
  })

  const values = {
    q: query,
    r: response,
  }

  const source    = `q ${TIMEOUT_MS - 1}ms -`
  const expected  = `- ${TIMEOUT_MS - 1}ms r`

  const dummyBus$ = new Subject<any>()

  const normalizeMessage = (response: InstanceType<typeof classified.actions.GetCurrentUserIdQueryResponse>) => ({
    ...response,
    meta: {
      ...response.meta,
      gerror: GError.from(response.meta.gerror).message,
    },
  })

  const execute = execute$(dummyBus$)
  type T = typeof execute

  const result$ = m.hot(source, { q: values.q }).pipe(
    tap(e => console.info(e)),
    mergeMap(execute),
    map(normalizeMessage),
  )

  m.expectObservable(result$).toBe(expected, values)
}))

test('execute$() ReturnType typing', async t => {
  const bus$ = new Subject<any>()

  const query = duck.actions.getCurrentUserIdQuery('PUPPET_ID')

  const $ = of(query).pipe(
    execute$(bus$),
  )

  const test: AssertEqual<
    ReturnType<typeof execute>,
    Observable<ReturnType<ResponseOf<typeof duck.actions.getCurrentUserIdQuery>>>
  > = true

  t.ok(test, 'should get the right return type of message')
})

test('execute$() ReturnType typing without input', async t => {
  const bus$ = new Subject<any>()

  const execute = execute$(bus$)

  const test: AssertEqual<
    ReturnType<typeof execute>,
    Observable<ActionBuilder<string, {}, MetaResponse>>
  > = true

  t.ok(test, 'should get the right return type of response')
})
