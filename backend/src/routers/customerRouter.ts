import { Router } from "express";
import { createCustomer, getAllCustomers, deleteCustomer, updateCustomer, searchCustomers, getCustomerById } from "../controller/customerController";
import { requireRole } from "../middleware/requireRole";
import { UserRole } from "../models/enums/userRole";
import { authenticate } from "../middleware/authMiddleware"; 

const router = Router();

router.post("/", authenticate, createCustomer);
router.get("/", authenticate, getAllCustomers);
router.get("/search", authenticate, searchCustomers);
router.put("/:id", authenticate, updateCustomer);
router.get("/:id", authenticate, getCustomerById);
router.delete("/:id", authenticate, requireRole([UserRole.ADMIN]), deleteCustomer);
export default router;