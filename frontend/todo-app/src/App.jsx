import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/tasks/v1';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Для модалки удаления
  const [modalVisible, setModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Анимация загрузки
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
      setIsInitialLoad(false);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
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
      if (data.success) {
        fetchTasks();
        setNewTaskName('');
        setNewTaskDescription('');
        setError('');
        showSuccessMessage('Task added successfully!');
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

  const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setModalVisible(true);
  };

  const closeModal = () => {
    setTaskToDelete(null);
    setModalVisible(false);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${taskToDelete.id}/delete`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setModalVisible(false);
      setTaskToDelete(null);
      fetchTasks();
      showSuccessMessage('Task deleted successfully!');
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
        showSuccessMessage(`Deleted ${taskIdsToDelete.length} completed tasks!`);
      } else {
        setError("Failed to delete tasks.");
      }
    } catch (error) {
      setError(`Error deleting tasks: ${error.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="app-container">
      <div className="centered-wrapper">
        <div className={`container ${isInitialLoad ? 'container-enter' : ''}`}>
          <header className="app-header">
            <h1 className="app-title">✨ My To-Do List ✨</h1>
            <p className="app-subtitle">Stay organized and productive</p>
          </header>

          {error && <div className="message error-message slide-in">{error}</div>}
          {successMessage && <div className="message success-message slide-in">{successMessage}</div>}

          <div className="input-section">
            <div className="input-group">
              <input
                type="text"
                placeholder="📝 Task Name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field"
              />
              <input
                type="text"
                placeholder="📋 Task Description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field"
              />
              <button onClick={addTask} className="btn btn-primary add-btn">
                ➕ Add Task
              </button>
            </div>
          </div>

          <div className="tasks-section">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading tasks...</p>
              </div>
            ) : (
              <>
                <div className="tasks-header">
                  <h2>Your Tasks ({tasks.length})</h2>
                  {tasks.some(task => task.completed) && (
                    <button onClick={handleDeleteMany} className="btn btn-danger delete-completed-btn">
                      🗑️ Delete Completed
                    </button>
                  )}
                </div>
                
                {tasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No tasks yet</h3>
                    <p>Add your first task to get started!</p>
                  </div>
                ) : (
                  <ul className="task-list">
                    {tasks.map((task, index) => (
                      <li
                        key={task.id}
                        className={`task-item ${task.completed ? 'completed' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="task-content">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(task.id)}
                            className="task-checkbox"
                          />
                          <div className="task-info">
                            <span className="task-name">{task.name}</span>
                            {task.description && (
                              <span className="task-description">{task.description}</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => openDeleteModal(task)} 
                          className="btn btn-danger delete-btn"
                        >
                          🗑️
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {modalVisible && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>⚠️ Confirm Deletion</h2>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete the task:</p>
                  <p className="task-to-delete"><b>"{taskToDelete?.name}"</b>?</p>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
                <div className="modal-buttons">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    ❌ Cancel
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    ✅ Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;