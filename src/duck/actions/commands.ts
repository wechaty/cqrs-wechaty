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

/* eslint-disable sort-keys */

import {
  createAction,
}                         from 'typesafe-actions'
import type * as PUPPET   from 'wechaty-puppet'

import * as types from '../types.js'

import {
  MetaResponse,
  metaRequest,
  metaResponse,
}                     from './meta.js'

const payloadSendMessageCommand = (puppetId: string, conversationId: string, sayable: PUPPET.payloads.Sayable)  => ({ puppetId, conversationId, sayable })
const payloadMessageSentEvent   = (res: MetaResponse & { messageId?: string })                                  => ({ messageId: res.messageId })

export const sendMessageCommand = createAction(types.SEND_MESSAGE_COMMAND,  payloadSendMessageCommand,  metaRequest)()
export const messageSentEvent   = createAction(types.MESSAGE_SENT_EVENT,    payloadMessageSentEvent,    metaResponse)()
