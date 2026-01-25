import express from "express" 
import upload from "../middlewares/multer";
import {isAuthenticated} from "../middlewares/isAuthenticated";
import { addMenu, editMenu, getMenus, deleteMenu } from "../controller/menu.controller";

const router = express.Router();

router.route("/").get(isAuthenticated, getMenus).post(isAuthenticated, upload.single("image"), addMenu);
router.route("/:id").put(isAuthenticated, upload.single("image"), editMenu).delete(isAuthenticated, deleteMenu);
 
export default router;



