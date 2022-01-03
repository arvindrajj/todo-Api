const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());

let db = null;

// Initialize Database and Server

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
};

initializeDBAndServer();

const isValidDate = (request, response, next) => {
  const { dueDate } = request.body;
  const { date } = request.query;
  let isValidDate;
  switch (true) {
    case dueDate === undefined:
      isValidDate = isValid(new Date(date));
      break;
    case date === undefined:
      isValidDate = isValid(new Date(dueDate));
      break;
  }
  if (isValidDate === true) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

const validateScenarios = (request, response, next) => {
  const { status, priority, category } = request.body;
  let first;
  let second;
  let third;
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    first = true;
  } else {
    first = false;
    response.status(400);
    response.send("Invalid Todo Status");
  }
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    second = true;
  } else {
    second = false;
    response.status(400);
    response.send("Invalid Todo Priority");
  }
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    third = true;
  } else {
    third = false;
    response.status(400);
    response.send("Invalid Todo Category");
  }
  if (first && second && third) {
    next();
  }
};

const validateScenario = (request, response, next) => {
  const { status, priority, category, todo, dueDate } = request.body;
  switch (true) {
    case todo !== undefined:
      next();
      break;
    case dueDate !== undefined:
      let isValidDate = isValid(new Date(dueDate));
      if (isValidDate === true) {
        next();
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
    case priority === undefined && category === undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        next();
      } else {
        first = false;
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case status === undefined && category === undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        next();
      } else {
        second = false;
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case status === undefined && priority === undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        next();
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
  }
};

const validateGetMethod = (request, response, next) => {
  const { status, priority, category, todo, dueDate, search_q } = request.query;
  switch (true) {
    case search_q !== undefined:
      next();
      break;
    case dueDate !== undefined:
      let isValidDate = isValid(new Date(dueDate));
      if (isValidDate === true) {
        next();
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
    case priority === undefined && category === undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        next();
      } else {
        first = false;
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case status === undefined && category === undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        next();
      } else {
        second = false;
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case status === undefined && priority === undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        next();
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      next();
      break;
  }
};

const DBValueToResponseValue = (dbValue) => {
  return {
    id: dbValue.id,
    todo: dbValue.todo,
    priority: dbValue.priority,
    status: dbValue.status,
    category: dbValue.category,
    dueDate: dbValue.due_date,
  };
};

// GET todo

app.get("/todos/", validateGetMethod, async (request, response) => {
  const { priority, status, category, search_q } = request.query;
  switch (true) {
    case search_q !== undefined:
      const getTodoSearchQuery = `
                SELECT * FROM todo
                WHERE todo LIKE '%${search_q}%';`;
      const getTodoSearchArray = await db.all(getTodoSearchQuery);
      response.send(
        getTodoSearchArray.map((eachTodo) => DBValueToResponseValue(eachTodo))
      );
      break;
    case priority === undefined && category === undefined:
      const getStatusQuery = `
                SELECT * FROM todo
                WHERE status LIKE '${status}';`;
      const getStatusArray = await db.all(getStatusQuery);
      response.send(
        getStatusArray.map((eachTodo) => DBValueToResponseValue(eachTodo))
      );
      break;
    case status === undefined && category === undefined:
      const getPriorityQuery = `
                SELECT * FROM todo
                WHERE priority LIKE '${priority}';`;
      const getPriorityArray = await db.all(getPriorityQuery);
      response.send(
        getPriorityArray.map((eachTodo) => DBValueToResponseValue(eachTodo))
      );
      break;
    case status === undefined && priority === undefined:
      const getCategoryQuery = `
                SELECT * FROM todo
                WHERE category LIKE '${category}';`;
      const getCategoryArray = await db.all(getCategoryQuery);
      response.send(
        getCategoryArray.map((eachTodo) => DBValueToResponseValue(eachTodo))
      );
      break;
    case category === undefined:
      const getStatusPriorityQuery = `
                SELECT * FROM todo
                WHERE status LIKE '${status}'
                AND priority LIKE '${priority}';`;
      const getStatusPriorityArray = await db.all(getStatusPriorityQuery);
      response.send(
        getStatusPriorityArray.map((eachTodo) =>
          DBValueToResponseValue(eachTodo)
        )
      );
      break;
    case priority === undefined:
      const getCategoryStatusQuery = `
                SELECT * FROM todo
                WHERE status LIKE '${status}'
                AND category LIKE '${category}';`;
      const getCategoryStatusArray = await db.all(getCategoryStatusQuery);
      response.send(
        getCategoryStatusArray.map((eachTodo) =>
          DBValueToResponseValue(eachTodo)
        )
      );
      break;
    case status === undefined:
      const getCategoryPriorityQuery = `
                SELECT * FROM todo
                WHERE priority LIKE '${priority}'
                AND category LIKE '${category}';`;
      const getCategoryPriorityArray = await db.all(getCategoryPriorityQuery);
      response.send(
        getCategoryPriorityArray.map((eachTodo) =>
          DBValueToResponseValue(eachTodo)
        )
      );
      break;
  }
});

// Get Todo API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE id LIKE ${todoId};`;
  const todoObject = await db.get(getTodoQuery);
  response.send(DBValueToResponseValue(todoObject));
});

