/**
 * Contratos estructurales para inyección manual; la implementación concreta vive en repositories.
 * @typedef {Object} CrudRepository
 * @property {(options: object) => Promise<object[]>} list
 * @property {(id: number) => Promise<object>} get
 * @property {(input: object) => Promise<object>} create
 * @property {(id: number, input: object) => Promise<object>} update
 * @property {(id: number) => Promise<void>} remove
 *
 * @typedef {Object} IdempotencyRepository
 * @property {(context: object, hash: string, work: Function) => Promise<{status: number, body: object, replayed: boolean}>} execute
 */
export {};
