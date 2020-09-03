import TaskStatus from "./TaskStatus";

type GetTaskResponse = {
    /**
     * Task status.
     */
    status: TaskStatus;
};

export default GetTaskResponse;