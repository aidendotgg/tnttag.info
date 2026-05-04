import type { Collection } from "mongodb"
import type { User } from "./User"

export type Database = {
    userCol: Collection<User>
}