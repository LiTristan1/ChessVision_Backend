import express from 'express'
import cors, { type CorsOptions } from "cors"
import { allowedOrigins } from "./allowedOrigins.ts"
export const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        console.log("Origin received:", origin)

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    }
}