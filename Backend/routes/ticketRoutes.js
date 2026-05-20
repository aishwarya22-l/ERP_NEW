import express from "express";
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} from "../controllers/ticketController.js";
import { isAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/",       isAuth, allowRoles("admin", "manager", "employee", "assets"), getTickets);
router.post("/",      isAuth, allowRoles("admin", "manager", "employee", "assets"), createTicket);
router.get("/:id",    isAuth, allowRoles("admin", "manager", "employee", "assets"), getTicketById);
router.put("/:id",    isAuth, allowRoles("admin", "manager"),             updateTicket);
router.delete("/:id", isAuth, allowRoles("admin"),                        deleteTicket);

export default router;
