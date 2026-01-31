import React, { useEffect, useState } from "react";
import { getTasks, addTask } from "../services/taskService";

const TaskApp = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const handleAddTask = async () => {
    if (!task.trim()) return;

    try {
      setLoading(true);
      await addTask(task);
      setTask("");
      fetchTasks();
    } catch (err) {
      console.error("Error adding task", err);
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="task-card">
    <h3 className="task-title">📝 Task Manager</h3>

    {/* Input */}
    <input
      type="text"
      className="form-control task-input"
      placeholder="What do you want to do?"
      value={task}
      onChange={(e) => setTask(e.target.value)}
    />

    {/* Button BELOW input */}
    <button
      className="btn btn-primary add-btn"
      onClick={handleAddTask}
      disabled={loading}
    >
      {loading ? "Adding..." : "Add Task"}
    </button>

    {/* Task List */}
    <div className="task-list">
      {tasks.length === 0 && (
        <div className="text-center text-muted">
          No tasks yet. Add one above 👆
        </div>
      )}

      {tasks.map((t) => (
        <div key={t._id} className="task-item">
          <div className="d-flex justify-content-between align-items-center">
            <span>{t.task}</span>
            {/* <span className="task-date">
              {new Date(t.dateCreated).toLocaleString()}
            </span> */}
          </div>
        </div>
      ))}
    </div>
  </div>
);


};

export default TaskApp;