//GET Todo Specific Due Time API

app.get("/agenda/", isValidDate, async (request, response) => {
  const { date } = request.query;
  const result = format(new Date(date), "yyyy-MM-dd");

  const getDueDateTodoQuery = `
  SELECT * FROM todo
  WHERE due_date LIKE '${result}';`;
  const dueDateTodoArray = await db.all(getDueDateTodoQuery);
  response.send(
    dueDateTodoArray.map((eachTodo) => DBValueToResponseValue(eachTodo))
  );
});

// Create Todo API
app.post(
  "/todos/",
  isValidDate,
  validateScenarios,
  async (request, response) => {
    const { id, todo, priority, status, category, dueDate } = request.body;
    const createTodQuery = `
      INSERT INTO todo(id,todo,priority,status,category,due_date)
      VALUES(
          ${id},
          '${todo}',
          '${priority}',
          '${status}',
          '${category}',
          '${dueDate}'
      );`;
    await db.run(createTodQuery);
    response.send("Todo Successfully Added");
  }
);

// Update Todo Api
app.put("/todos/:todoId/", validateScenario, async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status, category, dueDate } = request.body;
  switch (true) {
    case todo !== undefined:
      const updateTodoQuery = `
                UPDATE todo
                SET todo = '${todo}'
                WHERE id LIKE '${todoId}';`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case dueDate !== undefined:
      const result = format(new Date(dueDate), "yyyy-MM-dd");
      const updateDueDateQuery = `
                UPDATE todo
                SET due_date = '${result}'
                WHERE id LIKE '${todoId}';`;
      await db.run(updateDueDateQuery);
      response.send("Due Date Updated");
      break;
    case priority === undefined && category === undefined:
      const updateStatusQuery = `
                UPDATE todo
                SET status = '${status}'
                WHERE id LIKE '${todoId}';`;
      await db.run(updateStatusQuery);
      response.send("Status Updated");
      break;
    case status === undefined && category === undefined:
      const updatePriorityQuery = `
                UPDATE todo
                SET priority = '${priority}'
                WHERE id LIKE '${todoId}';`;
      await db.run(updatePriorityQuery);
      response.send("Priority Updated");
      break;
    case status === undefined && priority === undefined:
      const updateCategoryQuery = `
                UPDATE todo
                SET category = '${category}'
                WHERE id LIKE '${todoId}';`;
      await db.run(updateCategoryQuery);
      response.send("Category Updated");
      break;
  }
});

// Delete Todo API

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id LIKE ${todoId};`;
  await db.get(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
