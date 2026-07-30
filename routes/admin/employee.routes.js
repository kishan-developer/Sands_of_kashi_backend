const express = require("express");
const employeeRoutes = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../../controller/admin/employee.controller");

employeeRoutes.post("/", createEmployee);

employeeRoutes.get("/", getEmployees);

employeeRoutes.get("/:id", getEmployeeById);

employeeRoutes.put("/:id", updateEmployee);

employeeRoutes.delete("/:id", deleteEmployee);

module.exports = employeeRoutes;