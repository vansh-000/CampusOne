import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

const assertObjectId = (id, fieldName = "id") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(`Invalid ${fieldName} Type`, 400);
    }
};

export default assertObjectId;