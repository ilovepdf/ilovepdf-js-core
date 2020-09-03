/**
 * All the statuses that can have a task.
 */
type TaskStatus = 'TaskWaiting' | 'TaskProcessing' | 'TaskSuccess' |
                  'TaskSuccessWithWarnings' | 'TaskError' | 'TaskDeleted' |
                  'TaskNotFound';

export default TaskStatus;