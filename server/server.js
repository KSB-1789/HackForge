import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from "./db/connect.js";

const PORT = process.env.PORT || 5000;

await connectDatabase();

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});