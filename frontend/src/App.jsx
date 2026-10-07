import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const emptyTask = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Pending",
  due_date: "",
  assignee_id: "",
};

function App() {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("tarun_token")
  );

  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("tarun_dark") === "true"
  );

  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // DARK MODE
  // =====================================================

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";

    localStorage.setItem(
      "tarun_dark",
      darkMode
    );
  }, [darkMode]);

  // =====================================================
  // GOOGLE OAUTH + SESSION
  // =====================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const oauthToken = params.get("token");

    if (oauthToken) {
      localStorage.setItem(
        "tarun_token",
        oauthToken
      );

      setToken(oauthToken);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      return;
    }

    if (token) {
      loadUser();
      loadTasks();
      loadUsers();
    }
  }, [token]);

  // =====================================================
  // API HELPER
  // =====================================================

  const apiFetch = async (
    endpoint,
    options = {}
  ) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

    if (response.status === 401) {
      logout();
      throw new Error("Session expired");
    }

    return response;
  };

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  const loadUser = async () => {
    try {
      const response = await apiFetch(
        "/auth/me"
      );

      if (response.ok) {
        const data =
          await response.json();

        setUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // LOAD TASKS
  // =====================================================

  const loadTasks = async () => {
    try {
      const response = await apiFetch(
        "/tasks/"
      );

      if (response.ok) {
        const data =
          await response.json();

        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async () => {
    try {
      const response = await apiFetch(
        "/users/"
      );

      if (response.ok) {
        const data =
          await response.json();

        setUsers(data);
      }
    } catch (err) {
      console.error(
        "Could not load users:",
        err
      );
    }
  };

  // =====================================================
  // AUTH FORM
  // =====================================================

  const handleAuthChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // TASK FORM
  // =====================================================

  const handleTaskChange = (e) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = () => {
    window.location.href =
      `${API_URL}/auth/google/login`;
  };

  // =====================================================
  // EMAIL/PASSWORD AUTH
  // =====================================================

  const handleAuth = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (authMode === "register") {
        const response = await fetch(
          `${API_URL}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              authForm
            ),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Registration failed"
          );
        }

        setAuthMode("login");

        setError(
          "Account created! Now login."
        );

        setAuthForm({
          name: "",
          email: authForm.email,
          password: "",
        });
      } else {
        const response = await fetch(
          `${API_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              authForm
            ),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Login failed"
          );
        }

        localStorage.setItem(
          "tarun_token",
          data.access_token
        );

        setToken(
          data.access_token
        );

        setAuthForm({
          name: "",
          email: "",
          password: "",
        });

        setError("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem(
      "tarun_token"
    );

    setToken(null);
    setUser(null);
    setTasks([]);
    setUsers([]);
  };

  // =====================================================
  // CREATE TASK
  // =====================================================

  const openCreate = () => {
    setEditingTask(null);

    setTaskForm({
      ...emptyTask,
    });

    setShowModal(true);
  };

  // =====================================================
  // EDIT TASK
  // =====================================================

  const openEdit = (task) => {
    setEditingTask(task);

    setTaskForm({
      title: task.title || "",
      description:
        task.description || "",
      priority:
        task.priority || "Medium",
      status:
        task.status || "Pending",
      due_date: task.due_date
        ? task.due_date.substring(
            0,
            10
          )
        : "",
      assignee_id:
        task.assignee_id
          ? String(
              task.assignee_id
            )
          : "",
    });

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);

    setTaskForm({
      ...emptyTask,
    });
  };

  // =====================================================
  // SAVE TASK
  // =====================================================

  const saveTask = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const payload = {
        title: taskForm.title,
        description:
          taskForm.description || null,

        priority:
          taskForm.priority,

        status:
          taskForm.status,

        due_date:
          taskForm.due_date
            ? new Date(
                taskForm.due_date
              ).toISOString()
            : null,

        assignee_id:
          taskForm.assignee_id
            ? Number(
                taskForm.assignee_id
              )
            : null,
      };

      let response;

      if (editingTask) {
        response = await apiFetch(
          `/tasks/${editingTask.id}`,
          {
            method: "PUT",
            body: JSON.stringify(
              payload
            ),
          }
        );
      } else {
        response = await apiFetch(
          "/tasks/",
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.detail ||
            "Could not save task"
        );
      }

      closeModal();

      await loadTasks();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE TASK
  // =====================================================

  const deleteTask = async (id) => {
    if (
      !window.confirm(
        "Delete this task?"
      )
    ) {
      return;
    }

    try {
      const response =
        await apiFetch(
          `/tasks/${id}`,
          {
            method: "DELETE",
          }
        );

      if (response.ok) {
        await loadTasks();
      } else {
        const data =
          await response.json();

        alert(
          data.detail ||
            "Could not delete task"
        );
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // =====================================================
  // COMPLETE / REOPEN TASK
  // =====================================================

  const toggleTask = async (task) => {
    try {
      let response;

      if (task.completed) {
        // Reopen completed task
        response = await apiFetch(
          `/tasks/${task.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              completed: false,
              status: "Pending",
            }),
          }
        );
      } else {
        // Complete task
        // This endpoint also triggers
        // Gmail notification from backend.
        response = await apiFetch(
          `/tasks/${task.id}/complete`,
          {
            method: "PATCH",
          }
        );
      }

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.detail ||
            "Could not update task"
        );
      }

      await loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  // =====================================================
  // FILTER TASKS
  // =====================================================

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const text =
        `${task.title} ${
          task.description || ""
        }`.toLowerCase();

      const matchesSearch =
        text.includes(
          search.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "All" ||
        task.status ===
          statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        task.priority ===
          priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // =====================================================
  // DASHBOARD STATS
  // =====================================================

  const total = tasks.length;

  const completed =
    tasks.filter(
      (task) =>
        task.completed
    ).length;

  const pending =
    total - completed;

  const progress = total
    ? Math.round(
        (completed / total) * 100
      )
    : 0;

  const highPriority =
    tasks.filter(
      (task) =>
        task.priority === "High" &&
        !task.completed
    ).length;

  // =====================================================
  // AUTH SCREEN
  // =====================================================

  if (!token || !user) {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="auth-logo">
            T
          </div>

          <h1>
            TarunTask
          </h1>

          <p className="auth-subtitle">
            Your personal productivity
            workspace
          </p>

          <div className="auth-tabs">

            <button
              className={
                authMode === "login"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setAuthMode(
                  "login"
                );
                setError("");
              }}
            >
              Login
            </button>

            <button
              className={
                authMode ===
                "register"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setAuthMode(
                  "register"
                );
                setError("");
              }}
            >
              Register
            </button>

          </div>

          {error && (
            <div className="auth-message">
              {error}
            </div>
          )}

          <form
            onSubmit={handleAuth}
          >

            {authMode ===
              "register" && (
              <>
                <label>
                  Full Name
                </label>

                <input
                  name="name"
                  value={
                    authForm.name
                  }
                  onChange={
                    handleAuthChange
                  }
                  placeholder="Tarun Chauhan"
                  required
                />
              </>
            )}

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={
                authForm.email
              }
              onChange={
                handleAuthChange
              }
              placeholder="you@example.com"
              required
            />

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={
                authForm.password
              }
              onChange={
                handleAuthChange
              }
              placeholder="Minimum 6 characters"
              required
            />

            <button
              className="auth-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : authMode ===
                  "login"
                ? "Login"
                : "Create Account"}
            </button>

          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-login-button"
            onClick={
              handleGoogleLogin
            }
          >
            <span className="google-icon">
              G
            </span>

            Continue with Google
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN APPLICATION
  // =====================================================

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            T
          </div>

          <span>
            TarunTask
          </span>

        </div>

        <nav>

          <button
            className={
              page === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setPage(
                "dashboard"
              )
            }
          >
            📊 Dashboard
          </button>

          <button
            className={
              page === "tasks"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setPage("tasks")
            }
          >
            ✓ My Tasks
          </button>

          <button
            className={
              page === "important"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setPage(
                "important"
              )
            }
          >
            ⭐ Important
          </button>

          <button
            className={
              page === "calendar"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setPage("calendar")
            }
          >
            📅 Calendar
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="theme-button"
            onClick={() =>
              setDarkMode(
                !darkMode
              )
            }
          >
            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>

          <div className="user-box">

            <div className="avatar">
              {user.name
                .substring(0, 2)
                .toUpperCase()}
            </div>

            <div className="user-info">

              <strong>
                {user.name}
              </strong>

              <span>
                {user.email}
              </span>

            </div>

          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      <main className="main">

        <header className="topbar">

          <div>

            <p className="welcome">
              Welcome back,{" "}
              {user.name.split(
                " "
              )[0]} 👋
            </p>

            <h1>
              {page ===
              "dashboard"
                ? "Task Dashboard"
                : page === "tasks"
                ? "My Tasks"
                : page ===
                  "important"
                ? "Important Tasks"
                : "Calendar"}
            </h1>

          </div>

          <button
            className="add-button"
            onClick={openCreate}
          >
            + Add Task
          </button>

        </header>

        {/* DASHBOARD */}

        {page ===
          "dashboard" && (
          <>

            <section className="stats">

              <Stat
                icon="✓"
                label="Total Tasks"
                value={total}
              />

              <Stat
                icon="◷"
                label="Pending"
                value={pending}
              />

              <Stat
                icon="✓"
                label="Completed"
                value={
                  completed
                }
              />

              <Stat
                icon="%"
                label="Progress"
                value={`${progress}%`}
              />

            </section>

            <section className="welcome-card">

              <div>

                <span>
                  YOUR PRODUCTIVITY
                </span>

                <h2>
                  Keep your day
                  organized.
                </h2>

                <p>
                  You have{" "}
                  <strong>
                    {pending}
                  </strong>{" "}
                  pending tasks and{" "}
                  <strong>
                    {highPriority}
                  </strong>{" "}
                  high-priority tasks.
                </p>

              </div>

              <div className="progress-circle">

                <strong>
                  {progress}%
                </strong>

                <span>
                  complete
                </span>

              </div>

            </section>

          </>
        )}

        {/* IMPORTANT */}

        {page ===
          "important" ? (
          <TaskList
            title="Important Tasks"
            tasks={filteredTasks.filter(
              (task) =>
                task.priority ===
                  "High" &&
                !task.completed
            )}
            search={search}
            setSearch={
              setSearch
            }
            statusFilter={
              statusFilter
            }
            setStatusFilter={
              setStatusFilter
            }
            priorityFilter={
              priorityFilter
            }
            setPriorityFilter={
              setPriorityFilter
            }
            onCreate={
              openCreate
            }
            onEdit={openEdit}
            onDelete={
              deleteTask
            }
            onToggle={
              toggleTask
            }
            users={users}
          />
        ) : page ===
          "calendar" ? (
          <CalendarView
            tasks={tasks}
          />
        ) : page === "tasks" ? (
          <TaskList
            title="My Tasks"
            tasks={filteredTasks}
            search={search}
            setSearch={
              setSearch
            }
            statusFilter={
              statusFilter
            }
            setStatusFilter={
              setStatusFilter
            }
            priorityFilter={
              priorityFilter
            }
            setPriorityFilter={
              setPriorityFilter
            }
            onCreate={
              openCreate
            }
            onEdit={openEdit}
            onDelete={
              deleteTask
            }
            onToggle={
              toggleTask
            }
            users={users}
          />
        ) : (
          <TaskList
            title="Recent Tasks"
            tasks={filteredTasks.slice(
              0,
              5
            )}
            search={search}
            setSearch={
              setSearch
            }
            statusFilter={
              statusFilter
            }
            setStatusFilter={
              setStatusFilter
            }
            priorityFilter={
              priorityFilter
            }
            setPriorityFilter={
              setPriorityFilter
            }
            onCreate={
              openCreate
            }
            onEdit={openEdit}
            onDelete={
              deleteTask
            }
            onToggle={
              toggleTask
            }
            users={users}
          />
        )}

      </main>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  {editingTask
                    ? "Edit Task"
                    : "Create New Task"}
                </h2>

                <p>
                  Manage your task
                  details.
                </p>

              </div>

              <button
                className="close-button"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={saveTask}
            >

              <label>
                Task Title
              </label>

              <input
                name="title"
                value={
                  taskForm.title
                }
                onChange={
                  handleTaskChange
                }
                placeholder="Enter task title"
                required
              />

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  taskForm.description
                }
                onChange={
                  handleTaskChange
                }
                placeholder="Describe your task..."
                rows="4"
              />

              <div className="form-grid">

                <div>

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      taskForm.priority
                    }
                    onChange={
                      handleTaskChange
                    }
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                </div>

                <div>

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      taskForm.status
                    }
                    onChange={
                      handleTaskChange
                    }
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                </div>

              </div>

              {/* ASSIGN USER */}

              <label>
                Assign To
              </label>

              <select
                name="assignee_id"
                value={
                  taskForm.assignee_id
                }
                onChange={
                  handleTaskChange
                }
              >

                <option value="">
                  No Assignee
                </option>

                {users.map(
                  (userItem) => (
                    <option
                      key={
                        userItem.id
                      }
                      value={
                        userItem.id
                      }
                    >
                      {userItem.name} (
                      {
                        userItem.email
                      }
                      )
                    </option>
                  )
                )}

              </select>

              <label>
                Due Date
              </label>

              <input
                type="date"
                name="due_date"
                value={
                  taskForm.due_date
                }
                onChange={
                  handleTaskChange
                }
              />

              <button
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingTask
                  ? "Update Task"
                  : "Create Task"}
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}


// =======================================================
// STAT COMPONENT
// =======================================================

function Stat({
  icon,
  label,
  value,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


// =======================================================
// TASK LIST
// =======================================================

function TaskList({
  title,
  tasks,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onCreate,
  onEdit,
  onDelete,
  onToggle,
  users,
}) {

  const getAssignee = (
    assigneeId
  ) => {
    return users.find(
      (u) =>
        Number(u.id) ===
        Number(assigneeId)
    );
  };

  return (
    <section className="tasks-section">

      <div className="section-header">

        <div>

          <h2>
            {title}
          </h2>

          <p>
            Manage your tasks
            and stay productive.
          </p>

        </div>

        <button
          className="small-button"
          onClick={onCreate}
        >
          + New Task
        </button>

      </div>

      <div className="filters">

        <div className="search-box">

          🔍

          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >

          <option value="All">
            All
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>

        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(
              e.target.value
            )
          }
        >

          <option value="All">
            All
          </option>

          <option value="High">
            High
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Low">
            Low
          </option>

        </select>

      </div>

      {tasks.length === 0 ? (
        <div className="empty">

          <div>
            📝
          </div>

          <h3>
            No tasks found
          </h3>

          <p>
            Create a task to
            get started.
          </p>

          <button
            className="add-button"
            onClick={onCreate}
          >
            Create Task
          </button>

        </div>
      ) : (
        <div className="task-list">

          {tasks.map(
            (task) => {

              const assignee =
                getAssignee(
                  task.assignee_id
                );

              return (
                <div
                  className={
                    task.completed
                      ? "task-card completed"
                      : "task-card"
                  }
                  key={task.id}
                >

                  <button
                    className={
                      task.completed
                        ? "check checked"
                        : "check"
                    }
                    onClick={() =>
                      onToggle(
                        task
                      )
                    }
                  >
                    {task.completed
                      ? "✓"
                      : ""}
                  </button>

                  <div className="task-content">

                    <div className="task-title">

                      <h3>
                        {task.title}
                      </h3>

                      <span
                        className={`priority ${task.priority.toLowerCase()}`}
                      >
                        {
                          task.priority
                        }
                      </span>

                    </div>

                    {task.description && (
                      <p>
                        {
                          task.description
                        }
                      </p>
                    )}

                    <div className="task-meta">

                      <span>
                        {task.status}
                      </span>

                      {task.due_date && (
                        <span>
                          📅{" "}
                          {new Date(
                            task.due_date
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </span>
                      )}

                      {assignee && (
                        <span>
                          👤{" "}
                          {assignee.name}
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="task-actions">

                    <button
                      onClick={() =>
                        onEdit(
                          task
                        )
                      }
                      title="Edit task"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() =>
                        onDelete(
                          task.id
                        )
                      }
                      title="Delete task"
                    >
                      🗑️
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </section>
  );
}


// =======================================================
// CALENDAR
// =======================================================

function CalendarView({
  tasks,
}) {
  const grouped = {};

  tasks.forEach(
    (task) => {

      if (!task.due_date) {
        return;
      }

      const date =
        task.due_date.substring(
          0,
          10
        );

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(
        task
      );
    }
  );

  const dates = Object.keys(
    grouped
  ).sort();

  return (
    <section className="calendar-section">

      <div className="section-header">

        <div>

          <h2>
            Task Calendar
          </h2>

          <p>
            Your upcoming
            deadlines.
          </p>

        </div>

      </div>

      {dates.length === 0 ? (
        <div className="empty">

          <div>
            📅
          </div>

          <h3>
            No scheduled tasks
          </h3>

          <p>
            Add due dates to
            see tasks here.
          </p>

        </div>
      ) : (
        <div className="calendar-list">

          {dates.map(
            (date) => (

              <div
                className="calendar-day"
                key={date}
              >

                <div className="date-box">

                  <strong>
                    {new Date(
                      date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                      }
                    )}
                  </strong>

                  <span>
                    {new Date(
                      date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        month:
                          "short",
                      }
                    )}
                  </span>

                </div>

                <div>

                  {grouped[
                    date
                  ].map(
                    (task) => (

                      <div
                        className="calendar-task"
                        key={
                          task.id
                        }
                      >

                        <strong>
                          {
                            task.title
                          }
                        </strong>

                        <span>
                          {
                            task.priority
                          }
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )
          )}

        </div>
      )}

    </section>
  );
}


export default App;