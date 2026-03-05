import Dexie, { type EntityTable } from "dexie"
import { upperCamelCase } from "case-anything"

const APP_NAME = "novel-frog"

/**
 * Novel 实体定义
 */
export interface Novel {
    id?: number
    title: string
    author: string
    url: string
    coverUrl?: string
    source: string
    createdAt: number
}

/**
 * Chapter 实体定义
 */
export interface Chapter {
    id?: number
    novelId: number
    title: string
    content: string
    order: number
    readProgress: number
    createdAt: number
}

/**
 * 数据库核心类 (基于 Dexie)
 * 采用 read-frog 的版本管理和类映射模式
 */
export default class AppDB extends Dexie {
    novels!: EntityTable<Novel, "id">
    chapters!: EntityTable<Chapter, "id">

    constructor() {
        super(`${upperCamelCase(APP_NAME)}DB`)

        // 版本 1：定义初始表构造
        this.version(1).stores({
            novels: "++id, title, author, url, source",
            chapters: "++id, novelId, title, order"
        })
    }
}
