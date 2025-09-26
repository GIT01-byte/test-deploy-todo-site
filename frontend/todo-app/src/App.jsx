import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/tasks/v1'; // Ваш URL API

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Для модалки удаления
  const [modalVisible, setModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTasks(data.data);
      setError('');
    } catch (e) {
      setError(`Failed to fetch tasks: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (newTaskName.trim() === '') {
      setError('Task name cannot be empty');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTaskName, description: newTaskDescription }),
      });
      const data = await response.json();
      if (data.succes) {
        fetchTasks();
        setNewTaskName('');
        setNewTaskDescription('');
        setError('');
      } else {
        setError('Failed to add task.');
      }
    } catch (e) {
      setError(`Failed to add task: ${e.message}`);
    }
  };

  const toggleComplete = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${taskId}/complete`, { method: 'PATCH' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchTasks();
    } catch (e) {
      setError(`Failed to toggle complete: ${e.message}`);
    }
  };

  // Открыть модалку и запомнить задачу для удаления
  const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setModalVisible(true);
  };

  // Закрыть модалку без удаления
  const closeModal = () => {
    setTaskToDelete(null);
    setModalVisible(false);
  };

  // Подтвердить удаление задачи
  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${taskToDelete.id}/delete`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setModalVisible(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (e) {
      setError(`Failed to delete task: ${e.message}`);
    }
  };

  const handleDeleteMany = async () => {
    const taskIdsToDelete = tasks.filter(task => task.completed).map(task => task.id);
    if (taskIdsToDelete.length === 0) {
      setError("No tasks selected for deletion.");
      return;
    }
    try {
      const queryParams = taskIdsToDelete.map(id => `task_ids=${id}`).join('&');
      const response = await fetch(`${API_BASE_URL}/delete-many?${queryParams}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        fetchTasks();
        setError('');
      } else {
        setError("Failed to delete tasks.");
      }
    } catch (error) {
      setError(`Error deleting tasks: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h1>My To-Do List</h1>

      {error && <div className="error">{error}</div>}

      <div className="input-group">
        <input
          type="text"
          placeholder="Task Name"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task.id)}
              />
              <span>{task.name}</span> - <span>{task.description}</span>
              <button onClick={() => openDeleteModal(task)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleDeleteMany}>Delete Completed</button>

      {/* Модальное окно */}
      {modalVisible && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete the task: <b>{taskToDelete?.name}</b>?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-delete" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
