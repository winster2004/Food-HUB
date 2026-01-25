import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import {
    createOption,
    getOptionsByMenuItemId,
    updateOption,
    deleteOption,
    toggleOptionRequired,
} from "../controller/option.controller";

const router = express.Router();

// Create option
router.route("/").post(isAuthenticated, createOption);

// Get options by menu item ID
router.route("/menu-item/:menuItemId").get(getOptionsByMenuItemId);

// Update option
router.route("/:optionId").put(isAuthenticated, updateOption);

// Delete option
router.route("/:optionId").delete(isAuthenticated, deleteOption);

// Toggle option required status
router
    .route("/:optionId/toggle-required")
    .patch(isAuthenticated, toggleOptionRequired);

export default router;
