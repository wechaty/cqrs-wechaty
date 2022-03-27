import { classifyMap }  from '../../classify/classify-map.js'
import * as commands    from '../../duck/actions/commands.js'

/**
 * Selective export `Command` only
 */
export const {
  DingCommand,
  ResetCommand,
  NopCommand,
  SendMessageCommand,
  StartCommand,
  StopCommand,
} = classifyMap(commands)
