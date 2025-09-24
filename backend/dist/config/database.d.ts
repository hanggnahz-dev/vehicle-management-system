import sqlite3 from 'sqlite3';
import { Database } from 'sqlite';
export declare const getDatabase: () => Promise<Database<sqlite3.Database, sqlite3.Statement>>;
export declare const connectDatabase: () => Promise<void>;
export default getDatabase;
//# sourceMappingURL=database.d.ts.map