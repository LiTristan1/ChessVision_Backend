import express from 'express';
import cors, {} from "cors";
import { allowedOrigins } from "./allowedOrigins.js";
export const corsOptions = {
    origin: function (origin, callback) {
        console.log("Origin received:", origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
